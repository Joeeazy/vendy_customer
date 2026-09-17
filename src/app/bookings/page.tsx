import type { Metadata } from 'next';

import { BookingsList } from '@/features/bookings/BookingsList';
import { SiteHeader } from '@/features/layout/SiteHeader';

export const metadata: Metadata = { title: 'My bookings', robots: { index: false } };

export default function BookingsPage() {
  return (
    <>
      <SiteHeader />
      <BookingsList />
    </>
  );
}
