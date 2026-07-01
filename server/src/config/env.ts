/**
 * Server environment validation.
 * Parses and validates all required environment variables at boot time.
 * The server will not start if any required variable is missing — fail fast.
 *
 * Optional connector vars are marked optional() so the server starts
 * even when a connector is not yet configured, but the connector itself
 * will throw if it's invoked without its credentials.
 */
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the server directory, then fall back to project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const schema = z.object({
  // ── Server ──────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  HUB_API_KEY: z.string().min(1, 'HUB_API_KEY is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // ── Anthropic ───────────────────────────────────────
  ANTHROPIC_API_KEY: z.string().optional(),

  // ── Database ────────────────────────────────────────
  DATABASE_URL: z.string().optional(),

  // ── Google (shared OAuth app) ───────────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
  GA4_PROPERTY_ID: z.string().optional(),
  GSC_SITE_URL: z.string().optional(),
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().optional(),
  GOOGLE_ADS_CUSTOMER_ID: z.string().optional(),

  // ── Meta ────────────────────────────────────────────
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_AD_ACCOUNT_ID: z.string().optional(),

  // ── LinkedIn ────────────────────────────────────────
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_ACCESS_TOKEN: z.string().optional(),
  LINKEDIN_AD_ACCOUNT_ID: z.string().optional(),

  // ── Clarity ─────────────────────────────────────────
  CLARITY_PROJECT_ID: z.string().optional(),
  CLARITY_API_KEY: z.string().optional(),

  // ── Pabbly webhook ──────────────────────────────────
  PABBLY_WEBHOOK_SECRET: z.string().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`[env] Missing or invalid environment variables:\n${issues}`);
  process.exit(1);
}

export const env = result.data;
