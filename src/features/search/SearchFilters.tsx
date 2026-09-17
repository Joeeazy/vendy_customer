'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { distance, kes } from '@/api/format';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/cn';
import { Select, TextInput } from '@/ui/Field';

import { DISTANCES, hasFilters, JOB_THRESHOLDS, SORTS, type SearchState } from './searchState';

type Props = {
  state: SearchState;
  onChange: (patch: Partial<SearchState>) => void;
};

function FilterFields({ state, onChange }: Props) {
  const [price, setPrice] = useState(state.maxPrice?.toString() ?? '');

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 font-semibold">Distance</legend>
        <Select
          aria-label="Distance"
          value={state.maxDistance ?? ''}
          onChange={(event) => onChange({ maxDistance: event.target.value ? Number(event.target.value) : null })}
        >
          <option value="">Anyone who comes to you</option>
          {DISTANCES.map((metres) => (
            <option key={metres} value={metres}>
              Within {distance(metres)}
            </option>
          ))}
        </Select>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">Jobs completed</legend>
        <div className="grid grid-cols-3 gap-1">
          {JOB_THRESHOLDS.map((threshold) => {
            const selected = state.minJobs === threshold;
            return (
              <button
                key={threshold ?? 'any'}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ minJobs: threshold })}
                className={cn('h-11 rounded-sm text-body font-semibold', selected ? 'bg-ink text-paper' : 'bg-chalk hairline hover:bg-paper')}
              >
                {threshold == null ? 'Any' : `${threshold}+`}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">Price from, up to</legend>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onChange({ maxPrice: /^\d+$/.test(price) && Number(price) > 0 ? Number(price) : null });
          }}
        >
          <TextInput
            inputMode="numeric"
            aria-label="Highest starting price in shillings"
            placeholder="e.g. 5000"
            value={price}
            onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))}
          />
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
        {state.maxPrice != null && <p className="mt-1.5 text-caption text-slate">Showing prices up to {kes(state.maxPrice)}</p>}
      </fieldset>

      {hasFilters(state) && (
        <Button
          variant="link"
          className="self-start"
          onClick={() => {
            setPrice('');
            onChange({ minJobs: null, maxPrice: null, maxDistance: null });
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

export function SortSelect({ state, onChange, className }: Props & { className?: string }) {
  return (
    <label className={cn('flex items-center gap-2', className)}>
      <span className="text-body text-slate">Sort</span>
      <Select
        value={state.sort}
        onChange={(event) => onChange({ sort: event.target.value as SearchState['sort'] })}
        className="h-11 w-auto min-w-40 font-semibold"
      >
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

/** Filter rail on desktop; a collapsible panel on phones. */
export function SearchFilters(props: Props) {
  return (
    <>
      <aside className="hidden w-80 shrink-0 p-6 lg:block lg:pl-12" aria-label="Filters">
        <p className="mb-4 text-caption font-semibold text-slate">Filters</p>
        <FilterFields {...props} />
      </aside>

      <details className="group px-4 sm:px-6 lg:hidden">
        <summary className="flex h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-sm bg-chalk px-3 font-semibold hairline [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filters{hasFilters(props.state) ? ' (on)' : ''}
        </summary>
        <div className="mt-3 rounded-card bg-chalk p-4 hairline">
          <FilterFields {...props} />
        </div>
      </details>
    </>
  );
}
