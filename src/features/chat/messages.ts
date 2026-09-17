import type { Message } from '@/api/types';

/** A message the customer sent that the server hasn't acknowledged yet. */
export type Outgoing = {
  clientId: string;
  body: string;
  createdAt: string;
  failed: string | null;
};

/** Add messages, dropping duplicates by id, kept in sequence order. */
export function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  if (incoming.length === 0) return current;
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.sequence_no - b.sequence_no);
}

/** Outgoing messages whose confirmed copy hasn't arrived yet. */
export function stillOutgoing(outgoing: Outgoing[], messages: Message[]): Outgoing[] {
  const delivered = new Set(messages.map((message) => message.client_id).filter(Boolean));
  return outgoing.filter((item) => !delivered.has(item.clientId));
}

export function lastSequence(messages: Message[]): number {
  return messages.at(-1)?.sequence_no ?? 0;
}

/** The text the backend puts where contact details were. */
export const REDACTION = '[contact hidden]';

export function splitRedactions(body: string): { text: string; redacted: boolean }[] {
  return body
    .split(/(\[contact hidden\])/)
    .filter(Boolean)
    .map((text) => ({ text, redacted: text === REDACTION }));
}
