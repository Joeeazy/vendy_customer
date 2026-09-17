import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { BrushUnderline } from './BrushStroke';
import { cn } from './cn';

/** A big Archivo number with its caption: 214 / jobs completed. */
export function Stat({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="font-display text-display-m font-extrabold tabular">{value}</span>
      <span className="text-caption text-slate">{label}</span>
    </div>
  );
}

/** A masked field explained in words, never shown as bullets. */
export function LockedRow({ title, detail, className }: { title: ReactNode; detail?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-3 rounded-card bg-chalk p-4 hairline', className)}>
      <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate" />
      <div>
        <p className="font-semibold">{title}</p>
        {detail && <p className="mt-1 text-caption text-slate">{detail}</p>}
      </div>
    </div>
  );
}

type NoticeTone = 'info' | 'warn' | 'error' | 'success';

const noticeTones: Record<NoticeTone, string> = {
  info: 'bg-chalk hairline',
  warn: 'bg-sign-soft',
  error: 'bg-clay-soft text-ink',
  success: 'bg-duka-soft',
};

export function Notice({
  tone = 'info',
  title,
  children,
  icon,
  className,
}: {
  tone?: NoticeTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-card p-4', noticeTones[tone], className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-1', 'text-body')}>{children}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block rounded-sm bg-ink-12', className)} />;
}

/** Every empty state gives the next action. */
export function EmptyState({
  title,
  children,
  actions,
  band = false,
  className,
}: {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  band?: boolean;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col', className)}>
      {band && <div aria-hidden="true" className="h-28 bg-mabati hairline-b" />}
      <div className={cn('flex max-w-md flex-col gap-3', band && 'px-4 pt-6 sm:px-0')}>
        <h2 className="inline-flex w-fit flex-col font-display text-display-m font-bold">
          {title}
          <BrushUnderline className="mt-1 w-3/5" />
        </h2>
        {children && <div className="text-body-l">{children}</div>}
        {actions && <div className="mt-2 flex flex-col gap-2">{actions}</div>}
      </div>
    </section>
  );
}
