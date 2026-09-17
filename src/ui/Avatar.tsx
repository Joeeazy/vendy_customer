import { cn } from './cn';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, string> = {
  sm: 'size-10 text-body',
  md: 'size-16 text-title',
  lg: 'size-24 text-display-m',
  xl: 'size-36 text-display-l',
};

export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.length > 1 ? `${words[0]![0]}${words[1]![0]}` : (words[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

/** A vendor's photo, or their initials painted on a flat block. */
export function Avatar({
  name,
  src,
  size = 'md',
  tone = 'soft',
  className,
}: {
  name: string;
  src?: string | null;
  size?: Size;
  tone?: 'soft' | 'chalk' | 'duka';
  className?: string;
}) {
  const toneClass = {
    soft: 'bg-duka-soft text-duka-deep',
    chalk: 'bg-chalk text-slate hairline',
    duka: 'bg-duka text-chalk',
  }[tone];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm font-display font-extrabold',
        sizes[size],
        toneClass,
        className,
      )}
    >
      {src ? (
        // Vendor photos come from the media bucket, already resized to webp.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
