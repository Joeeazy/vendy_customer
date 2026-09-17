import { cache } from 'react';

import { orNotFound, serverApi } from '@/api/server';

/** One fetch per request, shared by the page and its metadata. */
export const loadVendor = cache((slug: string) =>
  orNotFound(serverApi(60).GET('/vendors/{slug}', { params: { path: { slug } } })),
);

export const loadRecentReviews = cache((slug: string) =>
  orNotFound(serverApi(60).GET('/vendors/{slug}/reviews', { params: { path: { slug }, query: { limit: 5 } } })),
);
