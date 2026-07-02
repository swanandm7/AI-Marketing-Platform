import { Search, TrendingUp, Users, Target, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  onPick: (question: string) => void;
}

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    text: 'Why did organic traffic drop on the NMIMS page?',
    color: 'text-[var(--mint)]'
  },
  {
    icon: MousePointerClick,
    text: 'Where are users rage-clicking this week?',
    color: 'text-[var(--blue)]'
  },
  {
    icon: Target,
    text: 'Which campaign had the lowest CPL last week?',
    color: 'text-[var(--amber)]'
  },
  {
    icon: Users,
    text: 'How many leads came from Meta vs Google Ads?',
    color: 'text-[var(--rose)]'
  },
  {
    icon: Search,
    text: 'What are my top 5 organic queries this month?',
    color: 'text-[var(--blue)]'
  }
];

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--mint)] p-[1px] mb-8 shadow-[0_0_40px_rgba(79,142,247,0.15)]">
        <div className="w-full h-full bg-[var(--void)] rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-[var(--text)]" />
        </div>
      </div>
      
      <h1 className="text-3xl font-semibold text-[var(--text)] mb-3 tracking-tight">
        Good morning.
      </h1>
      <p className="text-[var(--ash)] text-[15px] mb-12 max-w-[400px] text-center leading-relaxed">
        I'm connected to your marketing stack. Ask me anything about your campaigns, traffic, or leads.
      </p>

      <div className="w-full max-w-[600px] grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUGGESTIONS.map((suggestion, i) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={i}
              onClick={() => onPick(suggestion.text)}
              className={cn(
                "flex items-start gap-3 p-4 text-left rounded-xl border border-[var(--hairline)] transition-all",
                "bg-[var(--surface)]/30 hover:bg-[var(--surface)] hover:border-[var(--ash)]/30 hover:shadow-lg group",
                i === SUGGESTIONS.length - 1 ? "md:col-span-2 md:w-1/2 md:justify-self-center" : ""
              )}
            >
              <div className={cn("mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity", suggestion.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[13px] leading-snug text-[var(--text)]/80 group-hover:text-[var(--text)] transition-colors">
                {suggestion.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
