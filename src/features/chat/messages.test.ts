import { describe, expect, it } from 'vitest';

import type { Message } from '@/api/types';

import { lastSequence, mergeMessages, splitRedactions, stillOutgoing } from './messages';

const message = (sequence: number, patch: Partial<Message> = {}): Message => ({
  id: `m${sequence}`,
  conversation_id: 'c1',
  sequence_no: sequence,
  sender_role: 'customer',
  kind: 'text',
  body: `message ${sequence}`,
  moderation: 'allowed',
  client_id: null,
  created_at: '2026-09-17T08:00:00Z',
  ...patch,
});

describe('mergeMessages', () => {
  it('orders by sequence and drops duplicates from sync and the live stream', () => {
    const merged = mergeMessages([message(1), message(3)], [message(2), message(3)]);
    expect(merged.map((m) => m.sequence_no)).toEqual([1, 2, 3]);
    expect(lastSequence(merged)).toBe(3);
  });

  it('returns the same array when nothing arrives', () => {
    const current = [message(1)];
    expect(mergeMessages(current, [])).toBe(current);
  });
});

describe('stillOutgoing', () => {
  it('clears sends once their confirmed copy arrives', () => {
    const outgoing = [
      { clientId: 'a', body: 'hi', createdAt: '', failed: null },
      { clientId: 'b', body: 'there', createdAt: '', failed: null },
    ];
    expect(stillOutgoing(outgoing, [message(1, { client_id: 'a' })]).map((o) => o.clientId)).toEqual(['b']);
  });
});

describe('splitRedactions', () => {
  it('marks the hidden parts so they can be shown as a chip', () => {
    expect(splitRedactions('Call me on [contact hidden] and we talk.')).toEqual([
      { text: 'Call me on ', redacted: false },
      { text: '[contact hidden]', redacted: true },
      { text: ' and we talk.', redacted: false },
    ]);
  });
});
