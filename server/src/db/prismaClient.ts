/**
 * Prisma client singleton.
 * Instantiated once and reused across all connectors and services.
 * In development, a global variable prevents hot-reload from creating
 * multiple instances.
 *
 * If DATABASE_URL is not configured the server still starts — connectors
 * that require the DB (crm, gsc token storage) return graceful errors.
 */
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    // Return a proxy that throws a clear error when any model is accessed.
    // This lets the server start without a DB and gives connectors a chance
    // to return graceful "not configured" messages.
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === '$connect' || prop === '$disconnect') {
          return () => Promise.resolve();
        }
        return () => {
          throw new Error('DATABASE_URL is not configured. Set it in your .env file to enable CRM and OAuth token storage.');
        };
      },
    });
  }
  return new PrismaClient({ log: ['error', 'warn'] });
}

export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

