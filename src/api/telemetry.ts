import { api } from './client';

/* ── Types ─────────────────────────────────────────────── */

export interface TelemetryMetric {
  metricType: string;
  unit: string;
}

export interface TelemetryPoint {
  recordedAt: string;
  value: number;
  floor: string | null;
  zone: string | null;
}

export interface TelemetrySeriesGroup {
  label: string;
  locationId: string | null;
  locationName: string | null;
  zones: string[];
  floor: string | null;
  zone: string | null;
  points: TelemetryPoint[];
}

export interface TelemetryQueryResponse {
  buildingId: string;
  metricType: string;
  unit: string;
  granularity: string;
  series: TelemetrySeriesGroup[];
}

export interface TelemetryLatestReading {
  id: string;
  buildingId: string;
  metricType: string;
  value: number;
  unit: string;
  floor: string | null;
  zone: string | null;
  recordedAt: string;
  ingestedAt: string;
  metadata: Record<string, unknown> | null;
}

export interface TelemetrySeriesParams {
  metricType: string;
  dateFrom?: string;
  dateTo?: string;
  granularity?: 'raw' | 'hourly' | 'daily';
  groupBy?: 'room' | 'floor' | 'wing';
  floor?: string;
  zone?: string;
  locationId?: string;
}

export interface GroupingLevel {
  key: string;
  label: string;
}

export interface GroupingLevelsResponse {
  buildingId: string;
  levels: GroupingLevel[];
  floors: string[];
  wings: string[];
  roomCount: number;
}

/* ── API ───────────────────────────────────────────────── */

export const telemetryApi = {
  /** List available metric types for a building. */
  metrics: (buildingId: string) =>
    api.get<TelemetryMetric[]>(`/telemetry/${buildingId}/metrics`),

  /** Query time-series sensor data. */
  series: (buildingId: string, params: TelemetrySeriesParams) => {
    const qs = new URLSearchParams({ metricType: params.metricType });
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    if (params.granularity) qs.set('granularity', params.granularity);
    if (params.groupBy) qs.set('groupBy', params.groupBy);
    if (params.floor) qs.set('floor', params.floor);
    if (params.zone) qs.set('zone', params.zone);
    if (params.locationId) qs.set('locationId', params.locationId);
    return api.get<TelemetryQueryResponse>(
      `/telemetry/${buildingId}/series?${qs.toString()}`,
    );
  },

  /** Get latest reading per metric per floor/zone. */
  latest: (buildingId: string) =>
    api.get<TelemetryLatestReading[]>(`/telemetry/${buildingId}/latest`),

  /** Get available grouping levels for a building. */
  groupingLevels: (buildingId: string) =>
    api.get<GroupingLevelsResponse>(`/telemetry/${buildingId}/grouping-levels`),
};
