import { BadgeCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from './cn';

/** Verified is always green with a mark. Never yellow: trust and urgency stay separate. */
export function VerifiedMark({ label, className }: { label?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold text-duka', className)}>
      <BadgeCheck
        aria-hidden={label ? true : undefined}
        aria-label={label ? undefined : 'Verified'}
        className="size-4 fill-duka stroke-chalk"
      />
      {label && <span className="text-caption">{label}</span>}
    </span>
  );
}

export type Tone = 'duka' | 'sign' | 'clay' | 'slate' | 'quiet';

const tones: Record<Tone, string> = {
  duka: 'bg-duka text-chalk',
  sign: 'bg-sign text-ink',
  clay: 'bg-clay-soft text-clay',
  slate: 'bg-paper text-slate hairline',
  quiet: 'bg-chalk text-slate hairline',
};

export function Badge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-sm px-2 text-caption font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
