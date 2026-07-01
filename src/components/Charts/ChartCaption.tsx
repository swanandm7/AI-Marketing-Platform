import { cn } from '@/lib/utils';

interface ChartCaptionProps {
  text: string;
  className?: string;
}

export function ChartCaption({ text, className }: ChartCaptionProps) {
  return (
    <div
      className={cn(
        'text-[10.5px] uppercase tracking-[0.08em] text-[var(--ash)]',
        'mt-3 pt-2.5 border-t border-[var(--hairline)]',
        className,
      )}
    >
      {text}
    </div>
  );
}
