import { useEffect, useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Brush,
  ReferenceLine,
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

  const [dateRange, setDateRange] = useState(7);
  const [granularity, setGranularity] = useState<'raw' | 'hourly' | 'daily'>('hourly');

  const [telemetryData, setTelemetryData] = useState<TelemetryQueryResponse | null>(null);
  const [voteOverlay, setVoteOverlay] = useState<VoteAnalyticsResponse | null>(null);
  const [showVotes, setShowVotes] = useState(true);

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

    const dateTo = new Date();
    const dateFrom = new Date(dateTo.getTime() - dateRange * 86400000);

    const metricType = activeTab === 'thermal' ? 'temperature'
      : activeTab === 'performance' ? activeMetric
      : 'temperature';

    Promise.all([
      telemetryApi.series(selectedBuilding, {
        metricType,
        dateFrom: toISODate(dateFrom),
        dateTo: toISODate(dateTo),
        granularity,
      }).catch(() => null),
      telemetryApi.metrics(selectedBuilding).catch(() => []),
      votesApi.analytics(selectedBuilding, toISODate(dateFrom), toISODate(dateTo)).catch(() => null),
    ]).then(([series, metrics, votes]) => {
      setTelemetryData(series);
      setAvailableMetrics(metrics);
      setVoteOverlay(votes);
    }).finally(() => setDataLoading(false));
  }, [selectedBuilding, activeTab, activeMetric, dateRange, granularity]);

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
    const keys = telemetryData.series.map((s) => s.label);

    // Build lookup per series
    const lookup: Record<string, Record<string, number>> = {};
    for (const s of telemetryData.series) {
      const map: Record<string, number> = {};
      for (const p of s.points) map[p.recordedAt] = p.value;
      lookup[s.label] = map;
    }

    // Also build vote overlay lookup (thermal_comfort average per time bucket)
    const voteLookup: Record<string, number> = {};
    if (voteOverlay?.votes && showVotes) {
      const buckets: Record<string, number[]> = {};
      for (const v of voteOverlay.votes) {
        const thermal = v.payload?.thermal_comfort;
        if (thermal === undefined || thermal === null) continue;
        const val = typeof thermal === 'number' ? thermal : parseFloat(String(thermal));
        if (isNaN(val)) continue;
        // Normalize legacy 1-7 to -3..+3
        const norm = (val >= 1 && val <= 7) ? val - 4 : val;
        // Bucket to hour or day matching granularity
        const d = new Date(v.createdAt);
        let key: string;
        if (granularity === 'daily') {
          key = d.toISOString().split('T')[0] + 'T00:00:00+00:00';
        } else {
          key = d.toISOString().replace(/:\d{2}\.\d{3}Z/, ':00:00+00:00');
        }
        (buckets[key] ??= []).push(norm);
      }
      for (const [k, vals] of Object.entries(buckets)) {
        voteLookup[k] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
      }
    }

    const rows = timestamps.map((ts) => {
      const row: Record<string, unknown> = { time: ts, _display: formatDateTime(ts, telemetryData.granularity) };
      for (const k of keys) {
        row[k] = lookup[k]?.[ts] ?? null;
      }
      if (voteLookup[ts] !== undefined) {
        row['Avg. Thermal Vote'] = voteLookup[ts];
      }
      return row;
    });

    return { chartData: rows, seriesKeys: keys };
  }, [telemetryData, voteOverlay, showVotes, granularity]);

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
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-400 ml-2" />
            {DATE_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDateRange(r.days)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  dateRange === r.days ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
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
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-2">
              <MetricIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                Avg. {metricInfo.label} by floor
              </span>
            </div>

            <div className="p-4" style={{ minHeight: 420 }}>
              {dataLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-gray-500 text-sm">
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
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="_display"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={{ stroke: '#4b5563' }}
                      axisLine={{ stroke: '#4b5563' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      yAxisId="metric"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={{ stroke: '#4b5563' }}
                      axisLine={{ stroke: '#4b5563' }}
                      unit={` ${metricInfo.unit}`}
                    />
                    {/* Vote overlay Y axis (-3 to +3) */}
                    {showVotes && hasVoteData && activeTab === 'thermal' && (
                      <YAxis
                        yAxisId="vote"
                        orientation="right"
                        domain={[-3, 3]}
                        tick={{ fill: '#f43f5e', fontSize: 11 }}
                        tickLine={{ stroke: '#f43f5e44' }}
                        axisLine={{ stroke: '#f43f5e44' }}
                        label={{ value: 'Thermal Vote', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 11 }}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        color: '#e5e7eb',
                        fontSize: 13,
                      }}
                      labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Avg. Thermal Vote') return [`${value}`, name];
                        return [`${value} ${metricInfo.unit}`, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#d1d5db', fontSize: 12, paddingTop: 8 }}
                    />
                    {/* Sensor series */}
                    {seriesKeys.map((key, i) => (
                      <Line
                        key={key}
                        yAxisId="metric"
                        type="monotone"
                        dataKey={key}
                        stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    ))}
                    {/* Thermal vote overlay */}
                    {showVotes && hasVoteData && activeTab === 'thermal' && (
                      <Line
                        yAxisId="vote"
                        type="monotone"
                        dataKey="Avg. Thermal Vote"
                        stroke={VOTE_LINE_COLOR}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        dot={{ r: 3, fill: VOTE_LINE_COLOR }}
                        connectNulls
                      />
                    )}
                    {/* Neutral vote reference line */}
                    {showVotes && hasVoteData && activeTab === 'thermal' && (
                      <ReferenceLine yAxisId="vote" y={0} stroke="#f43f5e33" strokeDasharray="4 4" />
                    )}
                    <Brush
                      dataKey="_display"
                      height={30}
                      stroke="#4b5563"
                      fill="#111827"
                      travellerWidth={10}
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
            label: r.floor ? (r.zone ? `${r.floor} / ${r.zone}` : r.floor) : r.zone ?? 'Building',
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
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'ingestion', label: 'Ingestion API' },
  { id: 'fields', label: 'Field Reference' },
  { id: 'granularity', label: 'Spatial Granularity' },
  { id: 'metrics', label: 'Metric Types' },
  { id: 'query', label: 'Query API' },
  { id: 'votes', label: 'Vote Overlay' },
  { id: 'responses', label: 'Response Codes' },
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
                <p className="text-gray-500 text-sm">Connect your BMS to push live environmental data into ComfortOS</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-400" /> REST API
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> JSON format
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> API Key auth
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-12 text-sm text-gray-700 leading-relaxed">

            {/* ── Overview ── */}
            <section id="doc-overview">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                Overview
              </h4>
              <p className="mb-4">
                ComfortOS accepts environmental telemetry from <strong>any building service</strong> that can make HTTP REST calls —
                BMS platforms, IoT gateways, custom scripts, or cloud-to-cloud connectors.
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
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-50 px-2 text-[10px] text-gray-400 whitespace-nowrap">POST /telemetry/ingest</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="font-bold text-primary-600 text-sm">C</span>
                    </div>
                    <span className="text-gray-500">ComfortOS</span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-50 px-2 text-[10px] text-gray-400 whitespace-nowrap">Store & Aggregate</span>
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

            {/* ── Quick Start ── */}
            <section id="doc-quickstart">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Start</h4>
              <div className="space-y-5">
                <div className="flex items-start">
                  <StepNumber n={1} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Set an API key</div>
                    <p className="text-gray-500 text-xs mb-2">Go to <strong>Config Editor → Dashboard Layout</strong> and add <code className="bg-gray-100 px-1 rounded">telemetryApiKey</code></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <StepNumber n={2} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">Push sensor data</div>
                    <p className="text-gray-500 text-xs mb-2">POST readings from your BMS to the ingestion endpoint</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <StepNumber n={3} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">View analytics</div>
                    <p className="text-gray-500 text-xs">Charts appear on the Thermal Comfort and Performance tabs automatically</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Authentication ── */}
            <section id="doc-authentication">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Authentication</h4>
              <p className="mb-3">
                Building service connectors authenticate using a <strong>per-building API key</strong>, decoupled from user authentication.
                The key is stored in the building&apos;s dashboard configuration.
              </p>
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Setting the API key</div>
                <CopyBlock language="json" code={`// In Config Editor → Dashboard Layout JSON, add:
{
  "telemetryApiKey": "your-secret-key-here",
  ...
}`} />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Security:</strong> Keep your API key secret. Anyone with this key can push telemetry data to your building.
                Rotate it at any time by updating the config value — the old key is immediately invalidated.
              </div>
            </section>

            {/* ── Ingestion API ── */}
            <section id="doc-ingestion">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Ingestion API</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">POST</span>
                <code className="text-sm text-gray-800 font-mono">/telemetry/ingest</code>
              </div>

              <div className="space-y-4">
                {/* cURL */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">cURL</div>
                  <CopyBlock language="bash" code={`curl -X POST https://your-api-host/telemetry/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: your-secret-key-here" \\
  -d '{
    "buildingId": "bldg-abc12345",
    "readings": [
      {
        "metricType": "temperature",
        "value": 21.5,
        "unit": "°C",
        "floor": "Floor 0",
        "recordedAt": "2026-03-14T10:00:00Z"
      },
      {
        "metricType": "co2",
        "value": 485,
        "unit": "ppm",
        "floor": "Floor 0",
        "zone": "Zone A",
        "recordedAt": "2026-03-14T10:00:00Z"
      }
    ]
  }'`} />
                </div>

                {/* Python */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Python</div>
                  <CopyBlock language="python" code={`import requests
from datetime import datetime, timezone

response = requests.post(
    "https://your-api-host/telemetry/ingest",
    headers={
        "Content-Type": "application/json",
        "X-Api-Key": "your-secret-key-here",
    },
    json={
        "buildingId": "bldg-abc12345",
        "readings": [
            {
                "metricType": "temperature",
                "value": 21.5,
                "unit": "°C",
                "floor": "Floor 0",
                "recordedAt": datetime.now(timezone.utc).isoformat(),
            },
        ],
    },
)
print(response.json())  # {"accepted": 1, "buildingId": "bldg-abc12345"}`} />
                </div>

                {/* Node.js */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Node.js</div>
                  <CopyBlock language="javascript" code={`const response = await fetch("https://your-api-host/telemetry/ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "your-secret-key-here",
  },
  body: JSON.stringify({
    buildingId: "bldg-abc12345",
    readings: [
      {
        metricType: "temperature",
        value: 21.5,
        unit: "°C",
        floor: "Floor 0",
        recordedAt: new Date().toISOString(),
      },
    ],
  }),
});
const data = await response.json();
console.log(data); // { accepted: 1, buildingId: "bldg-abc12345" }`} />
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
                  <p className="text-xs text-gray-400">→ Single "Building" line per metric</p>
                </div>
                <div className="border rounded-xl p-5 bg-gray-50 hover:border-primary-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                    <Layers className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">Per Floor</div>
                  <p className="text-xs text-gray-500 mb-2">Set <code className="bg-white px-1 rounded">floor</code> (e.g. "Floor 0").</p>
                  <p className="text-xs text-gray-400">→ One colored line per floor</p>
                </div>
                <div className="border rounded-xl p-5 bg-gray-50 hover:border-primary-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                    <Grid className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">Per Zone</div>
                  <p className="text-xs text-gray-500 mb-2">Set both <code className="bg-white px-1 rounded">floor</code> + <code className="bg-white px-1 rounded">zone</code>.</p>
                  <p className="text-xs text-gray-400">→ One line per floor/zone combo</p>
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
                Custom metric types are fully supported — just send any string as <code className="bg-gray-100 px-1 rounded">metricType</code>.
                The chart will render it automatically.
              </p>
            </section>

            {/* ── Query API ── */}
            <section id="doc-query">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Query API</h4>
              <p className="text-gray-600 mb-4">
                Authenticated clients (the frontend, or your own tools) query aggregated telemetry via these endpoints using a <strong>Bearer token</strong>.
              </p>
              <div className="space-y-3">
                <div className="border rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">GET</span>
                    <code className="text-xs text-gray-800 font-mono">/telemetry/&#123;buildingId&#125;/metrics</code>
                  </div>
                  <p className="text-xs text-gray-500">List all metric types available for a building.</p>
                </div>
                <div className="border rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">GET</span>
                    <code className="text-xs text-gray-800 font-mono">/telemetry/&#123;buildingId&#125;/series</code>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Query time-series data grouped by floor/zone.</p>
                  <div className="text-xs">
                    <span className="text-gray-400">Params: </span>
                    <code className="bg-gray-100 px-1 rounded">metricType</code>{' '}
                    <code className="bg-gray-100 px-1 rounded">dateFrom</code>{' '}
                    <code className="bg-gray-100 px-1 rounded">dateTo</code>{' '}
                    <code className="bg-gray-100 px-1 rounded">granularity</code>{' '}
                    <code className="bg-gray-100 px-1 rounded">floor</code>{' '}
                    <code className="bg-gray-100 px-1 rounded">zone</code>
                  </div>
                </div>
                <div className="border rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">GET</span>
                    <code className="text-xs text-gray-800 font-mono">/telemetry/&#123;buildingId&#125;/latest</code>
                  </div>
                  <p className="text-xs text-gray-500">Most recent reading per metric type per floor/zone.</p>
                </div>
              </div>
            </section>

            {/* ── Vote Overlay ── */}
            <section id="doc-votes">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Thermal Comfort Vote Overlay</h4>
              <p className="text-gray-600 mb-3">
                When occupants submit comfort votes with a <code className="bg-gray-100 px-1 rounded">thermal_comfort</code> field (scale −3 to +3),
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
                Legacy 1–7 scale votes are automatically normalised to −3 to +3.
              </p>
            </section>

            {/* ── Response Codes ── */}
            <section id="doc-responses">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Response Codes</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs w-24">Code</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono font-bold">200</span></td><td className="px-4 py-2.5 text-gray-600">Batch accepted — returns <code className="bg-gray-100 px-1 rounded">&#123; "accepted": N, "buildingId": "..." &#125;</code></td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-mono font-bold">401</span></td><td className="px-4 py-2.5 text-gray-600">Invalid API key</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-mono font-bold">403</span></td><td className="px-4 py-2.5 text-gray-600">Telemetry not configured — no API key set in building config</td></tr>
                    <tr className="border-b hover:bg-gray-50"><td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono font-bold">404</span></td><td className="px-4 py-2.5 text-gray-600">Building not found</td></tr>
                    <tr className="hover:bg-gray-50"><td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono font-bold">422</span></td><td className="px-4 py-2.5 text-gray-600">Validation error — malformed payload</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Best Practices ── */}
            <section id="doc-best-practices">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Best Practices</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Push frequency', desc: '5–15 minute intervals recommended for most BMS sensors.' },
                  { title: 'Batch size', desc: 'Up to 1,000 readings per request. Batch calls for efficiency.' },
                  { title: 'Timestamps', desc: 'Always use UTC ISO 8601 format for recordedAt.' },
                  { title: 'Consistent labels', desc: 'Use the same floor/zone strings every time (e.g. always "Floor 0").' },
                  { title: 'Idempotency', desc: 'Re-sending the same reading is safe — aggregation smooths duplicates.' },
                  { title: 'Key rotation', desc: 'Update telemetryApiKey in config at any time. Old key is invalidated immediately.' },
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
