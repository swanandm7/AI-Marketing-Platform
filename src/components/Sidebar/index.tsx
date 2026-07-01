import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSourceStatus } from '@/hooks/useSourceStatus';
import { BrandHeader } from './BrandHeader';
import { SourceStatusList } from './SourceStatusList';
import { HistoryList } from './HistoryList';
import { SidebarFooter } from './SidebarFooter';

interface SidebarProps {
  history: string[];
  onRun: (query: string) => void;
  onNew: () => void;
}

export function Sidebar({ history, onRun, onNew }: SidebarProps) {
  const { data: statusData } = useSourceStatus();

  return (
    <aside
      className={cn(
        'w-[248px] flex-none flex flex-col bg-[var(--slate)]',
        'border-r border-[var(--hairline)]',
        'px-3.5 pt-[18px] pb-3 overflow-hidden',
      )}
    >
      <BrandHeader />

      <Button
        variant="outline"
        onClick={onNew}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 mb-[18px] h-auto',
          'bg-[var(--surface)] border-[var(--hairline)] rounded-md',
          'text-[var(--text)] text-[12.5px] font-medium justify-start',
          'hover:bg-[var(--surface-2)] hover:border-[#34394a] hover:text-[var(--text)]',
        )}
      >
        <span className="text-[var(--blue)] text-sm leading-none">＋</span>
        <span>New session</span>
      </Button>

      <SourceStatusList statusData={statusData} />

      <HistoryList history={history} onRun={onRun} />

      <SidebarFooter />
    </aside>
  );
}
