import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

export interface StoredToken {
  accessToken: string;
  expiresAt: Date;
  refreshToken: string | null;
}

export class GscRepository {
  private readonly PROVIDER = 'google';
  private readonly SOURCE_ID = 'gsc';

  async getToken(): Promise<StoredToken | null> {
    try {
      const row = await prisma.oAuthToken.findUnique({
        where: { provider: this.PROVIDER },
      });
      if (!row) return null;
      return {
        accessToken: row.accessToken,
        expiresAt: row.expiresAt,
        refreshToken: row.refreshToken,
      };
    } catch (err) {
      logger.warn({ err }, 'GscRepository.getToken failed — DB may not be configured');
      return null;
    }
  }

  async saveToken(accessToken: string, expiresAt: Date, refreshToken?: string): Promise<void> {
    try {
      await prisma.oAuthToken.upsert({
        where: { provider: this.PROVIDER },
        create: {
          provider: this.PROVIDER,
          accessToken,
          expiresAt,
          refreshToken: refreshToken ?? null,
        },
        update: {
          accessToken,
          expiresAt,
          ...(refreshToken ? { refreshToken } : {}),
        },
      });
    } catch (err) {
      logger.warn({ err }, 'GscRepository.saveToken failed — token not persisted');
    }
  }

  async updateStatus(
    status: 'live' | 'expired' | 'down',
    lastSyncAt?: Date,
    error?: string,
  ): Promise<void> {
    try {
      await prisma.connectorStatus.upsert({
        where: { sourceId: this.SOURCE_ID },
        create: {
          sourceId: this.SOURCE_ID,
          status,
          lastSyncAt: lastSyncAt ?? null,
          error: error ?? null,
        },
        update: {
          status,
          lastSyncAt: lastSyncAt ?? undefined,
          error: error ?? null,
        },
      });
    } catch (err) {
      logger.warn({ err }, 'GscRepository.updateStatus failed');
    }
  }

  async getStatus(): Promise<{ status: string; lastSyncAt: Date | null } | null> {
    try {
      const row = await prisma.connectorStatus.findUnique({
        where: { sourceId: this.SOURCE_ID },
      });
      if (!row) return null;
      return { status: row.status, lastSyncAt: row.lastSyncAt };
    } catch {
      return null;
    }
  }
}
