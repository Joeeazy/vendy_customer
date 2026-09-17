import { describe, expect, it } from 'vitest';

import type { BookingEvent } from '@/api/types';

import { eventLabel, progressSteps } from './timeline';

const event = (patch: Partial<BookingEvent>): BookingEvent => ({
  action: 'create',
  from_status: null,
  to_status: 'pending',
  actor_type: 'customer',
  note: null,
  created_at: '2026-09-17T08:00:00Z',
  ...patch,
});

describe('eventLabel', () => {
  it('names events from the customer side', () => {
    expect(eventLabel(event({}))).toBe('Request sent');
    expect(eventLabel(event({ action: 'accept', to_status: 'confirmed', actor_type: 'vendor' }))).toBe(
      'Vendor confirmed',
    );
    expect(eventLabel(event({ action: 'cancel', to_status: 'cancelled', actor_type: 'customer' }))).toBe(
      'Cancelled by you',
    );
    expect(eventLabel(event({ action: 'cancel', to_status: 'cancelled', actor_type: 'system' }))).toBe(
      'Cancelled by Vendy',
    );
  });
});

describe('progressSteps', () => {
  const states = (status: BookingEvent['to_status']) => progressSteps(status).map((step) => step.state);

  it('marks where the job is', () => {
    expect(states('pending')).toEqual(['current', 'todo', 'todo', 'todo']);
    expect(states('in_progress')).toEqual(['done', 'done', 'current', 'todo']);
    expect(states('completed')).toEqual(['done', 'done', 'done', 'done']);
  });

  it('holds at confirmed while a price change waits', () => {
    expect(states('awaiting_price_approval')).toEqual(['done', 'current', 'todo', 'todo']);
  });
});
