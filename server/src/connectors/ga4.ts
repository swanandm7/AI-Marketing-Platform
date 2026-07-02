import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

function getClient() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN || !env.GA4_PROPERTY_ID) {
    throw new AppError(503, 'GA4 is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GA4_PROPERTY_ID.');
  }
  return new BetaAnalyticsDataClient({
    credentials: {
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    },
  });
}

export const ga4Connector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      const client = getClient();
      const { startDate, endDate } = resolveDateRange(intent.timeRange);
      
      const [response] = await client.runReport({
        property: `properties/${env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'bounceRate' }, { name: 'conversions' }],
      });
      
      const data = response.rows?.map(row => {
        const channel = row.dimensionValues?.[0]?.value ?? 'Unknown';
        const sessions = Number(row.metricValues?.[0]?.value ?? 0);
        const bounceRate = Number(row.metricValues?.[1]?.value ?? 0);
        const conversions = Number(row.metricValues?.[2]?.value ?? 0);
        return { channel, sessions, bounceRate, conversions };
      }) ?? [];

      return { source: 'ga4', data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown GA4 error';
      logger.error({ err }, 'GA4 fetch failed');
      return { source: 'ga4', data: null, error: message };
    }
  },

  async checkStatus() {
    try {
      getClient();
      return { status: 'live', lastSync: 'now' };
    } catch {
      return { status: 'down', lastSync: 'not configured' };
    }
  },
};
