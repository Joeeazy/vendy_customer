'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/ui/cn';

import { useArea } from './area';

const NEAR_ME = '__near-me__';

/** Pick a neighbourhood, or use the device's location. */
export function AreaSelect({ className, tone = 'chalk' }: { className?: string; tone?: 'chalk' | 'ghost' }) {
  const { neighbourhoods, slug, label, chooseNeighbourhood, locateDevice } = useArea();
  const [error, setError] = useState<string | null>(null);

  async function onChange(value: string) {
    setError(null);
    if (value !== NEAR_ME) {
      chooseNeighbourhood(value);
      return;
    }
    try {
      await locateDevice();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pick your area instead.');
    }
  }

  return (
    <div className={cn('relative', className)}>
      <label className="sr-only" htmlFor="area-select">
        Your area
      </label>
      <MapPin
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate"
      />
      <select
        id="area-select"
        value={slug ?? NEAR_ME}
        onChange={(event) => void onChange(event.target.value)}
        className={cn(
          'h-11 w-full appearance-none rounded-sm pr-4 pl-9 text-body font-medium text-ink',
          tone === 'chalk' ? 'bg-chalk hairline' : 'bg-transparent',
        )}
      >
        <option value={NEAR_ME}>{slug ? 'Use my location' : label}</option>
        {neighbourhoods.map((neighbourhood) => (
          <option key={neighbourhood.slug} value={neighbourhood.slug}>
            {neighbourhood.name}
          </option>
        ))}
      </select>
      {error && (
        <p
          role="alert"
          className="absolute top-full right-0 z-10 mt-1 w-64 rounded-sm bg-clay-soft p-2 text-caption text-ink"
        >
          {error}
        </p>
      )}
    </div>
  );
}
