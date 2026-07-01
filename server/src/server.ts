import { createApp } from './app';
import { createContainer } from './container';
import { env } from './config/env';
import { logger } from './utils/logger';

const container = createContainer();
const app = createApp(container);

app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    'DegreeBaba Hub server started',
  );
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down');
  process.exit(0);
});
