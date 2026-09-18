'use client';

import { Check } from 'lucide-react';

import type { Category, PublicStats } from '@/api/types';
import { useArea } from '@/features/area/area';
import { CategoryGrid } from '@/features/catalog/CategoryGrid';
import { ServiceSearch } from '@/features/catalog/ServiceSearch';
import { BrushUnderline } from '@/ui/BrushStroke';

const PROMISES = [
  'ID checked by a person, not a bot.',
  'Jobs completed shown on every card, not just stars.',
  'Your number is shared only when a vendor confirms your booking.',
];

export function HomeHero({ categories, stats }: { categories: Category[]; stats: PublicStats | null }) {
  const { slug, neighbourhoods } = useArea();
  const vendorCount = stats?.verified_vendors ?? 0;
  const areaCount = stats?.areas ?? neighbourhoods.length;

  return (
    <>
      <section className="lg:grid lg:grid-cols-[1fr_minmax(0,32rem)]">
        {/* The hero is the search itself, over the one mabati band on the page. */}
        <div className="bg-mabati px-4 pt-8 pb-8 sm:px-6 lg:px-12 lg:pt-16 lg:pb-14">
          <h1 className="inline-flex flex-col font-display text-display-l leading-tight font-extrabold font-condensed sm:text-[3.25rem] lg:text-[4.5rem]">
            What do you need done?
            <BrushUnderline className="mt-2 w-2/3 sm:w-[22rem]" />
          </h1>
          <p className="mt-3 text-body-l text-slate">Unahitaji msaada wa nini?</p>

          <ServiceSearch categories={categories} className="mt-6 max-w-3xl" />

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-caption text-slate">
            {vendorCount > 0 && <li>{vendorCount} verified vendors</li>}
            {areaCount > 0 && <li>{areaCount} Nairobi areas</li>}
            <li>Phone numbers stay private until you book</li>
          </ul>
        </div>

        <aside className="hidden bg-duka p-10 text-chalk lg:flex lg:flex-col lg:justify-center">
          <p className="font-display text-display-m font-bold">Every vendor here has shown us an ID.</p>
          <ul className="mt-6 flex flex-col gap-3">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex gap-3 text-body-l">
                <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-sign" />
                {promise}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <nav aria-label="Categories" className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <CategoryGrid categories={categories} areaSlug={slug} />
      </nav>
    </>
  );
}
