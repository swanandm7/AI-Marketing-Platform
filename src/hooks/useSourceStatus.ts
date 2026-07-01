/**
 * Hook for polling source connection status.
 * Polls /api/status on mount and every 5 minutes.
 * Uses plain useEffect + useState — no React Query dependency.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchStatus } from '@/api';
import type { StatusResponse } from '@/types';

const FIVE_MINUTES = 5 * 60 * 1000;

export function useSourceStatus() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchStatus();
      setData(result);
      setError(null);
    } catch {
      setError('Status unavailable');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, FIVE_MINUTES);
    return () => clearInterval(timer);
  }, [load]);

  return { data, error };
}
