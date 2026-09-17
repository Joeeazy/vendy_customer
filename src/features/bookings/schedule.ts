import type { WhenChoice } from './draft';

/**
 * Nairobi has no daylight saving: East Africa Time is always UTC+3, so a
 * local date and time become an exact instant without a timezone library.
 */
const EAT_OFFSET = '+03:00';
const DAY_MS = 24 * 3600 * 1000;

/** Hours a customer can ask for, 7 am to 7 pm. */
export const SLOT_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] as const;

/** YYYY-MM-DD in Nairobi. */
export function nairobiDate(at: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

export function addDays(date: string, days: number): string {
  return nairobiDate(new Date(new Date(`${date}T12:00:00${EAT_OFFSET}`).getTime() + days * DAY_MS));
}

export function toInstant(date: string, hour: number): Date {
  return new Date(`${date}T${String(hour).padStart(2, '0')}:00:00${EAT_OFFSET}`);
}

export function dateFor(when: WhenChoice, pickedDate: string, now: Date): string {
  const today = nairobiDate(now);
  if (when === 'today') return today;
  if (when === 'tomorrow') return addDays(today, 1);
  return pickedDate;
}

/** Slots still ahead of now (with half an hour for the vendor to get moving). */
export function openSlots(date: string, now: Date): number[] {
  const earliest = now.getTime() + 30 * 60_000;
  return SLOT_HOURS.filter((hour) => toInstant(date, hour).getTime() > earliest);
}

export function slotLabel(hour: number): string {
  if (hour === 12) return '12:00 pm (midday)';
  return hour < 12 ? `${hour}:00 am` : `${hour - 12}:00 pm`;
}
