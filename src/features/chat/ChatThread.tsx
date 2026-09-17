'use client';

import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { clockTime, firstName, shortDate } from '@/api/format';
import type { Conversation, Message } from '@/api/types';
import { contactShared } from '@/features/bookings/status';
import { Avatar } from '@/ui/Avatar';
import { LockedRow, Notice, Skeleton } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/cn';

import { splitRedactions, type Outgoing } from './messages';
import { useConversation } from './useConversation';

const MAX_CHARS = 2000;

function Body({ text }: { text: string }) {
  return (
    <>
      {splitRedactions(text).map((part, index) =>
        part.redacted ? (
          <span key={index} className="rounded-sm bg-ink-12 px-1.5 text-slate">
            removed
          </span>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

function Bubble({ message }: { message: Message }) {
  if (message.kind === 'system') {
    return (
      <li className="my-2 text-center text-caption text-slate">
        <span className="rounded-sm bg-paper px-2 py-1 hairline">{message.body}</span>
      </li>
    );
  }
  const mine = message.sender_role === 'customer';
  const redacted = message.moderation === 'redacted';
  return (
    <li className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-card px-3.5 py-2.5 text-body-l whitespace-pre-wrap sm:max-w-[70%]',
          mine ? 'bg-duka-soft' : 'bg-chalk hairline',
          redacted && 'text-ink-80',
        )}
      >
        <Body text={message.body} />
        <span className="mt-1 block text-caption text-slate">
          {clockTime(message.created_at)}
          {redacted && mine && ' · sent without contact details'}
        </span>
      </div>
    </li>
  );
}

function PendingBubble({ item, onRetry }: { item: Outgoing; onRetry: () => void }) {
  return (
    <li className="flex justify-end">
      <div className="max-w-[85%] rounded-card bg-duka-soft/60 px-3.5 py-2.5 text-body-l whitespace-pre-wrap sm:max-w-[70%]">
        {item.body}
        {item.failed ? (
          <span className="mt-1 block text-caption text-clay">
            Not sent. {item.failed}{' '}
            <button type="button" onClick={onRetry} className="font-semibold underline">
              Try again
            </button>
          </span>
        ) : (
          <span className="mt-1 block text-caption text-slate">Sending…</span>
        )}
      </div>
    </li>
  );
}

/** Helpful, not punitive: why the number was taken out, and when they'll get it. */
function RedactionNotice({ otherName }: { otherName: string }) {
  return (
    <li>
      <Notice
        tone="warn"
        icon={<Lock aria-hidden="true" className="size-4" />}
        title="Contact details stay hidden until the booking is confirmed. You'll get the number then."
      >
        Your message was sent without the number. {otherName} can still read the rest.
      </Notice>
    </li>
  );
}

function Composer({ onSend, disabled }: { onSend: (body: string) => void; disabled: boolean }) {
  const [body, setBody] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = body.trim();
    if (!text || disabled) return;
    onSend(text);
    setBody('');
    ref.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <label htmlFor="chat-message" className="sr-only">
        Write a message
      </label>
      <textarea
        id="chat-message"
        ref={ref}
        rows={1}
        value={body}
        maxLength={MAX_CHARS}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write a message"
        className="field-sizing-content max-h-40 min-h-12 flex-1 resize-none rounded-sm bg-chalk px-3.5 py-3 text-body-l hairline placeholder:text-slate"
      />
      <Button
        type="submit"
        className="size-12 shrink-0 px-0"
        aria-label="Send"
        disabled={disabled || !body.trim()}
      >
        <ArrowRight aria-hidden="true" className="size-5" />
      </Button>
    </form>
  );
}

export function ChatThread({
  conversationId,
  conversation,
}: {
  conversationId: string;
  conversation: Conversation | null;
}) {
  const chat = useConversation(conversationId);
  const scroller = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const otherName = conversation ? firstName(conversation.other_party_name) : 'The vendor';
  const lastOwnRedacted = chat.messages.findLast(
    (m) => m.sender_role === 'customer' && m.moderation === 'redacted',
  );
  const showNotice =
    lastOwnRedacted && (chat.notice || !conversation || !contactShared(conversation.booking_status));

  // Stay pinned to the newest message unless the customer scrolled up to read.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element && nearBottom.current) element.scrollTop = element.scrollHeight;
  }, [chat.messages.length, chat.outgoing.length, showNotice]);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const onScroll = () => {
      nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
    };
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => element.removeEventListener('scroll', onScroll);
  }, []);

  async function older() {
    setLoadingOlder(true);
    nearBottom.current = false;
    try {
      await chat.loadOlder();
    } finally {
      setLoadingOlder(false);
    }
  }

  const days = chat.messages.map((message) => shortDate(message.created_at));

  return (
    <section
      className="flex h-full min-h-0 flex-col"
      aria-label={`Chat with ${conversation?.other_party_name ?? 'vendor'}`}
    >
      <header className="flex items-center gap-3 bg-paper px-2 py-2.5 hairline-b sm:px-4">
        <Link href="/messages" className="rounded-sm p-2 lg:hidden" aria-label="All messages">
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        {conversation && <Avatar name={conversation.other_party_name} size="sm" />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-title font-bold">
            {conversation?.other_party_name ?? 'Chat'}
          </p>
          {conversation && (
            <Link
              href={`/bookings/${conversation.booking_id}`}
              className="block truncate text-caption text-slate hover:text-ink"
            >
              {conversation.service_name} · {conversation.booking_reference}
            </Link>
          )}
        </div>
        {chat.connection === 'offline' && chat.status === 'ready' && (
          <span className="text-caption text-slate" role="status">
            Reconnecting…
          </span>
        )}
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        {chat.status === 'loading' && (
          <div aria-busy="true" className="flex flex-col gap-3">
            <Skeleton className="h-14 w-2/3" />
            <Skeleton className="ml-auto h-14 w-1/2" />
            <Skeleton className="h-14 w-3/5" />
          </div>
        )}
        {chat.status === 'error' && (
          <Notice tone="error" title="Couldn't load this chat">
            {chat.error}
          </Notice>
        )}
        {chat.hasOlder && (
          <div className="mb-3 flex justify-center">
            <Button variant="secondary" size="sm" loading={loadingOlder} onClick={() => void older()}>
              Earlier messages
            </Button>
          </div>
        )}
        {chat.status === 'ready' && chat.messages.length === 0 && chat.outgoing.length === 0 && (
          <p className="mx-auto max-w-sm py-8 text-center text-body text-slate">
            Ask {otherName} anything about the job. Phone numbers are shared once the booking is confirmed.
          </p>
        )}
        <ol className="flex flex-col gap-2.5" aria-live="polite">
          {chat.messages.map((message, index) => {
            const day = days[index];
            return (
              <Fragment key={message.id}>
                {day !== days[index - 1] && (
                  <li className="my-1 text-center text-caption text-slate">{day}</li>
                )}
                <Bubble message={message} />
                {showNotice && message.id === lastOwnRedacted?.id && (
                  <RedactionNotice otherName={otherName} />
                )}
              </Fragment>
            );
          })}
          {chat.outgoing.map((item) => (
            <PendingBubble key={item.clientId} item={item} onRetry={() => chat.retry(item.clientId)} />
          ))}
        </ol>
      </div>

      <footer className="bg-paper px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] hairline-t sm:px-6">
        {chat.isLocked || conversation?.is_locked ? (
          <LockedRow
            title="This chat is closed."
            detail="Chats close when a booking ends. You can still read it here."
          />
        ) : (
          <Composer onSend={chat.send} disabled={chat.status !== 'ready'} />
        )}
      </footer>
    </section>
  );
}
