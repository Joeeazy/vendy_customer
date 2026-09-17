'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { shortDate } from '@/api/format';
import { keys } from '@/api/keys';
import type { Review } from '@/api/types';
import { Button } from '@/ui/Button';

const PAGE_SIZE = 5;

type ReviewsPage = { items: Review[]; total: number; offset: number; count: number };

export function Reviews({ slug, initial }: { slug: string; initial: ReviewsPage | null }) {
  const reviews = useInfiniteQuery({
    queryKey: keys.vendorReviews(slug),
    queryFn: ({ pageParam }) =>
      unwrap(api.GET('/vendors/{slug}/reviews', { params: { path: { slug }, query: { offset: pageParam, limit: PAGE_SIZE } } })),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.offset + last.count < last.total ? last.offset + last.count : undefined),
    initialData: initial ? { pages: [initial], pageParams: [0] } : undefined,
  });

  const items = reviews.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-display text-display-m font-bold">
        Recent reviews
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 pt-3 text-body text-slate hairline-t">
          No reviews yet. Reviews come only from customers who booked through Vendy.
        </p>
      ) : (
        <ul className="mt-3 hairline-t">
          {items.map((review) => (
            <li key={review.id} className="py-4 hairline-b">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display font-bold">{review.customer_first_name}</span>
                <span className="text-caption text-slate">
                  <span className="tabular">{review.rating}/5</span> · {review.service_name} · {shortDate(review.created_at)}
                </span>
              </p>
              {review.comment && <p className="mt-1 text-body-l">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
      {reviews.error && <p className="mt-3 text-caption text-clay">{errorMessage(reviews.error)}</p>}
      {reviews.hasNextPage && (
        <Button variant="secondary" size="sm" className="mt-4" loading={reviews.isFetchingNextPage} onClick={() => void reviews.fetchNextPage()}>
          More reviews
        </Button>
      )}
    </section>
  );
}
