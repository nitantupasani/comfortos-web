import { api } from './client';
import type {
  Building,
  BuildingConfig,
  BuildingComfortData,
  SduiNode,
  VoteFormSchema,
  LocationFormConfig,
} from '../types';

export const buildingsApi = {
  list: (tenantId?: string) =>
    api.get<Building[]>(tenantId ? `/buildings?tenantId=${tenantId}` : '/buildings'),

  dashboard: (buildingId: string) =>
    api.get<SduiNode | null>(`/buildings/${buildingId}/dashboard`),

  voteForm: (buildingId: string) =>
    api.get<VoteFormSchema | null>(`/buildings/${buildingId}/vote-form`),

  locationForm: (buildingId: string) =>
    api.get<LocationFormConfig | null>(`/buildings/${buildingId}/location-form`),

  config: (buildingId: string) =>
    api.get<BuildingConfig>(`/buildings/${buildingId}/config`),

  comfort: (buildingId: string) =>
    api.get<BuildingComfortData>(`/buildings/${buildingId}/comfort`),
};
