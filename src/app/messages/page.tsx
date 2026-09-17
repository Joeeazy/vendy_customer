import type { Metadata } from 'next';

import { MessagesView } from '@/features/chat/MessagesView';

export const metadata: Metadata = { title: 'Messages', robots: { index: false } };

export default function MessagesPage() {
  return <MessagesView />;
}
