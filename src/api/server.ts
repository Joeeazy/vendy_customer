import createClient from 'openapi-fetch';

import { ApiError } from './errors';
import type { paths } from './schema';

/**
 * Server-side calls for public pages (catalogue, search, vendor profiles).
 * No cookies are sent: session cookies are scoped to the browser's /customer
 * path, so anything personal is fetched client-side.
 */
const baseUrl = process.env.CUSTOMER_API_URL ?? 'http://localhost:8002';

export function serverApi(revalidateSeconds = 60) {
  return createClient<paths>({
    baseUrl,
    requestInitExt: { next: { revalidate: revalidateSeconds } },
  });
}

type Result<Data> = { data?: Data; error?: unknown; response: Response };

/** Data, or null for a 404; anything else throws so the error page shows. */
export async function orNotFound<Data>(request: Promise<Result<Data>>): Promise<Data | null> {
  const { data, error, response } = await request;
  if (response.status === 404) return null;
  if (!response.ok) throw ApiError.from(response.status, error);
  return data as Data;
}

export async function required<Data>(request: Promise<Result<Data>>): Promise<Data> {
  const { data, error, response } = await request;
  if (!response.ok) throw ApiError.from(response.status, error);
  return data as Data;
}
