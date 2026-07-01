import { LIVE_COUNT, SOURCE_ORDER } from '@/constants/sources';

export function SidebarFooter() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-2.5 mt-1.5 border-t border-[var(--hairline)] text-[11px] text-[var(--ash)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)] shadow-[0_0_6px_rgba(52,201,138,0.5)]" />
      {LIVE_COUNT} of {SOURCE_ORDER.length} sources live
    </div>
  );
}
