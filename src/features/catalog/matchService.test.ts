import { describe, expect, it } from 'vitest';

import { matchServices, type ServiceOption } from './matchService';

const options: ServiceOption[] = [
  { slug: 'plumbing-leak-repair', name: 'Leak repair', categorySlug: 'plumbing', categoryName: 'Plumbing' },
  { slug: 'blocked-drain', name: 'Blocked drain', categorySlug: 'plumbing', categoryName: 'Plumbing' },
  {
    slug: 'phone-screen-replacement',
    name: 'Screen replacement',
    categorySlug: 'phone-repair',
    categoryName: 'Phone repair',
  },
  {
    slug: 'laptop-screen-replacement',
    name: 'Screen replacement',
    categorySlug: 'laptop-repair',
    categoryName: 'Laptop repair',
  },
  { slug: 'home-deep-clean', name: 'Deep clean', categorySlug: 'cleaning', categoryName: 'Cleaning' },
];

describe('matchServices', () => {
  it('maps everyday words to the catalogue', () => {
    expect(matchServices('plumber', options).map((o) => o.categorySlug)).toEqual(['plumbing', 'plumbing']);
    expect(matchServices('cleaner', options)[0]?.slug).toBe('home-deep-clean');
  });

  it('ranks a service-name match above a category-only match', () => {
    expect(matchServices('leak plumbing', options)[0]?.slug).toBe('plumbing-leak-repair');
  });

  it('uses the category to tell similar services apart', () => {
    expect(matchServices('cracked phone screen', options)[0]?.slug).toBe('phone-screen-replacement');
    expect(matchServices('laptop screen', options)[0]?.slug).toBe('laptop-screen-replacement');
  });

  it('returns nothing for nothing', () => {
    expect(matchServices('  ', options)).toEqual([]);
    expect(matchServices('xylophone tuning', options)).toEqual([]);
  });
});
