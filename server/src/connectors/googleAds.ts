/**
 * Google Ads connector stub.
 * Phase 2: implement with google-ads-api npm package.
 */
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';

export const googleAdsConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    const { startDate, endDate } = resolveDateRange(intent.timeRange);
    logger.info({ source: 'ads', startDate, endDate }, 'Google Ads fetch (stub)');
    return { source: 'ads', data: null, error: 'Google Ads connector not yet implemented.' };
  },

  async checkStatus() {
    return { status: 'down', lastSync: 'not configured' };
  },
};
