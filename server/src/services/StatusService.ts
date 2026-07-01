import { logger } from '../utils/logger';
import type { IStatusService } from '../interfaces';
import type { Connector } from '../connectors/types';
import type { StatusApiResponse, SourceId } from '../types';

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  data: StatusApiResponse;
  at: number;
}

export class StatusService implements IStatusService {
  private cache: CacheEntry | null = null;

  constructor(
    private readonly connectors: Record<SourceId, Connector>,
  ) {}

  async getAll(): Promise<StatusApiResponse> {
    if (this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) {
      logger.debug('Status served from cache');
      return this.cache.data;
    }

    logger.info('Refreshing source status');

    const entries = await Promise.all(
      (Object.keys(this.connectors) as SourceId[]).map(async (id) => {
        try {
          const status = await this.connectors[id].checkStatus();
          return [id, status] as const;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          logger.warn({ source: id, err: message }, 'checkStatus failed');
          return [id, { status: 'down' as const, lastSync: 'error' }] as const;
        }
      }),
    );

    const data: StatusApiResponse = Object.fromEntries(entries);
    this.cache = { data, at: Date.now() };

    return data;
  }
}
