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

export interface PersonalBlockSpec {
  name: string;
  startFloor: number;
  endFloor: number;
}

export interface PersonalRoom {
  block?: string;
  floor?: number;
  label: string;
}

export interface PersonalBuildingPayload {
  name: string;
  city?: string;
  /** Per-block floor ranges describing the building's structure. The
   * location picker uses these to constrain the floor selector when
   * the user adds a room. */
  blocks?: PersonalBlockSpec[];
  /** When true (default on the server), only the creator (and admins)
   * can see the building. Set false for office / shared buildings the
   * occupant wants other users to find. */
  requiresAccessPermission?: boolean;
}

export interface PersonalRoomPayload {
  block?: string;
  floor?: number;
  label: string;
}

/** Coerce a raw rooms-array entry from the API into the canonical
 * {block?, floor?, label} shape. Older personal buildings stored each
 * entry as a plain string; both shapes are normalized here. */
export function normalizePersonalRoom(raw: unknown): PersonalRoom | null {
  if (typeof raw === 'string') {
    const label = raw.trim();
    return label ? { label } : null;
  }
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const label = typeof r.label === 'string' ? r.label : null;
    if (!label) return null;
    return {
      label,
      block: typeof r.block === 'string' ? r.block : undefined,
      floor: typeof r.floor === 'number' ? r.floor : undefined,
    };
  }
  return null;
}

export function readPersonalRooms(metadata: unknown): PersonalRoom[] {
  if (!metadata || typeof metadata !== 'object') return [];
  const arr = (metadata as Record<string, unknown>).rooms;
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizePersonalRoom).filter((r): r is PersonalRoom => r !== null);
}

export function readPersonalBlocks(metadata: unknown): PersonalBlockSpec[] {
  if (!metadata || typeof metadata !== 'object') return [];
  const arr = (metadata as Record<string, unknown>).blocks;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((b): PersonalBlockSpec | null => {
      if (!b || typeof b !== 'object') return null;
      const r = b as Record<string, unknown>;
      const name = typeof r.name === 'string' ? r.name : null;
      const startFloor = typeof r.startFloor === 'number' ? r.startFloor : null;
      const endFloor = typeof r.endFloor === 'number' ? r.endFloor : null;
      if (!name || startFloor === null || endFloor === null) return null;
      return { name, startFloor, endFloor };
    })
    .filter((b): b is PersonalBlockSpec => b !== null);
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

  /** Add a room to a personal building. Idempotent — re-adding the
   * same {block, floor, label} triple is a no-op. */
  addPersonalRoom: (buildingId: string, payload: PersonalRoomPayload) =>
    api.post<Building>(`/buildings/personal/${buildingId}/rooms`, payload),

  /** Remove a room. Pass the same {block, floor, label} that was used
   * to add it. */
  removePersonalRoom: (buildingId: string, payload: PersonalRoomPayload) =>
    api.post<Building>(`/buildings/personal/${buildingId}/rooms/remove`, payload),

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

  /** Admin hard-delete: cascades FK-dependent rows (votes, sensors,
   * presence, etc.) then removes the building. */
  delete: (buildingId: string) =>
    api.post<void>(`/buildings/${buildingId}/delete`),

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
