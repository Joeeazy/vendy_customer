'use client';

import { useRef, type KeyboardEvent } from 'react';

import { cn } from './cn';

type Option<T extends string> = { value: T; label: string };

/** A row of mutually exclusive options (Today / Tomorrow / Pick a date). Arrow keys move the choice. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid auto-cols-fr grid-flow-col gap-1', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'h-12 rounded-sm px-3 text-body font-semibold transition-colors',
              selected ? 'bg-ink text-paper' : 'bg-chalk text-ink hairline hover:bg-paper',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
