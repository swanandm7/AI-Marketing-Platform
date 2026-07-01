import { cn } from '@/lib/utils';
import { SOURCES } from '@/constants/sources';
import type { SourceId } from '@/types';

interface SourcePillProps {
  id: SourceId;
  className?: string;
}

export function SourcePill({ id, className }: SourcePillProps) {
  const source = SOURCES[id];
  if (!source) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded',
        'text-[11px] font-medium tracking-wide border',
        className,
      )}
      style={{
        background: `color-mix(in srgb, ${source.color} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${source.color} 35%, transparent)`,
        color: `color-mix(in srgb, ${source.color} 70%, #fff)`,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-none"
        style={{ background: source.color }}
      />
      {source.short}
    </span>
  );
}
