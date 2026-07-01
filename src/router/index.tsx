/**
 * Application router — single-page app, no external router needed.
 * HubPage is the only view. Add navigation state here when routing is required.
 */
import { AppLayout } from '@/components/layout/AppLayout';

export function AppRouter() {
  return <AppLayout />;
}
