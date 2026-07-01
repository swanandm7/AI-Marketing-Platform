import { AppError } from '../../errors/AppError';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import type { Intent, ConnectorResult } from '../../types';
import type { Connector } from '../types';
import { GscService } from './GscService';
import { GscRepository } from './GscRepository';

function createService(): GscService {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN || !env.GSC_SITE_URL) {
    throw new AppError(503, 'Google Search Console is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GSC_SITE_URL.');
  }
  return new GscService(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REFRESH_TOKEN,
    env.GSC_SITE_URL,
    new GscRepository(),
  );
}

export class GscConnector implements Connector {
  async fetch(intent: Intent): Promise<ConnectorResult> {
    try {
      const service = createService();
      const result = await service.fetch({ timeRange: intent.timeRange });

      const repository = new GscRepository();
      await repository.updateStatus('live', new Date());

      logger.info({ rows: result.rows.length, source: 'gsc' }, 'GSC fetch complete');

      return { source: 'gsc', data: result };
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'GSC fetch failed';

      logger.error({ err, source: 'gsc' }, 'GSC fetch error');

      try {
        const repository = new GscRepository();
        await repository.updateStatus('down', undefined, message);
      } catch {
        // ignore secondary failure
      }

      return { source: 'gsc', data: null, error: message };
    }
  }

  async checkStatus(): Promise<{ status: 'live' | 'expired' | 'down'; lastSync: string }> {
    try {
      const service = createService();
      return service.checkStatus();
    } catch {
      return { status: 'down', lastSync: 'not configured' };
    }
  }
}
