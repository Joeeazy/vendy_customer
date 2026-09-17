import { cn } from './cn';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { text: string; stroke: string }> = {
  sm: { text: 'text-[1.625rem] leading-none', stroke: 'h-[5px] w-[62px]' },
  md: { text: 'text-[2rem] leading-none', stroke: 'h-[6px] w-[76px]' },
  lg: { text: 'text-[4.5rem] leading-none', stroke: 'h-[12px] w-[170px]' },
};

/**
 * `vendy` in Archivo 800 condensed, lowercase, tight tracking, with the y's
 * descender continuing into a hooked brush stroke under the word.
 * Ink on paper, or paper on duka green.
 */
export function Wordmark({
  size = 'md',
  tone = 'ink',
  className,
}: {
  size?: Size;
  tone?: 'ink' | 'paper';
  className?: string;
}) {
  const { text, stroke } = sizes[size];
  return (
    <span
      className={cn('relative inline-flex flex-col', tone === 'ink' ? 'text-ink' : 'text-paper', className)}
      aria-label="vendy"
      role="img"
    >
      <span aria-hidden="true" className={cn('font-display font-extrabold tracking-[-0.02em] font-condensed', text)}>
        vendy
      </span>
      <svg aria-hidden="true" viewBox="0 0 76 7" preserveAspectRatio="none" className={cn('-mt-[1px] ml-[2px]', stroke)}>
        <path
          fill="currentColor"
          d="M1.2 4.6C14 5.3 30 4.8 46 3.8c9.6-.6 18.5-1.6 25.8-2.9L75.4 0l.4 1.3C68.8 4 58 5.6 46.5 6.3 31 7.2 14.8 7.1 1 6.2.1 6.1-.2 4.7 1.2 4.6Z"
        />
      </svg>
    </span>
  );
}
