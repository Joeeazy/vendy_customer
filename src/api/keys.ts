/** TanStack Query keys, in one place so invalidation stays consistent. */
export const keys = {
  me: ['me'] as const,
  search: (params: Record<string, string | number | undefined>) => ['search', params] as const,
  popular: (lat: number, lng: number) => ['popular', lat, lng] as const,
  vendorReviews: (slug: string) => ['vendors', slug, 'reviews'] as const,
  bookings: (status?: string) => ['bookings', status ?? 'all'] as const,
  booking: (id: string) => ['booking', id] as const,
  bookingContact: (id: string) => ['booking', id, 'contact'] as const,
  bookingPhotos: (id: string) => ['booking', id, 'photos'] as const,
  awaitingReviews: ['reviews', 'awaiting'] as const,
  reports: ['reports'] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,
  notifications: ['notifications'] as const,
};
