/**
 * What the customer started typing on a vendor profile, carried to the
 * booking form (and kept if they have to sign in first). This tab only.
 */

export type WhenChoice = 'today' | 'tomorrow' | 'date';

export type BookingDraft = {
  /** `item:<price item id>` or `quote:<service type id>` */
  choice?: string;
  when?: WhenChoice;
  description?: string;
};

const key = (vendorSlug: string) => `vendy.booking-draft.${vendorSlug}`;

export function readDraft(vendorSlug: string): BookingDraft {
  try {
    const raw = window.sessionStorage.getItem(key(vendorSlug));
    return raw ? (JSON.parse(raw) as BookingDraft) : {};
  } catch {
    return {};
  }
}

export function saveDraft(vendorSlug: string, draft: BookingDraft): void {
  try {
    window.sessionStorage.setItem(key(vendorSlug), JSON.stringify(draft));
  } catch {
    // Storage blocked: the form just starts empty.
  }
}

export function clearDraft(vendorSlug: string): void {
  try {
    window.sessionStorage.removeItem(key(vendorSlug));
  } catch {
    // Nothing to clear.
  }
}
