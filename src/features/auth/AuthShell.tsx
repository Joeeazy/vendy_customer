import { Check } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrushUnderline } from '@/ui/BrushStroke';
import { Wordmark } from '@/ui/Wordmark';

const PROMISES = [
  'Every vendor has shown us an ID.',
  'Real prices and completed jobs before you book.',
  'Your number is shared only when a vendor confirms.',
];

/** Form on paper; on wide screens, the promise on duka green beside it. */
export function AuthShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_36rem]">
      <main className="flex flex-col bg-grain px-4 py-6 sm:px-10">
        <Link href="/" aria-label="Vendy home" className="self-start">
          <Wordmark size="sm" />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="inline-flex w-fit flex-col font-display text-display-l font-extrabold font-condensed sm:text-display-xl">
            {title}
            <BrushUnderline className="mt-2 w-3/5" />
          </h1>
          {lead && <p className="mt-3 text-body-l text-slate">{lead}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <aside className="hidden flex-col justify-end bg-duka bg-mabati p-12 text-chalk lg:flex">
        <p className="font-display text-display-l font-bold">Pata mtu wa kazi.</p>
        <ul className="mt-6 flex flex-col gap-3">
          {PROMISES.map((promise) => (
            <li key={promise} className="flex gap-3 text-body-l">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0" />
              {promise}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
