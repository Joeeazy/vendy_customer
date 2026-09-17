/**
 * Every backend error has the shape `{ code, detail }`. `code` is stable and
 * safe to branch on; `detail` is English written for the person using the app.
 * Validation errors (422) also carry `errors`, one per invalid field.
 */

type ValidationIssue = { loc?: (string | number)[]; msg?: string };

type ErrorBody = {
  code?: unknown;
  detail?: unknown;
  errors?: ValidationIssue[];
};

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static from(status: number, body: unknown): ApiError {
    const parsed = (typeof body === 'object' && body !== null ? body : {}) as ErrorBody;
    const code = typeof parsed.code === 'string' ? parsed.code : `http_${status}`;

    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.errors ?? []) {
      const field = issue.loc?.at(-1);
      if (typeof field === 'string' && issue.msg && !(field in fieldErrors)) {
        fieldErrors[field] = issue.msg.replace(/^Value error, /, '');
      }
    }

    const detail = typeof parsed.detail === 'string' ? parsed.detail : null;
    const firstFieldError = Object.values(fieldErrors)[0];
    const message = status === 422 && firstFieldError ? firstFieldError : (detail ?? GENERIC_MESSAGE);
    return new ApiError(status, code, message, fieldErrors);
  }
}

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

/** A sentence to show the person, whatever went wrong. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Couldn't reach Vendy. Check your connection and try again.";
  return GENERIC_MESSAGE;
}
