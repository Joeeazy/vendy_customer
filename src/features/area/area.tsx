'use client';

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Neighbourhood } from '@/api/types';

/**
 * Where the customer is looking for help: a neighbourhood they picked, or
 * their device location. Search always sends a point, so both work the same.
 * Remembered in this browser only.
 */

type Area =
  { kind: 'neighbourhood'; neighbourhood: Neighbourhood } | { kind: 'near-me'; lat: number; lng: number };

type AreaContextValue = {
  neighbourhoods: Neighbourhood[];
  area: Area | null;
  point: { lat: number; lng: number } | null;
  label: string;
  /** The neighbourhood slug for URLs, or null when using device location. */
  slug: string | null;
  chooseNeighbourhood: (slug: string) => void;
  locateDevice: () => Promise<void>;
};

const STORAGE_KEY = 'vendy.area';
const DEFAULT_SLUG = 'kilimani';

const AreaContext = createContext<AreaContextValue | null>(null);

function defaultNeighbourhood(neighbourhoods: Neighbourhood[]): Neighbourhood | undefined {
  return (
    neighbourhoods.find((n) => n.is_launch_area) ??
    neighbourhoods.find((n) => n.slug === DEFAULT_SLUG) ??
    neighbourhoods[0]
  );
}

function readStored(neighbourhoods: Neighbourhood[]): Area | null {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!stored) return null;
  if (stored.startsWith('near-me:')) {
    const [lat, lng] = stored.slice('near-me:'.length).split(',').map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { kind: 'near-me', lat: lat!, lng: lng! } : null;
  }
  const neighbourhood = neighbourhoods.find((n) => n.slug === stored);
  return neighbourhood ? { kind: 'neighbourhood', neighbourhood } : null;
}

function store(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private browsing: the choice just isn't remembered.
  }
}

export function AreaProvider({
  neighbourhoods,
  children,
}: {
  neighbourhoods: Neighbourhood[];
  children: ReactNode;
}) {
  const fallback = defaultNeighbourhood(neighbourhoods);
  const [area, setArea] = useState<Area | null>(
    fallback ? { kind: 'neighbourhood', neighbourhood: fallback } : null,
  );

  useEffect(() => {
    const stored = readStored(neighbourhoods);
    // Reading localStorage has to wait until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setArea(stored);
  }, [neighbourhoods]);

  const chooseNeighbourhood = useCallback(
    (slug: string) => {
      const neighbourhood = neighbourhoods.find((n) => n.slug === slug);
      if (!neighbourhood) return;
      setArea({ kind: 'neighbourhood', neighbourhood });
      store(slug);
    },
    [neighbourhoods],
  );

  const locateDevice = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error("This browser can't share your location. Pick your area instead."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const lat = Number(coords.latitude.toFixed(4));
            const lng = Number(coords.longitude.toFixed(4));
            setArea({ kind: 'near-me', lat, lng });
            store(`near-me:${lat},${lng}`);
            resolve();
          },
          () => reject(new Error("We couldn't get your location. Pick your area instead.")),
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
        );
      }),
    [],
  );

  const value = useMemo<AreaContextValue>(() => {
    const point =
      area?.kind === 'neighbourhood'
        ? { lat: area.neighbourhood.lat, lng: area.neighbourhood.lng }
        : area
          ? { lat: area.lat, lng: area.lng }
          : null;
    return {
      neighbourhoods,
      area,
      point,
      label: area?.kind === 'neighbourhood' ? area.neighbourhood.name : area ? 'Near you' : 'Pick your area',
      slug: area?.kind === 'neighbourhood' ? area.neighbourhood.slug : null,
      chooseNeighbourhood,
      locateDevice,
    };
  }, [neighbourhoods, area, chooseNeighbourhood, locateDevice]);

  return <AreaContext value={value}>{children}</AreaContext>;
}

export function useArea(): AreaContextValue {
  const context = use(AreaContext);
  if (!context) throw new Error('useArea must be used inside AreaProvider');
  return context;
}
