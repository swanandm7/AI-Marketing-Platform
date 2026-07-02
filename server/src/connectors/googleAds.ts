import { GoogleAdsApi } from 'google-ads-api';
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

function getClient() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_ADS_DEVELOPER_TOKEN || !env.GOOGLE_ADS_CUSTOMER_ID || !env.GOOGLE_REFRESH_TOKEN) {
    throw new AppError(503, 'Google Ads is not configured. Missing required credentials.');
  }
  return new GoogleAdsApi({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    developer_token: env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
}

export const googleAdsConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      const client = getClient();
      const customer = client.Customer({
        customer_id: env.GOOGLE_ADS_CUSTOMER_ID!,
        refresh_token: env.GOOGLE_REFRESH_TOKEN!,
      });

      const { startDate, endDate } = resolveDateRange(intent.timeRange);

      const campaigns = await customer.query(`
        SELECT
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 20
      `);

      const data = campaigns.map(c => ({
        name: c.campaign?.name ?? 'Unknown Campaign',
        impressions: Number(c.metrics?.impressions ?? 0),
        clicks: Number(c.metrics?.clicks ?? 0),
        spend: Number(c.metrics?.cost_micros ?? 0) / 1_000_000,
        conversions: Number(c.metrics?.conversions ?? 0),
        cpl: Number(c.metrics?.conversions ?? 0) > 0
          ? (Number(c.metrics?.cost_micros ?? 0) / 1_000_000) / Number(c.metrics?.conversions ?? 0)
          : null
      }));

      return { source: 'ads', data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Google Ads error';
      logger.error({ err }, 'Google Ads fetch failed');
      return { source: 'ads', data: null, error: message };
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
