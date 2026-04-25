import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useBuildingWizardStore, type FloorEntry } from '../../../store/buildingWizardStore';

interface BlockSetupRow {
  name: string;
  code: string;
  startFloor: string;
  endFloor: string;
  roomsPerFloor: string;
  roomPrefix: string;
}

const emptyBlockRow = (): BlockSetupRow => ({
  name: '',
  code: '',
  startFloor: '1',
  endFloor: '1',
  roomsPerFloor: '0',
  roomPrefix: 'Room',
});

export default function Step1_LocationHierarchy() {
  const { floors, setFloors } = useBuildingWizardStore();
  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'blocks' | 'manual'>(floors.length > 0 ? 'manual' : 'blocks');
  const [blockRows, setBlockRows] = useState<BlockSetupRow[]>(() => [
    { name: 'Main', code: 'MAIN', startFloor: '1', endFloor: '1', roomsPerFloor: '0', roomPrefix: 'Room' },
  ]);

  const toggleFloor = (idx: number) => {
    setExpandedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const updateBlockRow = (idx: number, patch: Partial<BlockSetupRow>) => {
    setBlockRows(blockRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const addBlockRow = () => setBlockRows([...blockRows, emptyBlockRow()]);
  const removeBlockRow = (idx: number) => {
    if (blockRows.length === 1) return;
    setBlockRows(blockRows.filter((_, i) => i !== idx));
  };

  /** Generate floors[] from the current block rows, parenting each
   * floor to its block via blockName/blockCode. Each room gets a
   * unique code by combining the block code + floor + index. */
  const handleGenerate = () => {
    const generated: FloorEntry[] = [];
    for (const block of blockRows) {
      const name = block.name.trim();
      if (!name) continue;
      const start = parseInt(block.startFloor, 10);
      const end = parseInt(block.endFloor, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      if (end < start) continue;
      const roomsPerFloor = Math.max(0, parseInt(block.roomsPerFloor, 10) || 0);
      const prefix = block.roomPrefix.trim() || 'Room';
      const blockCode = block.code.trim() || name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
      for (let f = start; f <= end; f++) {
        const floorCode = `${blockCode}-${f}`;
        const rooms: { name: string; code: string }[] = [];
        for (let r = 1; r <= roomsPerFloor; r++) {
          const num = Math.abs(f) * 100 + r;
          rooms.push({
            name: `${prefix} ${blockCode}${num}`,
            code: `${blockCode}-${num}`,
          });
        }
        generated.push({
          name: `${name} · Floor ${f}`,
          code: floorCode,
          rooms,
          blockName: name,
          blockCode,
        });
      }
    }
    if (generated.length === 0) return;
    setFloors(generated);
    setMode('manual');
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

  const blockSummary = (() => {
    const counts = new Map<string, number>();
    for (const f of floors) {
      const key = f.blockName ?? '—';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  })();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Building structure</h3>
        <p className="text-sm text-gray-500 mt-1">
          Define each block (e.g. Main, East Wing) with the range of floors it has.
          The wizard creates block → floor → room nodes for you. Use Manual to fine-tune afterward.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('blocks')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            mode === 'blocks' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          By Block
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

      {mode === 'blocks' && (
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500">
            Add one row per block. Negative floors are allowed for basements.
          </div>

          <div className="space-y-2">
            {/* Header row */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_72px_72px_96px_1.2fr_36px] gap-1.5 px-1 text-[10px] font-semibold uppercase text-gray-400">
              <span>Block name</span>
              <span>Code</span>
              <span>Start</span>
              <span>End</span>
              <span>Rooms / floor</span>
              <span>Room label prefix</span>
              <span></span>
            </div>

            {blockRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_72px_72px_96px_1.2fr_36px] gap-1.5 items-center"
              >
                <input
                  type="text"
                  placeholder="e.g. Main, East Wing"
                  value={row.name}
                  onChange={(e) => updateBlockRow(idx, { name: e.target.value })}
                  className="border rounded-lg px-2 py-1.5 text-sm"
                  maxLength={50}
                />
                <input
                  type="text"
                  placeholder="MAIN"
                  value={row.code}
                  onChange={(e) => updateBlockRow(idx, { code: e.target.value })}
                  className="border rounded-lg px-2 py-1.5 text-sm font-mono"
                  maxLength={10}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={row.startFloor}
                  onChange={(e) => updateBlockRow(idx, { startFloor: e.target.value })}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full"
                  title="Lowest floor (use 0 for ground, negative for basements)"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={row.endFloor}
                  onChange={(e) => updateBlockRow(idx, { endFloor: e.target.value })}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full"
                  title="Highest floor"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  value={row.roomsPerFloor}
                  onChange={(e) => updateBlockRow(idx, { roomsPerFloor: e.target.value })}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full"
                  title="How many rooms each floor of this block has (uniform)"
                />
                <input
                  type="text"
                  value={row.roomPrefix}
                  onChange={(e) => updateBlockRow(idx, { roomPrefix: e.target.value })}
                  className="border rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Room"
                  maxLength={20}
                />
                <button
                  onClick={() => removeBlockRow(idx)}
                  disabled={blockRows.length === 1}
                  className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={addBlockRow}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600"
            >
              <Plus className="h-3.5 w-3.5" /> Add block
            </button>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-primary-700"
            >
              Generate floors &amp; rooms
            </button>
            <span className="text-[11px] text-gray-400">
              You can switch to Manual after generating to tweak names or add extras.
            </span>
          </div>
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
              {floor.blockName && (
                <span className="text-[10px] font-semibold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {floor.blockName}
                </span>
              )}
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
        <div className="flex flex-wrap justify-end gap-2 text-xs text-gray-400">
          {blockSummary.map(([block, count]) => (
            <span key={block} className="rounded-full bg-gray-100 px-2.5 py-0.5">
              {block === '—' ? 'Unblocked' : block}: {count} floor{count === 1 ? '' : 's'}
            </span>
          ))}
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5">
            {floors.reduce((s, f) => s + f.rooms.length, 0)} rooms total
          </span>
        </div>
      )}
    </div>
  );
}
