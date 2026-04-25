import { api } from './client';
import type {
  Building,
  BuildingConfig,
  BuildingComfortData,
  SduiNode,
  VoteFormSchema,
  LocationFormConfig,
} from '../types';

const HIDDEN_PERSONAL_KEY = 'comfortos.hiddenPersonalBuildings';

export function getHiddenPersonalIds(): Set<string> {
  return readHiddenPersonalIds();
}

function readHiddenPersonalIds(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_PERSONAL_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x): x is string => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function writeHiddenPersonalIds(ids: Set<string>): void {
  try {
    localStorage.setItem(HIDDEN_PERSONAL_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export interface BuildingCreatePayload {
  name: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  requiresAccessPermission?: boolean;
}

export interface PersonalBuildingPayload {
  name: string;
  city?: string;
  /** Number of floors in the building (informational, used by the
   * location picker to suggest floor labels). */
  floorCount?: number;
  /** Number of blocks / zones / wings in the building. */
  zoneCount?: number;
}

export const PERSONAL_BUILDING_LIMIT = 3;

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

  /** List only buildings the caller manages (FM/admin). */
  listManaged: () =>
    api.get<Building[]>('/buildings?managedOnly=true'),

  create: (payload: BuildingCreatePayload) =>
    api.post<Building>('/buildings', payload),

  /** List the caller's personal buildings, excluding any the user has
   * hidden locally (kept in localStorage so dismissals survive reloads
   * even if the backend delete call never confirmed). Hidden ids that
   * are no longer present in the server response are pruned, so the
   * set doesn't grow unbounded. */
  listPersonal: async (): Promise<Building[]> => {
    const all = await api.get<Building[]>('/buildings/personal');
    const hidden = readHiddenPersonalIds();
    if (hidden.size === 0) return all;
    const presentIds = new Set(all.map((b) => b.id));
    const stillHidden = new Set(Array.from(hidden).filter((id) => presentIds.has(id)));
    if (stillHidden.size !== hidden.size) writeHiddenPersonalIds(stillHidden);
    return all.filter((b) => !stillHidden.has(b.id));
  },

  createPersonal: async (payload: PersonalBuildingPayload): Promise<Building> => {
    const created = await api.post<Building>('/buildings/personal', payload);
    // If the same id somehow lingered in the hidden set (extremely
    // unlikely — UUID collision), un-hide it so the user can see what
    // they just made.
    const hidden = readHiddenPersonalIds();
    if (hidden.delete(created.id)) writeHiddenPersonalIds(hidden);
    return created;
  },

  /** Add a room label to a personal building. Returns the updated
   * Building. Idempotent — re-adding an existing label is a no-op. */
  addPersonalRoom: (buildingId: string, room: string) =>
    api.post<Building>(`/buildings/personal/${buildingId}/rooms`, { room }),

  /** Remove a room label from a personal building. */
  removePersonalRoom: (buildingId: string, room: string) =>
    api.post<Building>(`/buildings/personal/${buildingId}/rooms/remove`, { room }),

  /** Mark a personal building as deleted from the user's POV.
   *
   * Always resolves — never throws. Adds the id to the local hidden
   * set first (so the building disappears immediately and stays gone
   * after refresh), then fires a best-effort POST to the server. If
   * the server call fails for any reason (route, proxy, network), the
   * UI is still consistent. */
  deletePersonal: async (buildingId: string): Promise<void> => {
    const hidden = readHiddenPersonalIds();
    hidden.add(buildingId);
    writeHiddenPersonalIds(hidden);
    try {
      await api.post<void>(`/buildings/personal/${buildingId}/delete`);
    } catch {
      // Server-side delete failed — the localStorage hide keeps the
      // building out of the user's view regardless.
    }
  },

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
