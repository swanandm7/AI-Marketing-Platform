/**
 * POST /api/webhook/pabbly
 *
 * Receives lead data pushed from Runo CRM via Pabbly Connect.
 * Upserts by runo_lead_id so re-sends are idempotent.
 * Verified by x-pabbly-secret header — reject any call without it.
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prismaClient';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const webhookRouter = Router();

const leadSchema = z.object({
  runo_lead_id: z.string().min(1),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().optional(),
  campaign: z.string().optional(),
  status: z.string().optional().default('new'),
});

webhookRouter.post('/pabbly', async (req: Request, res: Response) => {
  const secret = req.headers['x-pabbly-secret'];

  if (!env.PABBLY_WEBHOOK_SECRET || secret !== env.PABBLY_WEBHOOK_SECRET) {
    logger.warn('Webhook rejected — invalid secret');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, 'Webhook payload invalid');
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    return;
  }

  const { runo_lead_id, name, phone, email, source, campaign, status } = parsed.data;

  await prisma.lead.upsert({
    where: { runoLeadId: runo_lead_id },
    create: {
      runoLeadId: runo_lead_id,
      name: name ?? null,
      phone: phone ?? null,
      email: email || null,
      source: source ?? null,
      campaign: campaign ?? null,
      status: status ?? 'new',
    },
    update: {
      status: status ?? 'new',
      name: name ?? undefined,
      campaign: campaign ?? undefined,
    },
  });

  logger.info({ runoLeadId: runo_lead_id, status }, 'Lead upserted');
  res.json({ ok: true });
});
