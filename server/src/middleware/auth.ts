/**
 * Auth middleware — verifies the x-hub-api-key header on all /api/* routes.
 * This is a simple shared-secret gate suitable for a single-user internal tool.
 * Replace with a proper auth system if the tool ever becomes multi-user.
 */
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const key = req.headers['x-hub-api-key'];

  if (!key || key !== env.HUB_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
