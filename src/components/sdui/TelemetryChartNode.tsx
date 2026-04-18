import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { telemetryApi, type TelemetryQueryResponse } from '../../api/telemetry';
import { locationsApi, type LocationNode } from '../../api/locations';

/* ── Constants ──────────────────────────────────────────── */

interface TimeRange {
  label: string;
  hours: number;
  granularity: 'raw' | 'hourly' | 'daily';
}

const DEFAULT_RANGES: TimeRange[] = [
  { label: 'Last 2 hours', hours: 2, granularity: 'raw' },
  { label: 'Last 24 hours', hours: 24, granularity: 'hourly' },
];

const SERIES_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

/* ── Helpers ────────────────────────────────────────────── */

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

/* ── Props ──────────────────────────────────────────────── */

export interface TelemetryChartNodeProps {
  /** Metric to display, e.g. "temperature", "co2", "humidity" */
  metricType?: string;
  /** Chart title */
  title?: string;
  /** Unit label */
  unit?: string;
  /** Time range options (defaults to 2h/24h) */
  timeRanges?: TimeRange[];
  /** Group by level */
  groupBy?: 'room' | 'floor' | 'wing';
  /** Chart height in px */
  height?: number;
  /** Show location readings grid below chart */
  showReadings?: boolean;
  /** Link to full page */
  detailLink?: string;
}

/* ── Component ──────────────────────────────────────────── */

export default function TelemetryChartNode({
  metricType = 'temperature',
  title = 'Temperature',
  unit = '°C',
  timeRanges,
  groupBy = 'room',
  height = 240,
  showReadings = true,
  detailLink = '/environment',
}: TelemetryChartNodeProps) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const navigate = useNavigate();

  const ranges = timeRanges ?? DEFAULT_RANGES;
  const [rangeIdx, setRangeIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryQueryResponse | null>(null);
  const [locations, setLocations] = useState<LocationNode[]>([]);

  const range = ranges[rangeIdx];

  useEffect(() => {
    if (!activeBuilding) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const from = new Date(now.getTime() - range.hours * 60 * 60 * 1000);
        const [result, locs] = await Promise.all([
          telemetryApi.series(activeBuilding.id, {
            metricType,
            dateFrom: from.toISOString(),
            dateTo: now.toISOString(),
            granularity: range.granularity,
            groupBy,
          }),
          locationsApi.list(activeBuilding.id, 'room').catch(() => [] as LocationNode[]),
        ]);
        if (!cancelled) {
          setData(result);
          setLocations(locs);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeBuilding?.id, rangeIdx, metricType, groupBy]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Latest values per location (for readings grid)
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

      {/* Chart */}
      <div className="rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-sm">
        {loading ? (
          <div className="flex justify-center" style={{ height }}>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mt-20" />
          </div>
        ) : error ? (
          <div className="text-center text-xs text-red-500" style={{ height, lineHeight: `${height}px` }}>{error}</div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-xs text-slate-400" style={{ height, lineHeight: `${height}px` }}>
            No {metricType} data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                domain={['auto', 'auto']}
                unit={unit === '°C' ? '°' : ''}
              />
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
