import axios from 'axios';
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

function checkConfig() {
  if (!env.LINKEDIN_ACCESS_TOKEN || !env.LINKEDIN_AD_ACCOUNT_ID) {
    throw new AppError(503, 'LinkedIn is not configured. Missing credentials.');
  }
}

export const linkedinConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      checkConfig();
      const { startDate, endDate } = resolveDateRange(intent.timeRange);

      const res = await axios.get(
        `https://api.linkedin.com/v2/adAnalyticsV2`,
        {
          headers: { Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}` },
          params: {
            q: 'analytics',
            pivot: 'CAMPAIGN',
            dateRange: { 
              start: { year: parseInt(startDate.split('-')[0]), month: parseInt(startDate.split('-')[1]), day: parseInt(startDate.split('-')[2]) },
              end:   { year: parseInt(endDate.split('-')[0]),   month: parseInt(endDate.split('-')[1]),   day: parseInt(endDate.split('-')[2]) } 
            },
            fields: 'impressions,clicks,costInLocalCurrency,leadGenerationMailContactInfoShares,pivot,pivotValues',
            accounts: `urn:li:sponsoredAccount:${env.LINKEDIN_AD_ACCOUNT_ID}`
          }
        }
      );

      return { source: 'linkedin', data: res.data.elements };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown LinkedIn error';
      logger.error({ err }, 'LinkedIn fetch failed');
      return { source: 'linkedin', data: null, error: message };
    }
  },

  async checkStatus() {
    try {
      checkConfig();
      return { status: 'live', lastSync: 'now' };
    } catch {
      return { status: 'down', lastSync: 'not configured' };
    }
  },
};
