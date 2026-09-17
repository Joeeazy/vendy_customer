'use client';

import { useRequireUser } from '@/features/auth/session';
import { SiteHeader } from '@/features/layout/SiteHeader';
import { Skeleton } from '@/ui/Blocks';
import { cn } from '@/ui/cn';

import { ChatThread } from './ChatThread';
import { ConversationList } from './ConversationList';
import { useConversations } from './useBookingConversation';

/**
 * Phones: the list, or one chat full screen. Desktop: both side by side.
 */
export function MessagesView({ conversationId }: { conversationId?: string }) {
  const user = useRequireUser();
  const conversations = useConversations(Boolean(user));
  const conversation = conversations.data?.items.find((item) => item.id === conversationId) ?? null;

  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader className={cn(conversationId && 'hidden lg:block')} />
      {!user ? (
        <div className="flex flex-col gap-3 p-4" aria-busy="true">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 lg:px-12">
          <aside
            className={cn(
              'min-h-0 w-full overflow-y-auto lg:block lg:w-96 lg:shrink-0 lg:border-r-[1.5px] lg:border-ink-12',
              conversationId && 'hidden',
            )}
          >
            <h1 className="px-4 pt-6 pb-3 font-display text-display-l font-extrabold font-condensed hairline-b">
              Messages
            </h1>
            <ConversationList activeId={conversationId} />
          </aside>
          <div
            className={cn(
              'min-h-0 flex-1',
              !conversationId && 'hidden lg:flex lg:items-center lg:justify-center',
            )}
          >
            {conversationId ? (
              <ChatThread key={conversationId} conversationId={conversationId} conversation={conversation} />
            ) : (
              <p className="text-body text-slate">Choose a conversation.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
