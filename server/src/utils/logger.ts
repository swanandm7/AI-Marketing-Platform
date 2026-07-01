/**
 * Structured logger using pino.
 * In development: pretty-printed to stdout.
 * In production: JSON to stdout (picked up by log aggregators).
 */
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
