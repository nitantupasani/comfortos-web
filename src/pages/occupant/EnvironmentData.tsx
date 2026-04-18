import { useEffect, useState, useMemo } from 'react';
import { usePresenceStore } from '../../store/presenceStore';
import {
  Loader2,
  Thermometer,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { telemetryApi, type TelemetryQueryResponse } from '../../api/telemetry';

/* ── Constants ──────────────────────────────────────────── */

const TIME_RANGES = [
  { label: 'Last 2 hours', hours: 2, granularity: 'raw' as const },
  { label: 'Last 24 hours', hours: 24, granularity: 'hourly' as const },
];

const SERIES_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
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

/* ── Component ──────────────────────────────────────────── */

export default function EnvironmentData() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const floor = usePresenceStore((s) => s.floor);

  const [rangeIdx, setRangeIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryQueryResponse | null>(null);

  const range = TIME_RANGES[rangeIdx];

  // Fetch temperature data
  useEffect(() => {
    if (!activeBuilding) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const from = new Date(now.getTime() - range.hours * 60 * 60 * 1000);
        const result = await telemetryApi.series(activeBuilding.id, {
          metricType: 'temperature',
          dateFrom: from.toISOString(),
          dateTo: now.toISOString(),
          granularity: range.granularity,
          groupBy: 'room',
        });
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeBuilding?.id, rangeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build chart data: merge all series into rows keyed by timestamp
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

    return {
      chartData: sorted,
      seriesKeys: data.series.map((_, i) => `s${i}`),
      seriesLabels: labels,
    };
  }, [data, range.granularity]);

  // Latest values per location
  const latestValues = useMemo(() => {
    if (!data) return [];
    return data.series.map((s, idx) => {
      const lastPt = s.points.length > 0 ? s.points[s.points.length - 1] : null;
      return {
        key: `s${idx}`,
        label: cleanLabel(s.locationName || s.label),
        value: lastPt ? lastPt.value : null,
        color: SERIES_COLORS[idx % SERIES_COLORS.length],
      };
    });
  }, [data]);

  if (!activeBuilding) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <MapPin className="h-10 w-10 mb-3" />
        <p className="text-sm">Select a building first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with time range picker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-slate-800">Temperature</h1>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            {range.label}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {TIME_RANGES.map((r, idx) => (
                <button
                  key={r.label}
                  onClick={() => { setRangeIdx(idx); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                    idx === rangeIdx
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
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
      <div className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        ) : chartData.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No temperature data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="_display"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                unit="°"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  fontSize: 11,
                  padding: '8px 12px',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}°C`,
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

      {/* Location cards — current readings */}
      {!loading && latestValues.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
            All Locations — Current Readings
          </div>
          <div className="space-y-2">
            {latestValues.map((loc) => (
              <div
                key={loc.key}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: loc.color }}
                  />
                  <span className="text-sm font-medium text-slate-700 truncate">{loc.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 tabular-nums">
                  {loc.value !== null ? `${loc.value.toFixed(1)}°C` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
