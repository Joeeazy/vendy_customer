'use client';

import { useQuery } from '@tanstack/react-query';

import { api, unwrap } from '@/api/client';
import { keys } from '@/api/keys';

/** Every booking has one conversation, opened when the request is sent. */
export function useConversations(enabled = true) {
  return useQuery({
    queryKey: keys.conversations,
    queryFn: () => unwrap(api.GET('/conversations', { params: { query: { limit: 100 } } })),
    enabled,
  });
}

export function useBookingConversation(bookingId: string) {
  const conversations = useConversations();
  return conversations.data?.items.find((conversation) => conversation.booking_id === bookingId) ?? null;
}
