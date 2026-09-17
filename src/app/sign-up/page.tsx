import type { Metadata } from 'next';

import { AuthShell } from '@/features/auth/AuthShell';
import { SignUpForm } from '@/features/auth/forms';

export const metadata: Metadata = { title: 'Create an account' };

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account." lead="Free for customers. Takes a minute.">
      <SignUpForm />
    </AuthShell>
  );
}
