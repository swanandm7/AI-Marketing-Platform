import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  busy: boolean;
  queryingName: string;
}

export function ChatInput({ onSend, busy, queryingName }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !busy) {
        onSend(value.trim());
        setValue('');
      }
    }
  };

  return (
    <div className="w-full max-w-[880px] mx-auto px-9 py-6 shrink-0 relative">
      <div className={cn(
        'relative bg-[var(--surface)] border rounded-xl shadow-sm transition-colors',
        'border-[var(--hairline)] focus-within:border-[var(--ash)] focus-within:ring-1 focus-within:ring-[var(--ash)]/20'
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className={cn(
            'w-full max-h-[200px] bg-transparent resize-none overflow-y-auto px-4 py-3.5',
            'text-[var(--text)] placeholder-[var(--ash-dim)] focus:outline-none text-[14px] leading-relaxed block'
          )}
          rows={1}
          disabled={busy}
        />
        <div className="absolute right-2 bottom-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              if (value.trim() && !busy) {
                onSend(value.trim());
                setValue('');
              }
            }}
            disabled={!value.trim() || busy}
            className={cn(
              "w-8 h-8 rounded-lg transition-all",
              value.trim() && !busy
                ? "bg-[var(--blue)] text-white hover:bg-[var(--blue)]/90"
                : "text-[var(--ash)] bg-transparent hover:bg-transparent"
            )}
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--blue)]" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      {busy && queryingName && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[11px] text-[var(--ash)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--hairline)]">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Querying {queryingName}...</span>
        </div>
      )}
    </div>
  );
}
