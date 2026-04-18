import { useEffect, useState } from 'react';
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

/* ── Converters ────────────────────────────────────────── */

/** Convert a locations API tree into LocationFloor[] */
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
        const rooms = node.children
          .filter((c) => c.type === 'room')
          .map((c) => ({ id: c.id, label: c.name }));
        if (rooms.length > 0) floors.push({ id: node.id, label: node.name, rooms });
      }
    }
  }

  walk(tree);
  floors.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return floors;
}

/** Derive LocationFloor[] from telemetry latest readings (floor + zone fields) */
function latestReadingsToFloors(
  readings: { floor: string | null; zone: string | null }[],
): LocationFloor[] {
  const floorMap = new Map<string, Set<string>>();

  for (const r of readings) {
    const floorKey = r.floor || 'default';
    const zoneKey = r.zone || null;
    if (!zoneKey) continue;

    if (!floorMap.has(floorKey)) floorMap.set(floorKey, new Set());
    floorMap.get(floorKey)!.add(zoneKey);
  }

  const floors: LocationFloor[] = [];
  for (const [floorKey, zones] of floorMap) {
    const rooms = Array.from(zones)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((z) => ({ id: z, label: z }));
    floors.push({
      id: floorKey,
      label: floorKey === 'default' ? 'Default' : `Floor ${floorKey}`,
      rooms,
    });
  }

  floors.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return floors;
}

/* ── Component ─────────────────────────────────────────── */

export default function LocationQuickPicker({ isOpen, onClose }: Props) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const setLocation = usePresenceStore((s) => s.setLocation);
  const currentFloorId = usePresenceStore((s) => s.floor);
  const currentRoomId = usePresenceStore((s) => s.room);
  const { locationForm, fetchLocationForm } = useBuildingStore();

  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dynamicFloors, setDynamicFloors] = useState<LocationFloor[]>([]);

  useEffect(() => {
    if (!isOpen || !activeBuilding) return;

    let cancelled = false;
    setLoading(true);
    setSelectedFloor(null);
    setDynamicFloors([]);

    (async () => {
      try {
        // 1. Try configured location form
        await fetchLocationForm(activeBuilding.id);
        const form = useBuildingStore.getState().locationForm;
        if (cancelled) return;
        if (form && form.floors && form.floors.length > 0) return;

        // 2. Try locations API tree
        try {
          const tree = await locationsApi.tree(activeBuilding.id);
          if (cancelled) return;
          const fromTree = treeToFloors(tree);
          if (fromTree.length > 0) {
            setDynamicFloors(fromTree);
            return;
          }
        } catch {
          // locations table might be empty — continue to fallback
        }

        // 3. Fallback: derive from telemetry latest readings
        if (cancelled) return;
        try {
          const latest = await telemetryApi.latest(activeBuilding.id);
          if (cancelled) return;
          const fromTelemetry = latestReadingsToFloors(latest);
          setDynamicFloors(fromTelemetry);
        } catch {
          // nothing we can do
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use configured floors if available, otherwise use dynamic floors
  const configuredFloors = locationForm?.floors ?? [];
  const floors = configuredFloors.length > 0 ? configuredFloors : dynamicFloors;
  const currentFloor = floors.find((f) => f.id === selectedFloor);

  const handleRoomSelect = (roomId: string, roomLabel: string) => {
    const floor = floors.find((f) => f.id === selectedFloor)!;
    setLocation(floor.id, floor.label, roomId, roomLabel);
    onClose();
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
      ) : !selectedFloor ? (
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
            Select Floor
          </div>
          {floors.length === 0 ? (
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
            floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                  floor.id === currentFloorId
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-600">
                  {floor.label.replace(/[^0-9A-Za-z]/g, '').slice(0, 2) || 'F'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{floor.label}</div>
                  <div className="text-xs text-slate-400">
                    {floor.rooms.length} room{floor.rooms.length === 1 ? '' : 's'}
                  </div>
                </div>
                {floor.id === currentFloorId && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => setSelectedFloor(null)}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to floors
          </button>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
            {currentFloor?.label} — Select Room
          </div>
          {currentFloor?.rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomSelect(room.id, room.label)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                room.id === currentRoomId
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{room.label}</div>
              </div>
              {room.id === currentRoomId && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
