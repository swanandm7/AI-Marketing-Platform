interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
  unit?: string;
}

export function ChartTooltip({ active, payload, unit = '' }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-[var(--void)] border border-[var(--hairline)] rounded-md px-3 py-2 text-[12px]">
      <div className="text-[var(--ash)]">{item.payload.label}</div>
      <div className="text-[var(--text)] font-semibold font-mono-brand mt-0.5">
        {unit}{item.value.toLocaleString('en-IN')}
      </div>
    </div>
  );
}
