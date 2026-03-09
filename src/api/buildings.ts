import { api } from './client';
import type {
  Building,
  BuildingConfig,
  BuildingComfortData,
  SduiNode,
  VoteFormSchema,
  LocationFormConfig,
} from '../types';

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

  dashboard: (buildingId: string) =>
    api.get<SduiNode | null>(`/buildings/${buildingId}/dashboard`),

  voteForm: async (buildingId: string) =>
    normalizeVoteForm(await api.get<VoteFormSchema | null>(`/buildings/${buildingId}/vote-form`)),

  locationForm: (buildingId: string) =>
    api.get<LocationFormConfig | null>(`/buildings/${buildingId}/location-form`),

  config: (buildingId: string) =>
    api.get<BuildingConfig>(`/buildings/${buildingId}/config`),

  comfort: (buildingId: string) =>
    api.get<BuildingComfortData>(`/buildings/${buildingId}/comfort`),
};
