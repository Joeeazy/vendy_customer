'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { api, unwrap } from '@/api/client';
import { errorMessage, isApiError } from '@/api/errors';
import { Notice } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Field, TextInput } from '@/ui/Field';

import { useNextPath, useSession } from './session';

function fieldError(error: unknown, field: string): string | undefined {
  return isApiError(error) ? error.fieldErrors[field] : undefined;
}

/** The form-level message, unless it's already shown next to a field. */
function FormError({ error }: { error: unknown }) {
  if (!error || (isApiError(error) && error.status === 422 && Object.keys(error.fieldErrors).length))
    return null;
  return <Notice tone="error">{errorMessage(error)}</Notice>;
}

function withNext(path: string, next: string): string {
  return next === '/' ? path : `${path}?next=${encodeURIComponent(next)}`;
}

export function SignInForm() {
  const router = useRouter();
  const next = useNextPath();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: () => unwrap(api.POST('/auth/login', { body: { email: email.trim(), password } })),
    onSuccess: (session) => {
      signIn(session);
      router.replace(session.user.email_verified ? next : withNext('/verify-email', next));
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Email" error={fieldError(login.error, 'email')}>
        {(props) => (
          <TextInput
            {...props}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>
      <Field label="Password">
        {(props) => (
          <TextInput
            {...props}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>
      <FormError error={login.error} />
      <Button type="submit" size="lg" block loading={login.isPending}>
        Sign in
      </Button>
      <div className="flex flex-wrap justify-between gap-3 text-body">
        <Link href="/forgot-password" className="text-duka underline-offset-4 hover:underline">
          Forgot password?
        </Link>
        <Link
          href={withNext('/sign-up', next)}
          className="font-semibold text-duka underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const next = useNextPath();
  const { signIn } = useSession();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    accept_terms: false,
  });

  const signup = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/auth/signup', {
          body: { ...form, email: form.email.trim(), full_name: form.full_name.trim() },
        }),
      ),
    onSuccess: (session) => {
      signIn(session);
      router.replace(withNext('/verify-email', next));
    },
  });

  const set = (field: keyof typeof form) => (value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    signup.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Full name" error={fieldError(signup.error, 'full_name')}>
        {(props) => (
          <TextInput
            {...props}
            autoComplete="name"
            required
            value={form.full_name}
            onChange={(event) => set('full_name')(event.target.value)}
          />
        )}
      </Field>
      <Field label="Email" error={fieldError(signup.error, 'email')}>
        {(props) => (
          <TextInput
            {...props}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => set('email')(event.target.value)}
          />
        )}
      </Field>
      <Field
        label="Phone"
        hint="Shared with a vendor only after they confirm your booking."
        error={fieldError(signup.error, 'phone')}
      >
        {(props) => (
          <TextInput
            {...props}
            type="tel"
            autoComplete="tel"
            placeholder="0712 345 678"
            required
            value={form.phone}
            onChange={(event) => set('phone')(event.target.value)}
          />
        )}
      </Field>
      <Field label="Password" hint="At least 8 characters." error={fieldError(signup.error, 'password')}>
        {(props) => (
          <TextInput
            {...props}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={(event) => set('password')(event.target.value)}
          />
        )}
      </Field>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          required
          checked={form.accept_terms}
          onChange={(event) => set('accept_terms')(event.target.checked)}
          className="mt-0.5 size-5 accent-duka"
        />
        <span className="text-body">I accept the terms and privacy notice.</span>
      </label>
      {fieldError(signup.error, 'accept_terms') && (
        <p className="-mt-3 text-caption font-medium text-clay">{fieldError(signup.error, 'accept_terms')}</p>
      )}
      <FormError error={signup.error} />
      <Button type="submit" size="lg" block loading={signup.isPending}>
        Create account
      </Button>
      <p className="text-body">
        Already on Vendy?{' '}
        <Link
          href={withNext('/sign-in', next)}
          className="font-semibold text-duka underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function VerifyEmailForm() {
  const router = useRouter();
  const next = useNextPath();
  const { user, status, setUser } = useSession();
  const [code, setCode] = useState('');

  const verify = useMutation({
    mutationFn: () => unwrap(api.POST('/auth/verify-email', { body: { code: code.trim() } })),
    onSuccess: (verified) => {
      setUser(verified);
      router.replace(next);
    },
  });
  const resend = useMutation({ mutationFn: () => unwrap(api.POST('/auth/verify-email/resend')) });

  if (status === 'signed-out') {
    return (
      <Notice title="Sign in first">
        <Link
          href={withNext('/sign-in', withNext('/verify-email', next))}
          className="font-semibold text-duka underline"
        >
          Sign in
        </Link>{' '}
        and then enter the code we emailed you.
      </Notice>
    );
  }

  if (user?.email_verified) {
    return (
      <Notice tone="success" title="Your email is verified">
        <Link href={next} className="font-semibold text-duka underline">
          Carry on
        </Link>
      </Notice>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    verify.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field
        label="6-digit code"
        hint={user ? `Sent to ${user.email}. It can take a minute.` : undefined}
        error={fieldError(verify.error, 'code')}
      >
        {(props) => (
          <TextInput
            {...props}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            className="font-display text-display-m tracking-[0.3em] tabular"
          />
        )}
      </Field>
      <FormError error={verify.error} />
      <Button type="submit" size="lg" block loading={verify.isPending} disabled={code.length !== 6}>
        Verify email
      </Button>
      <div className="text-body">
        {resend.isSuccess ? (
          <p className="text-slate">New code sent. Check your spam folder too.</p>
        ) : (
          <Button variant="link" onClick={() => resend.mutate()} disabled={resend.isPending}>
            Send a new code
          </Button>
        )}
        {resend.error && <p className="mt-1 text-caption text-clay">{errorMessage(resend.error)}</p>}
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const initialEmail = useSearchParams().get('email') ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const request = useMutation({
    mutationFn: () => unwrap(api.POST('/auth/password/forgot', { body: { email: email.trim() } })),
  });
  const reset = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/auth/password/reset', {
          body: { email: email.trim(), code: code.trim(), new_password: password },
        }),
      ),
    onSuccess: () => router.replace('/sign-in?reset=1'),
  });

  if (!request.isSuccess) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          request.mutate();
        }}
        className="flex flex-col gap-5"
      >
        <Field label="Email" error={fieldError(request.error, 'email')}>
          {(props) => (
            <TextInput
              {...props}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </Field>
        <FormError error={request.error} />
        <Button type="submit" size="lg" block loading={request.isPending}>
          Email me a code
        </Button>
        <Link href="/sign-in" className="text-body text-duka underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </form>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        reset.mutate();
      }}
      className="flex flex-col gap-5"
    >
      <Notice tone="success">If {email} has an account, a code is on its way.</Notice>
      <Field label="6-digit code" error={fieldError(reset.error, 'code')}>
        {(props) => (
          <TextInput
            {...props}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            className="font-display text-display-m tracking-[0.3em] tabular"
          />
        )}
      </Field>
      <Field
        label="New password"
        hint="At least 8 characters."
        error={fieldError(reset.error, 'new_password')}
      >
        {(props) => (
          <TextInput
            {...props}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>
      <FormError error={reset.error} />
      <Button type="submit" size="lg" block loading={reset.isPending}>
        Set new password
      </Button>
    </form>
  );
}
