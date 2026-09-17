import type { Metadata } from 'next';

import { AuthShell } from '@/features/auth/AuthShell';
import { VerifyEmailForm } from '@/features/auth/forms';

export const metadata: Metadata = { title: 'Verify your email', robots: { index: false } };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Check your email." lead="We sent you a 6-digit code. Enter it to start booking.">
      <VerifyEmailForm />
    </AuthShell>
  );
}
