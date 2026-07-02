import { TooltipProvider } from '@/components/ui/tooltip';
import { HubPage } from '@/pages/HubPage';
import { Toaster } from '@/components/ui/toaster';

export function AppLayout() {
  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--void)]">
        <HubPage />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
