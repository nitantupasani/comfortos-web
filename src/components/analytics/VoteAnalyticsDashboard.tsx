import { useEffect, useState, useMemo } from 'react';
import {
  BarChart3,
  Loader2,
  Building2,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Hash,
  Layers,
} from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { votesApi, VoteAnalyticsResponse } from '../../api/votes';
import type { Building, Vote, VoteFormSchema, VoteFormField } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { DEFAULT_VOTE_FORM } from '../../utils/defaultVoteForm';

/* ── Constants ──────────────────────────────────────────── */

const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7',
  '#14b8a6', '#ec4899', '#f97316', '#06b6d4', '#84cc16',
  '#6366f1', '#d946ef', '#0ea5e9', '#10b981', '#fbbf24',
];

const THERMAL_LABELS: Record<number, string> = {
  [-3]: 'Cold',
  [-2]: 'Cool',
  [-1]: 'Slightly Cool',
  [0]: 'Neutral',
  [1]: 'Slightly Warm',
  [2]: 'Warm',
  [3]: 'Hot',
};

/** Field types that produce categorical values suitable for group-by */
const CATEGORICAL_TYPES = new Set([
  'single_select',
  'emoji_single_select',
  'emoji_scale',
  'yes_no',
  'emoji_select',
]);

/* ── Helpers ────────────────────────────────────────────── */

function isGroupableField(field: VoteFormField): boolean {
  return CATEGORICAL_TYPES.has(field.type);
}

function getFieldLabel(field: VoteFormField): string {
  return field.question || field.label || field.id;
}

function getOptionLabel(field: VoteFormField, value: unknown): string {
  if (field.type === 'yes_no') {
    return value === true || value === 'true' || value === 1 ? (field.yesLabel ?? 'Yes') : (field.noLabel ?? 'No');
  }

  if (field.options) {
    const match = field.options.find((o) => String(o.value) === String(value));
    if (match) return match.emoji ? `${match.emoji} ${match.label}` : match.label;
  }
  return String(value ?? 'Unknown');
}

/** Extract a display-friendly value from a vote payload for a field */
function extractDisplayValue(field: VoteFormField, raw: unknown): string {
  if (raw === undefined || raw === null) return '—';

  if (field.type === 'thermal_scale') {
    const n = Number(raw);
    return THERMAL_LABELS[n] ?? String(n);
  }
  if (field.type === 'yes_no') {
    return raw === true || raw === 'true' || raw === 1 ? (field.yesLabel ?? 'Yes') : (field.noLabel ?? 'No');
  }
  if (field.type === 'rating_stars') return `${raw} ★`;
  if (field.options) {
    const match = field.options.find((o) => String(o.value) === String(raw));
    if (match) return match.emoji ? `${match.emoji} ${match.label}` : match.label;
  }
  if (Array.isArray(raw)) return raw.map(String).join(', ');
  return String(raw);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/* ── Distribution builders ──────────────────────────────── */

interface DistItem { name: string; value: number; sortKey: number | string }

function buildDistribution(
  votes: Vote[],
  field: VoteFormField,
): DistItem[] {
  const counts: Record<string, number> = {};

  for (const v of votes) {
    const raw = v.payload[field.id];
    if (raw === undefined || raw === null) continue;

    if (field.type === 'multi_select' || field.type === 'emoji_multi_select') {
      const arr = Array.isArray(raw) ? raw : [raw];
      for (const item of arr) {
        const label = getOptionLabel(field, item);
        counts[label] = (counts[label] ?? 0) + 1;
      }
    } else {
      const label = extractDisplayValue(field, raw);
      counts[label] = (counts[label] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value, sortKey: name }))
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1));
}

function buildThermalDistribution(
  votes: Vote[],
  field: VoteFormField,
): DistItem[] {
  const min = field.min ?? -3;
  const max = field.max ?? 3;
  const dist: DistItem[] = [];
  for (let i = min; i <= max; i++) {
    dist.push({ name: THERMAL_LABELS[i] ?? String(i), value: 0, sortKey: i });
  }

  for (const v of votes) {
    const raw = v.payload[field.id];
    if (raw === undefined || raw === null) continue;
    const n = Number(raw);
    // Data is already in -3..+3 ASHRAE scale
    const clamped = Math.max(min, Math.min(max, Math.round(n)));
    const idx = clamped - min;
    if (idx >= 0 && idx < dist.length) dist[idx].value++;
  }
  return dist;
}

function buildStarDistribution(
  votes: Vote[],
  field: VoteFormField,
): DistItem[] {
  const maxStars = field.maxStars ?? field.max ?? 5;
  const dist: DistItem[] = [];
  for (let i = 1; i <= maxStars; i++) {
    dist.push({ name: `${i} ★`, value: 0, sortKey: i });
  }

  for (const v of votes) {
    const raw = v.payload[field.id];
    if (raw === undefined || raw === null) continue;
    const n = Math.round(Number(raw));
    if (n >= 1 && n <= maxStars) dist[n - 1].value++;
  }
  return dist;
}

function computeAverage(votes: Vote[], fieldId: string): number | null {
  let sum = 0;
  let count = 0;
  for (const v of votes) {
    const raw = v.payload[fieldId];
    if (raw !== undefined && raw !== null && typeof raw === 'number') {
      sum += raw;
      count++;
    }
  }
  return count > 0 ? sum / count : null;
}

/* ── Grouped distribution builder ──────────────────────── */

interface GroupedDistItem {
  name: string;
  [groupLabel: string]: number | string;
}

function buildGroupedDistribution(
  votes: Vote[],
  field: VoteFormField,
  groupByField: VoteFormField,
): { data: GroupedDistItem[]; groups: string[] } {
  // First, get all group values
  const groupValues = new Set<string>();
  for (const v of votes) {
    const gval = v.payload[groupByField.id];
    if (gval !== undefined && gval !== null) {
      groupValues.add(getOptionLabel(groupByField, gval));
    }
  }
  const groups = Array.from(groupValues).sort();

  // Build per-group vote buckets
  const buckets: Record<string, Vote[]> = {};
  for (const g of groups) buckets[g] = [];
  for (const v of votes) {
    const gval = v.payload[groupByField.id];
    if (gval === undefined || gval === null) continue;
    const label = getOptionLabel(groupByField, gval);
    if (buckets[label]) buckets[label].push(v);
  }

  // Get the base distribution keys (use all votes to find all possible values)
  let baseDistFn: (vs: Vote[], f: VoteFormField) => DistItem[];
  if (field.type === 'thermal_scale') baseDistFn = buildThermalDistribution;
  else if (field.type === 'rating_stars') baseDistFn = buildStarDistribution;
  else baseDistFn = buildDistribution;

  const allKeys = baseDistFn(votes, field).map((d) => d.name);

  // Build grouped data
  const data: GroupedDistItem[] = allKeys.map((name) => {
    const item: GroupedDistItem = { name };
    for (const g of groups) {
      const dist = baseDistFn(buckets[g], field);
      const match = dist.find((d) => d.name === name);
      item[g] = match?.value ?? 0;
    }
    return item;
  });

  return { data, groups };
}

/* ── Votes-per-day builder ──────────────────────────────── */

function buildTimeSeries(
  votes: Vote[],
  groupByField?: VoteFormField,
): { data: Record<string, unknown>[]; groups: string[] } {
  if (!groupByField) {
    const counts: Record<string, number> = {};
    for (const v of votes) {
      const day = formatDate(v.createdAt);
      counts[day] = (counts[day] ?? 0) + 1;
    }
    const data = Object.entries(counts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([day, count]) => ({ day, Votes: count }));
    return { data, groups: ['Votes'] };
  }

  // Grouped time series
  const groupValues = new Set<string>();
  for (const v of votes) {
    const gval = v.payload[groupByField.id];
    if (gval !== undefined && gval !== null) {
      groupValues.add(getOptionLabel(groupByField, gval));
    }
  }
  const groups = Array.from(groupValues).sort();

  const dayCounts: Record<string, Record<string, number>> = {};
  for (const v of votes) {
    const day = formatDate(v.createdAt);
    const gval = v.payload[groupByField.id];
    const glabel = gval !== undefined && gval !== null ? getOptionLabel(groupByField, gval) : null;
    if (!dayCounts[day]) dayCounts[day] = {};
    if (glabel) {
      dayCounts[day][glabel] = (dayCounts[day][glabel] ?? 0) + 1;
    }
  }

  const data = Object.entries(dayCounts)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([day, gc]) => {
      const row: Record<string, unknown> = { day };
      for (const g of groups) row[g] = gc[g] ?? 0;
      return row;
    });

  return { data, groups };
}

/* ── Sub-components ─────────────────────────────────────── */

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-gray-800 tabular-nums">{value}</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm select-none">
      No data available
    </div>
  );
}

/* ── Chart for a single question ────────────────────────── */

function QuestionChart({
  field,
  votes,
  groupByField,
}: {
  field: VoteFormField;
  votes: Vote[];
  groupByField?: VoteFormField;
}) {
  // Skip text_input fields — show a summary instead
  if (field.type === 'text_input') {
    const responses = votes
      .map((v) => v.payload[field.id])
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(String);
    return (
      <div className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-700 mb-3">{getFieldLabel(field)}</h3>
        <p className="text-sm text-gray-500 mb-2">{responses.length} response{responses.length !== 1 ? 's' : ''}</p>
        <div className="max-h-48 overflow-y-auto space-y-1.5">
          {responses.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No text responses yet</p>
          ) : (
            responses.slice(0, 50).map((r, i) => (
              <div key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                "{r}"
              </div>
            ))
          )}
          {responses.length > 50 && (
            <p className="text-xs text-gray-400">...and {responses.length - 50} more</p>
          )}
        </div>
      </div>
    );
  }

  // Numeric average for stars and thermal
  const avg = (field.type === 'rating_stars' || field.type === 'thermal_scale' || field.type === 'slider')
    ? computeAverage(votes, field.id)
    : null;

  // Grouped mode?
  const isGrouped = !!groupByField && groupByField.id !== field.id;

  if (isGrouped) {
    return <GroupedQuestionChart field={field} votes={votes} groupByField={groupByField!} avg={avg} />;
  }

  // Non-grouped distribution
  let dist: DistItem[];
  if (field.type === 'thermal_scale') {
    dist = buildThermalDistribution(votes, field);
  } else if (field.type === 'rating_stars') {
    dist = buildStarDistribution(votes, field);
  } else {
    dist = buildDistribution(votes, field);
  }

  const responded = dist.reduce((s, d) => s + d.value, 0);
  const usePie = (field.type === 'yes_no' || field.type === 'single_select' || field.type === 'emoji_single_select')
    && dist.length <= 6;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-gray-700">{getFieldLabel(field)}</h3>
        {avg !== null && (
          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            avg {avg.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3">{responded} response{responded !== 1 ? 's' : ''} · {field.type.replace(/_/g, ' ')}</p>

      <div className="h-56">
        {responded === 0 ? <NoData /> : usePie ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dist} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {dist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={dist.length > 5 ? -30 : 0} textAnchor={dist.length > 5 ? 'end' : 'middle'} height={dist.length > 5 ? 60 : 30} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {dist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ── Grouped chart (stacked bars) ───────────────────────── */

function GroupedQuestionChart({
  field,
  votes,
  groupByField,
  avg,
}: {
  field: VoteFormField;
  votes: Vote[];
  groupByField: VoteFormField;
  avg: number | null;
}) {
  const { data, groups } = buildGroupedDistribution(votes, field, groupByField);
  const responded = data.reduce((s, d) => {
    let total = 0;
    for (const g of groups) total += (d[g] as number) ?? 0;
    return s + total;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-gray-700">{getFieldLabel(field)}</h3>
        {avg !== null && (
          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            avg {avg.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3">
        {responded} response{responded !== 1 ? 's' : ''} · grouped by <span className="font-medium text-gray-500">{getFieldLabel(groupByField)}</span>
      </p>
      <div className="h-56">
        {responded === 0 ? <NoData /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={data.length > 5 ? -30 : 0} textAnchor={data.length > 5 ? 'end' : 'middle'} height={data.length > 5 ? 60 : 30} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
              {groups.map((g, i) => (
                <Bar key={g} dataKey={g} stackId="stack" fill={COLORS[i % COLORS.length]} radius={i === groups.length - 1 ? [4, 4, 0, 0] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ── Group-by average summary table ──────────────────────── */

function GroupAverageSummary({
  fields,
  votes,
  groupByField,
}: {
  fields: VoteFormField[];
  votes: Vote[];
  groupByField: VoteFormField;
}) {
  // Get group values
  const groupValues = new Set<string>();
  const groupBuckets: Record<string, Vote[]> = {};
  for (const v of votes) {
    const gval = v.payload[groupByField.id];
    if (gval !== undefined && gval !== null) {
      const label = getOptionLabel(groupByField, gval);
      groupValues.add(label);
      if (!groupBuckets[label]) groupBuckets[label] = [];
      groupBuckets[label].push(v);
    }
  }
  const groups = Array.from(groupValues).sort();

  // Numeric fields that have averages
  const numericFields = fields.filter(
    (f) => f.id !== groupByField.id &&
      (f.type === 'thermal_scale' || f.type === 'rating_stars' || f.type === 'slider' || f.type === 'emoji_scale')
  );

  if (numericFields.length === 0 || groups.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary-500" />
        Average Scores by {getFieldLabel(groupByField)}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Question</th>
              {groups.map((g) => (
                <th key={g} className="text-center py-2 px-3 text-gray-500 font-medium">{g}</th>
              ))}
              <th className="text-center py-2 px-3 text-gray-500 font-medium">Overall</th>
            </tr>
          </thead>
          <tbody>
            {numericFields.map((f) => {
              const overallAvg = computeAverage(votes, f.id);
              return (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 text-gray-700">{getFieldLabel(f)}</td>
                  {groups.map((g) => {
                    const avg = computeAverage(groupBuckets[g] ?? [], f.id);
                    return (
                      <td key={g} className="text-center py-2 px-3">
                        {avg !== null ? (
                          <span className="font-semibold text-gray-800">{avg.toFixed(1)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-3 font-semibold text-primary-600">
                    {overallAvg !== null ? overallAvg.toFixed(1) : '—'}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-50">
              <td className="py-2 pr-4 text-gray-500 font-medium">Responses</td>
              {groups.map((g) => (
                <td key={g} className="text-center py-2 px-3 text-gray-600 font-medium">
                  {groupBuckets[g]?.length ?? 0}
                </td>
              ))}
              <td className="text-center py-2 px-3 text-gray-600 font-medium">{votes.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Radar comparison chart ──────────────────────────────── */

function GroupRadarChart({
  fields,
  votes,
  groupByField,
}: {
  fields: VoteFormField[];
  votes: Vote[];
  groupByField: VoteFormField;
}) {
  const numericFields = fields.filter(
    (f) => f.id !== groupByField.id &&
      (f.type === 'thermal_scale' || f.type === 'rating_stars' || f.type === 'slider' || f.type === 'emoji_scale')
  );
  if (numericFields.length < 3) return null;

  const groupValues = new Set<string>();
  const groupBuckets: Record<string, Vote[]> = {};
  for (const v of votes) {
    const gval = v.payload[groupByField.id];
    if (gval !== undefined && gval !== null) {
      const label = getOptionLabel(groupByField, gval);
      groupValues.add(label);
      if (!groupBuckets[label]) groupBuckets[label] = [];
      groupBuckets[label].push(v);
    }
  }
  const groups = Array.from(groupValues).sort();
  if (groups.length === 0) return null;

  // Build radar data: normalize each field's average to 0–10 scale
  const radarData = numericFields.map((f) => {
    const row: Record<string, unknown> = { question: getFieldLabel(f) };
    for (const g of groups) {
      const avg = computeAverage(groupBuckets[g] ?? [], f.id);
      if (avg === null) { row[g] = 0; continue; }
      // Normalize based on field type
      if (f.type === 'thermal_scale') {
        // -3..+3 → how close to neutral (0)? map |avg|/3 → comfort 0..10
        row[g] = Math.round((1 - Math.abs(avg) / 3) * 10 * 10) / 10;
      } else if (f.type === 'rating_stars') {
        row[g] = Math.round((avg / (f.maxStars ?? 5)) * 10 * 10) / 10;
      } else if (f.type === 'emoji_scale') {
        const maxVal = Math.max(...(f.options ?? []).map((o) => Number(o.value) || 0), 1);
        row[g] = Math.round((avg / maxVal) * 10 * 10) / 10;
      } else {
        row[g] = Math.round(avg * 10) / 10;
      }
    }
    return row;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-700 mb-3">Comfort Radar — by {getFieldLabel(groupByField)}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="question" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
            {groups.map((g, i) => (
              <Radar
                key={g}
                name={g}
                dataKey={g}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend verticalAlign="bottom" />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ───────────────────────────── */

interface VoteAnalyticsProps {
  /** When true, only shows buildings the caller manages (for FM pages) */
  managedOnly?: boolean;
}

export default function VoteAnalyticsDashboard({ managedOnly = false }: VoteAnalyticsProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBldg, setSelectedBldg] = useState<string>('');
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());
  const [analyticsData, setAnalyticsData] = useState<VoteAnalyticsResponse | null>(null);
  const [voteForm, setVoteForm] = useState<VoteFormSchema | null>(null);
  const [groupByFieldId, setGroupByFieldId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingVotes, setLoadingVotes] = useState(false);

  // Load buildings
  useEffect(() => {
    const loader = managedOnly ? buildingsApi.listManaged() : buildingsApi.list();
    loader.then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelectedBldg(b[0].id);
    }).finally(() => setLoading(false));
  }, [managedOnly]);

  // Load vote form schema + analytics when building changes
  useEffect(() => {
    if (!selectedBldg) return;

    setLoadingVotes(true);
    setGroupByFieldId('');

    Promise.all([
      buildingsApi.voteForm(selectedBldg).catch(() => null),
      votesApi.analytics(selectedBldg, dateFrom, dateTo).catch(() => null),
    ]).then(([form, data]) => {
      setVoteForm(form ?? DEFAULT_VOTE_FORM);
      setAnalyticsData(data);
    }).finally(() => setLoadingVotes(false));
  }, [selectedBldg, dateFrom, dateTo]);

  const fields = useMemo(() => voteForm?.fields ?? [], [voteForm]);
  const votes = useMemo(() => analyticsData?.votes ?? [], [analyticsData]);

  const groupableFields = useMemo(
    () => fields.filter(isGroupableField),
    [fields],
  );

  const groupByField = useMemo(
    () => fields.find((f) => f.id === groupByFieldId),
    [fields, groupByFieldId],
  );

  // Time series data
  const timeSeries = useMemo(
    () => buildTimeSeries(votes, groupByField),
    [votes, groupByField],
  );

  // KPIs
  const totalResponses = votes.length;
  const uniqueRespondents = new Set(votes.map((v) => v.userId)).size;
  const dateRange = votes.length > 0
    ? `${formatDate(votes[votes.length - 1].createdAt)} – ${formatDate(votes[0].createdAt)}`
    : '—';
  const avgResponsesPerDay = votes.length > 0
    ? ((): number => {
      const days = new Set(votes.map((v) => new Date(v.createdAt).toDateString())).size;
      return days > 0 ? Math.round(votes.length / days * 10) / 10 : 0;
    })()
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header & Controls ──────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">Vote Analytics</h2>
            <p className="text-xs text-gray-500">Occupant comfort feedback · distribution and trends</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 bg-white border border-gray-200/70 rounded-2xl p-3 shadow-sm">
          {/* Building selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <Building2 className="h-3 w-3 inline mr-1" />Building
            </label>
            <select
              value={selectedBldg}
              onChange={(e) => setSelectedBldg(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none bg-white min-w-[180px]"
            >
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none bg-white"
            />
          </div>

          {/* Group-by selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <Filter className="h-3 w-3 inline mr-1" />Group by
            </label>
            <select
              value={groupByFieldId}
              onChange={(e) => setGroupByFieldId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none bg-white min-w-[180px]"
            >
              <option value="">No grouping</option>
              {groupableFields.map((f) => (
                <option key={f.id} value={f.id}>{getFieldLabel(f)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingVotes ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
        </div>
      ) : (
        <>
          {/* ── KPI cards ────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Responses"
              value={totalResponses}
              icon={<Hash className="h-5 w-5 text-primary-500" />}
            />
            <StatCard
              label="Unique Respondents"
              value={uniqueRespondents}
              icon={<Users className="h-5 w-5 text-green-500" />}
            />
            <StatCard
              label="Avg / Day"
              value={avgResponsesPerDay}
              icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              label="Date Range"
              value={dateRange}
              icon={<Calendar className="h-5 w-5 text-purple-500" />}
            />
          </div>

          {/* ── Group-by summary table ────────────────────── */}
          {groupByField && (
            <GroupAverageSummary fields={fields} votes={votes} groupByField={groupByField} />
          )}

          {/* ── Radar chart (when grouping with 3+ numeric fields) */}
          {groupByField && (
            <GroupRadarChart fields={fields} votes={votes} groupByField={groupByField} />
          )}

          {/* ── Per-question charts ──────────────────────── */}
          {fields.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Per-question breakdown</h3>
                <span className="text-xs text-gray-400">{fields.length} question{fields.length === 1 ? '' : 's'}</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {fields.map((f) => (
                  <QuestionChart
                    key={f.id}
                    field={f}
                    votes={votes}
                    groupByField={groupByField}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Time series (votes over time) ────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200/70 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">Responses over time</h3>
                <p className="text-xs text-gray-400">Daily vote count{groupByField ? ` · grouped by ${getFieldLabel(groupByField)}` : ''}</p>
              </div>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                {totalResponses} total
              </span>
            </div>
            <div className="h-56">
              {timeSeries.data.length === 0 ? <NoData /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    {timeSeries.groups.length > 1 && <Legend verticalAlign="bottom" height={36} />}
                    {timeSeries.groups.map((g, i) => (
                      <Line
                        key={g}
                        type="monotone"
                        dataKey={g}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── No vote form warning ─────────────────────── */}
          {fields.length === 0 && totalResponses === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-700 font-medium">No vote data yet for this building.</p>
              <p className="text-amber-600 text-sm mt-1">
                Once occupants start submitting votes, analytics will appear here automatically.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
