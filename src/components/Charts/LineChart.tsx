import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { SOURCES } from '@/constants/sources';
import { ChartCaption } from './ChartCaption';
import { ChartTooltip } from './ChartTooltip';
import type { LineChartSpec } from '@/types';

interface LineChartProps {
  spec: LineChartSpec;
}

export function LineChart({ spec }: LineChartProps) {
  const color = SOURCES[spec.source]?.color ?? '#4F8EF7';
  const annotationLabel =
    spec.annotation != null ? spec.data[spec.annotation.index]?.label : undefined;

  return (
    <div className="border border-[var(--hairline)] rounded-md bg-[var(--surface)] p-4 pb-3">
      <ResponsiveContainer width="100%" height={220}>
        <ReLineChart data={spec.data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="var(--hairline)" strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--ash)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'var(--ash)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: 'var(--hairline)', strokeWidth: 1 }}
          />
          {annotationLabel && (
            <ReferenceLine
              x={annotationLabel}
              stroke="#F5A623"
              strokeDasharray="3 3"
              strokeOpacity={0.55}
              label={{
                value: spec.annotation!.label,
                fill: '#F5A623',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                position: 'insideTopLeft',
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: 'var(--surface)', strokeWidth: 2 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
      <ChartCaption text={spec.caption} />
    </div>
  );
}
