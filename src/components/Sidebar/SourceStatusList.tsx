import { SOURCES, SOURCE_ORDER } from '@/constants/sources';
import { SourceStatusItem } from './SourceStatusItem';
import type { StatusResponse } from '@/types';

interface SourceStatusListProps {
  statusData: StatusResponse | null;
}

export function SourceStatusList({ statusData }: SourceStatusListProps) {
  return (
    <div className="mb-[18px]">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-[var(--ash)] px-1.5 mb-2">
        Connected Sources
      </div>
      <div className="flex flex-col gap-0.5">
        {SOURCE_ORDER.map((id) => (
          <SourceStatusItem
            key={id}
            id={id}
            overrideStatus={statusData?.[id]?.status ?? SOURCES[id].status}
            overrideSync={statusData?.[id]?.lastSync ?? SOURCES[id].sync}
          />
        ))}
      </div>
    </div>
  );
}
