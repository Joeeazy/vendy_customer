'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import { api, unwrap } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { ago } from '@/api/format';
import { keys } from '@/api/keys';
import type { Notification } from '@/api/types';
import { useRequireUser } from '@/features/auth/session';
import { EmptyState, Notice, Skeleton } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/cn';

/** Where a notification leads: its chat, else its booking. */
export function notificationHref(notification: Notification): string | null {
  const data = notification.data as Record<string, unknown>;
  if (typeof data.conversation_id === 'string') return `/messages/${data.conversation_id}`;
  if (typeof data.booking_id === 'string') return `/bookings/${data.booking_id}`;
  return null;
}

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: keys.notifications,
    queryFn: () => unwrap(api.GET('/notifications', { params: { query: { limit: 50 } } })),
    enabled,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function NotificationsList() {
  const user = useRequireUser();
  const queryClient = useQueryClient();
  const notifications = useNotifications(Boolean(user));
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.notifications });

  const readOne = useMutation({
    mutationFn: (id: string) =>
      unwrap(
        api.POST('/notifications/{notification_id}/read', { params: { path: { notification_id: id } } }),
      ),
    onSuccess: refresh,
  });
  const readAll = useMutation({
    mutationFn: () => unwrap(api.POST('/notifications/read-all')),
    onSuccess: refresh,
  });

  const unread = notifications.data?.unread_count ?? 0;

  return (
    <main className="mx-auto max-w-3xl pt-6 pb-12 sm:px-6">
      <div className="flex items-end justify-between gap-4 px-4 pb-4 sm:px-0">
        <h1 className="font-display text-display-l font-extrabold font-condensed">Notifications</h1>
        {unread > 0 && (
          <Button variant="link" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
            Mark all read
          </Button>
        )}
      </div>

      {(!user || notifications.isPending) && (
        <div aria-busy="true" className="flex flex-col gap-3 px-4 sm:px-0">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {notifications.error && (
        <Notice tone="error" title="Couldn't load notifications" className="mx-4 sm:mx-0">
          {errorMessage(notifications.error)}
        </Notice>
      )}

      {notifications.data?.items.length === 0 && (
        <EmptyState className="px-4 pt-6 sm:px-0" title="All quiet.">
          We&apos;ll tell you here when a vendor confirms, messages you, or finishes a job.
        </EmptyState>
      )}

      {notifications.data && notifications.data.items.length > 0 && (
        <ul className="hairline-t">
          {notifications.data.items.map((notification) => {
            const href = notificationHref(notification);
            const isUnread = !notification.read_at;
            const content = (
              <>
                <span
                  className={cn('mt-2 size-2 shrink-0 rounded-sm', isUnread ? 'bg-duka' : 'bg-transparent')}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className={cn('block', isUnread ? 'font-semibold' : 'text-ink-80')}>
                    {notification.title}
                  </span>
                  <span className="block text-body text-slate">{notification.body}</span>
                </span>
                <time dateTime={notification.created_at} className="shrink-0 text-caption text-slate">
                  {ago(notification.created_at)}
                </time>
              </>
            );
            const className = 'flex gap-3 px-4 py-4 hover:bg-chalk/60 sm:px-2';
            return (
              <li key={notification.id} className="hairline-b">
                {isUnread && <span className="sr-only">Unread: </span>}
                {href ? (
                  <Link
                    href={href}
                    className={className}
                    onClick={() => isUnread && readOne.mutate(notification.id)}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
