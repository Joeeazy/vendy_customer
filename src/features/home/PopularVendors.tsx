'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { api, unwrap } from '@/api/client';
import { keys } from '@/api/keys';
import { useArea } from '@/features/area/area';
import { VendorRow } from '@/features/vendors/VendorCard';
import { Skeleton } from '@/ui/Blocks';

export function PopularVendors() {
  const { point, label, slug } = useArea();

  const popular = useQuery({
    queryKey: keys.popular(point?.lat ?? 0, point?.lng ?? 0),
    queryFn: () =>
      unwrap(api.GET('/search/popular', { params: { query: { lat: point!.lat, lng: point!.lng } } })),
    enabled: point != null,
  });

  if (popular.isSuccess && popular.data.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-[1440px] px-4 sm:px-6 lg:px-12" aria-labelledby="popular-heading">
      <div className="flex items-baseline justify-between gap-4 pb-3 hairline-b">
        <h2 id="popular-heading" className="font-display text-title font-bold lg:text-display-m">
          Busiest in {label}
        </h2>
        <Link
          href={slug ? `/search?area=${slug}` : '/search'}
          className="text-body font-semibold text-duka hover:underline"
        >
          See all
        </Link>
      </div>

      {popular.isPending ? (
        <div
          className="grid gap-4 py-4 lg:grid-cols-3"
          aria-busy="true"
          aria-label={`Finding vendors in ${label}`}
        >
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="size-16" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : popular.isError ? null : (
        <ul className="grid lg:grid-cols-3 lg:divide-x-[1.5px] lg:divide-ink-12 [&>li+li]:hairline-t lg:[&>li+li]:border-t-0">
          {popular.data.slice(0, 3).map((vendor) => (
            <li key={vendor.id}>
              <VendorRow vendor={vendor} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
