import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Loader2, ChevronDown, RefreshCw } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { telemetryApi, type TelemetryQueryResponse } from '../../api/telemetry';
import { locationsApi, type LocationNode } from '../../api/locations';

/* ── Constants ──────────────────────────────────────────── */

interface TimeRange {
  label: string;
  hours: number;
  granularity: 'raw' | 'hourly' | 'daily';
}

const DEFAULT_RANGES: TimeRange[] = [
  { label: 'Last 6 hours', hours: 6, granularity: 'raw' },
  { label: 'Last 24 hours', hours: 24, granularity: 'hourly' },
];

const SERIES_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

/* ── Helpers ────────────────────────────────────────────── */

/** Format a Date as ISO string without the trailing Z (Python < 3.11 compat) */
function toISOCompat(d: Date): string {
  return d.toISOString().replace('Z', '+00:00');
}

function formatTime(iso: string, granularity: string): string {
  const d = new Date(iso);
  if (granularity === 'raw') {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
}

function cleanLabel(label: string): string {
  return label.replace(/^0\s*\/\s*/, '');
}

/** User-friendly error message */
function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'Failed to fetch') {
      return 'Cannot reach the server. Check your connection.';
    }
    if (err.message.includes('expired') || err.message.includes('authenticated')) {
      return 'Session expired — please log in again.';
    }
    return err.message;
  }
  return 'Failed to load data';
}

/* ── Props ──────────────────────────────────────────────── */

export type ChartKind = 'line' | 'area' | 'bar';
export type Mode = 'zone' | 'floor' | 'wing' | 'room' | 'pick';

export interface TelemetryChartNodeProps {
  metricType?: string;
  title?: string;
  unit?: string;
  timeRanges?: TimeRange[];
  groupBy?: 'room' | 'floor' | 'wing';
  height?: number;
  chartKind?: ChartKind;
  /** Force an initial view mode. Falls back to groupBy → presence → 'floor'. */
  mode?: Mode;
  /** Hide the view-mode toggle (useful when comparing wings/floors). */
  lockMode?: boolean;
}

/* ── Component ──────────────────────────────────────────── */

const VIEW_LABELS: Record<Mode, string> = {
  zone: 'My Zone',
  floor: 'By Floor',
  wing: 'By Wing',
  room: 'All Rooms',
  pick: 'Pick Room',
};
const TOGGLE_MODES: Mode[] = ['zone', 'floor', 'wing'];

function deriveInitialMode(
  mode: Mode | undefined,
  groupBy: 'room' | 'floor' | 'wing' | undefined,
  hasUserRoom: boolean,
): Mode {
  if (mode) return mode;
  if (groupBy === 'wing') return 'wing';
  if (groupBy === 'floor') return 'floor';
  return hasUserRoom ? 'zone' : 'floor';
}

export default function TelemetryChartNode({
  metricType = 'temperature',
  title = 'Temperature',
  unit = '°C',
  timeRanges,
  groupBy,
  height = 240,
  chartKind = 'line',
  mode,
  lockMode = false,
}: TelemetryChartNodeProps) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const userRoom = usePresenceStore((s) => s.room);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const ranges = timeRanges ?? DEFAULT_RANGES;
  const [rangeIdx, setRangeIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<Mode>(
    deriveInitialMode(mode, groupBy, !!userRoom),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryQueryResponse | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Pick-mode: list of rooms + selected room id
  const [rooms, setRooms] = useState<LocationNode[]>([]);
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(userRoom ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const range = ranges[rangeIdx];

  // Fetch room list when in pick mode.
  useEffect(() => {
    if (viewMode !== 'pick' || !activeBuilding || !token) return;
    locationsApi
      .list(activeBuilding.id, 'room')
      .then((rs) => {
        const sorted = [...rs].sort((a, b) => a.sortOrder - b.sortOrder);
        setRooms(sorted);
        // If user's presence room missing or not yet picked, default to first.
        setPickedRoomId((curr) => {
          if (curr && sorted.some((r) => r.id === curr)) return curr;
          return sorted[0]?.id ?? null;
        });
      })
      .catch(() => setRooms([]));
  }, [viewMode, activeBuilding?.id, token]);

  // Derive actual API params from viewMode
  const effectiveGroupBy: 'room' | 'floor' | 'wing' =
    viewMode === 'wing' ? 'wing'
    : viewMode === 'floor' ? 'floor'
    : 'room';
  const effectiveLocationId =
    viewMode === 'zone' ? (userRoom ?? undefined)
    : viewMode === 'pick' ? (pickedRoomId ?? undefined)
    : undefined;

  const fetchData = useCallback(async (buildingId: string, r: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const from = new Date(now.getTime() - r.hours * 60 * 60 * 1000);
      const series = await telemetryApi.series(buildingId, {
        metricType,
        dateFrom: toISOCompat(from),
        dateTo: toISOCompat(now),
        granularity: r.granularity,
        groupBy: effectiveGroupBy,
        locationId: effectiveLocationId,
      });
      setData(series);
    } catch (err) {
      setData(null);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [metricType, effectiveGroupBy, effectiveLocationId]);

  useEffect(() => {
    // Wait for both building selection AND a valid auth session before fetching
    if (!activeBuilding || !token || !user) return;
    // In pick mode, hold off until a room is selected (avoid all-rooms flash).
    if (viewMode === 'pick' && !pickedRoomId) return;
    fetchData(activeBuilding.id, range);
  }, [activeBuilding?.id, token, user?.id, rangeIdx, retryCount, viewMode, pickedRoomId, fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => setRetryCount((c) => c + 1);

  // Build chart data
  const { chartData, seriesKeys, seriesLabels, hourTicks, halfHourTicks } = useMemo(() => {
    const empty = { chartData: [] as Record<string, number | string>[], seriesKeys: [] as string[], seriesLabels: {} as Record<string, string>, hourTicks: [] as number[], halfHourTicks: [] as number[] };
    if (!data || data.series.length === 0) return empty;

    const labels: Record<string, string> = {};
    const timeMap = new Map<string, Record<string, number | string>>();
    data.series.forEach((s, idx) => {
      const key = `s${idx}`;
      labels[key] = cleanLabel(s.locationName || s.label);
      for (const pt of s.points) {
        const existing = timeMap.get(pt.recordedAt) || { time: pt.recordedAt, _ts: new Date(pt.recordedAt).getTime() };
        existing[key] = pt.value;
        timeMap.set(pt.recordedAt, existing);
      }
    });
    const sorted = Array.from(timeMap.values()).sort(
      (a, b) => (a._ts as number) - (b._ts as number),
    );

    // Compute hourly and half-hourly ticks from data range
    const hours: number[] = [];
    const halves: number[] = [];
    if (sorted.length > 0) {
      const minTs = sorted[0]._ts as number;
      const maxTs = sorted[sorted.length - 1]._ts as number;
      // Start from the first full hour at or before minTs
      const startHour = new Date(minTs);
      startHour.setMinutes(0, 0, 0);
      for (let t = startHour.getTime(); t <= maxTs + 3600000; t += 3600000) {
        hours.push(t);
        halves.push(t + 1800000); // :30
      }
    }

    return { chartData: sorted, seriesKeys: data.series.map((_, i) => `s${i}`), seriesLabels: labels, hourTicks: hours, halfHourTicks: halves };
  }, [data]);

  // For bar mode: snapshot of latest value per series, sorted descending.
  const barSnapshot = useMemo(() => {
    if (!data) return [] as { name: string; value: number }[];
    return data.series
      .map((s) => {
        const last = s.points[s.points.length - 1];
        return {
          name: cleanLabel(s.locationName || s.label),
          value: last ? Number(last.value) : 0,
        };
      })
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (!activeBuilding) return null;

  return (
    <div className="space-y-3">
      {/* Header with dropdown */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            {range.label}
            <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {ranges.map((r, idx) => (
                <button
                  key={r.label}
                  onClick={() => { setRangeIdx(idx); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                    idx === rangeIdx ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mode controls: room picker (pick mode) OR view-mode toggle */}
      {viewMode === 'pick' ? (
        <div className="relative">
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            disabled={rooms.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
          >
            Room: {rooms.find((r) => r.id === pickedRoomId)?.name ?? 'Select…'}
            <ChevronDown className={`h-3 w-3 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>
          {pickerOpen && rooms.length > 0 && (
            <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setPickedRoomId(r.id); setPickerOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-xs font-medium transition-colors ${
                    r.id === pickedRoomId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : !lockMode ? (
        <div className="flex gap-1.5">
          {TOGGLE_MODES.map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              disabled={m === 'zone' && !userRoom}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                viewMode === m
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
              } ${m === 'zone' && !userRoom ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {VIEW_LABELS[m]}
            </button>
          ))}
        </div>
      ) : null}

      {/* Chart */}
      <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center" style={{ height }}>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3" style={{ height }}>
            <p className="text-xs text-red-400 text-center px-4">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2" style={{ height }}>
            <p className="text-xs text-slate-400">No {metricType} data for this period</p>
            <button
              onClick={() => { if (rangeIdx === 0 && ranges.length > 1) setRangeIdx(1); else handleRetry(); }}
              className="text-[11px] text-emerald-600 font-medium hover:text-emerald-700"
            >
              {rangeIdx === 0 && ranges.length > 1 ? 'Try last 24 hours' : 'Refresh'}
            </button>
          </div>
        ) : chartKind === 'bar' ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={barSnapshot}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 4, left: 8 }}
            >
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                unit={unit === '°C' ? '°' : ''}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
                width={84}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, padding: '8px 12px' }}
                formatter={(value: number) => [`${value.toFixed(1)}${unit}`, 'Latest']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        ) : chartKind === 'area' ? (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <defs>
                {seriesKeys.map((key, idx) => (
                  <linearGradient key={`g-${key}`} id={`area-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES_COLORS[idx % SERIES_COLORS.length]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SERIES_COLORS[idx % SERIES_COLORS.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
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
              <YAxis
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={metricType === 'temperature' ? [16, 28] : ['auto', 'auto']}
                ticks={metricType === 'temperature' ? [16, 18, 20, 22, 24, 26, 28] : undefined}
                unit={unit === '°C' ? '°' : ''}
              />
              {hourTicks.map((t) => (
                <ReferenceLine key={`xh-${t}`} x={t} stroke="#e2e8f0" strokeWidth={1} />
              ))}
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, padding: '8px 12px' }}
                labelFormatter={(ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}${unit}`,
                  seriesLabels[name] || name,
                ]}
              />
              {seriesKeys.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                  strokeWidth={2}
                  fill={`url(#area-${key})`}
                  connectNulls
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
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
              <YAxis
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={metricType === 'temperature' ? [16, 28] : ['auto', 'auto']}
                ticks={metricType === 'temperature' ? [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] : undefined}
                unit={unit === '°C' ? '°' : ''}
              />
              {/* Vertical hourly gridlines (solid subtle) */}
              {hourTicks.map((t) => (
                <ReferenceLine key={`xh-${t}`} x={t} stroke="#e2e8f0" strokeWidth={1} />
              ))}
              {/* Vertical half-hour gridlines (dashed, subtler) */}
              {halfHourTicks.map((t) => (
                <ReferenceLine key={`xhh-${t}`} x={t} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth={1} />
              ))}
              {/* Horizontal integer gridlines (solid subtle) */}
              {metricType === 'temperature' && Array.from({ length: 13 }, (_, i) => 16 + i).map((v) => (
                <ReferenceLine key={`int-${v}`} y={v} stroke="#e2e8f0" strokeWidth={1} />
              ))}
              {/* Horizontal half-degree gridlines (dashed, subtler) */}
              {metricType === 'temperature' && Array.from({ length: 12 }, (_, i) => 16.5 + i).map((v) => (
                <ReferenceLine key={`half-${v}`} y={v} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth={1} />
              ))}
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, padding: '8px 12px' }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                labelFormatter={(ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}${unit}`,
                  seriesLabels[name] || name,
                ]}
              />
              {seriesKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
