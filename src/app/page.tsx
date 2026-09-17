import { required, serverApi } from '@/api/server';
import { HomeHero } from '@/features/home/HomeHero';
import { PopularVendors } from '@/features/home/PopularVendors';
import { SiteFooter } from '@/features/layout/SiteFooter';
import { SiteHeader } from '@/features/layout/SiteHeader';

export default async function HomePage() {
  const categories = await required(serverApi(300).GET('/catalog/categories'));

  return (
    <>
      <SiteHeader />
      <main className="bg-grain">
        <HomeHero categories={categories} />
        <PopularVendors />
      </main>
      <SiteFooter />
    </>
  );
}
