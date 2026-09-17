import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/ibm-plex-sans';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Suspense, type ReactNode } from 'react';

import { serverApi } from '@/api/server';
import type { Neighbourhood } from '@/api/types';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'Vendy · Pata mtu wa kazi', template: '%s · Vendy' },
  description:
    'Find verified plumbers, electricians, cleaners and repair technicians in Nairobi. See real prices and completed jobs before you book.',
  applicationName: 'Vendy',
};

export const viewport: Viewport = {
  themeColor: '#1b6b4c',
  width: 'device-width',
  initialScale: 1,
};

async function loadNeighbourhoods(): Promise<Neighbourhood[]> {
  // If the API is down the site still renders; search asks for an area later.
  try {
    const { data } = await serverApi(300).GET('/neighbourhoods');
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const neighbourhoods = await loadNeighbourhoods();
  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper">
        <Suspense>
          <Providers neighbourhoods={neighbourhoods}>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
