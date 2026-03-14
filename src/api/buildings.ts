import { api } from './client';
import type {
  Building,
  BuildingConfig,
  BuildingComfortData,
  SduiNode,
  VoteFormSchema,
  LocationFormConfig,
} from '../types';

export interface BuildingCreatePayload {
  name: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  requiresAccessPermission?: boolean;
}

export interface BuildingConfigUpdatePayload {
  dashboardLayout?: unknown;
  voteFormSchema?: unknown;
  locationFormConfig?: unknown;
}

function normalizeVoteForm(schema: VoteFormSchema | null): VoteFormSchema | null {
  if (!schema) {
    return null;
  }

  return {
    ...schema,
    version: schema.version ?? schema.schemaVersion ?? 1,
    title: schema.title ?? schema.formTitle ?? 'Comfort Vote',
    description: schema.description ?? schema.formDescription,
    fields: (schema.fields ?? []).map((field, index) => ({
      ...field,
      id: field.id ?? field.key ?? `field_${index + 1}`,
      question: field.question ?? field.label ?? `Question ${index + 1}`,
      maxStars: field.maxStars ?? field.max,
    })),
  };
}

export const buildingsApi = {
  list: (tenantId?: string) =>
    api.get<Building[]>(tenantId ? `/buildings?tenantId=${tenantId}` : '/buildings'),

  create: (payload: BuildingCreatePayload) =>
    api.post<Building>('/buildings', payload),

  update: (buildingId: string, payload: Partial<BuildingCreatePayload>) =>
    api.put<Building>(`/buildings/${buildingId}`, payload),

  dashboard: (buildingId: string) =>
    api.get<SduiNode | null>(`/buildings/${buildingId}/dashboard`),

  voteForm: async (buildingId: string) =>
    normalizeVoteForm(await api.get<VoteFormSchema | null>(`/buildings/${buildingId}/vote-form`)),

  locationForm: (buildingId: string) =>
    api.get<LocationFormConfig | null>(`/buildings/${buildingId}/location-form`),

  config: (buildingId: string) =>
    api.get<BuildingConfig>(`/buildings/${buildingId}/config`),

  updateConfig: (buildingId: string, payload: BuildingConfigUpdatePayload) =>
    api.put<BuildingConfig>(`/buildings/${buildingId}/config`, payload),

  comfort: (buildingId: string) =>
    api.get<BuildingComfortData>(`/buildings/${buildingId}/comfort`),
};
