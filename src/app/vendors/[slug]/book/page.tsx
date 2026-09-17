import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BookingForm } from '@/features/bookings/BookingForm';
import { loadVendor } from '@/features/vendors/loadVendor';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await loadVendor((await params).slug);
  return { title: vendor ? `Book ${vendor.display_name}` : 'Vendor not found', robots: { index: false } };
}

export default async function BookVendorPage({ params }: Props) {
  const vendor = await loadVendor((await params).slug);
  if (!vendor) notFound();

  return (
    <main className="min-h-dvh">
      <BookingForm vendor={vendor} />
    </main>
  );
}
