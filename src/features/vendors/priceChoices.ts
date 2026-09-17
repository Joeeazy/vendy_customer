import { kes } from '@/api/format';
import type { OfferedService, PriceItem } from '@/api/types';

/**
 * What a customer can book from a vendor: each listed price, or a quote for a
 * service (the vendor sets the price when they accept).
 */
export type PriceChoice = {
  value: string;
  serviceTypeId: number;
  serviceName: string;
  label: string;
  item: PriceItem | null;
};

export function priceLabel(item: PriceItem): string {
  return item.price_type === 'callout' ? `${kes(item.price_kes)} to come and look` : kes(item.price_kes);
}

export function priceChoices(services: OfferedService[]): PriceChoice[] {
  return services.flatMap((service) => [
    ...service.price_items.map((item) => ({
      value: `item:${item.id}`,
      serviceTypeId: service.service_type_id,
      serviceName: service.name,
      label: `${item.label} · ${priceLabel(item)}`,
      item,
    })),
    {
      value: `quote:${service.service_type_id}`,
      serviceTypeId: service.service_type_id,
      serviceName: service.name,
      label: service.price_items.length ? `${service.name} · something else, ask for a price` : `${service.name} · ask for a price`,
      item: null,
    },
  ]);
}

/** The cheapest listed price across a vendor's services. */
export function lowestPrice(services: OfferedService[]): number | null {
  const prices = services.flatMap((service) => service.price_items.map((item) => item.price_kes));
  return prices.length ? Math.min(...prices) : null;
}
