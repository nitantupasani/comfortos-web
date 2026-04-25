import { Trash2, Plus } from 'lucide-react';
import type { PersonalBlockSpec } from '../../api/buildings';

interface BlockRow {
  name: string;
  startFloor: string;
  endFloor: string;
}

interface Props {
  rows: BlockRow[];
  onChange: (rows: BlockRow[]) => void;
  maxBlocks?: number;
}

export const EMPTY_BLOCK_ROW: BlockRow = { name: '', startFloor: '', endFloor: '' };

export function emptyBlockRows(): BlockRow[] {
  return [{ name: 'Main', startFloor: '1', endFloor: '1' }];
}

export type { BlockRow };

/** Normalize block rows to the API payload shape, dropping invalid entries. */
export function blockRowsToPayload(rows: BlockRow[]): PersonalBlockSpec[] {
  const out: PersonalBlockSpec[] = [];
  for (const r of rows) {
    const name = r.name.trim();
    if (!name) continue;
    const startFloor = parseInt(r.startFloor, 10);
    const endFloor = parseInt(r.endFloor, 10);
    if (!Number.isFinite(startFloor) || !Number.isFinite(endFloor)) continue;
    if (endFloor < startFloor) continue;
    out.push({ name, startFloor, endFloor });
  }
  return out;
}

export default function PersonalBlocksField({ rows, onChange, maxBlocks = 10 }: Props) {
  const update = (idx: number, patch: Partial<BlockRow>) => {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const remove = (idx: number) => {
    onChange(rows.filter((_, i) => i !== idx));
  };
  const add = () => {
    if (rows.length >= maxBlocks) return;
    onChange([...rows, { ...EMPTY_BLOCK_ROW }]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="text-[11px] font-semibold text-slate-700">
          Building blocks / wings
        </div>
        <span className="text-[10px] text-slate-400">
          {rows.length} of {maxBlocks}
        </span>
      </div>
      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-400">
          Add at least one block (e.g. Main, East Wing).
        </div>
      )}
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-1.5 items-center">
          <input
            type="text"
            placeholder="Block name (e.g. A)"
            value={row.name}
            onChange={(e) => update(idx, { name: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
            maxLength={50}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Start"
            value={row.startFloor}
            onChange={(e) => update(idx, { startFloor: e.target.value })}
            className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
            title="Lowest floor in this block (e.g. 0 for ground, -1 for basement)"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="End"
            value={row.endFloor}
            onChange={(e) => update(idx, { endFloor: e.target.value })}
            className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
            title="Highest floor in this block"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            disabled={rows.length === 1}
            className="rounded-full p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
            title="Remove block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {rows.length < maxBlocks && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Add block
        </button>
      )}
      <p className="px-1 text-[11px] text-slate-400">
        For each block, give the lowest and highest floor numbers. Use 0 for ground, negatives for basement levels.
      </p>
    </div>
  );
}
