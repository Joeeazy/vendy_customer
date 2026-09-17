import Link from 'next/link';

import { distance, kes } from '@/api/format';
import type { VendorCard as VendorCardData } from '@/api/types';
import { Avatar } from '@/ui/Avatar';
import { VerifiedMark } from '@/ui/Badges';
import { buttonClasses } from '@/ui/Button';
import { cn } from '@/ui/cn';

function Rating({ vendor }: { vendor: VendorCardData }) {
  if (vendor.rating_avg == null) return <span className="text-slate">No reviews yet</span>;
  return (
    <span>
      <span className="font-semibold tabular">{vendor.rating_avg.toFixed(1)}</span>{' '}
      <span className="text-slate">
        ({vendor.rating_count} {vendor.rating_count === 1 ? 'review' : 'reviews'})
      </span>
    </span>
  );
}

/**
 * The most important component in the product. Jobs completed is the loudest
 * number: completed work predicts a good outcome better than stars do.
 * Every vendor in search has passed ID verification, so each carries the mark.
 */
export function VendorCard({ vendor, emphasis = false }: { vendor: VendorCardData; emphasis?: boolean }) {
  const href = `/vendors/${vendor.slug}`;
  return (
    <article className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:gap-x-6 sm:py-6">
      <Avatar name={vendor.display_name} size="md" className="sm:size-24 sm:text-display-m" tone={emphasis ? 'soft' : 'chalk'} />

      <div className="min-w-0">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={href} className="font-display text-title font-bold hover:underline sm:text-display-m">
            {vendor.display_name}
          </Link>
          <VerifiedMark label="Verified" className="hidden sm:inline-flex" />
          <VerifiedMark className="sm:hidden" />
        </h3>
        <p className="mt-0.5 truncate text-body text-slate">
          {[vendor.services.slice(0, 3).join(', '), vendor.neighbourhood?.name].filter(Boolean).join(' in ')}
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <span className="block font-display text-display-l leading-none font-extrabold tabular">{vendor.jobs_completed}</span>
            <span className="text-caption text-slate">jobs completed</span>
          </div>
          <div className="text-caption leading-snug">
            <Rating vendor={vendor} />
            <span className="block text-slate">{distance(vendor.distance_m)} away</span>
          </div>
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:w-52 sm:flex-col sm:items-stretch sm:justify-start">
        {vendor.price_from_kes != null ? (
          <p className="font-display text-title font-bold tabular sm:text-display-m">From {kes(vendor.price_from_kes)}</p>
        ) : (
          <p className="text-body text-slate">Price on request</p>
        )}
        <Link href={href} className={buttonClasses({ variant: emphasis ? 'primary' : 'secondary', size: 'md', className: cn('sm:w-full') })}>
          View profile
        </Link>
      </div>
    </article>
  );
}

/** A compact vendor for the home page lists. */
export function VendorRow({ vendor }: { vendor: VendorCardData }) {
  return (
    <Link href={`/vendors/${vendor.slug}`} className="flex gap-4 py-4 hover:bg-chalk/60 lg:px-5">
      <Avatar name={vendor.display_name} size="md" />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5">
          <span className="truncate font-display text-title font-bold">{vendor.display_name}</span>
          <VerifiedMark />
        </p>
        <p className="truncate text-caption text-slate">{vendor.services.slice(0, 3).join(', ')}</p>
        <div className="mt-1.5 flex items-end gap-5">
          <div>
            <span className="block font-display text-display-m leading-none font-extrabold tabular">{vendor.jobs_completed}</span>
            <span className="text-caption text-slate">jobs completed</span>
          </div>
          <div className="text-caption leading-snug text-slate">
            <span className="block">
              {vendor.rating_avg != null ? `${vendor.rating_avg.toFixed(1)} (${vendor.rating_count})` : 'New on Vendy'}
            </span>
            <span className="block">{distance(vendor.distance_m)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
