'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { AreaSelect } from '@/features/area/AreaSelect';
import { useSession } from '@/features/auth/session';
import { Avatar } from '@/ui/Avatar';
import { buttonClasses } from '@/ui/Button';
import { cn } from '@/ui/cn';
import { Wordmark } from '@/ui/Wordmark';

const VENDOR_APP_URL = process.env.NEXT_PUBLIC_VENDOR_APP_URL ?? 'http://localhost:3001';

function AccountMenu() {
  const { user, signOut } = useSession();
  const router = useRouter();
  if (!user) return null;

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center rounded-sm [&::-webkit-details-marker]:hidden" aria-label="Your account">
        <Avatar name={user.full_name} size="sm" />
      </summary>
      <nav className="absolute right-0 z-20 mt-2 flex w-56 flex-col rounded-card bg-chalk p-1.5 hairline" aria-label="Account">
        <p className="px-3 pt-2 pb-1 text-caption text-slate">{user.email}</p>
        {[
          ['/bookings', 'My bookings'],
          ['/messages', 'Messages'],
          ['/notifications', 'Notifications'],
        ].map(([href, label]) => (
          <Link key={href} href={href!} className="rounded-sm px-3 py-2.5 font-medium hover:bg-paper">
            {label}
          </Link>
        ))}
        <button
          type="button"
          className="rounded-sm px-3 py-2.5 text-left font-medium hover:bg-paper"
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
        >
          Sign out
        </button>
      </nav>
    </details>
  );
}

/** The top bar. `children` replaces the nav, e.g. the search bar on results pages. */
export function SiteHeader({ children, className }: { children?: ReactNode; className?: string }) {
  const { status } = useSession();

  return (
    <header className={cn('bg-paper hairline-b', className)}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:h-[72px] lg:px-12">
        <Link href="/" className="shrink-0" aria-label="Vendy home">
          <Wordmark size="sm" />
        </Link>

        {children ?? (
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            <Link href="/search" className="font-semibold">
              Find a vendor
            </Link>
            {status === 'signed-in' && (
              <Link href="/bookings" className="text-ink-80 hover:text-ink">
                My bookings
              </Link>
            )}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {!children && <AreaSelect className="hidden w-44 sm:block" />}
          <a href={VENDOR_APP_URL} className="hidden text-body text-ink-80 hover:text-ink lg:inline">
            Work with us
          </a>
          {status === 'signed-in' ? (
            <>
              <Link href="/bookings" className="hidden text-body text-ink-80 hover:text-ink md:inline lg:hidden">
                My bookings
              </Link>
              <AccountMenu />
            </>
          ) : (
            <Link href="/sign-in" className={buttonClasses({ size: 'sm', className: status === 'loading' ? 'invisible' : '' })}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
