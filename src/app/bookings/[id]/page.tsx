import type { Metadata } from 'next';

import { BookingDetail } from '@/features/bookings/BookingDetail';

export const metadata: Metadata = { title: 'Booking', robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

export default async function BookingPage({ params }: Props) {
  const { id } = await params;
  return <BookingDetail bookingId={id} />;
}
