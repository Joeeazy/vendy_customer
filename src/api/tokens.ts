/**
 * The access token, in memory only. REST calls authenticate with the httpOnly
 * cookie the backend sets; the token itself is needed only for the chat
 * socket's first frame. It is never written to storage.
 */

type Session = { accessToken: string; expiresAt: number };

let current: Session | null = null;

const EXPIRY_MARGIN_MS = 30_000;

export function rememberAccessToken(accessToken: string, expiresInSeconds: number): void {
  current = { accessToken, expiresAt: Date.now() + expiresInSeconds * 1000 };
}

export function forgetAccessToken(): void {
  current = null;
}

/** The token if it has more than 30 seconds left, otherwise null. */
export function freshAccessToken(): string | null {
  if (!current || current.expiresAt - EXPIRY_MARGIN_MS <= Date.now()) return null;
  return current.accessToken;
}
