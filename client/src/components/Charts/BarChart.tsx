/**
 * Horizontal bar chart using Recharts.
 * Each bar is colored by its source's brand color.
 */
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SOURCES } from '@/constants/sources';
import type { BarChartSpec } from '@/types';

interface BarChartProps {
  spec: BarChartSpec;
}

interface TooltipPayloadItem {
  value: number;
  payload: { label: string; source: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-[var(--void)] border border-[var(--hairline)] rounded-md px-3 py-2 text-[12px]">
      <div className="text-[var(--ash)]">{item.payload.label}</div>
      <div className="text-[var(--text)] font-semibold font-mono-brand mt-0.5">
        {item.value.toLocaleString('en-IN')}
      </div>
    </div>
  );
}

export function BarChart({ spec }: BarChartProps) {
  const data = spec.data.map((d) => ({
    ...d,
    color: SOURCES[d.source]?.color ?? '#4F8EF7',
  }));

  return (
    <div className="border border-[var(--hairline)] rounded-md bg-[var(--surface)] p-4 pb-3">
      <ResponsiveContainer width="100%" height={220}>
        <ReBarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
          barSize={22}
        >
          <CartesianGrid
            horizontal={false}
            stroke="var(--hairline)"
            strokeOpacity={0.5}
          />
          <XAxis
            type="number"
            tickFormatter={(v) => `${spec.unit}${v.toLocaleString('en-IN')}`}
            tick={{ fill: 'var(--ash)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tick={{ fill: 'var(--ash)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.75} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-[var(--ash)] mt-3 pt-2.5 border-t border-[var(--hairline)]">
        {spec.caption}
      </div>
    </div>
  );
}
