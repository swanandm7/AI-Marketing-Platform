/**
 * Google Analytics 4 connector stub.
 * Phase 2: implement with @google-analytics/data npm package.
 */
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';

export const ga4Connector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    const { startDate, endDate } = resolveDateRange(intent.timeRange);
    logger.info({ source: 'ga4', startDate, endDate }, 'GA4 fetch (stub)');
    return { source: 'ga4', data: null, error: 'GA4 connector not yet implemented.' };
  },

  async checkStatus() {
    return { status: 'down', lastSync: 'not configured' };
  },
};
