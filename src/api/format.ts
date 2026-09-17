/** Formatting for Kenyan shillings, distances and East Africa Time. */

const TIME_ZONE = 'Africa/Nairobi';
const LOCALE = 'en-KE';

const shillings = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

export function kes(amount: number): string {
  return `KSh ${shillings.format(amount)}`;
}

export function distance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 100) * 100 || 100} m`;
  return `${(metres / 1000).toFixed(1).replace(/\.0$/, '')} km`;
}

function parts(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options }).format(date);
}

function dayKey(date: Date): string {
  return parts(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/** 2:00 pm */
export function clockTime(iso: string): string {
  return parts(new Date(iso), { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?([ap])\.?m\.?/i, ' $1m').toLowerCase();
}

/** Today, 2:00 pm · Tomorrow, 9:30 am · Thu 17 Sep, 10:00 am */
export function when(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const day =
    dayKey(date) === dayKey(now)
      ? 'Today'
      : dayKey(date) === dayKey(tomorrow)
        ? 'Tomorrow'
        : parts(date, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day}, ${clockTime(iso)}`;
}

/** 2 Sep */
export function shortDate(iso: string): string {
  return parts(new Date(iso), { day: 'numeric', month: 'short' });
}

/** just now · 8 min ago · 3 hrs ago · yesterday · 2 Sep */
export function ago(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
  if (hours < 48) return 'yesterday';
  return shortDate(iso);
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** +254722000111 → 0722 000 111 */
export function phone(e164: string): string {
  const local = e164.replace(/^\+254/, '0');
  return local.length === 10 ? `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}` : e164;
}

/** Digits for a tel: link. */
export function telHref(e164: string): string {
  return `tel:${e164.replace(/[^\d+]/g, '')}`;
}
