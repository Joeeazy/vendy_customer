import type { ButtonHTMLAttributes } from 'react';

import { cn } from './cn';

export type ButtonVariant =
  | 'primary' // duka green: the main action on a screen
  | 'secondary' // chalk with a hairline edge
  | 'dark' // ink block, e.g. the selected option
  | 'danger' // clay: destructive only
  | 'light' // paper on green or ink grounds
  | 'outline-light' // paper outline on green or ink grounds
  | 'link'; // text action in duka

export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-duka text-chalk hover:bg-duka-deep active:bg-duka-deep',
  secondary: 'bg-chalk text-ink hairline hover:bg-paper',
  dark: 'bg-ink text-paper hover:bg-ink-80',
  danger: 'bg-clay text-chalk hover:opacity-90',
  light: 'bg-paper text-ink hover:bg-chalk',
  'outline-light': 'border-[1.5px] border-paper/40 text-paper hover:border-paper',
  link: 'text-duka underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-body',
  md: 'h-12 px-5 text-body-l',
  lg: 'h-14 px-6 text-title',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-sm font-display font-bold whitespace-nowrap transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    variant !== 'link' && sizes[size],
    variants[variant],
    block && 'w-full',
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
};

export function Button({
  variant,
  size,
  block,
  loading = false,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
