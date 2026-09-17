import type { Metadata } from 'next';

import { AuthShell } from '@/features/auth/AuthShell';
import { ForgotPasswordForm } from '@/features/auth/forms';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password." lead="We'll email you a code.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
