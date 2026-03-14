import { api } from './client';

/* ── Types ─────────────────────────────────────────────── */

export type AuthType =
  | 'bearer_token'
  | 'oauth2_client_credentials'
  | 'mtls'
  | 'api_key'
  | 'basic_auth'
  | 'hmac';

export interface BuildingConnector {
  id: string;
  buildingId: string;
  name: string;
  description: string | null;
  baseUrl: string;
  httpMethod: string;
  requestHeaders: Record<string, string> | null;
  requestBody: Record<string, unknown> | null;
  authType: AuthType;
  authConfig: Record<string, string>;
  responseMapping: ResponseMapping | null;
  availableMetrics: string[] | null;
  pollingIntervalMinutes: number;
  isEnabled: boolean;
  lastPolledAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  totalPolls: number;
  totalReadingsIngested: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseMapping {
  readingsPath?: string;
  fields?: {
    metricType?: string;
    value?: string;
    unit?: string;
    floor?: string;
    zone?: string;
    recordedAt?: string;
  };
  metadataFields?: string[];
}

export interface ConnectorCreate {
  buildingId: string;
  name: string;
  description?: string;
  baseUrl: string;
  httpMethod?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  authType: AuthType;
  authConfig: Record<string, string>;
  responseMapping?: ResponseMapping;
  availableMetrics?: string[];
  pollingIntervalMinutes?: number;
  isEnabled?: boolean;
}

export interface ConnectorUpdate {
  name?: string;
  description?: string;
  baseUrl?: string;
  httpMethod?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  authType?: AuthType;
  authConfig?: Record<string, string>;
  responseMapping?: ResponseMapping;
  availableMetrics?: string[];
  pollingIntervalMinutes?: number;
  isEnabled?: boolean;
}

export interface ConnectorTestResult {
  success: boolean;
  statusCode: number | null;
  readingsFound: number;
  sampleData: Record<string, unknown>[] | null;
  error: string | null;
}

export interface PollResult {
  connectorId: string;
  success: boolean;
  readingsIngested: number;
  error: string | null;
}

/* ── API ───────────────────────────────────────────────── */

export const connectorsApi = {
  list: (buildingId: string) =>
    api.get<BuildingConnector[]>(`/connectors/${buildingId}`),

  create: (data: ConnectorCreate) =>
    api.post<BuildingConnector>('/connectors', data),

  update: (connectorId: string, data: ConnectorUpdate) =>
    api.put<BuildingConnector>(`/connectors/${connectorId}`, data),

  remove: (connectorId: string) =>
    api.delete(`/connectors/${connectorId}`),

  test: (connectorId: string) =>
    api.post<ConnectorTestResult>(`/connectors/${connectorId}/test`),

  pollNow: (connectorId: string) =>
    api.post<PollResult>(`/connectors/${connectorId}/poll-now`),
};
