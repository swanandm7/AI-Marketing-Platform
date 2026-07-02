import axios from 'axios';
import type { Intent, ConnectorResult } from '../types';
import type { Connector } from './types';
import { logger } from '../utils/logger';
import { resolveDateRange } from '../utils/dates';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

const BASE = 'https://graph.facebook.com/v19.0';

function checkConfig() {
  if (!env.META_ACCESS_TOKEN || !env.META_AD_ACCOUNT_ID) {
    throw new AppError(503, 'Meta is not configured. Missing META_ACCESS_TOKEN or META_AD_ACCOUNT_ID.');
  }
}

export const metaConnector: Connector = {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      checkConfig();
      const { startDate, endDate } = resolveDateRange(intent.timeRange);

      const res = await axios.get(`${BASE}/${env.META_AD_ACCOUNT_ID}/campaigns`, {
        params: {
          fields: 'name,insights{impressions,clicks,spend,cpl,reach,actions}',
          time_range: JSON.stringify({ since: startDate, until: endDate }),
          access_token: env.META_ACCESS_TOKEN
        }
      });

      return { source: 'meta', data: res.data.data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Meta error';
      logger.error({ err }, 'Meta fetch failed');
      return { source: 'meta', data: null, error: message };
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
