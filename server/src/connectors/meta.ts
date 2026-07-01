/**
 * Meta Ads connector stub.
 * Phase 3: implement with axios against the Graph API v19.0.
 * Note: access tokens expire every 60 days — implement auto-refresh in Phase 3.
 */
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';

export const metaConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    const { startDate, endDate } = resolveDateRange(intent.timeRange);
    logger.info({ source: 'meta', startDate, endDate }, 'Meta Ads fetch (stub)');
    return { source: 'meta', data: null, error: 'Meta Ads connector not yet implemented.' };
  },

  async checkStatus() {
    return { status: 'down', lastSync: 'not configured' };
  },
};
