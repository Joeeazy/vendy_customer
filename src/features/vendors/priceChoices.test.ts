import { describe, expect, it } from 'vitest';

import type { OfferedService } from '@/api/types';

import { lowestPrice, priceChoices } from './priceChoices';

const services: OfferedService[] = [
  {
    service_type_id: 7,
    slug: 'leak-repair',
    name: 'Leak repair',
    price_items: [
      { id: 'a', label: 'Kitchen sink leak', price_type: 'fixed', price_kes: 1500, warranty_days: 7, suggested_label_id: null },
      { id: 'b', label: 'Site visit', price_type: 'callout', price_kes: 500, warranty_days: 0, suggested_label_id: null },
    ],
  },
  { service_type_id: 9, slug: 'drainage', name: 'Drainage', price_items: [] },
];

describe('priceChoices', () => {
  it('lists every price, then a quote option per service', () => {
    expect(priceChoices(services).map((choice) => [choice.value, choice.label])).toEqual([
      ['item:a', 'Kitchen sink leak · KSh 1,500'],
      ['item:b', 'Site visit · KSh 500 to come and look'],
      ['quote:7', 'Leak repair · something else, ask for a price'],
      ['quote:9', 'Drainage · ask for a price'],
    ]);
  });

  it('keeps the service each choice books', () => {
    expect(priceChoices(services).map((choice) => choice.serviceTypeId)).toEqual([7, 7, 7, 9]);
  });
});

describe('lowestPrice', () => {
  it('is the cheapest listed price, or null with no prices', () => {
    expect(lowestPrice(services)).toBe(500);
    expect(lowestPrice([services[1]!])).toBeNull();
  });
});
