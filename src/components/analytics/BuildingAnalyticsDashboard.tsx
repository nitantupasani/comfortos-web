import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Loader2,
  Building2,
  Calendar,
  Thermometer,
  Wind,
  Volume2,
  Droplets,
  Download,
  BookOpen,
  BarChart3,
  Layers,
  Grid,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { buildingsApi } from '../../api/buildings';
import { telemetryApi, TelemetryQueryResponse, TelemetryMetric } from '../../api/telemetry';
import { votesApi, VoteAnalyticsResponse } from '../../api/votes';
import type { Building } from '../../types';

/* ── Constants ──────────────────────────────────────────── */

const SERIES_COLORS = [
  '#facc15', // yellow
  '#4ade80', // green
  '#60a5fa', // blue
  '#f472b6', // pink
  '#a78bfa', // purple
  '#fb923c', // orange
  '#2dd4bf', // teal
  '#f87171', // red
  '#818cf8', // indigo
  '#34d399', // emerald
];

const VOTE_LINE_COLOR = '#f43f5e'; // rose-500

const METRIC_CONFIG: Record<string, { label: string; unit: string; icon: typeof Thermometer; color: string }> = {
  temperature: { label: 'Temperature', unit: '°C', icon: Thermometer, color: '#facc15' },
  co2: { label: 'CO₂', unit: 'ppm', icon: Wind, color: '#60a5fa' },
  noise: { label: 'Noise Level', unit: 'dBA', icon: Volume2, color: '#a78bfa' },
  humidity: { label: 'Humidity', unit: '%', icon: Droplets, color: '#4ade80' },
};

const DATE_RANGES = [
  { label: 'Last 24h', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

/* ── Helpers ────────────────────────────────────────────── */

function formatDateTime(iso: string, granularity: string): string {
  const d = new Date(iso);
  if (granularity === 'daily') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Strip generic floor prefixes like "0 / " from labels */
function cleanLabel(label: string): string {
  return label.replace(/^0\s*\/\s*/, '');
}

const COMFORT_LABEL: Record<number, string> = {
  '-3': 'Cold', '-2': 'Cool', '-1': 'Sl. cool', 0: 'Neutral', 1: 'Sl. warm', 2: 'Warm', 3: 'Hot',
};

/** Colour per comfort level: -3 cold blue → +3 hot red */
const VOTE_COLOR: Record<number, string> = {
  '-3': '#2563eb', '-2': '#60a5fa', '-1': '#93c5fd',
  0: '#4ade80',
  1: '#fbbf24', 2: '#fb923c', 3: '#ef4444',
};
function voteColor(val: number): string {
  const clamped = Math.max(-3, Math.min(3, Math.round(val)));
  return VOTE_COLOR[clamped] ?? '#a78bfa';
}

/** Build weekend / non-office-hour shading bands from chart data. */
function buildOffHourBands(data: Record<string, unknown>[]): { x1: string; x2: string; type: 'weekend' | 'offhours' }[] {
  const bands: { x1: string; x2: string; type: 'weekend' | 'offhours' }[] = [];
  if (data.length < 2) return bands;
  let currentBand: { x1: string; type: 'weekend' | 'offhours' } | null = null;
  for (const row of data) {
    const iso = row.time as string;
    const d = new Date(iso);
    const day = d.getUTCDay(); // 0=Sun, 6=Sat
    const hour = d.getUTCHours();
    const isWeekend = day === 0 || day === 6;
    const isOffHours = !isWeekend && (hour < 8 || hour >= 18);
    const display = row._display as string;
    if (isWeekend) {
      if (!currentBand || currentBand.type !== 'weekend') {
        if (currentBand) bands.push({ x1: currentBand.x1, x2: display, type: currentBand.type });
        currentBand = { x1: display, type: 'weekend' };
      }
    } else if (isOffHours) {
      if (!currentBand || currentBand.type !== 'offhours') {
        if (currentBand) bands.push({ x1: currentBand.x1, x2: display, type: currentBand.type });
        currentBand = { x1: display, type: 'offhours' };
      }
    } else {
      if (currentBand) {
        bands.push({ x1: currentBand.x1, x2: display, type: currentBand.type });
        currentBand = null;
      }
    }
  }
  if (currentBand) {
    const last = data[data.length - 1]._display as string;
    bands.push({ x1: currentBand.x1, x2: last, type: currentBand.type });
  }
  return bands;
}

/* ── Thermal comfort background bands ──────────────────── */

const COMFORT_BANDS = [
  { from: -3, to: -2, color: 'rgba(59,130,246,0.04)' },   // cold – blue
  { from: -2, to: -1, color: 'rgba(96,165,250,0.03)' },   // cool – lighter blue
  { from: -1, to:  1, color: 'rgba(74,222,128,0.03)' },    // neutral – green
  { from:  1, to:  2, color: 'rgba(251,146,60,0.03)' },    // warm – orange
  { from:  2, to:  3, color: 'rgba(239,68,68,0.04)' },     // hot – red
];

/* ── Component ──────────────────────────────────────────── */

interface Props {
  /** When true, shows the integration docs tab */
  showDocs?: boolean;
}

export default function BuildingAnalyticsDashboard({ showDocs = false }: Props) {
  /* ── State ── */
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [availableMetrics, setAvailableMetrics] = useState<TelemetryMetric[]>([]);
  const [activeMetric, setActiveMetric] = useState('temperature');
  const [activeTab, setActiveTab] = useState<'thermal' | 'performance' | 'docs'>('thermal');

  const [startDate, setStartDate] = useState(() => toISODate(new Date(Date.now() - 7 * 86400000)));
  const [endDate, setEndDate] = useState(() => toISODate(new Date()));
  const [granularity, setGranularity] = useState<'raw' | 'hourly' | 'daily'>('hourly');

  /** Apply a preset range (days from today) */
  const applyPreset = useCallback((days: number) => {
    setEndDate(toISODate(new Date()));
    setStartDate(toISODate(new Date(Date.now() - days * 86400000)));
  }, []);

  const [telemetryData, setTelemetryData] = useState<TelemetryQueryResponse | null>(null);
  const [voteOverlay, setVoteOverlay] = useState<VoteAnalyticsResponse | null>(null);
  const [showVotes, setShowVotes] = useState(true);
  const [voteMode, setVoteMode] = useState<'grouped' | 'individual'>('grouped');
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  // Use ref for brush range to avoid re-render loops (brush onChange → data change → brush reset)
  const brushRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const mergeMapRef = useRef<Map<number, { val: number; count: number }>>(new Map());

  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  /* ── Load buildings ── */
  useEffect(() => {
    buildingsApi.list().then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelectedBuilding(b[0].id);
    }).finally(() => setLoading(false));
  }, []);

  /* ── Load telemetry + votes when building/metric/range changes ── */
  useEffect(() => {
    if (!selectedBuilding) return;
    setDataLoading(true);

    const metricType = activeTab === 'thermal' ? 'temperature'
      : activeTab === 'performance' ? activeMetric
      : 'temperature';

    Promise.all([
      telemetryApi.series(selectedBuilding, {
        metricType,
        dateFrom: startDate,
        dateTo: endDate,
        granularity,
      }).catch(() => null),
      telemetryApi.metrics(selectedBuilding).catch(() => []),
      votesApi.analytics(selectedBuilding, startDate, endDate).catch(() => null),
    ]).then(([series, metrics, votes]) => {
      setTelemetryData(series);
      setAvailableMetrics(metrics);
      setVoteOverlay(votes);
      setHiddenSeries(new Set());
    }).finally(() => setDataLoading(false));
  }, [selectedBuilding, activeTab, activeMetric, startDate, endDate, granularity]);

  // Reset brush ref when underlying data changes
  useEffect(() => { brushRef.current = { start: 0, end: 0 }; }, [telemetryData]);

  /* ── Transform telemetry into Recharts-friendly data ── */
  const { chartData, seriesKeys } = useMemo(() => {
    if (!telemetryData || telemetryData.series.length === 0) {
      return { chartData: [], seriesKeys: [] };
    }

    // Collect all unique timestamps
    const tsSet = new Set<string>();
    for (const s of telemetryData.series) {
      for (const p of s.points) tsSet.add(p.recordedAt);
    }
    const timestamps = Array.from(tsSet).sort();
    const keys = telemetryData.series.map((s) => cleanLabel(s.label));

    // Build lookup per series
    const lookup: Record<string, Record<string, number>> = {};
    for (const s of telemetryData.series) {
      const map: Record<string, number> = {};
      for (const p of s.points) map[p.recordedAt] = p.value;
      lookup[cleanLabel(s.label)] = map;
    }

    // Also build vote overlay lookup (thermal_comfort average per time bucket)
    const voteLookup: Record<string, number> = {};
    const voteCountLookup: Record<string, number> = {};
    if (voteOverlay?.votes && showVotes) {
      const buckets: Record<string, number[]> = {};
      for (const v of voteOverlay.votes) {
        const thermal = v.payload?.thermal_comfort;
        if (thermal === undefined || thermal === null) continue;
        const val = typeof thermal === 'number' ? thermal : parseFloat(String(thermal));
        if (isNaN(val)) continue;
        // Values are already in -3..+3 ASHRAE scale
        const norm = val;
        // Bucket to hour or day matching granularity
        const d = new Date(v.createdAt);
        let key: string;
        if (granularity === 'daily') {
          key = d.toISOString().split('T')[0] + 'T00:00:00+00:00';
        } else {
          // Truncate to hour: 2026-01-15T14:32:00.000Z -> 2026-01-15T14:00:00+00:00
          const iso = d.toISOString();
          key = iso.slice(0, 14) + '00:00+00:00';
        }
        (buckets[key] ??= []).push(norm);
      }
      for (const [k, vals] of Object.entries(buckets)) {
        voteLookup[k] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
        voteCountLookup[k] = vals.length;
      }
    }

    const rows = timestamps.map((ts) => {
      const row: Record<string, unknown> = { time: ts, _display: formatDateTime(ts, telemetryData.granularity) };
      for (const k of keys) {
        row[k] = lookup[k]?.[ts] ?? null;
      }
      if (voteLookup[ts] !== undefined) {
        row['Comfort Vote'] = voteLookup[ts];
        row['_voteCount'] = voteCountLookup[ts] ?? 0;
      }
      return row;
    });

    return { chartData: rows, seriesKeys: keys };
  }, [telemetryData, voteOverlay, showVotes, granularity]);

  /* ── Build merge map for grouped bubble mode (called imperatively) ── */
  const rebuildMergeMap = useCallback(() => {
    const map = new Map<number, { val: number; count: number }>();
    const start = brushRef.current.start;
    const end = brushRef.current.end || chartData.length - 1;
    const visibleLen = Math.max(1, end - start + 1);
    const minGap = Math.max(1, Math.ceil(visibleLen / 60));

    // Collect indices that have votes
    const voteIndices: number[] = [];
    for (let i = 0; i < chartData.length; i++) {
      if (chartData[i]['Comfort Vote'] != null) voteIndices.push(i);
    }

    let groupAnchor = -Infinity;
    let groupVal = 0;
    let groupCount = 0;
    const flush = () => {
      if (groupAnchor >= 0) map.set(groupAnchor, { val: Math.round(groupVal / groupCount * 100) / 100, count: groupCount });
    };
    for (const idx of voteIndices) {
      const v = chartData[idx]['Comfort Vote'] as number;
      const c = (chartData[idx]['_voteCount'] as number) || 1;
      if (idx - groupAnchor < minGap && groupAnchor >= 0) {
        groupVal += v * c;
        groupCount += c;
      } else {
        flush();
        groupAnchor = idx;
        groupVal = v * c;
        groupCount = c;
      }
    }
    flush();
    mergeMapRef.current = map;
  }, [chartData]);

  // Initial merge map build
  useEffect(() => { rebuildMergeMap(); }, [rebuildMergeMap]);

  /* ── Weekend / off-hours shading bands ── */
  const offHourBands = useMemo(() => buildOffHourBands(chartData), [chartData]);

  /* ── Metric info ── */
  const currentMetricType = activeTab === 'thermal' ? 'temperature' : activeMetric;
  const metricInfo = METRIC_CONFIG[currentMetricType] ?? { label: currentMetricType, unit: '', icon: Thermometer, color: '#94a3b8' };
  const MetricIcon = metricInfo.icon;

  /* ── Performance tab metric select options ── */
  const perfMetrics = availableMetrics.filter((m) => m.metricType !== 'temperature');

  /* ── CSV export ── */
  const handleExport = () => {
    if (!chartData.length || !seriesKeys.length) return;
    const header = ['Time', ...seriesKeys].join(',');
    const rows = chartData.map((r) => [r._display, ...seriesKeys.map((k) => r[k] ?? '')].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMetricType}_${selectedBuilding}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  const hasVoteData = voteOverlay?.votes && voteOverlay.votes.some((v) => v.payload?.thermal_comfort !== undefined);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary-500" />
          Building Analytics
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Building select */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
          >
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-400 ml-2" />
              {DATE_RANGES.map((r) => (
                <button
                  key={r.days}
                  onClick={() => applyPreset(r.days)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    endDate === toISODate(new Date()) && startDate === toISODate(new Date(Date.now() - r.days * 86400000))
                      ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-primary-300 outline-none"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-primary-300 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('thermal')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'thermal' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Thermal comfort
        </button>
        <button
          onClick={() => { setActiveTab('performance'); if (!perfMetrics.find((m) => m.metricType === activeMetric)) setActiveMetric(perfMetrics[0]?.metricType ?? 'co2'); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'performance' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Performance
        </button>
        {showDocs && (
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Integration Guide
          </button>
        )}
      </div>

      {/* ── Docs tab ── */}
      {activeTab === 'docs' && showDocs && (
        <IntegrationDocs />
      )}

      {/* ── Chart tabs ── */}
      {activeTab !== 'docs' && (
        <>
          {/* Controls row */}
          <div className="flex items-center gap-3 flex-wrap">
            {activeTab === 'performance' && perfMetrics.length > 0 && (
              <select
                value={activeMetric}
                onChange={(e) => setActiveMetric(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              >
                {perfMetrics.map((m) => (
                  <option key={m.metricType} value={m.metricType}>
                    {METRIC_CONFIG[m.metricType]?.label ?? m.metricType} ({m.unit})
                  </option>
                ))}
              </select>
            )}

            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as 'raw' | 'hourly' | 'daily')}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
            >
              <option value="raw">Raw</option>
              <option value="hourly">Hourly avg</option>
              <option value="daily">Daily avg</option>
            </select>

            {activeTab === 'thermal' && hasVoteData && (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={showVotes} onChange={(e) => setShowVotes(e.target.checked)} className="rounded" />
                Show thermal comfort votes
              </label>
            )}

            <button
              onClick={handleExport}
              disabled={!chartData.length}
              className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>

          {/* ── Chart Card ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* ── Chart header ── */}
            <div className="px-5 py-3 border-b border-gray-100">
              {/* Row 1: title + vote legend + shading legend */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MetricIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {metricInfo.label} by Zone
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Vote colour legend */}
                  {activeTab === 'thermal' && hasVoteData && showVotes && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
                      <span className="text-xs font-medium text-gray-600 mr-1">Votes</span>
                      {([-3,-2,-1,0,1,2,3] as number[]).map(v => (
                        <span key={v} className="flex flex-col items-center" style={{ lineHeight: 1 }}>
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: VOTE_COLOR[v] + '55', borderColor: VOTE_COLOR[v] }} />
                          <span className="text-[8px] text-gray-500 mt-0.5 leading-none">{COMFORT_LABEL[v]}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Vote mode toggle */}
                  {activeTab === 'thermal' && hasVoteData && showVotes && (
                    <div className="flex bg-gray-100 rounded-md p-0.5 text-[11px]">
                      <button
                        onClick={() => setVoteMode('grouped')}
                        className={`px-2 py-1 rounded transition-colors ${voteMode === 'grouped' ? 'bg-white shadow-sm text-gray-700 font-medium' : 'text-gray-500'}`}
                      >Grouped</button>
                      <button
                        onClick={() => setVoteMode('individual')}
                        className={`px-2 py-1 rounded transition-colors ${voteMode === 'individual' ? 'bg-white shadow-sm text-gray-700 font-medium' : 'text-gray-500'}`}
                      >Individual</button>
                    </div>
                  )}
                  {/* Weekend / off-hours legend */}
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(99,102,241,0.15)' }} />
                    Weekend
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(148,163,184,0.10)' }} />
                    Off-hours
                  </span>
                </div>
              </div>
              {/* Row 2: zone toggles */}
              {seriesKeys.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <button
                    onClick={() => setHiddenSeries(hiddenSeries.size === 0 ? new Set(seriesKeys) : new Set())}
                    className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded transition-colors mr-1"
                  >
                    {hiddenSeries.size === 0 ? 'Hide all' : 'Show all'}
                  </button>
                  {seriesKeys.map((key, i) => {
                    const isHidden = hiddenSeries.has(key);
                    const color = SERIES_COLORS[i % SERIES_COLORS.length];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSeries(key)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all border ${
                          isHidden
                            ? 'border-gray-200 text-gray-400 bg-transparent'
                            : 'border-transparent text-gray-700'
                        }`}
                        style={isHidden ? {} : { backgroundColor: `${color}22`, borderColor: `${color}44` }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isHidden ? '#d1d5db' : color }}
                        />
                        {key}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4" style={{ minHeight: 460 }}>
              {dataLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 text-sm">
                  <Building2 className="h-10 w-10 mb-3 text-gray-600" />
                  <p className="font-medium">No telemetry data available</p>
                  <p className="text-gray-600 mt-1">Connect a building service to start seeing data here.</p>
                  {showDocs && (
                    <button onClick={() => setActiveTab('docs')} className="mt-3 text-primary-400 hover:text-primary-300 text-sm underline">
                      View Integration Guide
                    </button>
                  )}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 0 }}>
                    {/* Weekend / off-hours shading */}
                    {offHourBands.map((band, i) => (
                      <ReferenceArea
                        key={`oh-${i}`}
                        yAxisId="metric"
                        x1={band.x1}
                        x2={band.x2}
                        fill={band.type === 'weekend' ? '#6366f1' : '#94a3b8'}
                        fillOpacity={band.type === 'weekend' ? 0.10 : 0.06}
                        ifOverflow="extendDomain"
                        label={band.type === 'weekend' ? { value: '🅆', position: 'insideTopLeft', fill: '#818cf8', fontSize: 9, opacity: 0.5 } : undefined}
                      />
                    ))}
                    {/* Thermal comfort background bands (always visible on thermal tab) */}
                    {activeTab === 'thermal' && COMFORT_BANDS.map((band) => (
                      <ReferenceArea
                        key={`band-${band.from}`}
                        yAxisId="vote"
                        y1={band.from}
                        y2={band.to}
                        fill={band.color}
                        fillOpacity={1}
                        ifOverflow="extendDomain"
                      />
                    ))}
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="_display"
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      yAxisId="metric"
                      domain={['auto', 'auto']}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      unit={` ${metricInfo.unit}`}
                      width={65}
                    />
                    {/* Comfort vote right Y-axis — always present on thermal tab */}
                    {activeTab === 'thermal' && (
                      <YAxis
                        yAxisId="vote"
                        orientation="right"
                        domain={[-3, 3]}
                        ticks={[-3, -2, -1, 0, 1, 2, 3]}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickLine={{ stroke: '#d1d5db44' }}
                        axisLine={{ stroke: '#d1d5db44' }}
                        tickFormatter={(v: number) => COMFORT_LABEL[v] ?? String(v)}
                        width={60}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 10,
                        color: '#374151',
                        fontSize: 12,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      }}
                      labelStyle={{ color: '#9ca3af', marginBottom: 6, fontSize: 11 }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Comfort Vote') {
                          const rounded = Math.round(value);
                          const label = COMFORT_LABEL[rounded] ?? '';
                          return [`${value} (${label})`, 'Comfort Vote'];
                        }
                        return [`${value} ${metricInfo.unit}`, name];
                      }}
                    />
                    {/* Sensor series lines */}
                    {seriesKeys.map((key, i) => (
                      <Line
                        key={key}
                        yAxisId="metric"
                        type="monotone"
                        dataKey={key}
                        stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                        strokeWidth={hiddenSeries.has(key) ? 0 : 2}
                        dot={false}
                        connectNulls
                        hide={hiddenSeries.has(key)}
                      />
                    ))}
                    {/* Thermal vote overlay — bubbles (no connecting line) */}
                    {showVotes && hasVoteData && activeTab === 'thermal' && (
                      <Line
                        yAxisId="vote"
                        type="monotone"
                        dataKey="Comfort Vote"
                        stroke="none"
                        strokeWidth={0}
                        dot={(props: any) => {
                          const { cx, cy, payload, index } = props;
                          if (cx == null || cy == null || payload?.['Comfort Vote'] == null) return <g />;
                          const val = payload['Comfort Vote'] as number;
                          const count = (payload['_voteCount'] as number) ?? 1;
                          const fill = voteColor(val);

                          if (voteMode === 'individual') {
                            // Small fixed-size dot per hourly bucket
                            return (
                              <g>
                                <circle cx={cx} cy={cy} r={5} fill={fill + '88'} stroke={fill} strokeWidth={1} />
                              </g>
                            );
                          }

                          // Grouped mode: check merge map
                          const merged = mergeMapRef.current.get(index);
                          if (!merged) return <g />; // this index was merged into another
                          const mCount = merged.count;
                          const mVal = merged.val;
                          const mFill = voteColor(mVal);
                          const r = Math.min(28, 8 + Math.sqrt(mCount) * 5);
                          return (
                            <g>
                              <circle cx={cx} cy={cy} r={r} fill={mFill + '44'} stroke={mFill} strokeWidth={1.5} />
                              {mCount > 1 && (
                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#1f2937" fontSize={r > 10 ? 9 : 7} fontWeight={700}>
                                  {mCount}
                                </text>
                              )}
                            </g>
                          );
                        }}
                        connectNulls={false}
                        isAnimationActive={false}
                        legendType="none"
                      />
                    )}
                    {/* Neutral comfort reference line */}
                    {activeTab === 'thermal' && (
                      <ReferenceLine yAxisId="vote" y={0} stroke="#9ca3af44" strokeDasharray="4 4" />
                    )}
                    <Brush
                      dataKey="_display"
                      height={28}
                      stroke="#d1d5db"
                      fill="#f9fafb"
                      travellerWidth={10}
                      onChange={(range: any) => {
                        brushRef.current = { start: range.startIndex, end: range.endIndex };
                        if (voteMode === 'grouped') rebuildMergeMap();
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Latest readings KPI cards ── */}
          <LatestReadings buildingId={selectedBuilding} metric={currentMetricType} />
        </>
      )}
    </div>
  );
}

/* ── Latest Readings sub-component ────────────────────── */

function LatestReadings({ buildingId, metric }: { buildingId: string; metric: string }) {
  const [readings, setReadings] = useState<Array<{ label: string; value: number; unit: string; time: string }>>([]);

  useEffect(() => {
    if (!buildingId) return;
    telemetryApi.latest(buildingId).then((data) => {
      setReadings(
        data
          .filter((r) => r.metricType === metric)
          .map((r) => ({
            label: cleanLabel(r.floor ? (r.zone ? `${r.floor} / ${r.zone}` : r.floor) : r.zone ?? 'Building'),
            value: Math.round(r.value * 10) / 10,
            unit: r.unit,
            time: new Date(r.recordedAt).toLocaleString(),
          })),
      );
    }).catch(() => setReadings([]));
  }, [buildingId, metric]);

  if (readings.length === 0) return null;

  const info = METRIC_CONFIG[metric];

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
        Latest Readings — {info?.label ?? metric}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {readings.map((r) => (
          <div key={r.label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-400 mb-1">{r.label}</div>
            <div className="text-2xl font-bold text-gray-800">
              {r.value}<span className="text-sm font-normal text-gray-400 ml-1">{r.unit}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{r.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Integration Docs ──────────────────────────────────── */

const DOC_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'api-format', label: 'API Response Format' },
  { id: 'fields', label: 'Field Reference' },
  { id: 'granularity', label: 'Spatial Granularity' },
  { id: 'metrics', label: 'Metric Types' },
  { id: 'security', label: 'Security & Auth' },
  { id: 'response-mapping', label: 'Response Mapping' },
  { id: 'votes', label: 'Vote Overlay' },
  { id: 'best-practices', label: 'Best Practices' },
] as const;

function CopyBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium transition-all bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white opacity-0 group-hover:opacity-100"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold mr-2 flex-shrink-0">
      {n}
    </span>
  );
}

function IntegrationDocs() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="flex gap-6">
      {/* Sidebar nav */}
      <nav className="hidden lg:block w-48 flex-shrink-0 sticky top-6 self-start">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">On this page</div>
        <ul className="space-y-0.5">
          {DOC_SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#doc-${id}`}
                onClick={() => setActiveSection(id)}
                className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                  activeSection === id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="px-8 py-8 border-b bg-gradient-to-br from-primary-50 via-white to-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Building Service Integration Guide</h3>
                <p className="text-gray-500 text-sm">ComfortOS pulls environmental data from your building service API</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Pull Model
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> JSON / REST
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> mTLS · OAuth2 · Bearer · HMAC · API Key
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-12 text-sm text-gray-700 leading-relaxed">

            {/* ── Overview ── */}
            <section id="doc-overview">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Overview</h4>
              <p className="mb-4">
                ComfortOS uses a <strong>pull model</strong> — it periodically calls your building service&apos;s REST API to fetch
                the latest environmental sensor data. You create a service that reads from your BMS and exposes it as a
                standard JSON endpoint. ComfortOS handles the rest: scheduling, retries, aggregation, and dashboards.
              </p>
              <div className="p-5 bg-gray-50 border rounded-xl">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-500">Your BMS</span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-50 px-2 text-[10px] text-gray-400 whitespace-nowrap">Internal</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-gray-500">Your Service</span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-50 px-2 text-[10px] text-gray-400 whitespace-nowrap">ComfortOS polls every N min</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="font-bold text-primary-600 text-sm">C</span>
                    </div>
                    <span className="text-gray-500">ComfortOS</span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-50 px-2 text-[10px] text-gray-400 whitespace-nowrap">Store &amp; Aggregate</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-500">Dashboard</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── How It Works ── */}
            <section id="doc-how-it-works">
              <h4 className="text-lg font-bold text-gray-900 mb-3">How It Works</h4>
              <div className="space-y-4">
                <p>
                  The ComfortOS <strong>Telemetry Poller</strong> is a background service that runs continuously. Every 60 seconds
                  it checks all registered connectors and polls those whose interval has elapsed (default: 15 minutes).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Automatic scheduling', desc: 'Configurable per connector — poll every 5, 15, 30, or 60 minutes.' },
                    { title: 'Circuit breaker', desc: 'After 10 consecutive failures, a connector is auto-disabled to prevent runaway retries.' },
                    { title: 'Status tracking', desc: 'Each connector tracks last poll time, last status code, total readings ingested, and failure count.' },
                    { title: 'Manual poll', desc: 'Admins can trigger an immediate poll via the Connector Management page or API.' },
                  ].map(({ title, desc }) => (
                    <div key={title} className="border rounded-xl p-4 hover:border-gray-300 transition-colors">
                      <div className="font-semibold text-gray-800 text-xs mb-1">{title}</div>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Quick Start ── */}
            <section id="doc-quickstart">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Start</h4>
              <div className="space-y-5">
                <div className="flex items-start">
                  <StepNumber n={1} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Create a REST API</div>
                    <p className="text-gray-500 text-xs mb-2">
                      Build a service that reads sensor data from your BMS/IoT platform and returns it as JSON.
                      See the <strong>API Response Format</strong> section below for the expected schema.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <StepNumber n={2} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Register a connector</div>
                    <p className="text-gray-500 text-xs mb-2">
                      In the admin panel go to <strong>Connectors</strong>, click <strong>Add Connector</strong>, and enter
                      your API URL and authentication details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <StepNumber n={3} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Test the connection</div>
                    <p className="text-gray-500 text-xs mb-2">
                      Use the <strong>Test</strong> button to verify ComfortOS can reach your API and parse the response correctly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <StepNumber n={4} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Enable &amp; view data</div>
                    <p className="text-gray-500 text-xs">
                      Toggle the connector on. ComfortOS will start polling automatically. Charts appear on the
                      Thermal Comfort and Performance tabs.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── API Response Format ── */}
            <section id="doc-api-format">
              <h4 className="text-lg font-bold text-gray-900 mb-3">API Response Format</h4>
              <p className="text-gray-600 mb-4">
                Your building service API should return a JSON response in this <strong>standard format</strong>.
                If your API uses a different structure, use <strong>Response Mapping</strong> to tell ComfortOS where to find the data.
              </p>
              <CopyBlock language="json" code={`{
  "readings": [
    {
      "metricType": "temperature",
      "value": 22.1,
      "unit": "°C",
      "floor": "Floor 1",
      "zone": "Zone A",
      "recordedAt": "2026-03-14T10:00:00Z"
    },
    {
      "metricType": "co2",
      "value": 485,
      "unit": "ppm",
      "floor": "Floor 1",
      "zone": "Zone A",
      "recordedAt": "2026-03-14T10:00:00Z"
    },
    {
      "metricType": "humidity",
      "value": 45.2,
      "unit": "%",
      "floor": "Floor 1",
      "recordedAt": "2026-03-14T10:00:00Z"
    }
  ]
}`} />
              <div className="mt-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Example implementations</div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2">Python (Flask)</div>
                  <CopyBlock language="python" code={`from flask import Flask, jsonify
import your_bms_sdk  # your BMS client library

app = Flask(__name__)

@app.route("/api/telemetry")
def get_telemetry():
    sensors = your_bms_sdk.get_latest_readings()
    readings = [
        {
            "metricType": s.type,     # "temperature", "co2", etc.
            "value": s.value,
            "unit": s.unit,
            "floor": s.floor_label,
            "zone": s.zone_label,
            "recordedAt": s.timestamp.isoformat() + "Z",
        }
        for s in sensors
    ]
    return jsonify({"readings": readings})`} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2">Node.js (Express)</div>
                  <CopyBlock language="javascript" code={`const express = require("express");
const bms = require("./bms-client"); // your BMS client

const app = express();

app.get("/api/telemetry", async (req, res) => {
  const sensors = await bms.getLatestReadings();
  const readings = sensors.map((s) => ({
    metricType: s.type,
    value: s.value,
    unit: s.unit,
    floor: s.floorLabel,
    zone: s.zoneLabel,
    recordedAt: s.timestamp.toISOString(),
  }));
  res.json({ readings });
});

app.listen(8080);`} />
                </div>
              </div>
            </section>

            {/* ── Field Reference ── */}
            <section id="doc-fields">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Field Reference</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs">Field</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs">Type</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs">Required</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-xs">
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">metricType</code></td><td className="px-4 py-2.5">string</td><td className="px-4 py-2.5"><span className="text-green-600 font-medium">Yes</span></td><td className="px-4 py-2.5"><code>temperature</code> · <code>co2</code> · <code>noise</code> · <code>humidity</code> · or custom</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">value</code></td><td className="px-4 py-2.5">number</td><td className="px-4 py-2.5"><span className="text-green-600 font-medium">Yes</span></td><td className="px-4 py-2.5">Sensor reading value (e.g. 21.5, 485)</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">unit</code></td><td className="px-4 py-2.5">string</td><td className="px-4 py-2.5"><span className="text-gray-400">No</span></td><td className="px-4 py-2.5">Display unit — °C, ppm, dBA, %</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">floor</code></td><td className="px-4 py-2.5">string</td><td className="px-4 py-2.5"><span className="text-gray-400">No</span></td><td className="px-4 py-2.5">Floor label. Omit for whole-building readings.</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">zone</code></td><td className="px-4 py-2.5">string</td><td className="px-4 py-2.5"><span className="text-gray-400">No</span></td><td className="px-4 py-2.5">Zone label within a floor</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">recordedAt</code></td><td className="px-4 py-2.5">ISO 8601</td><td className="px-4 py-2.5"><span className="text-green-600 font-medium">Yes</span></td><td className="px-4 py-2.5">UTC timestamp when the sensor captured the reading</td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">metadata</code></td><td className="px-4 py-2.5">object</td><td className="px-4 py-2.5"><span className="text-gray-400">No</span></td><td className="px-4 py-2.5">Arbitrary context — sensor ID, device model, etc.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Spatial Granularity ── */}
            <section id="doc-granularity">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Spatial Granularity</h4>
              <p className="text-gray-600 mb-4">You decide the level of spatial detail. ComfortOS adapts the chart automatically — one line per distinct floor/zone combination.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-5 bg-gray-50 hover:border-primary-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">Whole Building</div>
                  <p className="text-xs text-gray-500 mb-2">Omit both <code className="bg-white px-1 rounded">floor</code> and <code className="bg-white px-1 rounded">zone</code>.</p>
                  <p className="text-xs text-gray-400">{'\u2192'} Single &ldquo;Building&rdquo; line per metric</p>
                </div>
                <div className="border rounded-xl p-5 bg-gray-50 hover:border-primary-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                    <Layers className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">Per Floor</div>
                  <p className="text-xs text-gray-500 mb-2">Set <code className="bg-white px-1 rounded">floor</code> (e.g. &ldquo;Floor 0&rdquo;).</p>
                  <p className="text-xs text-gray-400">{'\u2192'} One colored line per floor</p>
                </div>
                <div className="border rounded-xl p-5 bg-gray-50 hover:border-primary-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                    <Grid className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">Per Zone</div>
                  <p className="text-xs text-gray-500 mb-2">Set both <code className="bg-white px-1 rounded">floor</code> + <code className="bg-white px-1 rounded">zone</code>.</p>
                  <p className="text-xs text-gray-400">{'\u2192'} One line per floor/zone combo</p>
                </div>
              </div>
            </section>

            {/* ── Metric Types ── */}
            <section id="doc-metrics">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Standard Metric Types</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(METRIC_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="border rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.color + '20' }}>
                        <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{cfg.label}</div>
                        <div className="text-xs text-gray-500"><code className="bg-gray-100 px-1 rounded">{key}</code> — measured in <strong>{cfg.unit}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Custom metric types are fully supported — just return any string as <code className="bg-gray-100 px-1 rounded">metricType</code>.
                The chart will render it automatically.
              </p>
            </section>

            {/* ── Security & Authentication ── */}
            <section id="doc-security">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Security &amp; Authentication</h4>
              <p className="text-gray-600 mb-4">
                When ComfortOS polls your building service, it authenticates using the method you configure per connector.
                We support <strong>six authentication methods</strong>, ordered below from most to least secure.
                Choose the strongest method your infrastructure supports.
              </p>

              <div className="space-y-6">
                {/* mTLS */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-green-50 border-b flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-bold">RECOMMENDED</span>
                    <span className="font-semibold text-gray-800 text-sm">Mutual TLS (mTLS)</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      Both sides present X.509 certificates. ComfortOS sends its client certificate; your server verifies it.
                      Your server also presents its certificate; ComfortOS verifies it via the CA certificate you provide.
                      This is the <strong>gold standard</strong> for machine-to-machine security — no shared secrets, cryptographic identity on both ends.
                    </p>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</div>
                    <CopyBlock language="json" code={`{
  "auth_type": "mtls",
  "auth_config": {
    "client_cert_pem": "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----",
    "client_key_pem": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----",
    "ca_cert_pem": "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----"
  }
}`} />
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
                      <strong>Your server must:</strong> Require client certificates in its TLS config and validate them against the shared CA.
                      In nginx: <code className="bg-blue-100 px-1 rounded">ssl_verify_client on; ssl_client_certificate /path/to/ca.pem;</code>
                    </div>
                  </div>
                </div>

                {/* OAuth2 Client Credentials */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-blue-50 border-b flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">ENTERPRISE</span>
                    <span className="font-semibold text-gray-800 text-sm">OAuth 2.0 Client Credentials</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      ComfortOS authenticates to your token endpoint with a <code className="bg-gray-100 px-1 rounded">client_id</code> and{' '}
                      <code className="bg-gray-100 px-1 rounded">client_secret</code>, receives a short-lived access token, and uses it
                      in the <code className="bg-gray-100 px-1 rounded">Authorization: Bearer</code> header on each poll request.
                      Tokens are cached and refreshed automatically.
                    </p>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</div>
                    <CopyBlock language="json" code={`{
  "auth_type": "oauth2_client_credentials",
  "auth_config": {
    "token_url": "https://your-idp.example.com/oauth2/token",
    "client_id": "your-client-id",
    "client_secret": "your-client-secret",
    "scope": "read:telemetry"
  }
}`} />
                    <p className="text-xs text-gray-500">
                      Works with any OAuth2 / OIDC provider — Azure AD, Auth0, Keycloak, Okta, AWS Cognito, etc.
                    </p>
                  </div>
                </div>

                {/* HMAC */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b">
                    <span className="font-semibold text-gray-800 text-sm">HMAC Signature</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      ComfortOS computes an HMAC-SHA256 (or SHA512) signature over a canonical request string and sends it
                      in a header. Your server recomputes the signature with the shared secret to verify authenticity and prevent tampering.
                    </p>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</div>
                    <CopyBlock language="json" code={`{
  "auth_type": "hmac",
  "auth_config": {
    "secret": "your-hmac-shared-secret",
    "header_name": "X-Signature",
    "algorithm": "sha256"
  }
}`} />
                    <div className="text-xs text-gray-500">
                      <strong>Signed payload:</strong>{' '}
                      <code className="bg-gray-100 px-1 rounded">{'METHOD\\nURL\\nTIMESTAMP'}</code> — the timestamp is also sent via
                      <code className="bg-gray-100 px-1 rounded ml-1">X-Timestamp</code> header so your server can reject stale requests.
                    </div>
                  </div>
                </div>

                {/* Bearer Token */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b">
                    <span className="font-semibold text-gray-800 text-sm">Bearer Token</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      A static token sent in the <code className="bg-gray-100 px-1 rounded">Authorization: Bearer</code> header on every request.
                      Simple to set up — your server just checks the header value matches.
                    </p>
                    <CopyBlock language="json" code={`{
  "auth_type": "bearer_token",
  "auth_config": {
    "token": "your-static-bearer-token"
  }
}`} />
                  </div>
                </div>

                {/* API Key */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b">
                    <span className="font-semibold text-gray-800 text-sm">API Key</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      A key sent in a custom header (default: <code className="bg-gray-100 px-1 rounded">X-Api-Key</code>).
                      The header name is configurable.
                    </p>
                    <CopyBlock language="json" code={`{
  "auth_type": "api_key",
  "auth_config": {
    "key": "your-api-key-value",
    "header_name": "X-Api-Key"
  }
}`} />
                  </div>
                </div>

                {/* Basic Auth */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b">
                    <span className="font-semibold text-gray-800 text-sm">Basic Authentication</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-600">
                      Standard HTTP Basic Auth — username and password sent Base64-encoded in the{' '}
                      <code className="bg-gray-100 px-1 rounded">Authorization</code> header. <strong>Only use over HTTPS.</strong>
                    </p>
                    <CopyBlock language="json" code={`{
  "auth_type": "basic_auth",
  "auth_config": {
    "username": "your-service-username",
    "password": "your-password"
  }
}`} />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Security best practices:</strong> Always use HTTPS for all endpoints. Prefer mTLS or OAuth2 for production deployments.
                Rotate credentials periodically. All auth credentials are stored encrypted on the server and are never exposed in API responses.
              </div>
            </section>

            {/* ── Response Mapping ── */}
            <section id="doc-response-mapping">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Response Mapping</h4>
              <p className="text-gray-600 mb-4">
                If your API doesn&apos;t return the standard format, configure a <strong>response mapping</strong> to tell ComfortOS
                where to find the readings array and how to extract each field. Paths use dot notation.
              </p>
              <CopyBlock language="json" code={`{
  "readings_path": "data.sensors",
  "metric_type_key": "sensorType",
  "value_key": "currentValue",
  "unit_key": "measurementUnit",
  "floor_key": "location.floor",
  "zone_key": "location.zone",
  "recorded_at_key": "lastUpdated"
}`} />
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Example: Your API returns</div>
                <CopyBlock language="json" code={`{
  "data": {
    "sensors": [
      {
        "sensorType": "temperature",
        "currentValue": 22.3,
        "measurementUnit": "°C",
        "location": { "floor": "Level 1", "zone": "East Wing" },
        "lastUpdated": "2026-03-14T10:00:00Z"
      }
    ]
  }
}`} />
                <p className="mt-2 text-xs text-gray-500">
                  ComfortOS will use the mapping to extract readings from this non-standard structure — no code changes needed on either side.
                </p>
              </div>
            </section>

            {/* ── Vote Overlay ── */}
            <section id="doc-votes">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Thermal Comfort Vote Overlay</h4>
              <p className="text-gray-600 mb-3">
                When occupants submit comfort votes with a <code className="bg-gray-100 px-1 rounded">thermal_comfort</code> field (scale {'\u2212'}3 to +3),
                the Building Analytics chart overlays the average vote as a <strong>dashed line</strong> on a secondary Y-axis.
                This lets facility managers correlate indoor temperatures with subjective occupant comfort.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="font-semibold text-rose-800 text-xs mb-2">ASHRAE 7-Point Scale</div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                    {[
                      { v: -3, l: 'Cold', c: 'bg-blue-200 text-blue-800' },
                      { v: -2, l: 'Cool', c: 'bg-blue-100 text-blue-700' },
                      { v: -1, l: 'Slightly Cool', c: 'bg-blue-50 text-blue-600' },
                      { v: 0, l: 'Neutral', c: 'bg-green-100 text-green-800 font-bold' },
                      { v: 1, l: 'Slightly Warm', c: 'bg-orange-50 text-orange-600' },
                      { v: 2, l: 'Warm', c: 'bg-orange-100 text-orange-700' },
                      { v: 3, l: 'Hot', c: 'bg-red-200 text-red-800' },
                    ].map(({ v, l, c }) => (
                      <div key={v} className={`${c} rounded py-1.5 px-0.5`}>
                        <div className="font-bold">{v > 0 ? `+${v}` : v}</div>
                        <div className="mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-gray-500 text-xs">
                Legacy 1–7 scale votes are automatically normalised to {'\u2212'}3 to +3.
              </p>
            </section>

            {/* ── Best Practices ── */}
            <section id="doc-best-practices">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Best Practices</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Poll interval', desc: '15-minute default works for most buildings. Use 5 min for high-traffic or comfort-critical zones.' },
                  { title: 'Always HTTPS', desc: 'Serve your building service over TLS. ComfortOS will not poll plain HTTP endpoints in production.' },
                  { title: 'Timestamps', desc: 'Always return UTC ISO 8601 timestamps in recordedAt to avoid timezone ambiguity.' },
                  { title: 'Consistent labels', desc: 'Use the same floor/zone strings every time (e.g. always "Floor 0", not "floor-0" or "Ground").' },
                  { title: 'Credential rotation', desc: 'Rotate bearer tokens, API keys, or OAuth2 secrets regularly. Update them in the Connectors admin page.' },
                  { title: 'Monitor status', desc: 'Check the connector status on the admin page. If consecutive failures reach 10, the connector auto-disables.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="border rounded-xl p-4 hover:border-gray-300 transition-colors">
                    <div className="font-semibold text-gray-800 text-xs mb-1">{title}</div>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
