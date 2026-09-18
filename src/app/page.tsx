import { loadCategories, loadStats } from '@/api/catalog';
import { FaqAndSupport } from '@/features/home/FaqAndSupport';
import { FundiCta } from '@/features/home/FundiCta';
import { HomeHero } from '@/features/home/HomeHero';
import { HowItWorks } from '@/features/home/HowItWorks';
import { PopularVendors } from '@/features/home/PopularVendors';
import { SafetyBand } from '@/features/home/SafetyBand';
import { WhatVendyIs } from '@/features/home/WhatVendyIs';
import { SiteFooter } from '@/features/layout/SiteFooter';
import { SiteHeader } from '@/features/layout/SiteHeader';

export default async function HomePage() {
  const [categories, stats] = await Promise.all([loadCategories(), loadStats()]);

  return (
    <>
      <SiteHeader />
      <main className="bg-grain">
        <HomeHero categories={categories} stats={stats} />
        <PopularVendors />
        <HowItWorks />
        <WhatVendyIs stats={stats} trades={categories.map((category) => category.name)} />
        <SafetyBand />
        <FaqAndSupport areas={stats?.areas ?? null} />
        <FundiCta />
      </main>
      <SiteFooter />
    </>
  );
}
