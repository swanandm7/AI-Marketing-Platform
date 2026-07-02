import axios from 'axios';
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

function checkConfig() {
  if (!env.CLARITY_API_KEY || !env.CLARITY_PROJECT_ID) {
    throw new AppError(503, 'Clarity is not configured. Missing credentials.');
  }
}

export const clarityConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      checkConfig();
      const { startDate, endDate } = resolveDateRange(intent.timeRange);

      const res = await axios.get(
        `https://www.clarity.ms/export/api/v1/${env.CLARITY_PROJECT_ID}/metrics`,
        {
          headers: { Authorization: `Bearer ${env.CLARITY_API_KEY}` },
          params: {
            startDate,
            endDate,
            metrics: 'rageClicks,deadClicks,quickBacks,sessions,pagesPerSession'
          }
        }
      );

      return { source: 'clarity', data: res.data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Clarity error';
      logger.error({ err }, 'Clarity fetch failed');
      return { source: 'clarity', data: null, error: message };
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
