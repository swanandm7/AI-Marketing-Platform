/**
 * Microsoft Clarity connector stub.
 * Phase 4: implement with axios against the Clarity Export API v1.
 * Note: Clarity API returns aggregate metrics only, not session recordings.
 */
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';

export const clarityConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    const { startDate, endDate } = resolveDateRange(intent.timeRange);
    logger.info({ source: 'clarity', startDate, endDate }, 'Clarity fetch (stub)');
    return {
      source: 'clarity',
      data: null,
      error: 'Clarity connector not yet implemented. Note: Clarity API returns aggregate metrics only.',
    };
  },

  async checkStatus() {
    return { status: 'down', lastSync: 'not configured' };
  },
};
