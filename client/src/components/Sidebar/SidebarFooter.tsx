import { SOURCES, SOURCE_ORDER } from '@/constants/sources';
import type { StatusResponse } from '@/types';

interface SidebarFooterProps {
  statusData: StatusResponse | null;
}

export function SidebarFooter({ statusData }: SidebarFooterProps) {
  const liveCount = SOURCE_ORDER.filter(
    (id) => (statusData?.[id]?.status ?? SOURCES[id].status) === 'live'
  ).length;

  return (
    <div className="flex items-center gap-1.5 px-2 py-2.5 mt-1.5 border-t border-[var(--hairline)] text-[11px] text-[var(--ash)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)] shadow-[0_0_6px_rgba(52,201,138,0.5)]" />
      {liveCount} of {SOURCE_ORDER.length} sources live
    </div>
  );
}
