import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block w-[13px] h-[13px] rounded-full flex-none',
        'border-2 border-[var(--hairline)] border-t-[var(--blue)] animate-spin',
        className,
      )}
    />
  );
}
