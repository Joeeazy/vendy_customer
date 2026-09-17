import { describe, expect, it } from 'vitest';

import { hasFilters, parseSearch, serializeSearch } from './searchState';

describe('search URL state', () => {
  it('round-trips through the URL', () => {
    const query = 'service=plumbing-leak-repair&area=kilimani&sort=jobs_completed&min_jobs=10&max_price=5000&max_distance=5000';
    const state = parseSearch(new URLSearchParams(query));
    expect(state).toMatchObject({ service: 'plumbing-leak-repair', area: 'kilimani', sort: 'jobs_completed', minJobs: 10, maxPrice: 5000, maxDistance: 5000 });
    expect(parseSearch(new URLSearchParams(serializeSearch(state)))).toEqual(state);
  });

  it('keeps the default sort out of the URL', () => {
    expect(serializeSearch(parseSearch(new URLSearchParams('service=blocked-drain&sort=distance')))).toBe('service=blocked-drain');
  });

  it('ignores junk values', () => {
    const state = parseSearch(new URLSearchParams('sort=cheapest&min_jobs=-4&max_price=abc&max_distance=0'));
    expect(state.sort).toBe('distance');
    expect(hasFilters(state)).toBe(false);
  });
});
