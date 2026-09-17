import { accessToken, refreshSession } from '@/api/client';
import type { Message } from '@/api/types';

/**
 * The chat gateway client (protocol in vendy_backend/chat/gateway.py).
 * One socket per tab, shared by every open conversation. Postgres is the
 * source of truth: after any reconnect each conversation syncs from its last
 * sequence number, so a dropped connection loses nothing.
 */

const URL = process.env.NEXT_PUBLIC_CHAT_WS_URL ?? 'ws://localhost:8004/ws';
const PING_MS = 25_000;
const MAX_BACKOFF_MS = 30_000;

export type ConnectionState = 'connecting' | 'ready' | 'offline';

export type Ack = { clientId: string | null; duplicate: boolean; notice: string | null; message: Message };
export type SocketError = { code: string; detail: string; clientId: string | null };

type Listener = {
  conversationId: string;
  onMessage: (message: Message) => void;
  onAck: (ack: Ack) => void;
  onError: (error: SocketError) => void;
  /** Called on every (re)connect: the listener sends its sync. */
  onReady: () => void;
};

type Frame = Record<string, unknown> & { type: string };

class ChatSocket {
  private socket: WebSocket | null = null;
  private state: ConnectionState = 'offline';
  private listeners = new Set<Listener>();
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private attempts = 0;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshedForThisAttempt = false;
  /** Bumped by every connect and close, so a slow token fetch can't open a stale socket. */
  private generation = 0;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.state === 'ready') listener.onReady();
    else if (!this.socket && this.state !== 'connecting') void this.connect();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.close();
    };
  }

  onState(callback: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(callback);
    callback(this.state);
    return () => this.stateListeners.delete(callback);
  }

  /** False when not connected; callers fall back to REST. */
  send(frame: Frame): boolean {
    if (this.state !== 'ready' || !this.socket) return false;
    this.socket.send(JSON.stringify(frame));
    return true;
  }

  private setState(state: ConnectionState) {
    this.state = state;
    this.stateListeners.forEach((callback) => callback(state));
  }

  private async connect() {
    const generation = ++this.generation;
    this.setState('connecting');
    const token = await accessToken();
    if (generation !== this.generation) return;
    if (!token || this.listeners.size === 0) {
      this.setState('offline');
      return;
    }

    const socket = new WebSocket(URL);
    this.socket = socket;
    socket.onopen = () => socket.send(JSON.stringify({ type: 'auth', token }));
    socket.onmessage = (event) => this.receive(JSON.parse(String(event.data)) as Frame);
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.stopPing();
      this.socket = null;
      this.setState('offline');
      this.scheduleReconnect();
    };
  }

  private receive(frame: Frame) {
    switch (frame.type) {
      case 'ready':
        this.attempts = 0;
        this.refreshedForThisAttempt = false;
        this.setState('ready');
        this.startPing();
        this.listeners.forEach((listener) => listener.onReady());
        break;
      case 'message.new': {
        const message = frame.message as Message;
        this.forConversation(message.conversation_id, (listener) => listener.onMessage(message));
        break;
      }
      case 'message.ack': {
        const message = frame.message as Message;
        const ack: Ack = {
          clientId: (frame.client_id as string | null) ?? null,
          duplicate: Boolean(frame.duplicate),
          notice: (frame.notice as string | null) ?? null,
          message,
        };
        this.forConversation(message.conversation_id, (listener) => listener.onAck(ack));
        break;
      }
      case 'error': {
        const error: SocketError = {
          code: String(frame.code),
          detail: String(frame.detail),
          clientId: (frame.client_id as string | null) ?? null,
        };
        if (error.code === 'auth.token_expired' && !this.refreshedForThisAttempt) {
          // The socket closes next; refresh now so the reconnect has a fresh token.
          this.refreshedForThisAttempt = true;
          void refreshSession();
          return;
        }
        if (error.clientId) this.listeners.forEach((listener) => listener.onError(error));
        break;
      }
    }
  }

  private forConversation(conversationId: string, run: (listener: Listener) => void) {
    this.listeners.forEach((listener) => {
      if (listener.conversationId === conversationId) run(listener);
    });
  }

  private scheduleReconnect() {
    if (this.listeners.size === 0 || this.retryTimer) return;
    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** this.attempts) * (0.75 + Math.random() / 2);
    this.attempts += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.connect();
    }, delay);
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => this.send({ type: 'ping' }), PING_MS);
  }

  private stopPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  private close() {
    this.generation += 1;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    this.stopPing();
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.setState('offline');
  }
}

let shared: ChatSocket | null = null;

export function chatSocket(): ChatSocket {
  shared ??= new ChatSocket();
  return shared;
}
