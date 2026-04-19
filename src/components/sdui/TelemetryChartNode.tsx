import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Loader2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
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

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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

export interface TelemetryChartNodeProps {
  metricType?: string;
  title?: string;
  unit?: string;
  timeRanges?: TimeRange[];
  groupBy?: 'room' | 'floor' | 'wing';
  height?: number;
  showReadings?: boolean;
  detailLink?: string;
}

/* ── Component ──────────────────────────────────────────── */

type ViewMode = 'zone' | 'floor' | 'wing';
const VIEW_LABELS: Record<ViewMode, string> = { zone: 'My Zone', floor: 'By Floor', wing: 'By Wing' };

export default function TelemetryChartNode({
  metricType = 'temperature',
  title = 'Temperature',
  unit = '°C',
  timeRanges,
  groupBy: _groupByProp = 'room',
  height = 240,
  showReadings = true,
  detailLink = '/environment',
}: TelemetryChartNodeProps) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const userRoom = usePresenceStore((s) => s.room);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const ranges = timeRanges ?? DEFAULT_RANGES;
  const [rangeIdx, setRangeIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(userRoom ? 'zone' : 'floor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryQueryResponse | null>(null);
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const range = ranges[rangeIdx];

  // Derive actual API params from viewMode
  const effectiveGroupBy = viewMode === 'zone' ? 'room' : viewMode;
  const effectiveLocationId = viewMode === 'zone' ? (userRoom ?? undefined) : undefined;

  const fetchData = useCallback(async (buildingId: string, r: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const from = new Date(now.getTime() - r.hours * 60 * 60 * 1000);

      // Fetch telemetry and locations independently — one failing shouldn't block the other
      const [seriesResult, locsResult] = await Promise.allSettled([
        telemetryApi.series(buildingId, {
          metricType,
          dateFrom: toISOCompat(from),
          dateTo: toISOCompat(now),
          granularity: r.granularity,
          groupBy: effectiveGroupBy,
          locationId: effectiveLocationId,
        }),
        locationsApi.list(buildingId, 'room'),
      ]);

      if (seriesResult.status === 'fulfilled') {
        setData(seriesResult.value);
        setError(null);
      } else {
        setData(null);
        setError(friendlyError(seriesResult.reason));
      }

      if (locsResult.status === 'fulfilled') {
        setLocations(locsResult.value);
      }
      // locations failure is non-critical — just keep existing list
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [metricType, effectiveGroupBy, effectiveLocationId]);

  useEffect(() => {
    // Wait for both building selection AND a valid auth session before fetching
    if (!activeBuilding || !token || !user) return;
    fetchData(activeBuilding.id, range);
  }, [activeBuilding?.id, token, user?.id, rangeIdx, retryCount, viewMode, fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => setRetryCount((c) => c + 1);

  // Build chart data
  const { chartData, seriesKeys, seriesLabels } = useMemo(() => {
    if (!data || data.series.length === 0) {
      return { chartData: [], seriesKeys: [], seriesLabels: {} as Record<string, string> };
    }
    const labels: Record<string, string> = {};
    const timeMap = new Map<string, Record<string, number | string>>();
    data.series.forEach((s, idx) => {
      const key = `s${idx}`;
      labels[key] = cleanLabel(s.locationName || s.label);
      for (const pt of s.points) {
        const display = formatTime(pt.recordedAt, range.granularity);
        const existing = timeMap.get(pt.recordedAt) || { time: pt.recordedAt, _display: display };
        existing[key] = pt.value;
        timeMap.set(pt.recordedAt, existing);
      }
    });
    const sorted = Array.from(timeMap.values()).sort(
      (a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime(),
    );
    return { chartData: sorted, seriesKeys: data.series.map((_, i) => `s${i}`), seriesLabels: labels };
  }, [data, range.granularity]);

  // Latest values per location
  const latestValues = useMemo(() => {
    if (!data) return [];
    const locationNames = new Map<string, string>();
    for (const loc of locations) {
      locationNames.set(loc.id, loc.name);
      if (loc.code) locationNames.set(loc.code, loc.name);
    }
    return data.series.map((s, idx) => {
      const lastPt = s.points.length > 0 ? s.points[s.points.length - 1] : null;
      const label =
        (s.label && locationNames.get(s.label)) ||
        cleanLabel(s.locationName || s.label);
      return {
        key: `s${idx}`,
        label,
        value: lastPt ? lastPt.value : null,
        recordedAt: lastPt?.recordedAt ?? null,
        color: SERIES_COLORS[idx % SERIES_COLORS.length],
      };
    });
  }, [data, locations]);

  // Locations with no data
  const noDataLocations = useMemo(() => {
    if (!data || locations.length === 0) return [];
    const coveredCodes = new Set<string>();
    for (const s of data.series) {
      if (s.label) coveredCodes.add(s.label);
      for (const z of s.zones) coveredCodes.add(z);
    }
    return locations.filter(
      (loc) => !coveredCodes.has(loc.code ?? '') && !coveredCodes.has(loc.name) && !coveredCodes.has(loc.id)
    );
  }, [data, locations]);

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

      {/* View mode toggle */}
      <div className="flex gap-1.5">
        {(['zone', 'floor', 'wing'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            disabled={mode === 'zone' && !userRoom}
            className={`rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
              viewMode === mode
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
            } ${mode === 'zone' && !userRoom ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>

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
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="_display"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={metricType === 'temperature' ? [16, 28] : ['auto', 'auto']}
                ticks={metricType === 'temperature' ? [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] : undefined}
                unit={unit === '°C' ? '°' : ''}
              />
              {/* Integer gridlines (solid subtle) */}
              {metricType === 'temperature' && Array.from({ length: 13 }, (_, i) => 16 + i).map((v) => (
                <ReferenceLine key={`int-${v}`} y={v} stroke="#e2e8f0" strokeWidth={1} />
              ))}
              {/* Half-degree gridlines (dashed, subtler) */}
              {metricType === 'temperature' && Array.from({ length: 12 }, (_, i) => 16.5 + i).map((v) => (
                <ReferenceLine key={`half-${v}`} y={v} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth={1} />
              ))}
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, padding: '8px 12px' }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
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

      {/* Readings grid */}
      {showReadings && !loading && latestValues.length > 0 && (
        <>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              All Locations
            </span>
            {detailLink && (
              <button
                onClick={() => navigate(detailLink)}
                className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Details
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {latestValues.map((loc) => {
              const tempColor =
                loc.value === null ? 'text-slate-300' :
                loc.value < 18 ? 'text-blue-600' :
                loc.value > 26 ? 'text-red-500' :
                'text-emerald-600';
              return (
                <div key={loc.key} className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: loc.color }} />
                    <span className="text-[11px] font-medium text-slate-500 truncate">{loc.label}</span>
                  </div>
                  <div className={`text-lg font-bold tabular-nums mt-0.5 ${tempColor}`}>
                    {loc.value !== null ? loc.value.toFixed(1) : '--'}
                    <span className="text-[10px] font-normal text-slate-400">{unit}</span>
                  </div>
                  {loc.recordedAt && (
                    <div className="text-[9px] text-slate-300">{formatTimeAgo(loc.recordedAt)}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Locations with no data */}
          {noDataLocations.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1.5 px-1">
                No recent data
              </div>
              <div className="grid grid-cols-2 gap-2">
                {noDataLocations.map((loc) => (
                  <div key={loc.id} className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-3 py-2.5">
                    <div className="text-[11px] font-medium text-slate-400 truncate">{loc.name}</div>
                    <div className="text-lg font-bold text-slate-200">--<span className="text-[10px] font-normal">{unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
