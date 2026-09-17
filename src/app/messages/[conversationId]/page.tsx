import type { Metadata } from 'next';

import { MessagesView } from '@/features/chat/MessagesView';

export const metadata: Metadata = { title: 'Chat', robots: { index: false } };

type Props = { params: Promise<{ conversationId: string }> };

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  return <MessagesView conversationId={conversationId} />;
}
