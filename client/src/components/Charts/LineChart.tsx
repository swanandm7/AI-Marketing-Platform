/**
 * Line chart using Recharts.
 * Supports an optional annotation (vertical dashed line with label)
 * for marking events like algorithm updates.
 */
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
import type { LineChartSpec } from '@/types';

interface LineChartProps {
  spec: LineChartSpec;
}

interface TooltipPayloadItem {
  value: number;
  payload: { label: string };
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

export function LineChart({ spec }: LineChartProps) {
  const color = SOURCES[spec.source]?.color ?? '#4F8EF7';

  const annotationLabel =
    spec.annotation != null
      ? spec.data[spec.annotation.index]?.label
      : undefined;

  return (
    <div className="border border-[var(--hairline)] rounded-md bg-[var(--surface)] p-4 pb-3">
      <ResponsiveContainer width="100%" height={220}>
        <ReLineChart
          data={spec.data}
          margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        >
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
            content={<CustomTooltip />}
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
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-[var(--ash)] mt-3 pt-2.5 border-t border-[var(--hairline)]">
        {spec.caption}
      </div>
    </div>
  );
}
