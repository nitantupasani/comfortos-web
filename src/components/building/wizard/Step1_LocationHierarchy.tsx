import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useBuildingWizardStore, type FloorEntry } from '../../../store/buildingWizardStore';

export default function Step1_LocationHierarchy() {
  const { floors, setFloors } = useBuildingWizardStore();
  const [quickFloorCount, setQuickFloorCount] = useState('');
  const [quickRoomCount, setQuickRoomCount] = useState('');
  const [quickRoomPrefix, setQuickRoomPrefix] = useState('Room');
  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'quick' | 'manual'>(floors.length > 0 ? 'manual' : 'quick');

  const toggleFloor = (idx: number) => {
    setExpandedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleQuickGenerate = () => {
    const numFloors = parseInt(quickFloorCount) || 0;
    const numRooms = parseInt(quickRoomCount) || 0;
    if (numFloors <= 0) return;

    const generated: FloorEntry[] = [];
    for (let f = 1; f <= numFloors; f++) {
      const rooms: { name: string; code: string }[] = [];
      for (let r = 1; r <= numRooms; r++) {
        const roomNum = f * 100 + r;
        rooms.push({
          name: `${quickRoomPrefix} ${roomNum}`,
          code: `${roomNum}`,
        });
      }
      generated.push({
        name: `Floor ${f}`,
        code: `F${f}`,
        rooms,
      });
    }
    setFloors(generated);
    setMode('manual');
    // Expand all
    setExpandedFloors(new Set(generated.map((_, i) => i)));
  };

  const addFloor = () => {
    const idx = floors.length + 1;
    setFloors([...floors, { name: `Floor ${idx}`, code: `F${idx}`, rooms: [] }]);
    setExpandedFloors((prev) => new Set([...prev, floors.length]));
  };

  const removeFloor = (idx: number) => {
    setFloors(floors.filter((_, i) => i !== idx));
  };

  const updateFloor = (idx: number, patch: Partial<FloorEntry>) => {
    setFloors(floors.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const addRoom = (floorIdx: number) => {
    const floor = floors[floorIdx];
    const roomNum = (floorIdx + 1) * 100 + floor.rooms.length + 1;
    updateFloor(floorIdx, {
      rooms: [...floor.rooms, { name: `Room ${roomNum}`, code: `${roomNum}` }],
    });
    setExpandedFloors((prev) => new Set([...prev, floorIdx]));
  };

  const removeRoom = (floorIdx: number, roomIdx: number) => {
    const floor = floors[floorIdx];
    updateFloor(floorIdx, {
      rooms: floor.rooms.filter((_, i) => i !== roomIdx),
    });
  };

  const updateRoom = (floorIdx: number, roomIdx: number, patch: { name?: string; code?: string }) => {
    const floor = floors[floorIdx];
    updateFloor(floorIdx, {
      rooms: floor.rooms.map((r, i) => (i === roomIdx ? { ...r, ...patch } : r)),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Location Hierarchy</h3>
        <p className="text-sm text-gray-500 mt-1">
          Define floors and rooms. You can auto-generate or add manually.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('quick')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            mode === 'quick' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Quick Setup
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            mode === 'manual' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Manual
        </button>
      </div>

      {mode === 'quick' && (
        <div className="space-y-4 bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Number of Floors</label>
              <input
                type="number"
                min="1"
                max="100"
                value={quickFloorCount}
                onChange={(e) => setQuickFloorCount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rooms per Floor</label>
              <input
                type="number"
                min="0"
                max="100"
                value={quickRoomCount}
                onChange={(e) => setQuickRoomCount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Room Prefix</label>
              <input
                type="text"
                value={quickRoomPrefix}
                onChange={(e) => setQuickRoomPrefix(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Room"
              />
            </div>
          </div>
          <button
            onClick={handleQuickGenerate}
            disabled={!quickFloorCount || parseInt(quickFloorCount) <= 0}
            className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            Generate Floors & Rooms
          </button>
        </div>
      )}

      {/* Floor/Room editor */}
      <div className="space-y-2">
        {floors.map((floor, fIdx) => (
          <div key={fIdx} className="border rounded-xl bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button onClick={() => toggleFloor(fIdx)} className="text-gray-400 hover:text-gray-600">
                {expandedFloors.has(fIdx) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-green-600">
                {floor.code || `F${fIdx + 1}`}
              </div>
              <input
                value={floor.name}
                onChange={(e) => updateFloor(fIdx, { name: e.target.value })}
                className="flex-1 text-sm font-medium text-gray-800 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-1"
              />
              <span className="text-xs text-gray-400">{floor.rooms.length} rooms</span>
              <button
                onClick={() => addRoom(fIdx)}
                className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                title="Add room"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => removeFloor(fIdx)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {expandedFloors.has(fIdx) && floor.rooms.length > 0 && (
              <div className="border-t bg-gray-50/50 px-3 py-2 space-y-1">
                {floor.rooms.map((room, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2 pl-8">
                    <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center justify-center">
                      R
                    </div>
                    <input
                      value={room.name}
                      onChange={(e) => updateRoom(fIdx, rIdx, { name: e.target.value })}
                      className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none focus:bg-white rounded px-1"
                    />
                    <input
                      value={room.code}
                      onChange={(e) => updateRoom(fIdx, rIdx, { code: e.target.value })}
                      className="w-16 text-xs text-gray-400 font-mono bg-transparent border-none outline-none focus:bg-white rounded px-1 text-right"
                      placeholder="Code"
                    />
                    <button
                      onClick={() => removeRoom(fIdx, rIdx)}
                      className="p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addFloor}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Floor
        </button>
      </div>

      {floors.length > 0 && (
        <div className="text-xs text-gray-400 text-right">
          {floors.length} floor{floors.length !== 1 ? 's' : ''},{' '}
          {floors.reduce((sum, f) => sum + f.rooms.length, 0)} rooms total
        </div>
      )}
    </div>
  );
}
