import type { BookingStatus } from '@/api/types';
import type { Tone } from '@/ui/Badges';

/** Status words the customer reads, and the colour that carries them. */
export const STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Waiting', tone: 'sign' },
  confirmed: { label: 'Confirmed', tone: 'duka' },
  awaiting_price_approval: { label: 'Price change', tone: 'sign' },
  in_progress: { label: 'Working', tone: 'duka' },
  completed: { label: 'Done', tone: 'quiet' },
  declined: { label: 'Declined', tone: 'slate' },
  expired: { label: 'No reply', tone: 'slate' },
  cancelled: { label: 'Cancelled', tone: 'slate' },
};

const ACTIVE = new Set<BookingStatus>(['pending', 'confirmed', 'awaiting_price_approval', 'in_progress']);

/** Once confirmed, both sides can see each other's numbers. */
const CONTACT_SHARED = new Set<BookingStatus>([
  'confirmed',
  'awaiting_price_approval',
  'in_progress',
  'completed',
]);

const CANCELLABLE = new Set<BookingStatus>(['pending', 'confirmed', 'awaiting_price_approval']);

const REPORTABLE = new Set<BookingStatus>([
  'confirmed',
  'awaiting_price_approval',
  'in_progress',
  'completed',
  'cancelled',
]);

export const isActive = (status: BookingStatus) => ACTIVE.has(status);
export const contactShared = (status: BookingStatus) => CONTACT_SHARED.has(status);
export const canCancel = (status: BookingStatus) => CANCELLABLE.has(status);
export const canReport = (status: BookingStatus) => REPORTABLE.has(status);
