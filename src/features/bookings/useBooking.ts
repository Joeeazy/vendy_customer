'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, unwrap } from '@/api/client';
import { keys } from '@/api/keys';
import type { Booking } from '@/api/types';

import { contactShared, isActive } from './status';

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: keys.booking(bookingId),
    queryFn: () => unwrap(api.GET('/bookings/{booking_id}', { params: { path: { booking_id: bookingId } } })),
    // Vendors answer from their own app; check back while something can change.
    refetchInterval: (query) => (query.state.data && isActive(query.state.data.status) ? 20_000 : false),
    refetchOnWindowFocus: true,
  });
}

/** The vendor's number. Fetched only when asked for: every reveal is recorded. */
export function useVendorContact(booking: Booking, requested: boolean) {
  return useQuery({
    queryKey: keys.bookingContact(booking.id),
    queryFn: () =>
      unwrap(api.GET('/bookings/{booking_id}/contact', { params: { path: { booking_id: booking.id } } })),
    enabled: requested && contactShared(booking.status),
    staleTime: Infinity,
  });
}

/** Mutations that return the updated booking, written straight into the cache. */
export function useBookingMutation<Variables = void>(
  bookingId: string,
  action: (variables: Variables) => Promise<Booking>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: async (booking) => {
      queryClient.setQueryData(keys.booking(bookingId), booking);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
