import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteFooter } from '@/features/layout/SiteFooter';
import { SiteHeader } from '@/features/layout/SiteHeader';
import { BookingPanel } from '@/features/vendors/BookingPanel';
import { loadRecentReviews, loadVendor } from '@/features/vendors/loadVendor';
import { Reviews } from '@/features/vendors/Reviews';
import { ServicesAndPrices } from '@/features/vendors/ServicesAndPrices';
import { VendorHeader } from '@/features/vendors/VendorHeader';
import { WorkPhotos } from '@/features/vendors/WorkPhotos';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await loadVendor((await params).slug);
  if (!vendor) return { title: 'Vendor not found' };
  const services = vendor.services.map((service) => service.name).join(', ');
  return {
    title: vendor.display_name,
    description: `${vendor.display_name}: ${services}${vendor.neighbourhood ? ` in ${vendor.neighbourhood.name}` : ''}. ${vendor.jobs_completed} jobs completed on Vendy. ID verified.`,
  };
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;
  const [vendor, reviews] = await Promise.all([loadVendor(slug), loadRecentReviews(slug)]);
  if (!vendor) notFound();

  const firstService = vendor.services[0];

  return (
    <>
      <SiteHeader>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
          <ol className="flex items-center gap-2 truncate text-body text-slate">
            {firstService && (
              <li>
                <Link href={`/search?service=${firstService.slug}`} className="hover:text-ink">
                  {firstService.name}
                </Link>
              </li>
            )}
            {vendor.neighbourhood && <li aria-hidden="true">·</li>}
            {vendor.neighbourhood && <li>{vendor.neighbourhood.name}</li>}
            <li aria-hidden="true">·</li>
            <li aria-current="page" className="truncate text-ink">
              {vendor.display_name}
            </li>
          </ol>
        </nav>
      </SiteHeader>

      <main className="pb-24 lg:pb-0">
        <VendorHeader vendor={vendor} />

        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_30rem]">
          <div className="flex flex-col gap-9 px-4 py-6 sm:px-6 lg:px-12 lg:py-9">
            {vendor.bio && <p className="max-w-3xl text-body-l whitespace-pre-line">{vendor.bio}</p>}
            <ServicesAndPrices services={vendor.services} />
            <WorkPhotos items={vendor.portfolio} />
            <Reviews slug={vendor.slug} initial={reviews} />
          </div>

          <aside className="px-4 pb-6 sm:px-6 lg:bg-chalk lg:px-8 lg:py-9 lg:border-l-[1.5px] lg:border-ink-12">
            <div className="lg:sticky lg:top-6">
              <BookingPanel vendor={vendor} />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
