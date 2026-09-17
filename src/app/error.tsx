'use client';

import Link from 'next/link';

import { EmptyState } from '@/ui/Blocks';
import { Button, buttonClasses } from '@/ui/Button';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-[1440px] pb-16 sm:px-6 lg:px-12">
      <EmptyState
        band
        title="Something went wrong."
        actions={
          <>
            <Button onClick={reset} className="sm:self-start">
              Try again
            </Button>
            <Link href="/" className={buttonClasses({ variant: 'secondary', className: 'sm:self-start' })}>
              Go home
            </Link>
          </>
        }
      >
        It&apos;s on our side, not yours. If it keeps happening, check your connection and try again in a
        minute.
      </EmptyState>
    </main>
  );
}
