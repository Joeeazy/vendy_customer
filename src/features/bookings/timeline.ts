import type { BookingEvent } from '@/api/types';

const ACTOR: Record<BookingEvent['actor_type'], string> = {
  customer: 'you',
  vendor: 'the vendor',
  admin: 'Vendy',
  system: 'Vendy',
};

/** One line per booking event, in the customer's words. */
export function eventLabel(event: BookingEvent): string {
  switch (event.action) {
    case 'accept':
      return 'Vendor confirmed';
    case 'decline':
      return 'Vendor declined';
    case 'expire':
      return 'No reply in time';
    case 'start':
      return 'Work started';
    case 'propose_price':
      return 'Vendor asked to change the price';
    case 'approve_price':
      return 'You approved the new price';
    case 'decline_price':
      return 'You declined the new price';
    case 'price_timeout':
      return 'Price change lapsed';
    case 'complete':
      return 'Job finished';
    case 'cancel':
      return `Cancelled by ${ACTOR[event.actor_type]}`;
    default:
      return event.to_status === 'pending' ? 'Request sent' : event.action.replaceAll('_', ' ');
  }
}

export type Step = { label: string; state: 'done' | 'current' | 'todo' };

/** Accepted → Working → Finished, for the progress bar on an active job. */
export function progressSteps(status: BookingEvent['to_status']): Step[] {
  const order = ['pending', 'confirmed', 'in_progress', 'completed'] as const;
  const labels = ['Requested', 'Confirmed', 'Working', 'Finished'];
  const position = status === 'awaiting_price_approval' ? 1 : order.indexOf(status as (typeof order)[number]);
  return labels.map((label, index) => ({
    label,
    state:
      position === order.length - 1 || index < position ? 'done' : index === position ? 'current' : 'todo',
  }));
}
