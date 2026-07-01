import { GscRepository } from '../GscRepository';

// Mock the entire prisma module
jest.mock('../../../db/prismaClient', () => ({
  prisma: {
    oAuthToken: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    connectorStatus: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

// Import after mock is registered
import { prisma } from '../../../db/prismaClient';

// Cast to access jest mock methods
const mockOAuthFindUnique = prisma.oAuthToken.findUnique as jest.Mock;
const mockOAuthUpsert = prisma.oAuthToken.upsert as jest.Mock;
const mockStatusFindUnique = prisma.connectorStatus.findUnique as jest.Mock;
const mockStatusUpsert = prisma.connectorStatus.upsert as jest.Mock;

describe('GscRepository', () => {
  let repo: GscRepository;

  beforeEach(() => {
    repo = new GscRepository();
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('returns null when no token exists', async () => {
      mockOAuthFindUnique.mockResolvedValue(null);
      const result = await repo.getToken();
      expect(result).toBeNull();
    });

    it('returns stored token fields', async () => {
      const expiresAt = new Date('2026-08-01T00:00:00Z');
      mockOAuthFindUnique.mockResolvedValue({
        accessToken: 'tok_abc',
        expiresAt,
        refreshToken: 'ref_xyz',
      });

      const result = await repo.getToken();
      expect(result).toEqual({ accessToken: 'tok_abc', expiresAt, refreshToken: 'ref_xyz' });
    });

    it('returns null and does not throw on DB error', async () => {
      mockOAuthFindUnique.mockRejectedValue(new Error('DB down'));
      const result = await repo.getToken();
      expect(result).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('upserts token with all fields', async () => {
      mockOAuthUpsert.mockResolvedValue({});
      const expiresAt = new Date('2026-08-01T00:00:00Z');
      await repo.saveToken('tok_new', expiresAt, 'ref_new');

      expect(mockOAuthUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { provider: 'google' },
          create: expect.objectContaining({ accessToken: 'tok_new', refreshToken: 'ref_new' }),
          update: expect.objectContaining({ accessToken: 'tok_new' }),
        }),
      );
    });

    it('does not throw on upsert failure', async () => {
      mockOAuthUpsert.mockRejectedValue(new Error('DB error'));
      await expect(repo.saveToken('tok', new Date())).resolves.not.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('upserts connector status with live state', async () => {
      mockStatusUpsert.mockResolvedValue({});
      const syncAt = new Date();
      await repo.updateStatus('live', syncAt);

      expect(mockStatusUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sourceId: 'gsc' },
          create: expect.objectContaining({ status: 'live', lastSyncAt: syncAt }),
        }),
      );
    });

    it('does not throw on upsert failure', async () => {
      mockStatusUpsert.mockRejectedValue(new Error('DB error'));
      await expect(repo.updateStatus('down')).resolves.not.toThrow();
    });
  });

  describe('getStatus', () => {
    it('returns null when no status row exists', async () => {
      mockStatusFindUnique.mockResolvedValue(null);
      const result = await repo.getStatus();
      expect(result).toBeNull();
    });

    it('returns status and lastSyncAt', async () => {
      const lastSyncAt = new Date('2026-07-01T09:00:00Z');
      mockStatusFindUnique.mockResolvedValue({ status: 'live', lastSyncAt });
      const result = await repo.getStatus();
      expect(result).toEqual({ status: 'live', lastSyncAt });
    });
  });
});
