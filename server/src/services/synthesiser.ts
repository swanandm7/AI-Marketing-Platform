import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import type { ISynthesiser } from '../interfaces';
import type { ConnectorResult, SynthesisResult, Intent, ChartSpec, DataTableSpec } from '../types';

const SYSTEM_PROMPT = readFileSync(
  join(__dirname, '../prompts/synthesiser.txt'),
  'utf-8',
).trim();

const RENDER_VIZ_TOOL: Anthropic.Tool = {
  name: 'render_visualization',
  description:
    'Attach a chart or data table alongside your text analysis. Call exactly once when the data clearly warrants a visual representation.',
  input_schema: {
    type: 'object',
    properties: {
      chart: {
        description:
          'Chart specification (bar, line, or groupbar type). Omit this key if rendering a table instead.',
      },
      table: {
        description:
          'Data table specification. Omit this key if rendering a chart instead.',
      },
    },
    additionalProperties: false,
  },
  cache_control: { type: 'ephemeral' },
};

export class SynthesiserService implements ISynthesiser {
  private readonly client: Anthropic | null;

  constructor(apiKey?: string) {
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async synthesise(
    question: string,
    results: ConnectorResult[],
    intent: Intent,
    onToken?: (text: string) => void,
  ): Promise<SynthesisResult> {
    if (!this.client) {
      throw new AppError(503, 'Anthropic API key not configured. Set ANTHROPIC_API_KEY in server/.env');
    }

    logger.info({ sources: intent.sources }, 'Synthesising answer');

    const userMessage = `Question: ${question}\n\nRaw data:\n${JSON.stringify(results, null, 2)}`;

    const stream = this.client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [RENDER_VIZ_TOOL],
      tool_choice: { type: 'auto' },
      messages: [{ role: 'user', content: userMessage }],
    });

    if (onToken) {
      stream.on('text', (text) => onToken(text));
    }

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === 'text');
    const answer = textBlock?.type === 'text' ? textBlock.text.trim() : '';

    let chart: ChartSpec | null = null;
    let table: DataTableSpec | null = null;

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock =>
        b.type === 'tool_use' && b.name === 'render_visualization',
    );
    if (toolUse) {
      const viz = toolUse.input as { chart?: ChartSpec; table?: DataTableSpec };
      chart = viz.chart ?? null;
      table = viz.table ?? null;
    }

    if (!answer) {
      throw new AppError(500, 'Synthesiser returned an empty answer');
    }

    logger.info(
      {
        hasChart: !!chart,
        hasTable: !!table,
        cacheRead: response.usage.cache_read_input_tokens,
        cacheCreate: response.usage.cache_creation_input_tokens,
      },
      'Synthesis complete',
    );
    return { answer, chart, table };
  }
}
