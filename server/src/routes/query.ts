import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { logger } from '../utils/logger';
import type { IQueryService } from '../interfaces';

const queryBodySchema = z.object({
  question: z.string().min(1).max(2000),
  history: z.array(z.string()).optional().default([]),
});

export function createQueryRouter(queryService: IQueryService): Router {
  const router = Router();

  router.post('/', validateBody(queryBodySchema), async (req, res, next) => {
    try {
      const { question, history } = req.body as z.infer<typeof queryBodySchema>;
      const result = await queryService.execute(question, history);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/stream', validateBody(queryBodySchema), async (req, res) => {
    const { question, history } = req.body as z.infer<typeof queryBodySchema>;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const result = await queryService.execute(question, history, {
        onIntent: (sources, querying) => send({ type: 'querying', sources, querying }),
        onToken: (text) => send({ type: 'token', text }),
      });
      send({ type: 'done', chart: result.chart, table: result.table });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err }, 'Stream query error');
      send({ type: 'error', message });
    } finally {
      res.end();
    }
  });

  return router;
}
