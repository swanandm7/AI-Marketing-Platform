import { logger } from '../utils/logger';
import { AppError } from '../errors/AppError';
import type { IIntentRouter, ISynthesiser, IQueryService, QueryCallbacks } from '../interfaces';
import type { Connector } from '../connectors/types';
import type { QueryApiResponse, SourceId } from '../types';

const SOURCE_LABELS: Record<SourceId, string> = {
  gsc: 'Search Console',
  ga4: 'Analytics 4',
  ads: 'Google Ads',
  meta: 'Meta Ads',
  linkedin: 'LinkedIn',
  clarity: 'Clarity',
  crm: 'CRM',
};

export class QueryService implements IQueryService {
  constructor(
    private readonly intentRouter: IIntentRouter,
    private readonly synthesiser: ISynthesiser,
    private readonly connectors: Record<SourceId, Connector>,
  ) {}

  async execute(
    question: string,
    _history: string[],
    callbacks?: QueryCallbacks,
  ): Promise<QueryApiResponse> {
    const intent = await this.intentRouter.route(question);

    logger.info({ sources: intent.sources, timeRange: intent.timeRange }, 'Query dispatching');

    const firstSource = intent.sources[0];
    const querying = firstSource ? (SOURCE_LABELS[firstSource] ?? firstSource) : 'Multiple sources';

    callbacks?.onIntent?.(intent.sources, querying);

    const results = await Promise.all(
      intent.sources.map(async (sourceId) => {
        const connector = this.connectors[sourceId];
        if (!connector) {
          return { source: sourceId, data: null, error: `No connector registered for "${sourceId}"` };
        }
        try {
          return await connector.fetch(intent);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.warn({ source: sourceId, err: message }, 'Connector fetch failed');
          return { source: sourceId, data: null, error: message };
        }
      }),
    );

    const synthesis = await this.synthesiser.synthesise(
      question,
      results,
      intent,
      callbacks?.onToken,
    );

    if (!synthesis.answer) {
      throw new AppError(500, 'Synthesiser returned an empty answer');
    }

    return {
      sources: intent.sources,
      querying,
      answer: synthesis.answer,
      chart: synthesis.chart,
      table: synthesis.table,
    };
  }
}
