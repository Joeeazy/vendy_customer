import { cn } from './cn';

type Tone = 'duka' | 'sign' | 'paper' | 'ink';

const toneClass: Record<Tone, string> = {
  duka: 'text-duka',
  sign: 'text-sign',
  paper: 'text-paper',
  ink: 'text-ink',
};

/**
 * The hand-painted underline: an uneven brush stroke, thicker in the middle
 * and tapering at both ends. One per page, under the main headline.
 */
export function BrushUnderline({ tone = 'duka', className }: { tone?: Tone; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 340 12"
      preserveAspectRatio="none"
      className={cn('block h-2.5 w-full', toneClass[tone], className)}
    >
      <path
        fill="currentColor"
        d="M2 7.4C38 5.1 83 4.2 131 4.6c52 .4 101 1.1 150 .5 20-.3 38-1 55-1.9 2.2 1 2.4 3.2.3 4.2-20 1.8-41 2.4-62 2.6-47 .5-95-.3-143-.3-43 0-87 .7-127 2.4C.9 11.9.2 8.4 2 7.4Z"
      />
    </svg>
  );
}
