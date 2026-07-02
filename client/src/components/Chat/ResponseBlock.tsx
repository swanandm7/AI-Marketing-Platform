
import { MessageMeta } from './MessageMeta';
import { QueryingState } from './QueryingState';
import { RichText } from './RichText';
import { ChartRenderer } from '@/components/Charts';
import type { ConversationBlock } from '@/types';

interface ResponseBlockProps {
  block: ConversationBlock;
}

export function ResponseBlock({ block }: ResponseBlockProps) {
  return (
    <div className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-[22px] font-medium text-[var(--text)] leading-tight tracking-tight">
          {block.query}
        </h2>
      </div>

      <div className="bg-[var(--surface)]/50 rounded-xl p-5 border border-[var(--hairline)]">
        {block.phase === 'querying' && (
          <QueryingState sourceName={block.querying} />
        )}

        {block.phase === 'error' && (
          <div className="text-[var(--rose)] text-[13px] bg-[var(--rose)]/10 px-4 py-3 rounded-lg border border-[var(--rose)]/20">
            {block.error || block.shown || 'Something went wrong.'}
          </div>
        )}

        {(block.phase === 'streaming' || block.phase === 'done') && (
          <div className="flex flex-col gap-5">
            {block.sources.length > 0 && (
              <MessageMeta sources={block.sources} time={block.time} />
            )}
            
            {block.shown && (
              <div className="text-[14px] leading-relaxed text-[var(--text)]/90">
                <RichText text={block.shown} />
                {block.phase === 'streaming' && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[var(--blue)] animate-pulse" />
                )}
              </div>
            )}

            {(block.chart || block.table) && block.phase === 'done' && (
              <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 fill-mode-both">
                <ChartRenderer chart={block.chart} table={block.table} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
