/**
 * API client using native fetch.
 * Injects x-hub-api-key on every request.
 * Normalises errors into a consistent shape.
 */
import { env } from '@/lib/env';

const BASE_URL = env.VITE_API_BASE_URL;

export interface ApiError {
  message: string;
  status: number;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-hub-api-key': env.VITE_HUB_API_KEY,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    const err: ApiError = { message, status: res.status };
    throw err;
  }

  return res.json() as Promise<T>;
}

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as ApiError).message);
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
