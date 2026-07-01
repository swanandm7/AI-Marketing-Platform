import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requireApiKey } from './middleware/auth';
import { requestLogger } from './middleware/requestLogger';
import { queryRateLimiter, webhookRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { createQueryRouter } from './routes/query';
import { createStatusRouter } from './routes/status';
import { webhookRouter } from './routes/webhook';
import type { IContainer } from './interfaces';

export function createApp(container: IContainer) {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'x-hub-api-key'],
    }),
  );

  app.use(express.json({ limit: '256kb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
  });

  app.use('/api', requireApiKey);
  app.use('/api/query', queryRateLimiter, createQueryRouter(container.queryService));
  app.use('/api/status', createStatusRouter(container.statusService));

  app.use('/api/webhook', webhookRateLimiter, webhookRouter);

  app.use(errorHandler);

  return app;
}
