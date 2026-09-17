import type { Metadata } from 'next';

import { SiteHeader } from '@/features/layout/SiteHeader';
import { NotificationsList } from '@/features/notifications/NotificationsList';

export const metadata: Metadata = { title: 'Notifications', robots: { index: false } };

export default function NotificationsPage() {
  return (
    <>
      <SiteHeader />
      <NotificationsList />
    </>
  );
}
