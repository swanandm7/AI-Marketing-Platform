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
import { ChartCaption } from './ChartCaption';
import { ChartTooltip } from './ChartTooltip';
import type { BarChartSpec } from '@/types';

interface BarChartProps {
  spec: BarChartSpec;
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
          <CartesianGrid horizontal={false} stroke="var(--hairline)" strokeOpacity={0.5} />
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
            content={<ChartTooltip unit={spec.unit} />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.75} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
      <ChartCaption text={spec.caption} />
    </div>
  );
}
