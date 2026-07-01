import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  } else {
    logger.warn({ err: err.message, path: req.path, method: req.method }, 'Client error');
  }

  res.status(statusCode).json({
    error:
      isServerError && env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
}
