import type { TimeRange } from '../../types';

export interface GscQueryParams {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions: GscDimension[];
  rowLimit?: number;
  filters?: GscDimensionFilter[];
}

export type GscDimension = 'query' | 'page' | 'country' | 'device' | 'date';

export interface GscDimensionFilter {
  dimension: GscDimension;
  operator: 'equals' | 'contains' | 'notContains' | 'includingRegex' | 'excludingRegex';
  expression: string;
}

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscSearchAnalyticsResponse {
  rows: GscRow[];
  responseAggregationType?: string;
}

export interface GscFetchParams {
  timeRange: TimeRange;
  dimensions?: GscDimension[];
  filters?: GscDimensionFilter[];
  rowLimit?: number;
}
