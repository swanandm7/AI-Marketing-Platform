import { env } from '@/lib/env';
import type { ChartSpec, DataTableSpec, SourceId } from '@/types';

export type StreamEvent =
  | { type: 'querying'; sources: SourceId[]; querying: string }
  | { type: 'token'; text: string }
  | { type: 'done'; chart: ChartSpec | null; table: DataTableSpec | null }
  | { type: 'error'; message: string };

export async function* streamQuery(
  question: string,
  history: string[] = [],
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${env.VITE_API_BASE_URL}/api/query/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-api-key': env.VITE_HUB_API_KEY,
    },
    body: JSON.stringify({ question, history }),
  });

  if (!response.ok || !response.body) {
    let message = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw { message, status: response.status };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6)) as StreamEvent;
        } catch {
          // skip malformed event
        }
      }
    }
  }
}
