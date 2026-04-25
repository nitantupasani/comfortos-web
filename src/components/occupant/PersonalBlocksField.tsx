import { Trash2, Plus, ChevronDown } from 'lucide-react';
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

/** Integer floor range users can pick from. Includes basements
 * (-5..-1), ground (0), and aboveground floors. Wide enough for any
 * realistic personal building. */
const MIN_FLOOR = -5;
const MAX_FLOOR = 50;

function floorOptionsFrom(min: number): number[] {
  const out: number[] = [];
  for (let f = min; f <= MAX_FLOOR; f++) out.push(f);
  return out;
}

const ALL_FLOOR_OPTIONS: number[] = floorOptionsFrom(MIN_FLOOR);

function floorLabel(n: number): string {
  if (n === 0) return '0 (Ground)';
  if (n < 0) return `${n} (Basement)`;
  return String(n);
}

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
    onChange(rows.map((r, i) => {
      if (i !== idx) return r;
      const next = { ...r, ...patch };
      // If start moves above end, drag end up to match.
      const startNum = parseInt(next.startFloor, 10);
      const endNum = parseInt(next.endFloor, 10);
      if (Number.isFinite(startNum) && Number.isFinite(endNum) && endNum < startNum) {
        next.endFloor = next.startFloor;
      }
      return next;
    }));
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
      {rows.map((row, idx) => {
        const startNum = parseInt(row.startFloor, 10);
        const endOptions = Number.isFinite(startNum)
          ? floorOptionsFrom(startNum)
          : ALL_FLOOR_OPTIONS;
        return (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 space-y-2"
          >
            {/* Row 1: block name */}
            <div>
              <input
                type="text"
                placeholder="Block name (e.g. Main)"
                value={row.name}
                onChange={(e) => update(idx, { name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                maxLength={50}
              />
              <div className="mt-1 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Block name
              </div>
            </div>

            {/* Row 2: start floor / end floor / delete */}
            <div className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
              <div>
                <div className="relative">
                  <select
                    value={row.startFloor}
                    onChange={(e) => update(idx, { startFloor: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-7 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none"
                  >
                    {ALL_FLOOR_OPTIONS.map((f) => (
                      <option key={f} value={f}>{floorLabel(f)}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-1 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Start floor
                </div>
              </div>
              <div>
                <div className="relative">
                  <select
                    value={row.endFloor}
                    onChange={(e) => update(idx, { endFloor: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-7 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none"
                  >
                    {endOptions.map((f) => (
                      <option key={f} value={f}>{floorLabel(f)}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-1 px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  End floor
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                disabled={rows.length === 1}
                className="self-start mt-0.5 rounded-full p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                title="Remove block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
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
        For each block, pick the lowest and highest floor numbers. Negative numbers are basement levels.
      </p>
    </div>
  );
}
