/**
 * Frontend environment access.
 * Only validates variables the frontend actually uses.
 * All data persistence goes through the Express backend — no direct
 * database or third-party SDK calls from the browser.
 */

function get(key: string, fallback?: string): string {
  const val = (import.meta.env as Record<string, string>)[key];
  if (val) return val;
  if (fallback !== undefined) return fallback;
  throw new Error(`[env] Missing required environment variable: ${key}`);
}

export const env = {
  VITE_API_BASE_URL: get('VITE_API_BASE_URL', 'http://localhost:3001'),
  VITE_HUB_API_KEY: get('VITE_HUB_API_KEY', 'dev-key'),
};
