import createClient from 'openapi-fetch';

import { ApiError } from './errors';
import type { paths } from './schema';
import { forgetAccessToken, freshAccessToken, rememberAccessToken } from './tokens';
import type { Session } from './types';

/** The customer API, same-origin (Next forwards /customer/* in development, nginx in production). */
export const API_BASE = '/customer';

const SIGNED_OUT_CODES = new Set(['auth.token_expired', 'auth.not_authenticated']);

let refreshInFlight: Promise<Session | null> | null = null;

/**
 * Swap the long-lived refresh cookie for a new session. Concurrent callers
 * share one request, because the backend rotates refresh tokens on use.
 */
export function refreshSession(): Promise<Session | null> {
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        forgetAccessToken();
        return null;
      }
      const session = (await response.json()) as Session;
      rememberAccessToken(session.access_token, session.expires_in);
      return session;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** An access token for the chat socket, refreshing the session if needed. */
export async function accessToken(): Promise<string | null> {
  return freshAccessToken() ?? (await refreshSession())?.access_token ?? null;
}

async function fetchWithRefresh(request: Request): Promise<Response> {
  const retry = request.clone();
  const response = await fetch(request);
  if (response.status !== 401 || new URL(request.url).pathname.startsWith(`${API_BASE}/auth/`)) {
    return response;
  }

  const body = (await response
    .clone()
    .json()
    .catch(() => null)) as { code?: string } | null;
  if (!body?.code || !SIGNED_OUT_CODES.has(body.code)) return response;

  const session = await refreshSession();
  return session ? fetch(retry) : response;
}

export const api = createClient<paths>({
  baseUrl: API_BASE,
  credentials: 'include',
  fetch: fetchWithRefresh,
});

type Result<Data> = { data?: Data; error?: unknown; response: Response };

/** Resolve an API call to its data, or throw an ApiError with the backend's message. */
export async function unwrap<Data>(request: Promise<Result<Data>>): Promise<Data> {
  const { data, error, response } = await request;
  if (!response.ok) throw ApiError.from(response.status, error);
  return data as Data;
}
