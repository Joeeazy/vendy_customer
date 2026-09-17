'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { keys } from '@/api/keys';
import type { Category } from '@/api/types';
import { useArea } from '@/features/area/area';
import { AreaSelect } from '@/features/area/AreaSelect';
import { CategoryGrid } from '@/features/catalog/CategoryGrid';
import { matchServices, serviceOptions } from '@/features/catalog/matchService';
import { VendorCard } from '@/features/vendors/VendorCard';
import { EmptyState, Notice, Skeleton } from '@/ui/Blocks';
import { Button, buttonClasses } from '@/ui/Button';
import { cn } from '@/ui/cn';

import { SearchFilters, SortSelect } from './SearchFilters';
import { hasFilters, parseSearch, serializeSearch, type SearchState } from './searchState';

const PAGE_SIZE = 20;

function ResultsSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true">
      <p className="py-3 text-body text-slate">{label}</p>
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex gap-4 py-5 hairline-t sm:gap-6">
          <Skeleton className="size-16 sm:size-24" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-6 w-2/3 max-w-sm" />
            <Skeleton className="h-3.5 w-full max-w-md" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResults({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const state = useMemo(() => parseSearch(new URLSearchParams(params.toString())), [params]);
  const area = useArea();

  const options = useMemo(() => serviceOptions(categories), [categories]);
  const category = categories.find((c) => c.slug === state.category);

  // Resolve what to search for: an explicit service, the first service in a
  // category, or the best match for what was typed.
  const suggestions = useMemo(() => (state.q ? matchServices(state.q, options) : []), [state.q, options]);
  const resolvedSlug = state.service ?? category?.service_types[0]?.slug ?? suggestions[0]?.slug ?? null;
  const service = options.find((option) => option.slug === resolvedSlug) ?? null;

  // A URL area wins over the remembered one, so shared links show the same results.
  const urlArea = area.neighbourhoods.find((n) => n.slug === state.area);
  const point = urlArea ? { lat: urlArea.lat, lng: urlArea.lng } : area.point;
  const areaLabel = urlArea?.name ?? area.label;

  useEffect(() => {
    if (!state.area && area.slug) {
      router.replace(`${pathname}?${serializeSearch({ ...state, area: area.slug })}`, { scroll: false });
    }
  }, [state, area.slug, pathname, router]);

  function update(patch: Partial<SearchState>) {
    router.replace(`${pathname}?${serializeSearch({ ...state, ...patch })}`, { scroll: false });
  }

  const results = useInfiniteQuery({
    queryKey: keys.search({
      service: service?.slug,
      lat: point?.lat,
      lng: point?.lng,
      sort: state.sort,
      minJobs: state.minJobs ?? undefined,
      maxPrice: state.maxPrice ?? undefined,
      maxDistance: state.maxDistance ?? undefined,
    }),
    enabled: service != null && point != null,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      unwrap(
        api.GET('/search/vendors', {
          params: {
            query: {
              service: service!.slug,
              lat: point!.lat,
              lng: point!.lng,
              sort: state.sort,
              min_jobs: state.minJobs ?? undefined,
              max_price: state.maxPrice ?? undefined,
              max_distance_m: state.maxDistance ?? undefined,
              offset: pageParam,
              limit: PAGE_SIZE,
            },
          },
        }),
      ),
    getNextPageParam: (last) => (last.offset + last.count < last.total ? last.offset + last.count : undefined),
  });

  if (!service) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12">
        <h1 className="font-display text-display-m font-bold lg:text-display-l">
          {state.q ? `We couldn't match "${state.q}" to a service.` : 'What do you need done?'}
        </h1>
        <p className="mt-2 mb-6 text-body-l text-slate">Pick the closest kind of work.</p>
        <CategoryGrid categories={categories} areaSlug={area.slug} />
      </div>
    );
  }

  const siblings = category?.service_types ?? categories.find((c) => c.slug === service.categorySlug)?.service_types ?? [];
  const vendors = results.data?.pages.flatMap((page) => page.items) ?? [];
  const total = results.data?.pages[0]?.total ?? 0;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
      <SearchFilters state={state} onChange={update} />

      <section className="min-w-0 flex-1 px-4 pb-12 sm:px-6 lg:border-l-[1.5px] lg:border-ink-12 lg:px-12" aria-labelledby="results-heading">
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 id="results-heading" className="font-display text-display-m font-bold lg:text-display-l">
              {service.name} in {areaLabel}
            </h1>
            <p className="mt-1 text-body text-slate" aria-live="polite">
              {results.isSuccess ? `${total} ${total === 1 ? 'vendor matches' : 'vendors match'} ${hasFilters(state) ? 'your filters' : 'here'}` : ' '}
            </p>
          </div>
          <SortSelect state={state} onChange={update} />
        </div>

        {siblings.length > 1 && (
          <nav aria-label={`Other ${service.categoryName} services`} className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-2">
            {siblings.map((sibling) => (
              <button
                key={sibling.slug}
                type="button"
                aria-pressed={sibling.slug === service.slug}
                onClick={() => update({ service: sibling.slug, q: null })}
                className={cn(
                  'h-10 shrink-0 rounded-sm px-3 text-body font-semibold',
                  sibling.slug === service.slug ? 'bg-ink text-paper' : 'bg-chalk hairline hover:bg-paper',
                )}
              >
                {sibling.name}
              </button>
            ))}
          </nav>
        )}

        {results.isPending ? (
          <ResultsSkeleton label={`Looking for ${service.name.toLowerCase()} near ${areaLabel}…`} />
        ) : results.isError ? (
          <Notice tone="error" title="Search didn't load.">
            {errorMessage(results.error)}{' '}
            <Button variant="link" onClick={() => void results.refetch()}>
              Try again
            </Button>
          </Notice>
        ) : vendors.length === 0 ? (
          <EmptyState
            band
            title={`No ${service.name.toLowerCase()} vendors in ${areaLabel} yet.`}
            actions={
              hasFilters(state) ? (
                <Button onClick={() => update({ minJobs: null, maxPrice: null, maxDistance: null })}>Clear filters</Button>
              ) : (
                <>
                  <AreaSelect className="[&_select]:h-12" />
                  <Link href="/" className={buttonClasses({ variant: 'secondary' })}>
                    Search for something else
                  </Link>
                </>
              )
            }
          >
            {hasFilters(state) ? 'Your filters leave nobody. Try clearing them.' : 'Try a nearby area, or look for a related service.'}
          </EmptyState>
        ) : (
          <>
            {/* One stack, hairline rules between vendors, shown as a set. */}
            <ul className="[&>li]:hairline-t">
              {vendors.map((vendor, index) => (
                <li key={vendor.id}>
                  <VendorCard vendor={vendor} emphasis={index === 0} />
                </li>
              ))}
            </ul>
            {results.hasNextPage && (
              <Button variant="secondary" block className="mt-4" loading={results.isFetchingNextPage} onClick={() => void results.fetchNextPage()}>
                Show more vendors
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
