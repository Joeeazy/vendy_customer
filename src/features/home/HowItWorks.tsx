import { CreditCard, Lock, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/ui/cn';

const STEPS = [
  {
    title: 'Search your area',
    body: 'Pick a service and an area. Vendors are ordered by jobs completed and distance, never by who paid for placement.',
    icon: Search,
  },
  {
    title: 'Ask before you book',
    body: 'Chat opens as soon as you send a request. Describe the job and agree a price. Phone numbers stay hidden at this stage.',
    icon: MessageSquare,
  },
  {
    title: 'Confirm the booking',
    body: "Once the vendor confirms, you both see each other's number and they get the exact address, with a reference like VND-7K2MXP.",
    icon: Lock,
  },
  {
    title: 'Pay the vendor directly',
    body: 'Cash or M-Pesa, straight to the person who did the work. Rate the job afterwards so the next customer knows.',
    icon: CreditCard,
  },
];

/** Four numbered steps; the third bar is the one yellow thing in this section. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="mt-16 scroll-mt-6 bg-chalk hairline-t"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption font-semibold tracking-widest text-duka uppercase">How it works</p>
            <h2 id="how-heading" className="mt-2 font-display text-display-l font-extrabold font-condensed">
              Four steps, start to finish.
            </h2>
          </div>
          <p className="max-w-md text-body text-slate">
            No deposits, no platform cut, nothing charged to customers. Vendy keeps the record; you keep the
            relationship.
          </p>
        </div>

        <ol className="mt-8 grid border-y-[1.5px] border-ink sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                'flex flex-col gap-3 py-6 sm:px-6',
                index > 0 && 'hairline-t sm:border-t-0',
                index % 2 === 1 && 'sm:border-l-[1.5px] sm:border-ink-12',
                index >= 2 && 'sm:border-t-[1.5px] sm:border-ink-12 lg:border-t-0',
                index === 2 && 'lg:border-l-[1.5px] lg:border-ink-12',
                index === 0 && 'sm:pl-0',
              )}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-[3.5rem] leading-none font-extrabold font-condensed tabular">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <step.icon aria-hidden="true" className="size-5 text-duka" />
              </div>
              <span aria-hidden="true" className={cn('h-1 w-full', index === 2 ? 'bg-sign' : 'bg-duka')} />
              <h3 className="font-display text-title font-bold">{step.title}</h3>
              <p className="text-body text-slate">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-body">
          <span className="text-slate">Search to confirmed booking usually takes a few minutes.</span>
          <Link href="/search" className="font-semibold text-duka underline-offset-4 hover:underline">
            Kwanza, tafuta fundi →
          </Link>
        </p>
      </div>
    </section>
  );
}
