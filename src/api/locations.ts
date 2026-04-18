import { api } from './client';

/* ── Types ─────────────────────────────────────────────── */

export type LocationType = 'building' | 'block_or_wing' | 'floor' | 'room' | 'placement';

export interface LocationNode {
  id: string;
  buildingId: string;
  parentId: string | null;
  type: LocationType;
  name: string;
  code: string | null;
  sortOrder: number;
  orientation: string | null;
  usageType: string | null;
  externalRefs: Record<string, string> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocationTreeNode extends LocationNode {
  children: LocationTreeNode[];
}

export interface LocationCreate {
  buildingId: string;
  parentId?: string | null;
  type: LocationType;
  name: string;
  code?: string;
  sortOrder?: number;
  orientation?: string;
  usageType?: string;
  externalRefs?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface LocationUpdate {
  name?: string;
  code?: string;
  sortOrder?: number;
  orientation?: string;
  usageType?: string;
  externalRefs?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/** Which child types are valid under each parent type */
export const VALID_CHILDREN: Record<LocationType, LocationType[]> = {
  building: ['block_or_wing', 'floor', 'room'],
  block_or_wing: ['floor', 'room'],
  floor: ['room'],
  room: ['placement'],
  placement: [],
};

export const TYPE_LABELS: Record<LocationType, string> = {
  building: 'Building',
  block_or_wing: 'Block / Wing',
  floor: 'Floor',
  room: 'Room',
  placement: 'Placement',
};

/* ── API ───────────────────────────────────────────────── */

export const locationsApi = {
  list: (buildingId: string, type?: LocationType) => {
    const qs = type ? `?type=${type}` : '';
    return api.get<LocationNode[]>(`/locations/${buildingId}${qs}`);
  },

  tree: (buildingId: string) =>
    api.get<LocationTreeNode[]>(`/locations/${buildingId}/tree`),

  create: (data: LocationCreate) =>
    api.post<LocationNode>('/locations', data),

  batchCreate: (buildingId: string, locations: LocationCreate[]) =>
    api.post<LocationNode[]>('/locations/batch', { buildingId, locations }),

  update: (locationId: string, data: LocationUpdate) =>
    api.put<LocationNode>(`/locations/${locationId}`, data),

  remove: (locationId: string) =>
    api.delete(`/locations/${locationId}`),
};
