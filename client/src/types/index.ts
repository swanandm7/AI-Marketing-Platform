/**
 * Shared TypeScript types for the DegreeBaba Hub.
 * These types are shared between all frontend modules.
 * Server types live in server/src/types/index.ts and are NOT imported here.
 */

// ── Source registry ─────────────────────────────────────────────

export type SourceId =
  | 'gsc'
  | 'ga4'
  | 'ads'
  | 'meta'
  | 'linkedin'
  | 'clarity'
  | 'crm';

export type SourceStatus = 'live' | 'expired' | 'down';

export interface SourceMeta {
  id: SourceId;
  label: string;
  short: string;
  color: string;
  status: SourceStatus;
  sync: string;
}

// ── Chart types ─────────────────────────────────────────────────

export interface BarDatum {
  label: string;
  value: number;
  source: SourceId;
}

export interface BarChartSpec {
  type: 'bar';
  caption: string;
  unit: string;
  data: BarDatum[];
}

export interface LineDatum {
  label: string;
  value: number;
}

export interface LineAnnotation {
  index: number;
  label: string;
}

export interface LineChartSpec {
  type: 'line';
  caption: string;
  unit: string;
  source: SourceId;
  annotation?: LineAnnotation;
  data: LineDatum[];
}

export interface GroupBarSeries {
  source: SourceId;
  label: string;
}

export interface GroupBarDatum {
  label: string;
  values: [number, number];
}

export interface GroupBarChartSpec {
  type: 'groupbar';
  caption: string;
  unit: string;
  series: [GroupBarSeries, GroupBarSeries];
  data: GroupBarDatum[];
}

export type ChartSpec = BarChartSpec | LineChartSpec | GroupBarChartSpec;

// ── Data table ──────────────────────────────────────────────────

export type ColumnAlign = 'left' | 'right';
export type CellTone = 'up' | 'down';

export interface TableColumn {
  key: string;
  label: string;
  align: ColumnAlign;
  mono?: boolean;
}

export interface TableRow {
  [key: string]: string | Record<string, CellTone> | undefined;
}

export interface DataTableSpec {
  caption: string;
  source: SourceId;
  columns: TableColumn[];
  rows: TableRow[];
}

// ── Chat / conversation ──────────────────────────────────────────

export type BlockPhase = 'querying' | 'streaming' | 'done' | 'error';

export interface ConversationBlock {
  id: number;
  query: string;
  sources: SourceId[];
  querying: string;
  time: string;
  text: string;
  chart: ChartSpec | null;
  table: DataTableSpec | null;
  phase: BlockPhase;
  shown: string;
  error?: string;
}

// ── API request / response ───────────────────────────────────────

export interface QueryRequest {
  question: string;
  history?: string[];
}

export interface QueryResponse {
  sources: SourceId[];
  querying: string;
  answer: string;
  chart: ChartSpec | null;
  table: DataTableSpec | null;
}

export interface StatusResponse {
  [sourceId: string]: {
    status: SourceStatus;
    lastSync: string;
  };
}
