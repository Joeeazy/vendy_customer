'use client';

import { Check, MessageSquare, Phone } from 'lucide-react';
import Link from 'next/link';

import { errorMessage } from '@/api/errors';
import { kes, phone, telHref, when as formatWhen } from '@/api/format';
import type { Booking } from '@/api/types';
import { useBookingConversation } from '@/features/chat/useBookingConversation';
import { Avatar } from '@/ui/Avatar';
import { BrushUnderline } from '@/ui/BrushStroke';
import { Button, buttonClasses } from '@/ui/Button';

import { useVendorContact } from './useBooking';

export function agreedPrice(booking: Booking): string {
  if (booking.final_price_kes != null) return kes(booking.final_price_kes);
  if (booking.pricing_model === 'callout' && booking.callout_fee_kes != null)
    return `${kes(booking.callout_fee_kes)} callout`;
  if (booking.agreed_price_kes != null) return kes(booking.agreed_price_kes);
  return 'Vendor quotes on site';
}

export function scheduledFor(booking: Booking): string {
  if (booking.preferred_at) return formatWhen(booking.preferred_at);
  return booking.is_emergency ? 'As soon as possible' : 'Time to agree';
}

/**
 * Treatment 1d, "Proof": the emotional peak of the product. Full duka green,
 * one painted yellow stroke, the reference as big as the screen allows.
 * Built to be screenshotted.
 */
export function ConfirmationProof({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const contact = useVendorContact(booking, true);
  const conversation = useBookingConversation(booking.id);

  return (
    <main className="min-h-dvh bg-duka text-chalk">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-16">
        <Check aria-hidden="true" className="size-9" strokeWidth={2.5} />

        <h1 className="mt-6 inline-flex w-fit flex-col font-display text-display-xl font-extrabold font-condensed sm:text-[3.5rem] sm:leading-none">
          Booking confirmed.
          <BrushUnderline tone="sign" className="mt-3 h-3 w-3/5" />
        </h1>
        <p className="mt-4 text-body-l text-chalk/90">You can now call {booking.vendor.display_name}.</p>

        <p className="mt-8 text-caption text-chalk/70">Reference</p>
        <p className="font-display text-[4rem] leading-none font-extrabold tracking-tight font-condensed tabular sm:text-[5.5rem]">
          {booking.reference}
        </p>

        <div className="mt-8 flex items-center gap-4 rounded-card bg-duka-deep p-4">
          <Avatar name={booking.vendor.display_name} size="md" tone="soft" />
          <div className="min-w-0">
            <p className="font-display text-title font-bold">{booking.vendor.display_name}</p>
            {contact.data ? (
              <a
                href={telHref(contact.data.phone)}
                className="text-body-l text-chalk/90 tabular underline-offset-4 hover:underline"
              >
                {phone(contact.data.phone)}
              </a>
            ) : contact.error ? (
              <p className="text-caption text-chalk/80">{errorMessage(contact.error)}</p>
            ) : (
              <p className="text-body text-chalk/70">Unlocking number…</p>
            )}
          </div>
        </div>

        <dl className="mt-6 border-t-[1.5px] border-chalk/20">
          {[
            ['Job', booking.service.name],
            ['When', scheduledFor(booking)],
            ['Agreed', agreedPrice(booking)],
          ].map(([term, detail]) => (
            <div key={term} className="flex justify-between gap-4 border-b-[1.5px] border-chalk/20 py-3">
              <dt className="text-chalk/70">{term}</dt>
              <dd className="text-right tabular">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-10">
          {contact.data ? (
            <a href={telHref(contact.data.phone)} className={buttonClasses({ variant: 'light', size: 'lg' })}>
              <Phone aria-hidden="true" className="size-5" />
              Call
            </a>
          ) : (
            <Button variant="light" size="lg" disabled>
              <Phone aria-hidden="true" className="size-5" />
              Call
            </Button>
          )}
          {conversation ? (
            <Link
              href={`/messages/${conversation.id}`}
              className={buttonClasses({ variant: 'outline-light', size: 'lg' })}
            >
              <MessageSquare aria-hidden="true" className="size-5" />
              Open chat
            </Link>
          ) : (
            <Button variant="outline-light" size="lg" disabled>
              Open chat
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={onDone}
          className="mt-4 self-center py-2 font-semibold text-chalk/90 underline-offset-4 hover:underline"
        >
          See booking details
        </button>
      </div>
    </main>
  );
}
