'use client';

import Link from 'next/link';

import { errorMessage } from '@/api/errors';
import { ago } from '@/api/format';
import { STATUS } from '@/features/bookings/status';
import { Avatar } from '@/ui/Avatar';
import { Badge } from '@/ui/Badges';
import { EmptyState, Notice, Skeleton } from '@/ui/Blocks';
import { buttonClasses } from '@/ui/Button';
import { cn } from '@/ui/cn';

import { useConversations } from './useBookingConversation';

export function ConversationList({ activeId, className }: { activeId?: string; className?: string }) {
  const conversations = useConversations();

  if (conversations.isPending) {
    return (
      <ul aria-busy="true" className={className}>
        {[0, 1, 2].map((index) => (
          <li key={index} className="flex gap-3 px-4 py-4 hairline-b">
            <Skeleton className="size-10" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (conversations.error) {
    return (
      <Notice tone="error" title="Couldn't load messages" className={cn('m-4', className)}>
        {errorMessage(conversations.error)}
      </Notice>
    );
  }

  const items = conversations.data.items;
  if (items.length === 0) {
    return (
      <EmptyState
        className={cn('px-4 pt-8', className)}
        title="No messages yet."
        actions={
          <Link href="/search" className={buttonClasses({ className: 'self-start' })}>
            Find a vendor
          </Link>
        }
      >
        A chat opens with the vendor as soon as you send a booking request.
      </EmptyState>
    );
  }

  return (
    <ul className={className}>
      {items.map((conversation) => (
        <li key={conversation.id} className="hairline-b">
          <Link
            href={`/messages/${conversation.id}`}
            aria-current={conversation.id === activeId ? 'page' : undefined}
            className={cn('flex gap-3 px-4 py-4 hover:bg-chalk/70', conversation.id === activeId && 'bg-chalk')}
          >
            <Avatar name={conversation.other_party_name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn('truncate font-display font-bold', conversation.unread_count > 0 && 'text-duka')}>
                  {conversation.other_party_name}
                </p>
                {conversation.last_message_at && (
                  <time className="shrink-0 text-caption text-slate" dateTime={conversation.last_message_at}>
                    {ago(conversation.last_message_at)}
                  </time>
                )}
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="truncate text-caption text-slate">
                  {conversation.service_name} · {conversation.booking_reference} · {STATUS[conversation.booking_status].label}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge tone="duka" className="h-5 px-1.5">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
