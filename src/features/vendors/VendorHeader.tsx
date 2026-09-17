import type { VendorProfile } from '@/api/types';
import { Avatar } from '@/ui/Avatar';
import { VerifiedMark } from '@/ui/Badges';
import { cn } from '@/ui/cn';

type StatItem = { value: string; label: string };

function stats(vendor: VendorProfile): StatItem[] {
  const items: StatItem[] = [{ value: String(vendor.jobs_completed), label: 'jobs completed' }];
  items.push(
    vendor.rating_avg != null
      ? {
          value: vendor.rating_avg.toFixed(1),
          label: `${vendor.rating_count} ${vendor.rating_count === 1 ? 'review' : 'reviews'}`,
        }
      : { value: 'New', label: 'no reviews yet' },
  );
  if (vendor.confirmation_rate != null)
    items.push({ value: `${vendor.confirmation_rate}%`, label: 'jobs confirmed' });
  if (vendor.years_experience) items.push({ value: `${vendor.years_experience} yrs`, label: 'on the tools' });
  return items;
}

/** Name, verification and the numbers that earn trust, jobs completed first. */
export function VendorHeader({ vendor }: { vendor: VendorProfile }) {
  const items = stats(vendor);
  const subline = [
    vendor.neighbourhood?.name,
    vendor.years_experience ? `${vendor.years_experience} years on the tools` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="hairline-b">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pt-5 sm:px-6 lg:flex-row lg:gap-7 lg:px-12 lg:py-9">
        <div className="flex items-start gap-4 lg:contents">
          <Avatar name={vendor.display_name} size="lg" className="lg:size-36 lg:text-display-l" />
          <div className="min-w-0 lg:hidden">
            <h1 className="font-display text-display-m font-bold">{vendor.display_name}</h1>
            <VerifiedMark label="ID verified" className="mt-1.5 rounded-sm bg-duka-soft px-2 py-1" />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="hidden font-display text-[3rem] leading-tight font-extrabold font-condensed lg:block">
            {vendor.display_name}
          </h1>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body text-slate lg:mt-2">
            <VerifiedMark
              label="ID verified"
              className="hidden rounded-sm bg-duka-soft px-2 py-1 lg:inline-flex"
            />
            {subline && <span>{subline}</span>}
            {vendor.is_founding_vendor && <span className="font-medium text-ink">Founding vendor</span>}
          </p>

          <dl
            className={cn(
              '-mx-4 mt-4 grid hairline-t sm:mx-0 lg:mt-6 lg:inline-grid lg:hairline',
              items.length > 3 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3',
            )}
          >
            {items.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'flex flex-col-reverse px-4 py-3 lg:min-w-40',
                  index > 0 && 'border-l-[1.5px] border-ink-12',
                  items.length > 3 &&
                    index === 2 &&
                    'border-t-[1.5px] border-l-0 sm:border-t-0 sm:border-l-[1.5px]',
                  items.length > 3 && index === 3 && 'border-t-[1.5px] sm:border-t-0',
                )}
              >
                <dt className="text-caption text-slate">{item.label}</dt>
                <dd className="font-display text-display-m leading-tight font-extrabold tabular lg:text-display-l">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
