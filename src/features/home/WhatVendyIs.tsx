import { X } from 'lucide-react';

import type { PublicStats } from '@/api/types';
import { BrushUnderline } from '@/ui/BrushStroke';
import { cn } from '@/ui/cn';

const NOT = [
  {
    title: 'Not a payment service',
    body: 'We never hold your money. You pay the vendor directly, on the day.',
  },
  {
    title: 'Not an employer',
    body: 'Vendors run their own businesses and set their own prices. We check who they are; we do not supervise the work.',
  },
  {
    title: 'Not a bidding site',
    body: 'No quote auctions, no paid ranking. Order is set by jobs completed and distance.',
  },
  {
    title: 'Not a number exchange',
    body: 'Contact details are held back until a booking is confirmed, in both directions.',
  },
];

const number = new Intl.NumberFormat('en-KE');

/** The ink section: what Vendy is, the numbers behind it, and what it is not. */
export function WhatVendyIs({ stats, trades }: { stats: PublicStats | null; trades: string[] }) {
  const figures = [
    {
      value: stats ? number.format(stats.verified_vendors) : '–',
      label: 'verified vendors',
      highlight: true,
    },
    { value: stats ? number.format(stats.areas) : '–', label: 'Nairobi areas' },
    { value: stats ? number.format(stats.jobs_completed) : '–', label: 'jobs completed' },
    { value: 'Free', label: 'for customers, always' },
  ];
  const tradeList = trades.length ? trades.join(', ').toLowerCase() : 'local trades';

  return (
    <section aria-labelledby="what-heading" className="bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:px-12 lg:py-16">
        <div>
          <p className="text-caption font-semibold tracking-widest text-sign uppercase">What Vendy is</p>
          <h2
            id="what-heading"
            className="mt-3 inline-flex flex-col font-display text-display-xl leading-none font-extrabold font-condensed lg:text-[3.5rem]"
          >
            A directory of fundis somebody actually checked.
            <BrushUnderline tone="sign" className="mt-3 w-1/2" />
          </h2>
        </div>
        <div className="flex flex-col gap-4 text-body-l text-paper/85">
          <p>
            Vendors for {tradeList}
            {stats ? ` across ${stats.areas} Nairobi areas` : ''}. Every vendor has shown us a national ID,
            and a person checks each one before they can take bookings.
          </p>
          <p className="text-paper/65">
            Finding a reliable fundi usually means asking three neighbours and hoping. Vendy keeps the record
            instead: jobs completed, what customers said afterwards, and which areas each vendor really
            covers.
          </p>
        </div>
      </div>

      <dl className="mx-auto grid max-w-[1440px] grid-cols-2 border-y-[1.5px] border-paper/15 lg:grid-cols-4">
        {figures.map((figure, index) => (
          <div
            key={figure.label}
            className={cn(
              'px-4 py-6 sm:px-6 lg:px-12',
              index % 2 === 1 && 'border-l-[1.5px] border-paper/15',
              index >= 2 && 'border-t-[1.5px] border-paper/15 lg:border-t-0',
              index === 2 && 'lg:border-l-[1.5px]',
            )}
          >
            <dd
              className={cn(
                'font-display text-display-l font-extrabold tabular lg:text-display-xl',
                figure.highlight && 'text-sign',
              )}
            >
              {figure.value}
            </dd>
            <dt className="text-caption text-paper/65">{figure.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-12">
        <h3 className="text-caption font-semibold tracking-widest text-paper/60 uppercase">
          And what it is not
        </h3>
        <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {NOT.map((item, index) => (
            <li
              key={item.title}
              className={cn(
                'lg:px-6',
                index === 0 && 'lg:pl-0',
                index > 0 && 'lg:border-l-[1.5px] lg:border-paper/15',
              )}
            >
              <p className="flex items-center gap-2 font-display text-title font-bold">
                <X aria-hidden="true" className="size-4 text-sign" strokeWidth={3} />
                {item.title}
              </p>
              <p className="mt-1.5 text-body text-paper/65">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
