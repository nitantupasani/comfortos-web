import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Loader2, ChevronDown, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { telemetryApi, type TelemetryQueryResponse } from '../../api/telemetry';

/* ── Constants ──────────────────────────────────────────── */

const TIME_RANGES = [
  { label: 'Last 2 hours', hours: 2, granularity: 'raw' as const },
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

/* ── Component ──────────────────────────────────────────── */

export default function EnvironmentData() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [rangeIdx, setRangeIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupLevel>('floor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryQueryResponse | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);

  const range = TIME_RANGES[rangeIdx];

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
      // When switching to room view, start with none selected (user picks)
      if (groupBy === 'room') setSelectedRooms(new Set());
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
  const { chartData, seriesKeys, seriesLabels } = useMemo(() => {
    if (!data || data.series.length === 0) {
      return { chartData: [], seriesKeys: [], seriesLabels: {} as Record<string, string> };
    }

    const visibleSeries = groupBy === 'room'
      ? data.series.filter((_, i) => selectedRooms.has(`s${i}`))
      : data.series;

    if (visibleSeries.length === 0) {
      return { chartData: [], seriesKeys: [], seriesLabels: {} as Record<string, string> };
    }

    const labels: Record<string, string> = {};
    const timeMap = new Map<string, Record<string, number | string>>();

    visibleSeries.forEach((s) => {
      const origIdx = data.series.indexOf(s);
      const key = `s${origIdx}`;
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
    const keys = visibleSeries.map((s) => `s${data.series.indexOf(s)}`);
    return { chartData: sorted, seriesKeys: keys, seriesLabels: labels };
  }, [data, range.granularity, groupBy, selectedRooms]);

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

  const showChart = groupBy !== 'room' || selectedRooms.size > 0;

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

      {/* Group-by toggle */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(['floor', 'wing', 'room'] as GroupLevel[]).map((g) => (
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

      {/* Room selector (only in room mode) */}
      {groupBy === 'room' && !loading && data && data.series.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
            Select rooms to compare
          </div>
          <div className="flex flex-wrap gap-2">
            {data.series.map((s, idx) => {
              const key = `s${idx}`;
              const active = selectedRooms.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleRoom(key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                    active
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: active ? SERIES_COLORS[idx % SERIES_COLORS.length] : '#cbd5e1' }}
                  />
                  {cleanLabel(s.locationName || s.label)}
                </button>
              );
            })}
          </div>
        </div>
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
            Select one or more rooms above to view their charts
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-xs text-slate-400">
            No temperature data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_display" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit="°" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, padding: '8px 12px' }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
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

      {/* Legend for floor/wing view */}
      {groupBy !== 'room' && !loading && chartData.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
          {seriesKeys.map((key) => {
            const idx = parseInt(key.slice(1));
            return (
              <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }} />
                {seriesLabels[key]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
