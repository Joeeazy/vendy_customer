'use client';

import { useSearchParams } from 'next/navigation';

import type { Category } from '@/api/types';
import { ServiceSearch } from '@/features/catalog/ServiceSearch';

export function HeaderSearch({ categories }: { categories: Category[] }) {
  const params = useSearchParams();
  const serviceSlug = params.get('service');
  const serviceName = categories.flatMap((c) => c.service_types).find((s) => s.slug === serviceSlug)?.name;
  return (
    <ServiceSearch
      key={serviceSlug ?? params.get('q') ?? ''}
      categories={categories}
      initialText={serviceName ?? params.get('q') ?? ''}
      compact
      className="hidden max-w-3xl flex-1 md:flex"
    />
  );
}
