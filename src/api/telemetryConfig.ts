import { api } from './client';

/* ── Types ─────────────────────────────────────────────── */

export interface MetricConfig {
  id: string;
  buildingId: string;
  metricType: string;
  isEnabled: boolean;
  defaultUnit: string | null;
  sourceLevel: string | null;
  roomAggregationRule: string;
  preferredSensorId: string | null;
  validRangeMin: number | null;
  validRangeMax: number | null;
  staleThresholdMinutes: number | null;
  conflictResolution: string;
  connectorPriority: string[] | null;
  metadata: Record<string, unknown> | null;
}

export interface MetricConfigUpsert {
  buildingId: string;
  metricType: string;
  isEnabled?: boolean;
  defaultUnit?: string;
  sourceLevel?: string;
  roomAggregationRule?: string;
  preferredSensorId?: string;
  validRangeMin?: number | null;
  validRangeMax?: number | null;
  staleThresholdMinutes?: number | null;
  conflictResolution?: string;
  connectorPriority?: string[];
  metadata?: Record<string, unknown>;
}

export const KNOWN_METRICS: { type: string; label: string; unit: string }[] = [
  { type: 'temperature', label: 'Temperature', unit: 'C' },
  { type: 'co2', label: 'CO2', unit: 'ppm' },
  { type: 'relative_humidity', label: 'Relative Humidity', unit: '%' },
  { type: 'noise', label: 'Noise', unit: 'dBA' },
];

export const AGGREGATION_RULES = ['avg', 'min', 'max', 'median', 'preferred_sensor'] as const;
export const CONFLICT_RESOLUTIONS = ['newest_wins', 'connector_priority', 'average'] as const;

/* ── API ───────────────────────────────────────────────── */

export const telemetryConfigApi = {
  list: (buildingId: string) =>
    api.get<MetricConfig[]>(`/telemetry/${buildingId}/config`),

  upsert: (buildingId: string, data: MetricConfigUpsert) =>
    api.post<MetricConfig>(`/telemetry/${buildingId}/config`, data),
};
