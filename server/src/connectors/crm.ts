/**
 * CRM connector.
 * Reads from the internal `leads` table populated by Pabbly webhooks.
 * This is the only connector that queries the local database instead of an external API.
 */
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { prisma } from '../db/prismaClient';
import { resolveDateRange } from '../utils/dates';
import { logger } from '../utils/logger';

export const crmConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      const { startDate, endDate } = resolveDateRange(intent.timeRange);
      logger.info({ source: 'crm', startDate, endDate }, 'CRM fetch');

      const rows = await prisma.lead.groupBy({
        by: ['source'],
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        _count: { id: true },
      });

      const conversions = await prisma.lead.groupBy({
        by: ['source'],
        where: {
          status: 'converted',
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        _count: { id: true },
      });

      const conversionMap = Object.fromEntries(
        conversions.map((c) => [c.source, c._count.id]),
      );

      return {
        source: 'crm',
        data: rows.map((r) => ({
          source: r.source,
          totalLeads: r._count.id,
          conversions: conversionMap[r.source ?? ''] ?? 0,
        })),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'CRM unavailable';
      logger.warn({ err }, 'CRM fetch failed');
      return { source: 'crm', data: null, error: message };
    }
  },

  async checkStatus() {
    try {
      const last = await prisma.lead.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      if (!last) return { status: 'live', lastSync: 'no leads yet' };

      const diff = Date.now() - last.createdAt.getTime();
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor(diff / 60_000);

      const lastSync =
        hours > 0 ? `${hours} hr ago` : `${minutes} min ago`;

      return { status: 'live', lastSync };
    } catch {
      return { status: 'down', lastSync: 'error' };
    }
  },
};
