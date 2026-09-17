'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { ApiError } from '@/api/errors';
import type { Neighbourhood } from '@/api/types';
import { AreaProvider } from '@/features/area/area';
import { SessionProvider } from '@/features/auth/session';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't retry what won't change: bad input, missing, forbidden.
        retry: (failures, error) => !(error instanceof ApiError && error.status < 500) && failures < 2,
      },
    },
  });
}

export function Providers({ neighbourhoods, children }: { neighbourhoods: Neighbourhood[]; children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AreaProvider neighbourhoods={neighbourhoods}>{children}</AreaProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
