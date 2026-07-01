import { Router } from 'express';
import type { IStatusService } from '../interfaces';

export function createStatusRouter(statusService: IStatusService): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const data = await statusService.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
