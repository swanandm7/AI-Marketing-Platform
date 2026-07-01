import { SourcePill } from '@/components/Common/SourcePill';
import type { SourceId } from '@/types';

interface MessageMetaProps {
  sources: SourceId[];
  time: string;
}

export function MessageMeta({ sources, time }: MessageMetaProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex gap-1.5 flex-wrap">
        {sources.map((s) => (
          <SourcePill key={s} id={s} />
        ))}
      </div>
      <time className="text-[11px] text-[var(--ash)] font-mono-brand shrink-0">
        {time}
      </time>
    </div>
  );
}
