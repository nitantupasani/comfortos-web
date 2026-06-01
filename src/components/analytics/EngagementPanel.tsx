import { useEffect, useState } from 'react';
import { Loader2, Trees, Sprout, Flame, Trophy, Users } from 'lucide-react';
import { votesApi } from '../../api/votes';
import type { LeaderboardResponse, EcoTier } from '../../types';
import EcoTree from '../gamification/EcoTree';
import { TIER_VISUALS } from '../gamification/tiers';

const TIER_ORDER: EcoTier[] = ['seedling', 'sapling', 'young', 'tree', 'forest'];

/**
 * Gamification / engagement stats for a building — occupant participation seen
 * through the eco-tree lens. Rendered on the admin Vote Analytics dashboard.
 */
export default function EngagementPanel({ buildingId }: { buildingId: string }) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    votesApi
      .leaderboard(buildingId, 100)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [buildingId]);

  if (loading) {
    return (
      <div className="flex justify-center rounded-2xl border border-gray-200/70 bg-white py-10 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
      </div>
    );
  }

  const summary = data?.summary;
  const entries = data?.leaderboard ?? [];
  if (!summary || summary.totalContributors === 0) return null;

  const avgVotes = summary.totalVotes / summary.totalContributors;
  const dist = TIER_ORDER.map((t) => ({
    tier: t,
    count: entries.filter((e) => e.tier === t).length,
  }));
  const distTotal = dist.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Trees className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 leading-tight">Occupant engagement</h3>
          <p className="text-xs text-gray-400">Gamified participation · eco-tree contribution</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Contributors" value={summary.totalContributors} icon={<Users className="h-4 w-4 text-teal-500" />} />
        <Kpi label="Trees grown" value={summary.treesGrown} icon={<Trees className="h-4 w-4 text-teal-600" />} />
        <Kpi label="Active streaks" value={summary.activeStreaks} icon={<Flame className="h-4 w-4 text-orange-500" />} />
        <Kpi label="Avg votes / person" value={avgVotes.toFixed(1)} icon={<Sprout className="h-4 w-4 text-emerald-500" />} />
        <Kpi
          label="Top contributor"
          value={summary.topContributor ? summary.topContributor.name.split(' ')[0] : '—'}
          sub={summary.topContributor ? `${summary.topContributor.ecoPoints.toLocaleString()} pts` : undefined}
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top 5 contributors */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Top contributors</h4>
          <div className="space-y-2">
            {entries.slice(0, 5).map((e) => (
              <div key={e.userId} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold tabular-nums text-gray-400">{e.rank}</span>
                <EcoTree tier={e.tier} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800">{e.name}</div>
                  <div className="text-[11px] text-gray-400">{e.tierLabel} · {e.votes} votes</div>
                </div>
                <div className="text-sm font-bold tabular-nums text-teal-600">{e.ecoPoints.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier distribution */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Tier distribution</h4>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
            {dist.map((d) =>
              d.count > 0 ? (
                <div
                  key={d.tier}
                  style={{ width: `${(d.count / distTotal) * 100}%`, backgroundColor: TIER_VISUALS[d.tier].foliageDark }}
                  title={`${TIER_VISUALS[d.tier].label}: ${d.count}`}
                />
              ) : null,
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {dist.map((d) => (
              <div key={d.tier} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: TIER_VISUALS[d.tier].foliageDark }} />
                <span className="text-gray-600">{TIER_VISUALS[d.tier].label}</span>
                <span className="ml-auto font-semibold tabular-nums text-gray-800">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-3 shadow-sm">
      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50">{icon}</div>
      <div className="truncate text-lg font-bold tabular-nums text-gray-800">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </div>
  );
}
