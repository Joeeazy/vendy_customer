import type { Category } from '@/api/types';

export type ServiceOption = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
};

export function serviceOptions(categories: Category[]): ServiceOption[] {
  return categories.flatMap((category) =>
    category.service_types.map((service) => ({
      slug: service.slug,
      name: service.name,
      categorySlug: category.slug,
      categoryName: category.name,
    })),
  );
}

// Everyday words people type, mapped to the catalogue's words.
const SYNONYMS: Record<string, string> = {
  plumber: 'plumbing',
  electrician: 'electrical',
  cleaner: 'cleaning',
  fundi: 'repair',
  phone: 'phone',
  simu: 'phone',
  laptop: 'laptop',
  fridge: 'fridge',
  friji: 'fridge',
  leak: 'leak',
  screen: 'screen',
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1)
    .map((word) => SYNONYMS[word] ?? word.replace(/s$/, ''));
}

/**
 * Rank services against what someone typed ("plumber", "cracked phone screen").
 * Matches on the service name count most, then the category name.
 */
export function matchServices(query: string, options: ServiceOption[], limit = 6): ServiceOption[] {
  const terms = words(query);
  if (terms.length === 0) return [];

  const scored = options
    .map((option) => {
      const name = option.name.toLowerCase();
      const category = option.categoryName.toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (name.includes(term) ? 3 : 0) + (category.includes(term) ? 2 : 0),
        0,
      );
      return { option, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.option.name.localeCompare(b.option.name));

  return scored.slice(0, limit).map(({ option }) => option);
}
