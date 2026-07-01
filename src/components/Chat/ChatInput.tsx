import { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (query: string) => void;
  busy: boolean;
  queryingName: string;
}

export function ChatInput({ onSend, busy, queryingName }: ChatInputProps) {
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const q = value.trim();
    if (!q || busy) return;
    onSend(q);
    setValue('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const canSend = value.trim().length > 0 && !busy;

  return (
    <div className="border-t border-[var(--hairline)] bg-[var(--void)] px-9 py-4 pb-5">
      <div
        className={cn(
          'max-w-[880px] mx-auto flex items-end gap-2.5',
          'bg-[var(--surface)] border rounded-xl px-4 pt-2.5 pb-2.5 pr-2.5',
          'transition-colors',
          busy
            ? 'border-[rgba(79,142,247,0.4)]'
            : 'border-[var(--hairline)] focus-within:border-[#34394a]',
        )}
      >
        <Textarea
          ref={taRef}
          rows={1}
          disabled={busy}
          value={busy ? '' : value}
          placeholder={
            busy
              ? `Querying ${queryingName}…`
              : 'Ask anything about your marketing data…'
          }
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex-1 border-none bg-transparent shadow-none outline-none resize-none',
            'text-[14.5px] leading-relaxed py-1 max-h-[160px] min-h-0',
            'placeholder:text-[var(--ash)] focus-visible:ring-0 focus-visible:ring-offset-0',
            busy ? 'text-[var(--ash)] cursor-not-allowed' : 'text-[var(--text)]',
          )}
        />

        {!busy && (
          <span className="text-[10.5px] text-[var(--ash)] px-1.5 py-1 rounded bg-white/[0.03] border border-[var(--hairline)] self-center whitespace-nowrap font-mono-brand">
            ⌘↵
          </span>
        )}

        <Button
          size="icon"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            'flex-none w-[34px] h-[34px] rounded-lg',
            canSend
              ? 'bg-[var(--blue)] hover:bg-[#6BA0F8] text-white'
              : 'bg-[#2A2E37] text-[var(--ash-dim)] cursor-not-allowed',
          )}
        >
          {busy ? (
            <span className="w-[11px] h-[11px] rounded-full bg-white animate-[pulse_1s_ease-in-out_infinite]" />
          ) : (
            <ArrowRight size={16} strokeWidth={2} />
          )}
        </Button>
      </div>
    </div>
  );
}
