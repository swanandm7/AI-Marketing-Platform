import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SOURCES } from '@/constants/sources';
import type { SourceStatus } from '@/types';

const STATUS_SHADOW: Record<SourceStatus, string> = {
  live: 'shadow-[0_0_6px_rgba(52,201,138,0.6)]',
  expired: '',
  down: '',
};

const DOT_COLOR: Record<SourceStatus, string> = {
  live: 'bg-[var(--mint)]',
  expired: 'bg-[var(--amber)]',
  down: 'bg-[var(--rose)]',
};

interface SourceStatusItemProps {
  id: string;
  overrideStatus?: SourceStatus;
  overrideSync?: string;
}

export function SourceStatusItem({ id, overrideStatus, overrideSync }: SourceStatusItemProps) {
  const source = SOURCES[id];
  if (!source) return null;

  const status = overrideStatus ?? source.status;
  const sync = overrideSync ?? source.sync;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded cursor-default',
            'transition-colors hover:bg-[var(--surface)]',
          )}
        >
          <span
            className={cn(
              'inline-block w-[7px] h-[7px] rounded-full flex-none',
              DOT_COLOR[status],
              STATUS_SHADOW[status],
            )}
          />
          <span
            className={cn(
              'flex-1 text-[12.5px] truncate',
              status === 'down' ? 'text-[var(--ash)]' : 'text-[var(--text)]',
            )}
          >
            {source.label}
          </span>
          <span className="text-[10px] text-[var(--ash-dim)] whitespace-nowrap font-mono-brand">
            {sync}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--text)] text-[12px]"
      >
        <span className="capitalize">{status}</span> · {sync}
      </TooltipContent>
    </Tooltip>
  );
}
