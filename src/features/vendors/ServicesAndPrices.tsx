import type { OfferedService } from '@/api/types';

import { priceLabel } from './priceChoices';

export function ServicesAndPrices({ services }: { services: OfferedService[] }) {
  const grouped = services.length > 1;

  return (
    <section aria-labelledby="services-heading">
      <h2 id="services-heading" className="font-display text-display-m font-bold">
        Services and prices
      </h2>
      <div className="mt-3 flex flex-col gap-5">
        {services.map((service) => (
          <div key={service.service_type_id}>
            {grouped && <h3 className="mb-1 text-caption font-semibold tracking-wide text-slate uppercase">{service.name}</h3>}
            <ul className="grid hairline-t sm:grid-cols-2 sm:gap-x-10">
              {service.price_items.length === 0 && (
                <li className="flex justify-between gap-4 py-3 hairline-b">
                  <span>{grouped ? 'Priced after a look at the job' : service.name}</span>
                  <span className="text-slate">Ask for a price</span>
                </li>
              )}
              {service.price_items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 hairline-b">
                  <span>
                    {item.label}
                    {item.warranty_days > 0 && <span className="block text-caption text-slate">{item.warranty_days}-day warranty</span>}
                  </span>
                  <span className="text-right font-display font-bold whitespace-nowrap tabular">{priceLabel(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-caption text-slate">Nothing is charged through Vendy. You pay the vendor directly.</p>
    </section>
  );
}
