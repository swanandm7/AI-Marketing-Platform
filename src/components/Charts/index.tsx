import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { GroupBarChart } from './GroupBarChart';
import { DataTable } from '@/components/Tables/DataTable';
import type { ChartSpec, DataTableSpec } from '@/types';

interface ChartRendererProps {
  chart: ChartSpec | null;
  table: DataTableSpec | null;
}

export function ChartRenderer({ chart, table }: ChartRendererProps) {
  if (table) return <DataTable spec={table} />;
  if (!chart) return null;

  switch (chart.type) {
    case 'bar':
      return <BarChart spec={chart} />;
    case 'line':
      return <LineChart spec={chart} />;
    case 'groupbar':
      return <GroupBarChart spec={chart} />;
    default:
      return null;
  }
}
