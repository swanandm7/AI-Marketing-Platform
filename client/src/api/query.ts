/**
 * API functions for the /api/query endpoint.
 */
import { apiFetch } from './client';
import type { QueryRequest, QueryResponse } from '@/types';

export async function postQuery(payload: QueryRequest): Promise<QueryResponse> {
  return apiFetch<QueryResponse>('/api/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
