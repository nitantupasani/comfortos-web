import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Loader2, ChevronDown, RefreshCw, Search, X, Check } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { telemetryApi, type TelemetryQueryResponse } from '../../api/telemetry';

/* ── Constants ──────────────────────────────────────────── */

const TIME_RANGES = [
  { label: 'Last 6 hours', hours: 6, granularity: 'raw' as const },
  { label: 'Last 24 hours', hours: 24, granularity: 'hourly' as const },
];

const SERIES_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

type GroupLevel = 'floor' | 'wing' | 'room';

/* ── Helpers ────────────────────────────────────────────── */

function toISOCompat(d: Date): string {
  return d.toISOString().replace('Z', '+00:00');
}

function formatTime(iso: string, granularity: string): string {
  const d = new Date(iso);
  if (granularity === 'raw') return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function cleanLabel(label: string): string {
  return label.replace(/^0\s*\/\s*/, '');
}

/** A reading of exactly 0 °C means an offline/faulty sensor — treat as missing. */
function isLivePoint(value: number): boolean {
  return value !== 0;
}

/** A series with no non-zero readings is a dead sensor; hide it entirely. */
function seriesHasData(points: { value: number }[]): boolean {
  return points.some((p) => isLivePoint(p.value));
}

/* ── Component ──────────────────────────────────────────── */

export default function EnvironmentData() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [rangeIdx, setRangeIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupLevel>('floor');
  const [availableLevels, setAvailableLevels] = useState<GroupLevel[]>(['floor', 'wing', 'room']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryQueryResponse | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);

  // Room search dropdown (room mode)
  const [roomQuery, setRoomQuery] = useState('');
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const roomPickerRef = useRef<HTMLDivElement | null>(null);

  const range = TIME_RANGES[rangeIdx];

  // Which grouping levels does this building actually support? Buildings with
  // no wing structure must not show a "By Wing" toggle.
  useEffect(() => {
    if (!activeBuilding || !token) return;
    let cancelled = false;
    telemetryApi
      .groupingLevels(activeBuilding.id)
      .then((res) => {
        if (cancelled) return;
        const keys = res.levels
          .map((l) => l.key)
          .filter((k): k is GroupLevel => k === 'floor' || k === 'wing' || k === 'room');
        const ordered = (['floor', 'wing', 'room'] as GroupLevel[]).filter((g) => keys.includes(g));
        const levels = ordered.length > 0 ? ordered : (['room'] as GroupLevel[]);
        setAvailableLevels(levels);
        setGroupBy((prev) => (levels.includes(prev) ? prev : levels[0]));
      })
      .catch(() => { /* keep defaults */ });
    return () => { cancelled = true; };
  }, [activeBuilding?.id, token]);

  // Close the room search dropdown on outside click.
  useEffect(() => {
    if (!roomPickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (roomPickerRef.current && !roomPickerRef.current.contains(e.target as Node)) {
        setRoomPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [roomPickerOpen]);

  const fetchData = useCallback(async () => {
    if (!activeBuilding) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const from = new Date(now.getTime() - range.hours * 60 * 60 * 1000);
      const result = await telemetryApi.series(activeBuilding.id, {
        metricType: 'temperature',
        dateFrom: toISOCompat(from),
        dateTo: toISOCompat(now),
        granularity: range.granularity,
        groupBy,
      });
      setData(result);
      // Room view starts empty (user picks via search); floor/wing start with
      // every live series selected. Dead sensors (all-zero) are never selected.
      const liveKeys = result.series
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => seriesHasData(s.points))
        .map(({ i }) => `s${i}`);
      setSelectedRooms(groupBy === 'room' ? new Set() : new Set(liveKeys));
      setRoomQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [activeBuilding?.id, range, groupBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeBuilding || !token || !user) return;
    fetchData();
  }, [activeBuilding?.id, token, user?.id, rangeIdx, groupBy, retryCount, fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build chart data — for room view, only include selected rooms
  const { chartData, seriesKeys, seriesLabels, hourTicks, halfHourTicks } = useMemo(() => {
    const empty = { chartData: [] as Record<string, number | string>[], seriesKeys: [] as string[], seriesLabels: {} as Record<string, string>, hourTicks: [] as number[], halfHourTicks: [] as number[] };
    if (!data || data.series.length === 0) return empty;

    // All modes filter by the selected-series set (floor/wing default to all).
    const visibleSeries = data.series.filter((_, i) => selectedRooms.has(`s${i}`));

    if (visibleSeries.length === 0) return empty;

    const labels: Record<string, string> = {};
    const timeMap = new Map<string, Record<string, number | string>>();

    visibleSeries.forEach((s) => {
      const origIdx = data.series.indexOf(s);
      const key = `s${origIdx}`;
      labels[key] = cleanLabel(s.locationName || s.label);
      for (const pt of s.points) {
        if (!isLivePoint(pt.value)) continue; // drop 0 °C fault readings
        const existing = timeMap.get(pt.recordedAt) || { time: pt.recordedAt, _ts: new Date(pt.recordedAt).getTime() };
        existing[key] = pt.value;
        timeMap.set(pt.recordedAt, existing);
      }
    });

    const sorted = Array.from(timeMap.values()).sort(
      (a, b) => (a._ts as number) - (b._ts as number),
    );

    // Compute hourly and half-hourly ticks
    const hours: number[] = [];
    const halves: number[] = [];
    if (sorted.length > 0) {
      const minTs = sorted[0]._ts as number;
      const maxTs = sorted[sorted.length - 1]._ts as number;
      const startHour = new Date(minTs);
      startHour.setMinutes(0, 0, 0);
      for (let t = startHour.getTime(); t <= maxTs + 3600000; t += 3600000) {
        hours.push(t);
        halves.push(t + 1800000);
      }
    }

    const keys = visibleSeries.map((s) => `s${data.series.indexOf(s)}`);
    return { chartData: sorted, seriesKeys: keys, seriesLabels: labels, hourTicks: hours, halfHourTicks: halves };
  }, [data, groupBy, selectedRooms]);

  const toggleRoom = (key: string) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (!activeBuilding) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <MapPin className="h-10 w-10 mb-3" />
        <p className="text-sm">Select a building first</p>
      </div>
    );
  }

  const showChart = selectedRooms.size > 0;
  const levelNoun = groupBy === 'room' ? 'rooms' : groupBy === 'wing' ? 'wings' : 'floors';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Temperature</h1>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
          >
            {range.label}
            <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {TIME_RANGES.map((r, idx) => (
                <button
                  key={r.label}
                  onClick={() => { setRangeIdx(idx); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-medium ${idx === rangeIdx ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group-by toggle — only levels this building supports */}
      {availableLevels.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {availableLevels.map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                groupBy === g ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {g === 'floor' ? 'By Floor' : g === 'wing' ? 'By Wing' : 'By Room'}
            </button>
          ))}
        </div>
      )}

      {/* Series selector */}
      {!loading && data && data.series.length > 0 && (
        groupBy === 'room' ? (
          /* Room mode: searchable dropdown + removable selected chips */
          <div className="space-y-2" ref={roomPickerRef}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1">
              Select rooms to compare
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={roomQuery}
                  onChange={(e) => { setRoomQuery(e.target.value); setRoomPickerOpen(true); }}
                  onFocus={() => setRoomPickerOpen(true)}
                  placeholder="Search rooms…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
              {roomPickerOpen && (
                <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {(() => {
                    const opts = data.series
                      .map((s, idx) => ({ s, key: `s${idx}`, idx, label: cleanLabel(s.locationName || s.label) }))
                      .filter((o) => seriesHasData(o.s.points) && o.label.toLowerCase().includes(roomQuery.trim().toLowerCase()));
                    if (opts.length === 0) {
                      return <div className="px-4 py-3 text-xs text-slate-400">No rooms match “{roomQuery}”</div>;
                    }
                    return opts.map((o) => {
                      const active = selectedRooms.has(o.key);
                      return (
                        <button
                          key={o.key}
                          onClick={() => toggleRoom(o.key)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs hover:bg-slate-50"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: active ? SERIES_COLORS[o.idx % SERIES_COLORS.length] : '#cbd5e1' }}
                          />
                          <span className="flex-1 truncate text-slate-700">{o.label}</span>
                          {active && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
            {selectedRooms.size > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.series.map((s, idx) => {
                  const key = `s${idx}`;
                  if (!selectedRooms.has(key)) return null;
                  return (
                    <span
                      key={key}
                      className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }} />
                      {cleanLabel(s.locationName || s.label)}
                      <button
                        onClick={() => toggleRoom(key)}
                        className="ml-0.5 text-emerald-500 hover:text-emerald-800"
                        aria-label={`Remove ${cleanLabel(s.locationName || s.label)}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Floor / Wing mode: checkboxes to show/hide each series */
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1">
              {groupBy === 'wing' ? 'Wings' : 'Floors'}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.series
                .map((s, idx) => ({ s, idx }))
                .filter(({ s }) => seriesHasData(s.points))
                .map(({ s, idx }) => {
                const key = `s${idx}`;
                const active = selectedRooms.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleRoom(key)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      active
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                        active ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {active && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }} />
                    {cleanLabel(s.locationName || s.label)}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Chart */}
      <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-[280px]">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 h-[280px]">
            <p className="text-xs text-red-400 text-center px-4">{error}</p>
            <button onClick={() => setRetryCount((c) => c + 1)} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        ) : !showChart ? (
          <div className="flex items-center justify-center h-[280px] text-xs text-slate-400">
            Select one or more {levelNoun} above to view their charts
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-xs text-slate-400">
            No temperature data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid horizontal={false} vertical={false} />
              <XAxis
                dataKey="_ts"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={hourTicks}
                tickFormatter={(ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={[16, 28]} ticks={[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]} unit="°" />
              {/* Vertical hourly gridlines */}
              {hourTicks.map((t) => (
                <ReferenceLine key={`xh-${t}`} x={t} stroke="#e2e8f0" strokeWidth={1} />
              ))}
              {/* Vertical half-hour gridlines (dashed, subtler) */}
              {halfHourTicks.map((t) => (
                <ReferenceLine key={`xhh-${t}`} x={t} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth={1} />
              ))}
              {/* Horizontal integer gridlines */}
              {Array.from({ length: 13 }, (_, i) => 16 + i).map((v) => (
                <ReferenceLine key={`int-${v}`} y={v} stroke="#e2e8f0" strokeWidth={1} />
              ))}
              {/* Horizontal half-degree gridlines (dashed, subtler) */}
              {Array.from({ length: 12 }, (_, i) => 16.5 + i).map((v) => (
                <ReferenceLine key={`half-${v}`} y={v} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth={1} />
              ))}
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, padding: '8px 12px' }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                labelFormatter={(ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                formatter={(value: number, name: string) => [`${value.toFixed(1)}°C`, seriesLabels[name] || name]}
              />
              {seriesKeys.map((key) => {
                const idx = parseInt(key.slice(1));
                return (
                  <Line key={key} type="monotone" dataKey={key} name={key} stroke={SERIES_COLORS[idx % SERIES_COLORS.length]} strokeWidth={2} dot={false} connectNulls />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
