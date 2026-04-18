import { useEffect, useState, useMemo } from 'react';
import { MapPin, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { usePresenceStore } from '../../store/presenceStore';
import { locationsApi, type LocationTreeNode } from '../../api/locations';
import { telemetryApi } from '../../api/telemetry';
import BottomSheet from '../common/BottomSheet';
import type { LocationFloor } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Hierarchy types ───────────────────────────────────── */

interface HierarchyNode {
  id: string;
  label: string;
  children: HierarchyNode[];
}

/* ── Converters ────────────────────────────────────────── */

/** Convert a locations API tree into a flat LocationFloor[] (for the configured form fallback) */
function treeToFloors(tree: LocationTreeNode[]): LocationFloor[] {
  const floors: LocationFloor[] = [];
  function walk(nodes: LocationTreeNode[]) {
    for (const node of nodes) {
      if (node.type === 'floor') {
        const rooms: { id: string; label: string }[] = [];
        for (const child of node.children) {
          if (child.type === 'room') {
            rooms.push({ id: child.id, label: child.name });
          } else if (child.type === 'block_or_wing') {
            for (const gc of child.children) {
              if (gc.type === 'room') rooms.push({ id: gc.id, label: gc.name });
            }
          }
        }
        if (rooms.length > 0) floors.push({ id: node.id, label: node.name, rooms });
      } else if (node.type === 'building') {
        walk(node.children);
      } else if (node.type === 'block_or_wing') {
        const rooms = node.children.filter((c) => c.type === 'room').map((c) => ({ id: c.id, label: c.name }));
        if (rooms.length > 0) floors.push({ id: node.id, label: node.name, rooms });
      }
    }
  }
  walk(tree);
  floors.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return floors;
}

/** Build a multi-level hierarchy from telemetry zone codes.
 *  Zone codes like "1-W-560" are parsed as floor-wing-room.
 *  Returns a tree: Floor → Wing → Room (leaf nodes have empty children).
 */
function buildHierarchyFromReadings(
  readings: { floor: string | null; zone: string | null }[],
): { levels: string[]; roots: HierarchyNode[] } {
  // Collect unique zones
  const zones = new Set<string>();
  for (const r of readings) {
    if (r.zone) zones.add(r.zone);
  }

  // Detect if zones follow {floor}-{wing}-{room} pattern
  const parsed: { floor: string; wing: string; room: string; zone: string }[] = [];
  let hasWings = false;
  for (const z of zones) {
    const parts = z.split('-');
    if (parts.length >= 3) {
      parsed.push({ floor: parts[0], wing: parts[1], room: parts.slice(2).join('-'), zone: z });
      hasWings = true;
    } else if (parts.length === 2) {
      parsed.push({ floor: parts[0], wing: '', room: parts[1], zone: z });
    } else {
      parsed.push({ floor: '', wing: '', room: z, zone: z });
    }
  }

  if (!hasWings || parsed.length === 0) {
    // No wing structure — fall back to flat floor → room
    const floorMap = new Map<string, string[]>();
    for (const p of parsed) {
      const key = p.floor || 'default';
      if (!floorMap.has(key)) floorMap.set(key, []);
      floorMap.get(key)!.push(p.zone);
    }
    const roots: HierarchyNode[] = [];
    for (const [f, roomZones] of floorMap) {
      roots.push({
        id: f,
        label: f === 'default' ? 'Default' : `Floor ${f}`,
        children: roomZones.sort().map((z) => ({ id: z, label: z, children: [] })),
      });
    }
    roots.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    return { levels: ['Floor', 'Room'], roots };
  }

  // Build Floor → Wing → Room tree
  const floorMap = new Map<string, Map<string, string[]>>();
  for (const p of parsed) {
    if (!floorMap.has(p.floor)) floorMap.set(p.floor, new Map());
    const wingMap = floorMap.get(p.floor)!;
    if (!wingMap.has(p.wing)) wingMap.set(p.wing, []);
    wingMap.get(p.wing)!.push(p.zone);
  }

  const roots: HierarchyNode[] = [];
  for (const [floor, wingMap] of floorMap) {
    const wingNodes: HierarchyNode[] = [];
    for (const [wing, roomZones] of wingMap) {
      wingNodes.push({
        id: `${floor}-${wing}`,
        label: `Wing ${wing}`,
        children: roomZones.sort().map((z) => {
          // Show just the room number as label
          const parts = z.split('-');
          const roomNum = parts.length >= 3 ? parts.slice(2).join('-') : z;
          return { id: z, label: `Room ${roomNum}`, children: [] };
        }),
      });
    }
    wingNodes.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    roots.push({
      id: floor,
      label: `Floor ${floor}`,
      children: wingNodes,
    });
  }

  roots.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return { levels: ['Floor', 'Wing', 'Room'], roots };
}

/* ── Component ─────────────────────────────────────────── */

export default function LocationQuickPicker({ isOpen, onClose }: Props) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const setLocation = usePresenceStore((s) => s.setLocation);
  const currentFloorId = usePresenceStore((s) => s.floor);
  const currentRoomId = usePresenceStore((s) => s.room);
  const { locationForm, fetchLocationForm } = useBuildingStore();

  const [loading, setLoading] = useState(false);
  // Navigation path through the hierarchy: each entry is a selected node
  const [path, setPath] = useState<HierarchyNode[]>([]);
  const [hierarchy, setHierarchy] = useState<{ levels: string[]; roots: HierarchyNode[] } | null>(null);

  useEffect(() => {
    if (!isOpen || !activeBuilding) return;

    let cancelled = false;
    setLoading(true);
    setPath([]);
    setHierarchy(null);

    (async () => {
      try {
        // 1. Try configured location form (2-level: floor → room)
        await fetchLocationForm(activeBuilding.id);
        const form = useBuildingStore.getState().locationForm;
        if (cancelled) return;
        if (form && form.floors && form.floors.length > 0) {
          // Convert to hierarchy
          const roots: HierarchyNode[] = form.floors.map((f) => ({
            id: f.id,
            label: f.label,
            children: f.rooms.map((r) => ({ id: r.id, label: r.label, children: [] })),
          }));
          setHierarchy({ levels: ['Floor', 'Room'], roots });
          return;
        }

        // 2. Try locations API tree
        try {
          const tree = await locationsApi.tree(activeBuilding.id);
          if (cancelled) return;
          const fromTree = treeToFloors(tree);
          if (fromTree.length > 0) {
            const roots: HierarchyNode[] = fromTree.map((f) => ({
              id: f.id,
              label: f.label,
              children: f.rooms.map((r) => ({ id: r.id, label: r.label, children: [] })),
            }));
            setHierarchy({ levels: ['Floor', 'Room'], roots });
            return;
          }
        } catch { /* continue */ }

        // 3. Fallback: derive multi-level hierarchy from telemetry data
        if (cancelled) return;
        try {
          const latest = await telemetryApi.latest(activeBuilding.id);
          if (cancelled) return;
          setHierarchy(buildHierarchyFromReadings(latest));
        } catch { /* nothing */ }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Current view: the nodes at the current level
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

  const currentLevelLabel = hierarchy
    ? hierarchy.levels[path.length] ?? 'Location'
    : 'Location';

  const isLeafLevel = currentNodes.length > 0 && currentNodes[0].children.length === 0;

  const handleSelect = (node: HierarchyNode) => {
    if (node.children.length === 0) {
      // Leaf — this is the room/zone selection
      // Build floor label from path
      const floorNode = path[0];
      const floorId = floorNode?.id ?? 'default';
      const floorLabel = floorNode?.label ?? 'Default';
      setLocation(floorId, floorLabel, node.id, node.label);
      onClose();
    } else {
      // Drill down
      setPath([...path, node]);
    }
  };

  const handleBack = () => {
    setPath(path.slice(0, -1));
  };

  const handleDefaultLocation = () => {
    setLocation('default', 'Default', 'default', 'Default');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Change Location">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Back button */}
          {path.length > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back{path.length > 0 ? ` to ${hierarchy?.levels[path.length - 1] ?? ''}` : ''}
            </button>
          )}

          {/* Breadcrumb */}
          {path.length > 0 && (
            <div className="text-[10px] text-slate-400 px-1 mb-1">
              {path.map((p) => p.label).join(' › ')}
            </div>
          )}

          {/* Level label */}
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
                        {childCount} {hierarchy?.levels[path.length + 1]?.toLowerCase() ?? 'item'}{childCount === 1 ? '' : 's'}
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
