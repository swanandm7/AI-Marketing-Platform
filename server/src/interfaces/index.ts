import type { Intent, ConnectorResult, SynthesisResult, QueryApiResponse, StatusApiResponse, SourceId } from '../types';

export interface IIntentRouter {
  route(question: string): Promise<Intent>;
}

export interface ISynthesiser {
  synthesise(
    question: string,
    results: ConnectorResult[],
    intent: Intent,
    onToken?: (text: string) => void,
  ): Promise<SynthesisResult>;
}

export interface QueryCallbacks {
  onIntent?: (sources: SourceId[], querying: string) => void;
  onToken?: (text: string) => void;
}

export interface IQueryService {
  execute(question: string, history: string[], callbacks?: QueryCallbacks): Promise<QueryApiResponse>;
}

export interface IStatusService {
  getAll(): Promise<StatusApiResponse>;
}

export interface IContainer {
  queryService: IQueryService;
  statusService: IStatusService;
}
