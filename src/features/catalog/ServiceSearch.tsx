'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';

import type { Category } from '@/api/types';
import { useArea } from '@/features/area/area';
import { AreaSelect } from '@/features/area/AreaSelect';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/cn';

import { matchServices, serviceOptions, type ServiceOption } from './matchService';

/**
 * The hero search: type what you need, pick a matching service, go to results.
 * An accessible combobox (listbox popup, arrow keys, Enter to choose).
 */
export function ServiceSearch({
  categories,
  initialText = '',
  withArea = true,
  compact = false,
  className,
}: {
  categories: Category[];
  initialText?: string;
  withArea?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { slug: areaSlug } = useArea();
  const listId = useId();
  const [text, setText] = useState(initialText);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const options = useMemo(() => serviceOptions(categories), [categories]);
  const matches = useMemo(() => matchServices(text, options), [text, options]);

  function go(option?: ServiceOption) {
    const params = new URLSearchParams();
    if (option) params.set('service', option.slug);
    else if (text.trim()) params.set('q', text.trim());
    if (areaSlug) params.set('area', areaSlug);
    setOpen(false);
    router.push(`/search?${params}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    go(open ? matches[active] : matches[0]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!matches.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const expanded = open && matches.length > 0;

  return (
    <form role="search" onSubmit={onSubmit} className={cn('flex flex-col gap-2 sm:flex-row', className)}>
      <div className="relative flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate" />
        <input
          type="search"
          role="combobox"
          aria-label="What do you need done?"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
          placeholder="Plumber, laptop repair, deep clean…"
          autoComplete="off"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full rounded-sm bg-chalk pr-4 pl-12 text-ink hairline placeholder:text-slate',
            compact ? 'h-12 text-body-l' : 'h-16 text-title',
          )}
        />
        {expanded && (
          <ul id={listId} role="listbox" className="absolute top-full right-0 left-0 z-20 mt-1 rounded-card bg-chalk p-1.5 hairline">
            {matches.map((option, index) => (
              <li
                key={option.slug}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                // mousedown, so the choice lands before the input's blur closes the list
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(option);
                }}
                onMouseEnter={() => setActive(index)}
                className={cn('flex cursor-pointer items-baseline justify-between gap-3 rounded-sm px-3 py-2.5', index === active && 'bg-paper')}
              >
                <span className="font-semibold">{option.name}</span>
                <span className="text-caption text-slate">{option.categoryName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {withArea && <AreaSelect className={cn('sm:w-56', compact ? '[&_select]:h-12' : '[&_select]:h-16 [&_select]:text-body-l')} />}
      <Button type="submit" size={compact ? 'md' : 'lg'} className={cn(!compact && 'sm:w-40')}>
        Search
      </Button>
    </form>
  );
}
