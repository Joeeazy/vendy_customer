'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { keys } from '@/api/keys';
import type { Message } from '@/api/types';

import { lastSequence, mergeMessages, stillOutgoing, type Outgoing } from './messages';
import { chatSocket, type ConnectionState } from './socket';

const PAGE = 50;

function newClientId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type ConversationState = {
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  messages: Message[];
  outgoing: Outgoing[];
  hasOlder: boolean;
  isLocked: boolean;
  connection: ConnectionState;
  /** Set when the last message sent had contact details hidden. */
  notice: string | null;
};

/**
 * Live messages for one conversation: REST for history, the shared socket
 * for delivery, REST again when the socket is down. Sends are optimistic and
 * retry-safe (each carries a client id the server deduplicates on).
 */
export function useConversation(conversationId: string) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ConversationState>({
    status: 'loading',
    error: null,
    messages: [],
    outgoing: [],
    hasOlder: false,
    isLocked: false,
    connection: 'connecting',
    notice: null,
  });
  const messagesRef = useRef<Message[]>([]);
  const readUpTo = useRef(0);

  const addMessages = useCallback((incoming: Message[]) => {
    setState((current) => {
      const messages = mergeMessages(current.messages, incoming);
      messagesRef.current = messages;
      return { ...current, messages, outgoing: stillOutgoing(current.outgoing, messages) };
    });
  }, []);

  // History first, then the socket keeps it current.
  useEffect(() => {
    let cancelled = false;
    unwrap(
      api.GET('/conversations/{conversation_id}/messages', {
        params: { path: { conversation_id: conversationId }, query: { limit: PAGE } },
      }),
    )
      .then((page) => {
        if (cancelled) return;
        messagesRef.current = page.items;
        setState((current) => ({
          ...current,
          status: 'ready',
          messages: mergeMessages(page.items, current.messages),
          hasOlder: page.has_more,
          isLocked: page.is_locked,
        }));
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((current) => ({ ...current, status: 'error', error: errorMessage(error) }));
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    const socket = chatSocket();
    const offState = socket.onState((connection) => setState((current) => ({ ...current, connection })));
    const unsubscribe = socket.subscribe({
      conversationId,
      onReady: () =>
        socket.send({
          type: 'sync',
          conversation_id: conversationId,
          after_sequence_no: lastSequence(messagesRef.current),
        }),
      onMessage: (message) => addMessages([message]),
      onAck: (ack) => {
        addMessages([ack.message]);
        setState((current) => ({ ...current, notice: ack.notice }));
      },
      onError: (error) =>
        setState((current) => ({
          ...current,
          outgoing: current.outgoing.map((item) =>
            item.clientId === error.clientId ? { ...item, failed: error.detail } : item,
          ),
        })),
    });
    return () => {
      unsubscribe();
      offState();
    };
  }, [conversationId, addMessages]);

  const deliver = useCallback(
    async (item: Outgoing) => {
      const sent = chatSocket().send({
        type: 'message.send',
        conversation_id: conversationId,
        body: item.body,
        client_id: item.clientId,
      });
      if (sent) return;
      try {
        const result = await unwrap(
          api.POST('/conversations/{conversation_id}/messages', {
            params: { path: { conversation_id: conversationId } },
            body: { body: item.body, client_id: item.clientId },
          }),
        );
        addMessages([result.message]);
        setState((current) => ({ ...current, notice: result.notice }));
      } catch (error) {
        setState((current) => ({
          ...current,
          outgoing: current.outgoing.map((o) =>
            o.clientId === item.clientId ? { ...o, failed: errorMessage(error) } : o,
          ),
        }));
      }
    },
    [conversationId, addMessages],
  );

  const send = useCallback(
    (body: string) => {
      const item: Outgoing = {
        clientId: newClientId(),
        body,
        createdAt: new Date().toISOString(),
        failed: null,
      };
      setState((current) => ({ ...current, outgoing: [...current.outgoing, item], notice: null }));
      void deliver(item);
    },
    [deliver],
  );

  const retry = useCallback(
    (clientId: string) => {
      const item = state.outgoing.find((o) => o.clientId === clientId);
      if (!item) return;
      setState((current) => ({
        ...current,
        outgoing: current.outgoing.map((o) => (o.clientId === clientId ? { ...o, failed: null } : o)),
      }));
      void deliver({ ...item, failed: null });
    },
    [state.outgoing, deliver],
  );

  const loadOlder = useCallback(async () => {
    const first = messagesRef.current[0];
    if (!first) return;
    const page = await unwrap(
      api.GET('/conversations/{conversation_id}/messages', {
        params: {
          path: { conversation_id: conversationId },
          query: { before_sequence_no: first.sequence_no, limit: PAGE },
        },
      }),
    );
    addMessages(page.items);
    setState((current) => ({ ...current, hasOlder: page.has_more }));
  }, [conversationId, addMessages]);

  // Mark as read up to the newest message whenever new ones arrive.
  const newest = lastSequence(state.messages);
  useEffect(() => {
    if (newest <= readUpTo.current || document.visibilityState !== 'visible') return;
    readUpTo.current = newest;
    const viaSocket = chatSocket().send({
      type: 'read',
      conversation_id: conversationId,
      sequence_no: newest,
    });
    const done = viaSocket
      ? Promise.resolve()
      : api.POST('/conversations/{conversation_id}/read', {
          params: { path: { conversation_id: conversationId } },
          body: { sequence_no: newest },
        });
    void done.then(() => queryClient.invalidateQueries({ queryKey: keys.conversations }));
  }, [newest, conversationId, queryClient]);

  return { ...state, send, retry, loadOlder };
}
