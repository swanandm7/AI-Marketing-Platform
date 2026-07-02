import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryListProps {
  history: string[];
  onRun: (query: string) => void;
}

export function HistoryList({ history, onRun }: HistoryListProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-[var(--ash)] px-1.5 mb-2">
        Query History
      </div>
      <ScrollArea className="flex-1">
        {history.length === 0 ? (
          <div className="text-[12px] text-[var(--ash-dim)] px-2 py-1">
            No queries yet
          </div>
        ) : (
          <div className="flex flex-col gap-px pr-1">
            {history.map((h, i) => (
              <button
                key={i}
                title={h}
                onClick={() => onRun(h)}
                className={cn(
                  'flex items-center gap-1.5 text-left w-full',
                  'px-2 py-1.5 rounded border-l-2 border-transparent',
                  'text-[var(--ash)] text-[12.5px]',
                  'transition-all hover:text-[var(--text)] hover:bg-[var(--surface)] hover:border-l-[var(--blue)]',
                  'cursor-pointer bg-transparent',
                )}
              >
                <span className="text-[var(--ash-dim)] flex-none">›</span>
                <span className="truncate">{h}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
