/**
 * Source registry — single source of truth for all data source metadata.
 * Colors, labels, and short names are referenced by chart components
 * and the sidebar status list. Keep this in sync with server-side SourceId.
 */
import type { SourceMeta } from '@/types';

export const SOURCES: Record<string, SourceMeta> = {
  gsc: {
    id: 'gsc',
    label: 'Search Console',
    short: 'GSC',
    color: '#34A853',
    status: 'live',
    sync: '—',
  },
  ads: {
    id: 'ads',
    label: 'Google Ads',
    short: 'Ads',
    color: '#4285F4',
    status: 'live',
    sync: '—',
  },
  ga4: {
    id: 'ga4',
    label: 'Analytics 4',
    short: 'GA4',
    color: '#FF6D00',
    status: 'live',
    sync: '—',
  },
  meta: {
    id: 'meta',
    label: 'Meta Ads',
    short: 'Meta',
    color: '#0866FF',
    status: 'live',
    sync: '—',
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    short: 'LinkedIn',
    color: '#0A66C2',
    status: 'expired',
    sync: '—',
  },
  clarity: {
    id: 'clarity',
    label: 'Clarity',
    short: 'Clarity',
    color: '#8B5CF6',
    status: 'live',
    sync: '—',
  },
  crm: {
    id: 'crm',
    label: 'CRM / Runo',
    short: 'CRM',
    color: '#06B6D4',
    status: 'down',
    sync: '—',
  },
} as const;

export const SOURCE_ORDER: string[] = [
  'gsc',
  'ads',
  'ga4',
  'meta',
  'linkedin',
  'clarity',
  'crm',
];


