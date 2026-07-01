/**
 * Rate limiter for /api/query.
 * Caps at 200 requests/day to prevent accidental Claude API cost overruns.
 * Single-user tool so one window per server is appropriate.
 */
import rateLimit from 'express-rate-limit';

export const queryRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Daily query limit reached. Try again tomorrow.' },
});

export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many webhook calls.' },
});
