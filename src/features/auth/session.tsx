'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, use, useCallback, useEffect, useMemo, type ReactNode } from 'react';

import { api } from '@/api/client';
import { ApiError } from '@/api/errors';
import { keys } from '@/api/keys';
import { forgetAccessToken, rememberAccessToken } from '@/api/tokens';
import type { Session, User } from '@/api/types';

type Status = 'loading' | 'signed-in' | 'signed-out';

type SessionContextValue = {
  status: Status;
  user: User | null;
  /** Store a session returned by sign-up, sign-in or refresh. */
  signIn: (session: Session) => void;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchMe(): Promise<User | null> {
  const { data, error, response } = await api.GET('/me');
  if (response.status === 401) return null;
  if (!response.ok) throw ApiError.from(response.status, error);
  return data ?? null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: keys.me, queryFn: fetchMe, staleTime: 5 * 60_000, retry: false });

  const signIn = useCallback(
    (session: Session) => {
      rememberAccessToken(session.access_token, session.expires_in);
      queryClient.setQueryData(keys.me, session.user);
    },
    [queryClient],
  );

  const setUser = useCallback((user: User) => queryClient.setQueryData(keys.me, user), [queryClient]);

  const signOut = useCallback(async () => {
    await api.POST('/auth/logout').catch(() => undefined);
    forgetAccessToken();
    queryClient.clear();
    queryClient.setQueryData(keys.me, null);
  }, [queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status: me.isPending ? 'loading' : me.data ? 'signed-in' : 'signed-out',
      user: me.data ?? null,
      signIn,
      signOut,
      setUser,
    }),
    [me.isPending, me.data, signIn, signOut, setUser],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const context = use(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}

/** Where to go after signing in: the page that asked, never another site. */
export function useNextPath(fallback = '/'): string {
  const next = useSearchParams().get('next');
  return next?.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

/** The signed-in user, sending anyone else to sign in and back here afterwards. */
export function useRequireUser(): User | null {
  const { status, user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (status === 'signed-out') {
      const next = search ? `${pathname}?${search}` : pathname;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    }
  }, [status, router, pathname, search]);

  return user;
}
