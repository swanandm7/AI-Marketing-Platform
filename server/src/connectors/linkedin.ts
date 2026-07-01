/**
 * LinkedIn Campaign Manager connector stub.
 * Phase 4: implement with axios against the LinkedIn Marketing API v2.
 */
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';

export const linkedinConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    const { startDate, endDate } = resolveDateRange(intent.timeRange);
    logger.info({ source: 'linkedin', startDate, endDate }, 'LinkedIn fetch (stub)');
    return { source: 'linkedin', data: null, error: 'LinkedIn connector not yet implemented.' };
  },

  async checkStatus() {
    return { status: 'down', lastSync: 'not configured' };
  },
};
