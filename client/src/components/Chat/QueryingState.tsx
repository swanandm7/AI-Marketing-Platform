import { Spinner } from '@/components/Common/Spinner';

interface QueryingStateProps {
  sourceName: string;
}

export function QueryingState({ sourceName }: QueryingStateProps) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <Spinner />
      <span className="text-[13px] text-[var(--ash)]">
        Querying{' '}
        <span className="text-[var(--text)] font-medium">{sourceName}</span>
        <span>
          <span className="animate-[blink_1.2s_infinite_both]">.</span>
          <span className="animate-[blink_1.2s_0.2s_infinite_both]">.</span>
          <span className="animate-[blink_1.2s_0.4s_infinite_both]">.</span>
        </span>
      </span>
    </div>
  );
}
