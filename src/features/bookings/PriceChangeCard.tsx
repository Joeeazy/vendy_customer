'use client';

import { useState } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { kes, when } from '@/api/format';
import type { Booking, PriceRevision } from '@/api/types';
import { Button } from '@/ui/Button';
import { Dialog } from '@/ui/Dialog';

import { useBookingMutation } from './useBooking';

/** The vendor wants a different price. Work waits until the customer answers. */
export function PriceChangeCard({ booking, revision }: { booking: Booking; revision: PriceRevision }) {
  const [confirmDecline, setConfirmDecline] = useState(false);
  const path = { params: { path: { booking_id: booking.id } } };
  const approve = useBookingMutation(booking.id, () =>
    unwrap(api.POST('/bookings/{booking_id}/price-change/approve', path)),
  );
  const decline = useBookingMutation(booking.id, () =>
    unwrap(api.POST('/bookings/{booking_id}/price-change/decline', path)),
  );
  const error = approve.error ?? decline.error;
  const evidence = revision.evidence_urls?.['1200'] ?? revision.evidence_urls?.['400'];
  const higher = revision.to_kes > revision.from_kes;

  return (
    <section className="rounded-card bg-sign-soft p-4 sm:p-5" aria-labelledby="price-change-heading">
      <h2 id="price-change-heading" className="font-display text-title font-bold">
        {booking.vendor.display_name} wants to change the price
      </h2>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
        <span className="text-body-l text-slate tabular line-through">{kes(revision.from_kes)}</span>
        <span className="font-display text-display-l font-extrabold tabular">{kes(revision.to_kes)}</span>
        {revision.delta_pct != null && (
          <span className="text-caption font-semibold tabular">
            {higher ? '+' : ''}
            {Math.round(revision.delta_pct)}%
          </span>
        )}
      </p>
      <p className="mt-2 font-semibold">{revision.reason_label}</p>
      {revision.reason_text && <p className="mt-1 text-body-l">{revision.reason_text}</p>}
      {evidence && (
        <a href={evidence} target="_blank" rel="noreferrer" className="mt-3 block w-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={revision.evidence_urls?.['400'] ?? evidence}
            alt="Photo from the vendor"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </a>
      )}
      <p className="mt-3 text-caption text-slate">
        Answer by {when(revision.expires_at)}. If you don&apos;t, the change lapses and the vendor may cancel
        the job.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button onClick={() => approve.mutate()} loading={approve.isPending} disabled={decline.isPending}>
          Approve {kes(revision.to_kes)}
        </Button>
        <Button variant="secondary" onClick={() => setConfirmDecline(true)} disabled={approve.isPending}>
          Decline
        </Button>
      </div>
      {error && <p className="mt-2 text-caption font-medium text-clay">{errorMessage(error)}</p>}

      <Dialog
        open={confirmDecline}
        onClose={() => setConfirmDecline(false)}
        title="Decline the new price?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDecline(false)}>
              Keep talking
            </Button>
            <Button
              variant="danger"
              loading={decline.isPending}
              onClick={() => decline.mutate(undefined, { onSettled: () => setConfirmDecline(false) })}
            >
              Decline and cancel
            </Button>
          </>
        }
      >
        <p className="text-body-l">
          Declining cancels this booking. If something isn&apos;t clear, ask {booking.vendor.display_name} in
          chat first.
        </p>
      </Dialog>
    </section>
  );
}
