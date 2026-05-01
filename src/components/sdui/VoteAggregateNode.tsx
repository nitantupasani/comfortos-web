import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { votesApi } from '../../api/votes';
import type { Vote } from '../../types';

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
  green: '#22c55e', teal: '#14b8a6', cyan: '#06b6d4', blue: '#3b82f6',
  indigo: '#6366f1', purple: '#a855f7', pink: '#ec4899',
  grey: '#6b7280', gray: '#6b7280',
};

function resolveColor(name?: string): string {
  return COLOR_MAP[name ?? ''] ?? '#14b8a6';
}

type Kind =
  | 'thermal'           // -3..3, closer to 0 = comfortable (ASHRAE PMV)
  | 'preference'        // -1..1, closer to 0 = comfortable (McIntyre)
  | 'acoustic'          // -2..2, closer to 0 = comfortable
  | 'air'               // legacy 1..3 high = better
  | 'air_5pt'           // 1..5 high = better
  | 'noise'             // legacy 1..5 stars high = better (no longer authored, kept for legacy data)
  | 'acceptability';    // boolean true = acceptable (= 100%)

export interface VoteAggregateMetric {
  /** Vote payload field id (thermal_sensation, air_quality, acoustic_comfort…). */
  id: string;
  /** Display label (e.g. "Thermal comfort"). */
  label: string;
  /** Bar color (named token: teal, amber, blue…). */
  color?: string;
  /** Mapping rule from raw vote value to a 0-100 score. */
  kind: Kind;
}

export interface VoteAggregateProps {
  /** Look-back window in days (default 7). */
  windowDays?: number;
  metrics?: VoteAggregateMetric[];
  /** Filter to a specific zone if set. */
  zone?: string;
}

const DEFAULT_METRICS: VoteAggregateMetric[] = [
  { id: 'thermal_sensation', label: 'Thermal comfort',  color: 'teal',  kind: 'thermal' },
  { id: 'air_quality',       label: 'Air freshness',    color: 'amber', kind: 'air_5pt' },
  { id: 'acoustic_comfort',  label: 'Acoustic comfort', color: 'teal',  kind: 'acoustic' },
];

/** Map a raw vote-field value to a 0..100 score (higher = better). */
function scoreOf(kind: Kind, raw: unknown): number | null {
  if (kind === 'acceptability') {
    if (typeof raw === 'boolean') return raw ? 100 : 0;
    if (typeof raw === 'string') {
      if (raw === 'true' || raw === 'yes') return 100;
      if (raw === 'false' || raw === 'no') return 0;
    }
    if (typeof raw === 'number') return raw ? 100 : 0;
    return null;
  }
  const num = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isFinite(num)) return null;
  switch (kind) {
    case 'thermal':
      // -3..3 around neutral 0; closer to 0 = more comfortable.
      return Math.max(0, Math.min(100, (1 - Math.abs(num) / 3) * 100));
    case 'preference':
      // -1..1 around 0; closer to 0 = comfortable (McIntyre).
      return Math.max(0, Math.min(100, (1 - Math.abs(num)) * 100));
    case 'acoustic':
      // -2..2 around 0; closer to 0 = comfortable.
      return Math.max(0, Math.min(100, (1 - Math.abs(num) / 2) * 100));
    case 'air':
      // legacy 1..3 (stuffy → fresh).
      return Math.max(0, Math.min(100, ((num - 1) / 2) * 100));
    case 'air_5pt':
      // 1..5 (very stuffy → very fresh).
      return Math.max(0, Math.min(100, ((num - 1) / 4) * 100));
    case 'noise':
      // legacy 1..5 stars (low = noisy/bad → high = quiet/good).
      return Math.max(0, Math.min(100, ((num - 1) / 4) * 100));
  }
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export default function VoteAggregateNode({
  windowDays = 7,
  metrics = DEFAULT_METRICS,
  zone,
}: VoteAggregateProps) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const token = useAuthStore((s) => s.token);

  const [votes, setVotes] = useState<Vote[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBuilding || !token) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const dateFrom = daysAgoIso(windowDays);
    const dateTo = new Date().toISOString();
    votesApi
      .analytics(activeBuilding.id, dateFrom, dateTo, zone)
      .then((res) => {
        if (!alive) return;
        setVotes(res.votes ?? []);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setVotes([]);
        setError(err instanceof Error ? err.message : 'Failed to load votes');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [activeBuilding?.id, token, windowDays, zone]);

  const aggregates = useMemo(() => {
    if (!votes) return [];
    return metrics.map((m) => {
      const scores: number[] = [];
      for (const v of votes) {
        const raw = (v.payload as Record<string, unknown> | null | undefined)?.[m.id];
        const s = scoreOf(m.kind, raw);
        if (s !== null) scores.push(s);
      }
      const avg = scores.length === 0
        ? null
        : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      return { ...m, avg, n: scores.length };
    });
  }, [votes, metrics]);

  const totalVotes = votes?.length ?? 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Aggregating last {windowDays}-day votes…
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-500 py-2">{error}</div>;
  }

  if (totalVotes === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
        No comfort votes yet over the last {windowDays} days.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-slate-500">
        Based on <span className="font-semibold text-slate-700">{totalVotes}</span>{' '}
        {totalVotes === 1 ? 'vote' : 'votes'} over the last {windowDays} days
      </div>
      {aggregates.map((a) => {
        const pct = a.avg ?? 0;
        const color = resolveColor(a.color);
        return (
          <div key={a.id} className="mb-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{a.label}</span>
              <span className="font-medium tabular-nums">
                {a.avg === null ? '—' : `${pct}%`}
                {a.n > 0 ? (
                  <span className="ml-1 text-slate-400">· {a.n}</span>
                ) : null}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
