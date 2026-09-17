import Link from 'next/link';

import { SiteHeader } from '@/features/layout/SiteHeader';
import { EmptyState } from '@/ui/Blocks';
import { buttonClasses } from '@/ui/Button';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] pb-16 sm:px-6 lg:px-12">
        <EmptyState
          band
          title="We couldn't find that page."
          actions={
            <Link href="/search" className={buttonClasses({ className: 'sm:self-start' })}>
              Find a vendor
            </Link>
          }
        >
          The vendor may have moved or paused their profile. Search shows everyone taking bookings now.
        </EmptyState>
      </main>
    </>
  );
}
