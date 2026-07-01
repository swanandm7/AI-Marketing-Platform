/**
 * Query key constants — reserved for when React Query is wired up.
 */
export const queryKeys = {
  status: () => ['status'] as const,
  history: () => ['history'] as const,
} as const;
