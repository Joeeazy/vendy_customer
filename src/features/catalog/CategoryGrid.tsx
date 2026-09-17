import Link from 'next/link';

import type { Category } from '@/api/types';
import { cn } from '@/ui/cn';

import { blockClass, categoryIcon, orderCategories } from './categoryStyle';

/** Six flat colour blocks you can see at once, not a scroller. */
export function CategoryGrid({ categories, areaSlug }: { categories: Category[]; areaSlug?: string | null }) {
  return (
    <ul className="grid grid-cols-2 gap-0.5 lg:grid-cols-6">
      {orderCategories(categories).map((category, index) => {
        const Icon = categoryIcon(category.icon);
        const params = new URLSearchParams({ category: category.slug });
        if (areaSlug) params.set('area', areaSlug);
        return (
          <li key={category.slug}>
            <Link
              href={`/search?${params}`}
              className={cn(
                'flex h-28 flex-col justify-between p-4 transition-opacity hover:opacity-90 lg:h-48 lg:p-5',
                blockClass(index),
              )}
            >
              <Icon aria-hidden="true" strokeWidth={1.75} className="size-6" />
              <span>
                <span className="block font-display text-title font-bold">{category.name}</span>
                {category.vendor_count > 0 && (
                  <span className="block text-caption opacity-75">
                    {category.vendor_count} {category.vendor_count === 1 ? 'vendor' : 'vendors'}
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
