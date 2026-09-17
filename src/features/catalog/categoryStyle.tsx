import { Droplet, Laptop, type LucideIcon, Refrigerator, Smartphone, Sparkles, Square, Zap } from 'lucide-react';

import type { Category } from '@/api/types';

/** Flat colour blocks for the category grid, in the order the design shows them. */
const BLOCKS = [
  'bg-duka text-chalk',
  'bg-duka-deep text-chalk',
  'bg-ink text-paper',
  'bg-slate text-chalk',
  'bg-duka-soft text-duka-deep',
  'bg-chalk text-ink hairline',
] as const;

const PREFERRED_ORDER = ['phone-repair', 'laptop-repair', 'plumbing', 'electrical', 'cleaning', 'appliance-repair'];

const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  droplet: Droplet,
  zap: Zap,
  sparkles: Sparkles,
  refrigerator: Refrigerator,
};

export function orderCategories(categories: Category[]): Category[] {
  const rank = (slug: string) => {
    const index = PREFERRED_ORDER.indexOf(slug);
    return index === -1 ? PREFERRED_ORDER.length : index;
  };
  return [...categories].sort((a, b) => rank(a.slug) - rank(b.slug));
}

export function blockClass(index: number): string {
  return BLOCKS[index % BLOCKS.length]!;
}

export function categoryIcon(icon: string | null | undefined): LucideIcon {
  return (icon && ICONS[icon]) || Square;
}
