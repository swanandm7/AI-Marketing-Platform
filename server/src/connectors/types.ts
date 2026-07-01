/**
 * Connector interface.
 * Every connector exports a single `fetch(intent)` function.
 * The dispatcher calls them in Promise.all — connectors are independent.
 */
import type { Intent, ConnectorResult } from '../types';

export interface Connector {
  fetch(intent: Intent): Promise<ConnectorResult>;
  checkStatus(): Promise<{ status: 'live' | 'expired' | 'down'; lastSync: string }>;
}
