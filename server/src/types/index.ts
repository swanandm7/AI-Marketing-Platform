/**
 * Shared types for the server layer.
 * The frontend has its own parallel types in src/types/index.ts.
 * These are server-internal — they are NOT exported to the client.
 */

export type SourceId =
  | 'gsc'
  | 'ga4'
  | 'ads'
  | 'meta'
  | 'linkedin'
  | 'clarity'
  | 'crm';

export type TimeRange =
  | 'last_7_days'
  | 'last_28_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month';

// ── Intent router output ─────────────────────────────────────────

export interface Intent {
  sources: SourceId[];
  timeRange: TimeRange;
  metrics: string[];
  filters: Record<string, string>;
}

// ── Connector output ─────────────────────────────────────────────

export interface ConnectorResult {
  source: SourceId;
  data: unknown;
  error?: string;
}

// ── Synthesiser output ───────────────────────────────────────────

export interface ChartDatum {
  label: string;
  value: number;
  source?: string;
}

export interface ChartSpec {
  type: 'bar' | 'line' | 'groupbar';
  caption: string;
  unit: string;
  data?: unknown;
  source?: string;
  series?: unknown;
  annotation?: { index: number; label: string };
}

export interface TableColumn {
  key: string;
  label: string;
  align: 'left' | 'right';
  mono?: boolean;
}

export interface TableRow {
  [key: string]: string | Record<string, string> | undefined;
}

export interface DataTableSpec {
  caption: string;
  source: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export interface SynthesisResult {
  answer: string;
  chart: ChartSpec | null;
  table: DataTableSpec | null;
}

// ── API response ─────────────────────────────────────────────────

export interface QueryApiResponse {
  sources: SourceId[];
  querying: string;
  answer: string;
  chart: ChartSpec | null;
  table: DataTableSpec | null;
}

// ── Source status ────────────────────────────────────────────────

export type SourceStatus = 'live' | 'expired' | 'down';

export interface SourceStatusEntry {
  status: SourceStatus;
  lastSync: string;
}

export interface StatusApiResponse {
  [sourceId: string]: SourceStatusEntry;
}
