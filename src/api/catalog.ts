import { cache } from 'react';

import { serverApi } from './server';
import type { Category, PublicStats } from './types';

/**
 * Catalogue data for server-rendered pages. When the API can't be reached
 * (for example while Vercel builds the site) these return empty values
 * instead of failing, and the page fills in on its next revalidation.
 */

export const loadCategories = cache(async (): Promise<Category[]> => {
  try {
    const { data } = await serverApi(300).GET('/catalog/categories');
    return data ?? [];
  } catch {
    return [];
  }
});

export const loadStats = cache(async (): Promise<PublicStats | null> => {
  try {
    const { data } = await serverApi(300).GET('/catalog/stats');
    return data ?? null;
  } catch {
    return null;
  }
});
