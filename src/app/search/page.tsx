import type { Metadata } from 'next';

import { required, serverApi } from '@/api/server';
import { SiteHeader } from '@/features/layout/SiteHeader';
import { HeaderSearch } from '@/features/search/HeaderSearch';
import { SearchResults } from '@/features/search/SearchResults';

export const metadata: Metadata = { title: 'Find a vendor' };

export default async function SearchPage() {
  const categories = await required(serverApi(300).GET('/catalog/categories'));

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
