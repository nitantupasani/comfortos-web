import { useEffect, useState } from 'react';
import { MapPin, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { usePresenceStore } from '../../store/presenceStore';
import { locationsApi, type LocationTreeNode } from '../../api/locations';
import BottomSheet from '../common/BottomSheet';
import type { LocationFloor } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Convert a locations API tree into the LocationFloor[] format the picker expects */
function treeToFloors(tree: LocationTreeNode[]): LocationFloor[] {
  const floors: LocationFloor[] = [];

  function walk(nodes: LocationTreeNode[], parentFloorId?: string, parentFloorLabel?: string) {
    for (const node of nodes) {
      if (node.type === 'floor') {
        const floor: LocationFloor = {
          id: node.id,
          label: node.name,
          rooms: [],
        };
        // Collect rooms directly under this floor
        for (const child of node.children) {
          if (child.type === 'room') {
            floor.rooms.push({ id: child.id, label: child.name });
          } else if (child.type === 'block_or_wing') {
            // Rooms nested under wings
            for (const grandchild of child.children) {
              if (grandchild.type === 'room') {
                floor.rooms.push({ id: grandchild.id, label: grandchild.name });
              }
            }
          }
        }
        if (floor.rooms.length > 0) {
          floors.push(floor);
        }
      } else if (node.type === 'building') {
        // Recurse into building root
        walk(node.children);
      } else if (node.type === 'block_or_wing') {
        // Wing at top level (no floor parent) — create a synthetic floor
        const rooms = node.children
          .filter((c) => c.type === 'room')
          .map((c) => ({ id: c.id, label: c.name }));
        if (rooms.length > 0) {
          floors.push({ id: node.id, label: node.name, rooms });
        }
      } else if (node.type === 'room' && parentFloorId) {
        // Room directly in a walk — already handled above
      }
    }
  }

  walk(tree);

  // Sort floors by label (natural sort for "Floor 1", "Floor 2", etc.)
  floors.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return floors;
}

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
    if (isOpen && activeBuilding) {
      setLoading(true);
      setSelectedFloor(null);
      setDynamicFloors([]);

      // Try the configured location form first, then fall back to locations API
      fetchLocationForm(activeBuilding.id)
        .then(async () => {
          const form = useBuildingStore.getState().locationForm;
          if (!form || form.floors.length === 0) {
            // No configured form — fetch from locations API
            try {
              const tree = await locationsApi.tree(activeBuilding.id);
              setDynamicFloors(treeToFloors(tree));
            } catch {
              setDynamicFloors([]);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, activeBuilding, fetchLocationForm]);

  // Use configured floors if available, otherwise use dynamic floors from API
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
