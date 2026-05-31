import { api } from './client';

/* ── Types ─────────────────────────────────────────────── */

export type AuthType =
  | 'bearer_token'
  | 'oauth2_client_credentials'
  | 'mtls'
  | 'api_key'
  | 'basic_auth'
  | 'hmac'
  | 'priva_signalr'; // Priva Operator SignalR via replayed BFF session cookie

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

/* ── Priva helpers ─────────────────────────────────────── */

/** Priva Operator SignalR connector — session-cookie based, not REST-polled. */
export const PRIVA_AUTH_TYPE: AuthType = 'priva_signalr';

export function isPrivaConnector(c: BuildingConnector): boolean {
  return c.authType === PRIVA_AUTH_TYPE;
}

/**
 * Priva BFF session cookies expire after ~5 days. A connector whose last poll
 * errored (or that has stacked failures) almost always needs a fresh cookie.
 */
export function privaCookieHealth(
  c: BuildingConnector,
): 'healthy' | 'stale' | 'unknown' {
  if (c.lastStatus === 'error' || c.consecutiveFailures > 0) return 'stale';
  if (c.lastStatus === 'success') return 'healthy';
  return 'unknown';
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

  /**
   * Replace a Priva connector's BFF session cookie. The other priva auth fields
   * (siteId/serverId/groupId/controller) are preserved by merging onto the
   * connector's existing (unmasked) authConfig.
   */
  refreshPrivaCookie: (
    connectorId: string,
    existingAuthConfig: Record<string, string>,
    bffCookie: string,
  ) =>
    api.put<BuildingConnector>(`/connectors/${connectorId}`, {
      authConfig: { ...existingAuthConfig, bffCookie: bffCookie.trim() },
    }),
};
