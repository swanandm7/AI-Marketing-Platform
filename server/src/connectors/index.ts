/**
 * Connector registry.
 * Maps source IDs to their connector implementations.
 * Adding a new source = add the connector + one entry here.
 */
import type { Connector } from './types';
import { gscConnector } from './gsc';
import { ga4Connector } from './ga4';
import { googleAdsConnector } from './googleAds';
import { metaConnector } from './meta';
import { linkedinConnector } from './linkedin';
import { clarityConnector } from './clarity';
import { crmConnector } from './crm';
import type { SourceId } from '../types';

export const connectors: Record<SourceId, Connector> = {
  gsc: gscConnector,
  ga4: ga4Connector,
  ads: googleAdsConnector,
  meta: metaConnector,
  linkedin: linkedinConnector,
  clarity: clarityConnector,
  crm: crmConnector,
};
