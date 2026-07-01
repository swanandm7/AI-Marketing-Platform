import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SOURCES } from '@/constants/sources';
import { ChartCaption } from './ChartCaption';
import type { GroupBarChartSpec } from '@/types';

interface GroupBarChartProps {
  spec: GroupBarChartSpec;
}

export function GroupBarChart({ spec }: GroupBarChartProps) {
  const data = spec.data.map((d) => ({
    label: d.label,
    [spec.series[0].source]: d.values[0],
    [spec.series[1].source]: d.values[1],
  }));

  const colors = spec.series.map((s) => SOURCES[s.source]?.color ?? '#4F8EF7');

  return (
    <div className="border border-[var(--hairline)] rounded-md bg-[var(--surface)] p-4 pb-3">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid vertical={false} stroke="var(--hairline)" strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--ash)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--ash)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--void)',
              border: '1px solid var(--hairline)',
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--ash)', marginBottom: 4 }}
            itemStyle={{ color: 'var(--text)' }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--ash)', paddingTop: 8 }}
            formatter={(value) => {
              const s = spec.series.find((s) => s.source === value);
              return s?.label ?? value;
            }}
          />
          {spec.series.map((s, i) => (
            <Bar
              key={s.source}
              dataKey={s.source}
              name={s.source}
              fill={colors[i]}
              fillOpacity={0.75}
              radius={[3, 3, 0, 0]}
              barSize={26}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ChartCaption text={spec.caption} />
    </div>
  );
}
