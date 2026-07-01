import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { AppError } from '../../errors/AppError';
import { logger } from '../../utils/logger';
import { resolveDateRange } from '../../utils/dates';
import type { GscRepository } from './GscRepository';
import type { GscQueryParams, GscSearchAnalyticsResponse, GscFetchParams, GscRow } from './types';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(status: number): boolean {
  return status === 429 || status === 500 || status === 503;
}

export class GscService {
  private readonly auth: OAuth2Client;

  constructor(
    clientId: string,
    clientSecret: string,
    private readonly refreshToken: string,
    private readonly siteUrl: string,
    private readonly repository: GscRepository,
  ) {
    this.auth = new google.auth.OAuth2(clientId, clientSecret);
    this.auth.setCredentials({ refresh_token: refreshToken });
  }

  private async refreshIfNeeded(): Promise<void> {
    const stored = await this.repository.getToken();
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 min buffer

    if (stored && stored.expiresAt.getTime() - now.getTime() > bufferMs) {
      this.auth.setCredentials({
        access_token: stored.accessToken,
        refresh_token: stored.refreshToken ?? this.refreshToken,
        expiry_date: stored.expiresAt.getTime(),
      });
      return;
    }

    logger.info('GSC: refreshing access token');
    const { credentials } = await this.auth.refreshAccessToken();
    const expiresAt = new Date(credentials.expiry_date ?? Date.now() + 3600 * 1000);
    await this.repository.saveToken(
      credentials.access_token!,
      expiresAt,
      credentials.refresh_token ?? undefined,
    );
    this.auth.setCredentials(credentials);
  }

  async query(params: GscQueryParams): Promise<GscSearchAnalyticsResponse> {
    await this.refreshIfNeeded();
    const sc = google.searchconsole({ version: 'v1', auth: this.auth });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.info({ attempt, delay }, 'GSC: retrying after error');
        await sleep(delay);
      }

      try {
        const response = await sc.searchanalytics.query({
          siteUrl: params.siteUrl,
          requestBody: {
            startDate: params.startDate,
            endDate: params.endDate,
            dimensions: params.dimensions,
            rowLimit: params.rowLimit ?? 25,
            ...(params.filters?.length
              ? {
                  dimensionFilterGroups: [
                    {
                      filters: params.filters.map((f) => ({
                        dimension: f.dimension,
                        operator: f.operator,
                        expression: f.expression,
                      })),
                    },
                  ],
                }
              : {}),
          },
        });

        const rows: GscRow[] = (response.data.rows ?? []).map((r) => ({
          keys: r.keys ?? [],
          clicks: r.clicks ?? 0,
          impressions: r.impressions ?? 0,
          ctr: r.ctr ?? 0,
          position: r.position ?? 0,
        }));

        return {
          rows,
          responseAggregationType: response.data.responseAggregationType ?? undefined,
        };
      } catch (err: unknown) {
        const gErr = err as { code?: number; message?: string };
        lastError = new Error(gErr.message ?? 'GSC API error');

        if (gErr.code && !isRetryable(gErr.code)) {
          break;
        }
        logger.warn({ code: gErr.code, attempt }, 'GSC API error — will retry');
      }
    }

    throw new AppError(502, `GSC query failed: ${lastError?.message ?? 'unknown error'}`);
  }

  async fetch(params: GscFetchParams): Promise<GscSearchAnalyticsResponse> {
    const { startDate, endDate } = resolveDateRange(params.timeRange);
    return this.query({
      siteUrl: this.siteUrl,
      startDate,
      endDate,
      dimensions: params.dimensions ?? ['query'],
      rowLimit: params.rowLimit,
      filters: params.filters,
    });
  }

  async checkStatus(): Promise<{ status: 'live' | 'expired' | 'down'; lastSync: string }> {
    const stored = await this.repository.getStatus();
    const storedStatus = stored?.status;
    const lastSync = stored?.lastSyncAt?.toISOString() ?? 'never';

    try {
      await this.refreshIfNeeded();
      return { status: 'live', lastSync };
    } catch {
      if (storedStatus === 'expired') {
        return { status: 'expired', lastSync };
      }
      return { status: 'down', lastSync };
    }
  }
}
