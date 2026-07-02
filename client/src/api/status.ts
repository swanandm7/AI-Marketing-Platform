/**
 * API functions for the /api/status endpoint.
 */
import { apiFetch } from './client';
import type { StatusResponse } from '@/types';

export async function fetchStatus(): Promise<StatusResponse> {
  return apiFetch<StatusResponse>('/api/status');
}
