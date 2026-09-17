'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage, isApiError } from '@/api/errors';
import { ago, kes, when } from '@/api/format';
import { keys } from '@/api/keys';
import type { Booking } from '@/api/types';
import { useRequireUser } from '@/features/auth/session';
import { SiteHeader } from '@/features/layout/SiteHeader';
import { useBookingConversation } from '@/features/chat/useBookingConversation';
import { Badge } from '@/ui/Badges';
import { EmptyState, Notice, Skeleton } from '@/ui/Blocks';
import { buttonClasses } from '@/ui/Button';
import { cn } from '@/ui/cn';

import { BookingActions } from './BookingActions';
import { agreedPrice, ConfirmationProof, scheduledFor } from './ConfirmationProof';
import { PriceChangeCard } from './PriceChangeCard';
import { ReviewForm } from './ReviewForm';
import { contactShared, STATUS } from './status';
import { eventLabel, progressSteps } from './timeline';
import { useBooking } from './useBooking';
import { VendorContactCard } from './VendorContactCard';

const SEEN_KEY = 'vendy.confirmations-seen';

function readSeen(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function markSeen(bookingId: string) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...readSeen().slice(-50), bookingId]));
  } catch {
    // The confirmation screen may show again; nothing breaks.
  }
}

/** Show the confirmation once per booking, the first time it's seen confirmed. */
function useFirstConfirmation(booking: Booking | undefined) {
  const [showing, setShowing] = useState(false);
  useEffect(() => {
    if (
      booking &&
      contactShared(booking.status) &&
      booking.status !== 'completed' &&
      !readSeen().includes(booking.id)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowing(true);
    }
  }, [booking]);
  return {
    showing,
    dismiss: () => {
      if (booking) markSeen(booking.id);
      setShowing(false);
    },
  };
}

function Progress({ booking }: { booking: Booking }) {
  if (
    !['pending', 'confirmed', 'awaiting_price_approval', 'in_progress', 'completed'].includes(booking.status)
  )
    return null;
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Progress">
      {progressSteps(booking.status).map((step) => (
        <li key={step.label} aria-current={step.state === 'current' ? 'step' : undefined}>
          <span className={cn('block h-1.5 rounded-sm', step.state === 'todo' ? 'bg-ink-12' : 'bg-duka')} />
          <span
            className={cn(
              'mt-1.5 block text-caption',
              step.state === 'todo' ? 'text-slate' : 'font-semibold',
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Details({ booking }: { booking: Booking }) {
  const rows: [string, string][] = [
    ['Job', booking.service.name],
    ['When', scheduledFor(booking)],
    ['Where', [booking.address_text, booking.access_notes].filter(Boolean).join(' · ')],
    [booking.final_price_kes != null ? 'Final price' : 'Price', agreedPrice(booking)],
  ];
  return (
    <section aria-labelledby="details-heading">
      <h2 id="details-heading" className="font-display text-title font-bold">
        Details
      </h2>
      <dl className="mt-2 hairline-t">
        {rows.map(([term, detail]) => (
          <div key={term} className="grid grid-cols-[7rem_1fr] gap-3 py-3 hairline-b">
            <dt className="text-slate">{term}</dt>
            <dd className="tabular">{detail}</dd>
          </div>
        ))}
        <div className="py-3 hairline-b">
          <dt className="text-slate">What needs doing</dt>
          <dd className="mt-1 text-body-l whitespace-pre-line">{booking.description}</dd>
        </div>
      </dl>
      {booking.price_lines.length > 1 && (
        <ul className="mt-3 text-body">
          {booking.price_lines.map((line) => (
            <li key={`${line.revision_no}-${line.label}`} className="flex justify-between gap-3 py-1">
              <span className="text-slate">
                {line.label}
                {line.qty > 1 && ` × ${line.qty}`}
              </span>
              <span className="tabular">{kes(line.amount_kes)}</span>
            </li>
          ))}
        </ul>
      )}
      {booking.warranty_days > 0 && booking.status === 'completed' && (
        <p className="mt-3 text-caption text-slate">
          {booking.warranty_days}-day warranty from the vendor on this work.
        </p>
      )}
    </section>
  );
}

function History({ booking }: { booking: Booking }) {
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="font-display text-title font-bold">
        History
      </h2>
      <ol className="mt-2 hairline-t">
        {[...booking.events].reverse().map((event) => (
          <li
            key={`${event.created_at}-${event.action}`}
            className="flex justify-between gap-4 py-2.5 hairline-b"
          >
            <span>
              {eventLabel(event)}
              {event.note && <span className="block text-caption text-slate">“{event.note}”</span>}
            </span>
            <time dateTime={event.created_at} className="text-caption whitespace-nowrap text-slate">
              {ago(event.created_at)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StatusNotice({ booking, justSent }: { booking: Booking; justSent: boolean }) {
  const vendor = booking.vendor.display_name;
  switch (booking.status) {
    case 'pending':
      return (
        <Notice
          tone={justSent ? 'success' : 'info'}
          title={justSent ? `Request sent to ${vendor}` : `Waiting for ${vendor}`}
        >
          They have until {when(booking.expires_at).replace(/^(Today|Tomorrow),/, (day) => day.toLowerCase())}{' '}
          to confirm. We&apos;ll let you know the moment they do. You can chat with them now.
        </Notice>
      );
    case 'declined':
      return (
        <Notice title={`${vendor} can't take this job`}>
          <Link
            href={`/search?service=${booking.service.slug}`}
            className="font-semibold text-duka underline-offset-4 hover:underline"
          >
            Find another {booking.service.name.toLowerCase()} vendor
          </Link>
        </Notice>
      );
    case 'expired':
      return (
        <Notice title={`${vendor} didn't answer in time`}>
          <Link
            href={`/search?service=${booking.service.slug}`}
            className="font-semibold text-duka underline-offset-4 hover:underline"
          >
            Find another vendor
          </Link>
        </Notice>
      );
    case 'cancelled':
      return <Notice title="This booking was cancelled">{booking.cancellation_reason}</Notice>;
    default:
      return null;
  }
}

export function BookingDetail({ bookingId }: { bookingId: string }) {
  const user = useRequireUser();
  const justSent = useSearchParams().get('sent') === '1';
  const query = useBooking(bookingId);
  const booking = query.data;
  const confirmation = useFirstConfirmation(booking);
  const conversation = useBookingConversation(bookingId);
  const awaiting = useQuery({
    queryKey: keys.awaitingReviews,
    queryFn: () => unwrap(api.GET('/reviews/awaiting')),
    enabled: booking?.status === 'completed',
  });

  if (!user || query.isPending) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6" aria-busy="true">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (query.error || !booking) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          {isApiError(query.error, 'booking.not_found') ? (
            <EmptyState
              title="Booking not found"
              actions={
                <Link href="/bookings" className={buttonClasses()}>
                  My bookings
                </Link>
              }
            />
          ) : (
            <Notice tone="error" title="Couldn't load this booking">
              {errorMessage(query.error)}
            </Notice>
          )}
        </div>
      </>
    );
  }

  if (confirmation.showing) return <ConfirmationProof booking={booking} onDone={confirmation.dismiss} />;

  const pendingRevision =
    booking.status === 'awaiting_price_approval'
      ? booking.revisions.find((r) => r.status === 'pending')
      : undefined;
  const status = STATUS[booking.status];
  const canReview = awaiting.data?.some((item) => item.booking_id === booking.id) ?? false;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-12 sm:px-6">
        <Link
          href="/bookings"
          className="-ml-2 inline-flex items-center gap-1 rounded-sm p-2 text-body text-slate hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          My bookings
        </Link>

        <header className="mt-2 flex flex-wrap items-end justify-between gap-3 pb-5 hairline-b">
          <div>
            <p className="text-caption text-slate">Reference</p>
            <h1 className="font-display text-display-l font-extrabold font-condensed tabular">
              {booking.reference}
            </h1>
            <p className="mt-1 text-body-l">
              {booking.service.name} with{' '}
              <Link
                href={`/vendors/${booking.vendor.slug}`}
                className="font-semibold underline-offset-4 hover:underline"
              >
                {booking.vendor.display_name}
              </Link>
            </p>
          </div>
          <Badge tone={status.tone} className="h-7 px-2.5 text-body">
            {status.label}
          </Badge>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-7">
            <StatusNotice booking={booking} justSent={justSent} />
            <Progress booking={booking} />
            {pendingRevision && <PriceChangeCard booking={booking} revision={pendingRevision} />}
            {canReview && <ReviewForm booking={booking} />}
            <Details booking={booking} />
            <History booking={booking} />
          </div>

          <aside className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            <VendorContactCard booking={booking} />
            {conversation && (
              <Link
                href={`/messages/${conversation.id}`}
                className={buttonClasses({ variant: 'secondary', block: true })}
              >
                <MessageSquare aria-hidden="true" className="size-4" />
                {conversation.is_locked ? 'View chat' : 'Open chat'}
                {conversation.unread_count > 0 && <Badge tone="duka">{conversation.unread_count}</Badge>}
              </Link>
            )}
            <BookingActions booking={booking} />
          </aside>
        </div>
      </main>
    </>
  );
}
