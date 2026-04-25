import { useEffect, useState, useMemo } from 'react';
import { MapPin, ChevronRight, Loader2, ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { usePresenceStore } from '../../store/presenceStore';
import { locationsApi, type LocationTreeNode } from '../../api/locations';
import { telemetryApi } from '../../api/telemetry';
import { buildingsApi } from '../../api/buildings';
import BottomSheet from '../common/BottomSheet';
import type { Building } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Hierarchy types ───────────────────────────────────── */

interface HierarchyNode {
  id: string;
  label: string;
  /** empty = leaf (selectable room/zone) */
  children: HierarchyNode[];
}

interface Hierarchy {
  /** Human labels per depth, e.g. ['Floor','Wing','Room'] */
  levels: string[];
  roots: HierarchyNode[];
}

/* ── Type label map ────────────────────────────────────── */

const TYPE_LABEL: Record<string, string> = {
  building: 'Building',
  block_or_wing: 'Wing',
  floor: 'Floor',
  room: 'Room',
  placement: 'Placement',
};

/* ── Converters ────────────────────────────────────────── */

/**
 * Convert a locations API tree into a generic Hierarchy,
 * preserving every level that actually has nodes.
 * Skips the top-level 'building' node (if present) since the
 * building is already selected.
 */
function treeToHierarchy(tree: LocationTreeNode[]): Hierarchy | null {
  // Skip building-type root nodes
  let roots = tree;
  if (roots.length === 1 && roots[0].type === 'building') {
    roots = roots[0].children as LocationTreeNode[];
  }

  if (roots.length === 0) return null;

  // Detect the level types by walking one path down to a leaf
  const levelTypes: string[] = [];
  function detectLevels(nodes: LocationTreeNode[]) {
    if (nodes.length === 0) return;
    const first = nodes[0];
    levelTypes.push(first.type);
    if (first.children && first.children.length > 0) {
      detectLevels(first.children as LocationTreeNode[]);
    }
  }
  detectLevels(roots);

  const levels = levelTypes.map((t) => TYPE_LABEL[t] ?? t);

  // Recursively convert
  function convert(nodes: LocationTreeNode[]): HierarchyNode[] {
    return nodes
      .map((n) => ({
        id: n.id,
        label: n.name,
        children: n.children && n.children.length > 0
          ? convert(n.children as LocationTreeNode[])
          : [],
      }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }

  const hierRoots = convert(roots);
  return hierRoots.length > 0 ? { levels, roots: hierRoots } : null;
}

/**
 * Build a multi-level Hierarchy from telemetry zone codes.
 * Auto-detects the hierarchy depth from the zone pattern:
 *   "1-W-560" → Floor → Wing → Room
 *   "1-560"   → Floor → Room
 *   "room1"   → Room (flat)
 */
function buildHierarchyFromReadings(
  readings: { floor: string | null; zone: string | null }[],
): Hierarchy | null {
  const zones = new Set<string>();
  for (const r of readings) {
    if (r.zone) zones.add(r.zone);
  }
  if (zones.size === 0) return null;

  // Parse every zone and detect the max segment count
  const parsed: { segments: string[]; zone: string }[] = [];
  for (const z of zones) {
    parsed.push({ segments: z.split('-'), zone: z });
  }

  const maxSegments = Math.max(...parsed.map((p) => p.segments.length));

  if (maxSegments >= 3) {
    // {floor}-{wing}-{room...}
    const floorMap = new Map<string, Map<string, Set<string>>>();
    const allWings = new Set<string>();
    for (const p of parsed) {
      const floor = p.segments[0];
      const wing = p.segments[1];
      const room = p.segments.slice(2).join('-');
      allWings.add(wing);
      if (!floorMap.has(floor)) floorMap.set(floor, new Map());
      const wm = floorMap.get(floor)!;
      if (!wm.has(wing)) wm.set(wing, new Set());
      wm.get(wing)!.add(room);
    }

    // Ensure continuous floors (1..max or 0..max)
    const floorNums = Array.from(floorMap.keys()).map(Number).filter((n) => !isNaN(n));
    if (floorNums.length > 0) {
      const minFloor = Math.min(...floorNums) <= 0 ? Math.min(...floorNums) : 1;
      const maxFloor = Math.max(...floorNums);
      for (let f = minFloor; f <= maxFloor; f++) {
        const key = String(f);
        if (!floorMap.has(key)) {
          // Add empty floor with all known wings (no rooms)
          const wm = new Map<string, Set<string>>();
          for (const w of allWings) wm.set(w, new Set());
          floorMap.set(key, wm);
        } else {
          // Ensure every wing appears on every floor
          const wm = floorMap.get(key)!;
          for (const w of allWings) {
            if (!wm.has(w)) wm.set(w, new Set());
          }
        }
      }
    }

    const roots: HierarchyNode[] = [];
    for (const [floor, wingMap] of floorMap) {
      const wings: HierarchyNode[] = [];
      for (const [wing, rooms] of wingMap) {
        const roomNodes = Array.from(rooms)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          .map((r) => ({ id: `${floor}-${wing}-${r}`, label: `Room ${r}`, children: [] }));
        wings.push({
          id: `${floor}-${wing}`,
          label: `Wing ${wing}`,
          children: roomNodes,
        });
      }
      wings.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
      roots.push({ id: floor, label: `Floor ${floor}`, children: wings });
    }
    roots.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    return { levels: ['Floor', 'Wing', 'Room'], roots };
  }

  if (maxSegments === 2) {
    // {floor}-{room}
    const floorMap = new Map<string, Set<string>>();
    for (const p of parsed) {
      const floor = p.segments[0];
      const room = p.segments[1];
      if (!floorMap.has(floor)) floorMap.set(floor, new Set());
      floorMap.get(floor)!.add(room);
    }

    // Ensure continuous floors
    const floorNums = Array.from(floorMap.keys()).map(Number).filter((n) => !isNaN(n));
    if (floorNums.length > 0) {
      const minFloor = Math.min(...floorNums) <= 0 ? Math.min(...floorNums) : 1;
      const maxFloor = Math.max(...floorNums);
      for (let f = minFloor; f <= maxFloor; f++) {
        if (!floorMap.has(String(f))) floorMap.set(String(f), new Set());
      }
    }

    const roots: HierarchyNode[] = [];
    for (const [floor, rooms] of floorMap) {
      roots.push({
        id: floor,
        label: `Floor ${floor}`,
        children: Array.from(rooms).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          .map((r) => ({ id: `${floor}-${r}`, label: `Room ${r}`, children: [] })),
      });
    }
    roots.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    return { levels: ['Floor', 'Room'], roots };
  }

  // Flat list
  const roots: HierarchyNode[] = Array.from(zones)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((z) => ({ id: z, label: z, children: [] }));
  return { levels: ['Location'], roots };
}

/* ── Component ─────────────────────────────────────────── */

function isPersonalBuilding(b: Building | null): boolean {
  if (!b) return false;
  const meta = (b.metadata ?? {}) as Record<string, unknown>;
  return meta.isPersonal === true;
}

export default function LocationQuickPicker({ isOpen, onClose }: Props) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const setLocation = usePresenceStore((s) => s.setLocation);
  const currentFloorId = usePresenceStore((s) => s.floor);
  const currentRoomId = usePresenceStore((s) => s.room);
  const { locationForm, fetchLocationForm } = useBuildingStore();

  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<HierarchyNode[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);

  // Personal-building room management. Only used when activeBuilding has
  // metadata.isPersonal=true; the rest of the picker (hierarchy
  // resolution from API/telemetry) doesn't apply because personal
  // buildings live entirely in the building's metadata column.
  const [personalRooms, setPersonalRooms] = useState<string[]>([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [roomSubmitting, setRoomSubmitting] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const personalMeta = activeBuilding?.metadata as Record<string, unknown> | undefined;
  const personalFloorCount =
    typeof personalMeta?.floorCount === 'number' ? personalMeta.floorCount : null;
  const personalZoneCount =
    typeof personalMeta?.zoneCount === 'number' ? personalMeta.zoneCount : null;

  useEffect(() => {
    if (!isOpen || !activeBuilding) return;
    if (!isPersonalBuilding(activeBuilding)) return;
    const meta = (activeBuilding.metadata ?? {}) as Record<string, unknown>;
    setPersonalRooms(Array.isArray(meta.rooms) ? meta.rooms.filter((r): r is string => typeof r === 'string') : []);
    setShowAddRoom(false);
    setRoomInput('');
    setRoomError(null);
  }, [isOpen, activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBuilding) return;
    const value = roomInput.trim();
    if (!value) {
      setRoomError('Room label is required');
      return;
    }
    setRoomSubmitting(true);
    setRoomError(null);
    try {
      const updated = await buildingsApi.addPersonalRoom(activeBuilding.id, value);
      const meta = (updated.metadata ?? {}) as Record<string, unknown>;
      const rooms = Array.isArray(meta.rooms)
        ? meta.rooms.filter((r): r is string => typeof r === 'string')
        : [];
      setPersonalRooms(rooms);
      setRoomInput('');
      setShowAddRoom(false);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Failed to add room');
    } finally {
      setRoomSubmitting(false);
    }
  };

  const removeRoom = async (room: string) => {
    if (!activeBuilding) return;
    if (!confirm(`Remove room "${room}"?`)) return;
    setPersonalRooms((prev) => prev.filter((r) => r !== room));
    try {
      const updated = await buildingsApi.removePersonalRoom(activeBuilding.id, room);
      const meta = (updated.metadata ?? {}) as Record<string, unknown>;
      const rooms = Array.isArray(meta.rooms)
        ? meta.rooms.filter((r): r is string => typeof r === 'string')
        : [];
      setPersonalRooms(rooms);
    } catch {
      // Silently keep the optimistic state — caller can retry.
    }
  };

  const selectPersonalRoom = (room: string) => {
    setLocation('default', 'Default', `personal-${room}`, room);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !activeBuilding) return;
    if (isPersonalBuilding(activeBuilding)) return;

    let cancelled = false;
    setLoading(true);
    setPath([]);
    setHierarchy(null);

    (async () => {
      try {
        // 1. Try configured location form (always 2-level: floor → room)
        await fetchLocationForm(activeBuilding.id);
        const form = useBuildingStore.getState().locationForm;
        if (cancelled) return;
        if (form && form.floors && form.floors.length > 0) {
          setHierarchy({
            levels: ['Floor', 'Room'],
            roots: form.floors.map((f) => ({
              id: f.id,
              label: f.label,
              children: f.rooms.map((r) => ({ id: r.id, label: r.label, children: [] })),
            })),
          });
          return;
        }

        // 2. Try locations API tree — preserves full hierarchy
        try {
          const tree = await locationsApi.tree(activeBuilding.id);
          if (cancelled) return;
          const h = treeToHierarchy(tree);
          if (h) { setHierarchy(h); return; }
        } catch { /* continue */ }

        // 3. Fallback: derive from telemetry data (auto-detects depth)
        if (cancelled) return;
        try {
          const latest = await telemetryApi.latest(activeBuilding.id);
          if (cancelled) return;
          const h = buildHierarchyFromReadings(latest);
          if (h) setHierarchy(h);
        } catch { /* nothing */ }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Current nodes at this depth
  const currentNodes = useMemo(() => {
    if (!hierarchy) return [];
    let nodes = hierarchy.roots;
    for (const p of path) {
      const found = nodes.find((n) => n.id === p.id);
      if (found) nodes = found.children;
      else return [];
    }
    return nodes;
  }, [hierarchy, path]);

  const currentLevelLabel = hierarchy?.levels[path.length] ?? 'Location';
  const isLeafLevel = currentNodes.length > 0 && currentNodes[0].children.length === 0;
  const nextLevelLabel = hierarchy?.levels[path.length + 1]?.toLowerCase() ?? 'item';

  const handleSelect = (node: HierarchyNode) => {
    if (node.children.length === 0) {
      // Leaf node — set as the selected location
      const floorNode = path[0];
      setLocation(
        floorNode?.id ?? 'default',
        floorNode?.label ?? 'Default',
        node.id,
        node.label,
      );
      onClose();
    } else {
      setPath([...path, node]);
    }
  };

  const handleBack = () => setPath(path.slice(0, -1));

  const handleDefaultLocation = () => {
    setLocation('default', 'Default', 'default', 'Default');
    onClose();
  };

  // Personal-building view — bypass the hierarchy resolver entirely.
  if (isPersonalBuilding(activeBuilding)) {
    const subtitleParts: string[] = [];
    if (personalFloorCount) subtitleParts.push(`${personalFloorCount} floor${personalFloorCount === 1 ? '' : 's'}`);
    if (personalZoneCount) subtitleParts.push(`${personalZoneCount} zone${personalZoneCount === 1 ? '' : 's'}`);
    const structureSubtitle = subtitleParts.join(' · ');

    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Change Location">
        <div className="space-y-3">
          {structureSubtitle && (
            <div className="rounded-2xl bg-emerald-50/60 px-3 py-2 text-[11px] text-emerald-700">
              {activeBuilding?.name}: {structureSubtitle}.
            </div>
          )}
          <div className="flex items-center justify-between px-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Your Rooms
              <span className="ml-2 normal-case text-[10px] font-normal tracking-normal text-slate-400">
                {personalRooms.length} added
              </span>
            </div>
            {!showAddRoom && (
              <button
                onClick={() => { setShowAddRoom(true); setRoomError(null); }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add room
              </button>
            )}
          </div>

          {showAddRoom && (
            <form onSubmit={submitRoom} className="rounded-2xl border border-emerald-200 bg-white px-3 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">New room</div>
                <button
                  type="button"
                  onClick={() => { setShowAddRoom(false); setRoomInput(''); setRoomError(null); }}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 101, F2-East, Lab A"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                maxLength={50}
                autoFocus
              />
              <p className="mt-1.5 px-1 text-[11px] text-slate-400">
                Use any label that helps you remember the spot. You can include the floor or zone in the name.
              </p>
              {roomError && (
                <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{roomError}</div>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddRoom(false); setRoomInput(''); setRoomError(null); }}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roomSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                >
                  {roomSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          )}

          {personalRooms.length === 0 && !showAddRoom ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/75 px-4 py-6 text-center text-xs text-slate-400">
              No rooms yet. Add one to get a location-aware comfort vote.
            </div>
          ) : (
            <div className="space-y-1.5">
              {personalRooms.map((room) => {
                const roomKey = `personal-${room}`;
                const isCurrent = currentRoomId === roomKey;
                return (
                  <div
                    key={room}
                    className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-all ${
                      isCurrent ? 'bg-emerald-50 border-emerald-200' : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => selectPersonalRoom(room)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-600">
                        {room.replace(/[^0-9A-Za-z]/g, '').slice(0, 2).toUpperCase() || '·'}
                      </div>
                      <div className="flex-1 text-sm font-semibold text-slate-800">{room}</div>
                      {isCurrent ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Select
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => removeRoom(room)}
                      className="rounded-full p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                      title="Remove room"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setLocation('default', 'Default', 'default', 'Default');
                onClose();
              }}
              className="w-full rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200"
            >
              Skip — use default location
            </button>
          </div>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Change Location">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {path.length > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {hierarchy?.levels[path.length - 1] ?? 'previous'}
            </button>
          )}

          {path.length > 0 && (
            <div className="text-[10px] text-slate-400 px-1 mb-1">
              {path.map((p) => p.label).join(' › ')}
            </div>
          )}

          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
            Select {currentLevelLabel}
          </div>

          {currentNodes.length === 0 ? (
            <div className="text-center py-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400 mb-3">No location data available</p>
              <button
                onClick={handleDefaultLocation}
                className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600"
              >
                Use default location
              </button>
            </div>
          ) : (
            currentNodes.map((node) => {
              const isCurrent =
                (isLeafLevel && node.id === currentRoomId) ||
                (!isLeafLevel && node.id === currentFloorId);
              const childCount = node.children.length;

              return (
                <button
                  key={node.id}
                  onClick={() => handleSelect(node)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {!isLeafLevel && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-600">
                      {node.label.replace(/[^0-9A-Za-z]/g, '').slice(0, 2) || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-800">{node.label}</div>
                    {childCount > 0 && (
                      <div className="text-xs text-slate-400">
                        {childCount} {nextLevelLabel}{childCount === 1 ? '' : 's'}
                      </div>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  {!isLeafLevel && <ChevronRight className="h-4 w-4 text-gray-300" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </BottomSheet>
  );
}
