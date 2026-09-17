'use client';

import { useQuery } from '@tanstack/react-query';
import { Lock, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { firstName, shortDate, when } from '@/api/format';
import { keys } from '@/api/keys';
import type { BookingSummary } from '@/api/types';
import { useRequireUser } from '@/features/auth/session';
import { Avatar } from '@/ui/Avatar';
import { Badge } from '@/ui/Badges';
import { EmptyState, Notice, Skeleton } from '@/ui/Blocks';
import { buttonClasses } from '@/ui/Button';
import { SegmentedControl } from '@/ui/SegmentedControl';

import { contactShared, isActive, STATUS } from './status';

type Tab = 'active' | 'past';

const TABS = [
  { value: 'active', label: 'Active' },
  { value: 'past', label: 'Past' },
] as const;

function BookingRow({ booking, canReview }: { booking: BookingSummary; canReview: boolean }) {
  const status = STATUS[booking.status];
  const date = booking.preferred_at ? when(booking.preferred_at) : shortDate(booking.created_at);
  const href = `/bookings/${booking.id}`;

  return (
    <li className="hairline-b">
      <Link href={href} className="flex gap-4 px-4 py-4 hover:bg-chalk/60 sm:px-0">
        <Avatar name={booking.vendor.display_name} size="sm" className="sm:size-14 sm:text-title" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate font-display text-title font-bold">{booking.vendor.display_name}</p>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="truncate text-body text-slate">
            {booking.service.name} · {date}
          </p>
          <p className="mt-1 text-caption">
            {booking.status === 'pending' && (
              <span className="inline-flex items-center gap-1.5 text-slate">
                <Lock aria-hidden="true" className="size-3.5" />
                Phone unlocks once {firstName(booking.vendor.display_name)} confirms
              </span>
            )}
            {contactShared(booking.status) && booking.status !== 'completed' && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-duka">
                <Phone aria-hidden="true" className="size-3.5" />
                Number unlocked
              </span>
            )}
            {canReview && <span className="font-semibold text-duka">Rate this job</span>}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function BookingsList() {
  const user = useRequireUser();
  const [tab, setTab] = useState<Tab>('active');
  const bookings = useQuery({
    queryKey: keys.bookings(),
    queryFn: () => unwrap(api.GET('/bookings', { params: { query: { limit: 100 } } })),
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
  });
  const awaiting = useQuery({
    queryKey: keys.awaitingReviews,
    queryFn: () => unwrap(api.GET('/reviews/awaiting')),
    enabled: Boolean(user),
  });

  const reviewable = new Set(awaiting.data?.map((item) => item.booking_id));
  const items = (bookings.data?.items ?? []).filter((booking) => isActive(booking.status) === (tab === 'active'));

  return (
    <main className="mx-auto max-w-3xl pt-6 pb-12 sm:px-6">
      <div className="flex flex-col gap-4 px-4 pb-4 sm:px-0">
        <h1 className="font-display text-display-l font-extrabold font-condensed">My bookings</h1>
        <SegmentedControl label="Bookings" options={TABS} value={tab} onChange={setTab} className="sm:max-w-sm" />
      </div>

      {(!user || bookings.isPending) && (
        <ul aria-busy="true" className="hairline-t">
          {[0, 1, 2].map((index) => (
            <li key={index} className="flex gap-4 px-4 py-4 hairline-b sm:px-0">
              <Skeleton className="size-10 sm:size-14" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {bookings.error && (
        <Notice tone="error" title="Couldn't load your bookings" className="mx-4 sm:mx-0">
          {errorMessage(bookings.error)}
        </Notice>
      )}

      {bookings.data && items.length === 0 && (
        <EmptyState
          className="px-4 pt-6 sm:px-0"
          title={tab === 'active' ? 'Nothing booked right now.' : 'No past bookings yet.'}
          actions={
            <Link href="/search" className={buttonClasses({ className: 'sm:self-start' })}>
              Find a vendor
            </Link>
          }
        >
          Every vendor on Vendy has shown us an ID, and their completed jobs are on their profile.
        </EmptyState>
      )}

      {items.length > 0 && (
        <ul className="hairline-t">
          {items.map((booking) => (
            <BookingRow key={booking.id} booking={booking} canReview={reviewable.has(booking.id)} />
          ))}
        </ul>
      )}
    </main>
  );
}
