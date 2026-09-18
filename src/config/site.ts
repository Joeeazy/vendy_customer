/**
 * Contact details and links shown on the site. They come from the
 * environment so a made-up number never ships: anything unset is simply
 * not shown.
 */

const value = (raw: string | undefined) => raw?.trim() || null;

export const site = {
  vendorAppUrl: process.env.NEXT_PUBLIC_VENDOR_APP_URL ?? 'http://localhost:3001',
  support: {
    /** WhatsApp number in international format, e.g. 254709400400. */
    whatsapp: value(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP),
    /** Phone for calls and SMS, e.g. 0709 400 400. */
    phone: value(process.env.NEXT_PUBLIC_SUPPORT_PHONE),
    email: value(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
    vendorEmail: value(process.env.NEXT_PUBLIC_VENDOR_SUPPORT_EMAIL),
    hours: value(process.env.NEXT_PUBLIC_SUPPORT_HOURS) ?? 'Monday to Saturday, 8:00 am – 8:00 pm EAT',
    address: value(process.env.NEXT_PUBLIC_OFFICE_ADDRESS),
  },
};

export function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}`;
}

export function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
