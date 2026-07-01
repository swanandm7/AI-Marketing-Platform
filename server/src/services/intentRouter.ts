import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import type { IIntentRouter } from '../interfaces';
import type { Intent, SourceId } from '../types';

const VALID_SOURCES: SourceId[] = ['gsc', 'ga4', 'ads', 'meta', 'linkedin', 'clarity', 'crm'];

const SYSTEM_PROMPT = readFileSync(
  join(__dirname, '../prompts/intentRouter.txt'),
  'utf-8',
).trim();

export class IntentRouterService implements IIntentRouter {
  private readonly client: Anthropic | null;

  constructor(apiKey?: string) {
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async route(question: string): Promise<Intent> {
    if (!this.client) {
      throw new AppError(503, 'Anthropic API key not configured. Set ANTHROPIC_API_KEY in server/.env');
    }

    logger.info({ question }, 'Routing intent');

    const stream = this.client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: question }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new AppError(500, 'Intent router returned non-text response');
    }

    let intent: Intent;
    try {
      intent = JSON.parse(textBlock.text) as Intent;
    } catch {
      throw new AppError(500, `Intent router returned invalid JSON: ${textBlock.text.slice(0, 120)}`);
    }

    intent.sources = (intent.sources ?? []).filter((s) =>
      VALID_SOURCES.includes(s as SourceId),
    ) as SourceId[];

    if (intent.sources.length === 0) intent.sources = ['gsc'];

    logger.info(
      {
        intent,
        cacheRead: response.usage.cache_read_input_tokens,
        cacheCreate: response.usage.cache_creation_input_tokens,
      },
      'Intent resolved',
    );
    return intent;
  }
}
