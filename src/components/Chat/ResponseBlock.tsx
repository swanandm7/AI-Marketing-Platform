import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/Common/Skeleton';
import { QueryingState } from './QueryingState';
import { MessageMeta } from './MessageMeta';
import { RichText } from './RichText';
import { ChartRenderer } from '@/components/Charts';
import type { ConversationBlock } from '@/types';

interface ResponseBlockProps {
  block: ConversationBlock;
}

export function ResponseBlock({ block }: ResponseBlockProps) {
  const isQuerying = block.phase === 'querying';
  const isStreaming = block.phase === 'streaming';
  const isDone = block.phase === 'done';
  const isError = block.phase === 'error';

  return (
    <article
      className={cn(
        'py-6 border-b border-[var(--hairline)] last:border-b-0',
        'animate-[blockIn_0.35s_ease_both]',
      )}
    >
      {/* Question */}
      <div className="mb-4">
        <h2 className="text-[15.5px] font-semibold tracking-tight text-white leading-snug">
          {block.query}
        </h2>
      </div>

      {/* Source pills + timestamp */}
      <MessageMeta sources={block.sources} time={block.time} />

      {/* Querying state */}
      {isQuerying && <QueryingState sourceName={block.querying} />}

      {/* Answer */}
      {(isStreaming || isDone || isError) && (
        <div className="text-[14.5px] leading-relaxed text-[var(--text)]">
          {isError ? (
            <span className="text-[var(--rose)]">
              {block.error ?? 'An error occurred. Please try again.'}
            </span>
          ) : block.shown ? (
            <>
              <RichText text={block.shown} />
              {isStreaming && (
                <span className="inline-block w-[7px] h-[15px] bg-[var(--blue)] ml-px align-text-bottom animate-[blink_1s_step-end_infinite]" />
              )}
            </>
          ) : (
            <Skeleton />
          )}
        </div>
      )}

      {/* Chart or table */}
      {isDone && (block.chart || block.table) && (
        <div className="mt-5 animate-[blockIn_0.4s_ease]">
          <ChartRenderer chart={block.chart} table={block.table} />
        </div>
      )}
    </article>
  );
}
