import { api } from './client';

/* ── Types ─────────────────────────────────────────────── */

export type EndpointMode = 'single_zone' | 'multi_zone' | 'building_wide' | 'sensor_centric';

export interface TelemetryEndpoint {
  endpointId: string;
  buildingId: string;
  endpointName: string;
  endpointUrl: string;
  authenticationConfig: Record<string, string>;
  endpointMode: EndpointMode;
  servedZoneIds: string[] | null;
  servedRoomIds: string[] | null;
  servedSensorIds: string[] | null;
  defaultLocationId: string | null;
  responseFormat: Record<string, unknown> | null;
  locationMapping: Record<string, unknown> | null;
  sensorMapping: Record<string, unknown> | null;
  normalizationProfile: Record<string, unknown> | null;
  availableMetrics: string[] | null;
  httpMethod: string;
  pollingConfig: PollingConfig;
  priority: number;
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

export interface PollingConfig {
  interval_minutes: number;
  timeout_seconds: number;
  retry_count: number;
  backoff_strategy: string;
}

export interface EndpointCreate {
  buildingId: string;
  endpointName: string;
  endpointUrl: string;
  authenticationConfig?: Record<string, string>;
  endpointMode: EndpointMode;
  servedZoneIds?: string[];
  servedRoomIds?: string[];
  servedSensorIds?: string[];
  defaultLocationId?: string;
  responseFormat?: Record<string, unknown>;
  locationMapping?: Record<string, unknown>;
  sensorMapping?: Record<string, unknown>;
  normalizationProfile?: Record<string, unknown>;
  availableMetrics?: string[];
  httpMethod?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  pollingConfig?: PollingConfig;
  priority?: number;
  isEnabled?: boolean;
}

export interface EndpointUpdate {
  endpointName?: string;
  endpointUrl?: string;
  authenticationConfig?: Record<string, string>;
  endpointMode?: EndpointMode;
  availableMetrics?: string[];
  httpMethod?: string;
  pollingConfig?: PollingConfig;
  priority?: number;
  isEnabled?: boolean;
}

export const MODE_LABELS: Record<EndpointMode, string> = {
  single_zone: 'Single Zone',
  multi_zone: 'Multi Zone',
  building_wide: 'Building Wide',
  sensor_centric: 'Sensor Centric',
};

/* ── API ───────────────────────────────────────────────── */

export const telemetryEndpointsApi = {
  list: (buildingId: string) =>
    api.get<TelemetryEndpoint[]>(`/telemetry-endpoints/${buildingId}`),

  create: (data: EndpointCreate) =>
    api.post<TelemetryEndpoint>('/telemetry-endpoints', data),

  update: (endpointId: string, data: EndpointUpdate) =>
    api.put<TelemetryEndpoint>(`/telemetry-endpoints/${endpointId}`, data),

  remove: (endpointId: string) =>
    api.delete(`/telemetry-endpoints/${endpointId}`),
};
