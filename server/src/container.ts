import { IntentRouterService } from './services/intentRouter';
import { SynthesiserService } from './services/synthesiser';
import { QueryService } from './services/QueryService';
import { StatusService } from './services/StatusService';
import { connectors } from './connectors';
import { env } from './config/env';
import type { IContainer } from './interfaces';

/**
 * Creates and wires all application services.
 * Call once at startup; pass the returned container to the Express app factory.
 * Swapping an implementation means changing one line here — no routes need to know.
 */
export function createContainer(): IContainer {
  const intentRouter = new IntentRouterService(env.ANTHROPIC_API_KEY);
  const synthesiser = new SynthesiserService(env.ANTHROPIC_API_KEY);
  const queryService = new QueryService(intentRouter, synthesiser, connectors);
  const statusService = new StatusService(connectors);

  return { queryService, statusService };
}
