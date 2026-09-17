import type { SearchSort } from '@/api/types';

/** Everything about a search lives in the URL, so results can be shared and the back button works. */
export type SearchState = {
  service: string | null;
  category: string | null;
  q: string | null;
  area: string | null;
  sort: SearchSort;
  minJobs: number | null;
  maxPrice: number | null;
  maxDistance: number | null;
};

export const SORTS: readonly { value: SearchSort; label: string }[] = [
  { value: 'distance', label: 'Nearest' },
  { value: 'jobs_completed', label: 'Jobs completed' },
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Lowest price' },
];

export const DISTANCES = [1000, 3000, 5000, 10000, 20000] as const;
export const JOB_THRESHOLDS = [null, 10, 50] as const;

function positiveInt(value: string | null): number | null {
  if (value == null || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
}

function isSort(value: string | null): value is SearchSort {
  return SORTS.some((sort) => sort.value === value);
}

export function parseSearch(params: URLSearchParams): SearchState {
  const sort = params.get('sort');
  return {
    service: params.get('service'),
    category: params.get('category'),
    q: params.get('q'),
    area: params.get('area'),
    sort: isSort(sort) ? sort : 'distance',
    minJobs: positiveInt(params.get('min_jobs')),
    maxPrice: positiveInt(params.get('max_price')),
    maxDistance: positiveInt(params.get('max_distance')),
  };
}

export function serializeSearch(state: SearchState): string {
  const params = new URLSearchParams();
  const entries: [string, string | number | null][] = [
    ['service', state.service],
    ['category', state.category],
    ['q', state.q],
    ['area', state.area],
    ['sort', state.sort === 'distance' ? null : state.sort],
    ['min_jobs', state.minJobs],
    ['max_price', state.maxPrice],
    ['max_distance', state.maxDistance],
  ];
  for (const [key, value] of entries) {
    if (value !== null && value !== '') params.set(key, String(value));
  }
  return params.toString();
}

export function hasFilters(state: SearchState): boolean {
  return state.minJobs != null || state.maxPrice != null || state.maxDistance != null;
}
