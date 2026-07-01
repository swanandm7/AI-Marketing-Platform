import { Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXAMPLE_CHIPS } from '@/constants/prompts';

interface EmptyStateProps {
  onPick: (query: string) => void;
}

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center">
      <div className="mb-5">
        <Diamond size={30} className="text-[var(--blue)] opacity-85" strokeWidth={1.5} />
      </div>

      <h1 className="text-[21px] font-semibold tracking-tight text-[var(--text)]">
        Ask anything about your marketing data.
      </h1>

      <p className="text-[12.5px] text-[var(--ash)] mt-2.5 max-w-[440px] leading-relaxed">
        Search Console · Google Ads · GA4 · Meta · LinkedIn · Clarity · CRM
        — queried in plain English.
      </p>

      <div className="flex flex-col gap-2.5 mt-7 w-full max-w-[440px]">
        {EXAMPLE_CHIPS.map((chip) => (
          <Button
            key={chip}
            variant="outline"
            onClick={() => onPick(chip)}
            className="h-auto px-4 py-3 text-left justify-start text-[13px] text-[var(--text)] font-normal bg-[rgba(79,142,247,0.04)] border-[rgba(79,142,247,0.4)] hover:bg-[rgba(79,142,247,0.12)] hover:border-[var(--blue)] hover:text-[var(--text)] rounded transition-colors"
          >
            {chip}
          </Button>
        ))}
      </div>
    </div>
  );
}
