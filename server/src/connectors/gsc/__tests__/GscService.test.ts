// Keep factory self-contained — variables referenced inside jest.mock are hoisted but
// external consts are not, so we store mocks on the returned object and retrieve them after import.
jest.mock('googleapis', () => {
  const mockSetCredentials = jest.fn();
  const mockRefreshAccessToken = jest.fn();
  const mockQuery = jest.fn();

  return {
    __mocks: { mockSetCredentials, mockRefreshAccessToken, mockQuery },
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: mockSetCredentials,
          refreshAccessToken: mockRefreshAccessToken,
        })),
      },
      searchconsole: jest.fn().mockReturnValue({
        searchanalytics: { query: mockQuery },
      }),
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const googlapisMocks = (require('googleapis') as { __mocks: Record<string, jest.Mock> }).__mocks;
const mockSetCredentials = googlapisMocks.mockSetCredentials;
const mockRefreshAccessToken = googlapisMocks.mockRefreshAccessToken;
const mockQuery = googlapisMocks.mockQuery;

import { GscService } from '../GscService';
import type { GscRepository } from '../GscRepository';
import { AppError } from '../../../errors/AppError';

function makeRepo(overrides: Partial<GscRepository> = {}): GscRepository {
  return {
    getToken: jest.fn().mockResolvedValue(null),
    saveToken: jest.fn().mockResolvedValue(undefined),
    updateStatus: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn().mockResolvedValue(null),
    ...overrides,
  } as GscRepository;
}

function makeService(repo?: GscRepository): GscService {
  return new GscService(
    'client_id',
    'client_secret',
    'refresh_token',
    'https://www.example.com/',
    repo ?? makeRepo(),
  );
}

const REFRESH_SUCCESS = {
  credentials: {
    access_token: 'new_access_token',
    expiry_date: Date.now() + 3600 * 1000,
    refresh_token: 'new_refresh_token',
  },
};

describe('GscService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefreshAccessToken.mockResolvedValue(REFRESH_SUCCESS);
  });

  describe('fetch', () => {
    it('returns normalized rows from GSC API', async () => {
      mockQuery.mockResolvedValue({
        data: {
          rows: [
            { keys: ['online mba india'], clicks: 8420, impressions: 138200, ctr: 0.061, position: 2.4 },
            { keys: ['nmims online mba'], clicks: 5190, impressions: 74600, ctr: 0.07, position: 3.2 },
          ],
        },
      });

      const result = await makeService().fetch({ timeRange: 'last_28_days' });

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toMatchObject({ keys: ['online mba india'], clicks: 8420 });
    });

    it('returns empty rows when API response has no rows', async () => {
      mockQuery.mockResolvedValue({ data: {} });
      const result = await makeService().fetch({ timeRange: 'last_7_days' });
      expect(result.rows).toEqual([]);
    });

    it('retries on 429 and succeeds on second attempt', async () => {
      mockQuery
        .mockRejectedValueOnce({ code: 429, message: 'Too Many Requests' })
        .mockResolvedValueOnce({ data: { rows: [{ keys: ['q'], clicks: 1, impressions: 10, ctr: 0.1, position: 5 }] } });

      const result = await makeService().fetch({ timeRange: 'last_7_days' });

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result.rows).toHaveLength(1);
    });

    it('throws AppError after exhausting retries on 503', async () => {
      mockQuery.mockRejectedValue({ code: 503, message: 'Service Unavailable' });

      await expect(makeService().fetch({ timeRange: 'last_7_days' })).rejects.toBeInstanceOf(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('does not retry on 400 error', async () => {
      mockQuery.mockRejectedValue({ code: 400, message: 'Bad Request' });

      await expect(makeService().fetch({ timeRange: 'last_28_days' })).rejects.toBeInstanceOf(AppError);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('uses cached token when not expired and skips refresh', async () => {
      const repo = makeRepo({
        getToken: jest.fn().mockResolvedValue({
          accessToken: 'cached_token',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          refreshToken: 'cached_refresh',
        }),
      });
      mockQuery.mockResolvedValue({ data: { rows: [] } });

      await makeService(repo).fetch({ timeRange: 'last_7_days' });

      expect(mockRefreshAccessToken).not.toHaveBeenCalled();
      expect(mockSetCredentials).toHaveBeenCalledWith(
        expect.objectContaining({ access_token: 'cached_token' }),
      );
    });

    it('refreshes and persists token when stored token is expired', async () => {
      const saveToken = jest.fn().mockResolvedValue(undefined);
      const repo = makeRepo({
        getToken: jest.fn().mockResolvedValue({
          accessToken: 'old_token',
          expiresAt: new Date(Date.now() - 1000),
          refreshToken: 'old_refresh',
        }),
        saveToken,
      });
      mockQuery.mockResolvedValue({ data: { rows: [] } });

      await makeService(repo).fetch({ timeRange: 'last_7_days' });

      expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
      expect(saveToken).toHaveBeenCalledWith('new_access_token', expect.any(Date), 'new_refresh_token');
    });
  });

  describe('checkStatus', () => {
    it('returns live when token refresh succeeds', async () => {
      const result = await makeService().checkStatus();
      expect(result.status).toBe('live');
    });

    it('returns down when token refresh fails', async () => {
      mockRefreshAccessToken.mockRejectedValue(new Error('invalid_grant'));
      const result = await makeService().checkStatus();
      expect(result.status).toBe('down');
    });
  });
});
