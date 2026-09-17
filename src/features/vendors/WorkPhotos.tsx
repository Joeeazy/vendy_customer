'use client';

import { useState } from 'react';

import type { PortfolioItem } from '@/api/types';

const COLLAPSED = 4;

/** Portfolio photos, four across; the fourth tile opens the rest. */
export function WorkPhotos({ items }: { items: PortfolioItem[] }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const hidden = items.length - COLLAPSED;
  const shown = expanded || hidden <= 0 ? items : items.slice(0, COLLAPSED - 1);

  return (
    <section aria-labelledby="photos-heading">
      <h2 id="photos-heading" className="font-display text-display-m font-bold">
        Work photos
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 pt-3 hairline-t sm:grid-cols-4">
        {shown.map((item) => (
          <li key={item.id}>
            <a href={item.urls['1200'] ?? item.urls['400']} target="_blank" rel="noreferrer" className="block">
              {/* Already resized to webp by the upload worker. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.urls['400'] ?? item.urls['1200']}
                alt={item.caption ?? 'Work photo'}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-sm bg-duka-soft object-cover"
              />
            </a>
            {item.caption && <p className="mt-1 line-clamp-2 text-caption text-slate">{item.caption}</p>}
          </li>
        ))}
        {!expanded && hidden > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex aspect-[4/3] w-full items-center justify-center rounded-sm bg-duka-soft font-semibold text-duka-deep hover:bg-duka hover:text-chalk"
            >
              +{hidden + 1} more
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}
