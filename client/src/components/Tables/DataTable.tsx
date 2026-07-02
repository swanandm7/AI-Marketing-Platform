import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DataTableSpec, CellTone } from '@/types';

interface DataTableProps {
  spec: DataTableSpec;
}

const TONE_CLS: Record<CellTone, string> = {
  up: 'text-[var(--mint)]',
  down: 'text-[var(--rose)]',
};

const TONE_PREFIX: Record<CellTone, string> = {
  up: '▲ ',
  down: '▼ ',
};

export function DataTable({ spec }: DataTableProps) {
  return (
    <div className="border border-[var(--hairline)] rounded-md bg-[var(--surface)] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--hairline)] hover:bg-transparent">
              {spec.columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'text-[10.5px] uppercase tracking-[0.07em] font-medium',
                    'text-[var(--ash)] h-auto py-2.5 px-3.5',
                    'border-b border-[var(--hairline)]',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.mono ? 'font-mono-brand' : '',
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {spec.rows.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                className="border-[rgba(37,40,48,0.5)] hover:bg-white/[0.015] transition-colors"
                style={{ animation: `rowIn 0.4s ease ${rowIdx * 0.05}s both` }}
              >
                {spec.columns.map((col) => {
                  const tone = (row.tone as Record<string, CellTone> | undefined)?.[col.key];
                  const cellValue = row[col.key];
                  const displayValue = typeof cellValue === 'string' ? cellValue : '';
                  return (
                    <TableCell
                      key={col.key}
                      className={cn(
                        'py-2.5 px-3.5 text-[var(--text)] text-[13px]',
                        col.align === 'right' ? 'text-right' : 'text-left',
                        col.mono ? 'font-mono-brand font-medium' : '',
                        tone ? TONE_CLS[tone] : '',
                      )}
                    >
                      {tone && TONE_PREFIX[tone]}
                      {displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-[var(--ash)] px-3.5 py-2.5 border-t border-[var(--hairline)]">
        {spec.caption}
      </div>
    </div>
  );
}
