import type { Metadata } from 'next';

import { AuthShell } from '@/features/auth/AuthShell';
import { SignInForm } from '@/features/auth/forms';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ reset?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { reset } = await searchParams;
  return (
    <AuthShell title="Karibu tena." lead={reset ? 'Password changed. Sign in with your new password.' : 'Sign in to book and chat with vendors.'}>
      <SignInForm />
    </AuthShell>
  );
}
