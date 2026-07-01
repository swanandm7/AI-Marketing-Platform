import { Diamond } from 'lucide-react';

export function BrandHeader() {
  return (
    <div className="px-1.5 pb-4">
      <div className="flex items-center gap-2.5">
        <Diamond size={18} className="text-[var(--blue)] fill-[var(--blue)]" />
        <div>
          <div className="font-semibold text-[14px] text-white tracking-tight">
            DegreeBaba Hub
          </div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--ash)] mt-0.5">
            Marketing Intelligence
          </div>
        </div>
      </div>
    </div>
  );
}
