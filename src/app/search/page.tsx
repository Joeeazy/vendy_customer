import type { Metadata } from 'next';

import { loadCategories } from '@/api/catalog';
import { SiteHeader } from '@/features/layout/SiteHeader';
import { HeaderSearch } from '@/features/search/HeaderSearch';
import { SearchResults } from '@/features/search/SearchResults';

export const metadata: Metadata = { title: 'Find a vendor' };

export default async function SearchPage() {
  const categories = await loadCategories();

  return (
    <>
      <SiteHeader>
        <HeaderSearch categories={categories} />
      </SiteHeader>
      <main>
        <SearchResults categories={categories} />
      </main>
    </>
  );
}
