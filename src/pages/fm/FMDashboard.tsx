import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BarChart3,
  Vote,
  MapPin,
  ArrowRight,
  Thermometer,
  Bell,
  FileQuestion,
  PanelsTopLeft,
  AlertTriangle,
  Trees,
  Flame,
} from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { votesApi } from '../../api/votes';
import type { Building, BuildingComfortData, LeaderboardResponse } from '../../types';
import { PageHeader, KpiCard, SectionCard, StatusBadge, EmptyState } from '../../components/common/ui';
import EcoTree from '../../components/gamification/EcoTree';

export default function FMDashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [comforts, setComforts] = useState<Map<string, BuildingComfortData>>(new Map());
  const [engagement, setEngagement] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buildings.length === 0) return;
    votesApi
      .leaderboard(buildings[0].id, 5)
      .then(setEngagement)
      .catch(() => setEngagement(null));
  }, [buildings]);

  useEffect(() => {
    const load = async () => {
      try {
        const bldgs = await buildingsApi.listManaged();
        setBuildings(bldgs);
        const comfortMap = new Map<string, BuildingComfortData>();
        await Promise.all(
          bldgs.map(async (b) => {
            try {
              const c = await buildingsApi.comfort(b.id);
              if (c) comfortMap.set(b.id, c);
            } catch {
              /* skip */
            }
          }),
        );
        setComforts(comfortMap);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalVotes = useMemo(
    () => Array.from(comforts.values()).reduce((sum, c) => sum + c.totalVotes, 0),
    [comforts],
  );
  const totalLocations = useMemo(
    () => Array.from(comforts.values()).reduce((sum, c) => sum + c.locations.length, 0),
    [comforts],
  );
  const avgComfort = useMemo(() => {
    const vals = Array.from(comforts.values()).map((c) => c.overallScore);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [comforts]);

  const attentionList = useMemo(() => {
    const flagged: { building: Building; comfort: BuildingComfortData }[] = [];
    for (const b of buildings) {
      const c = comforts.get(b.id);
      if (c && c.overallScore < 6) flagged.push({ building: b, comfort: c });
    }
    return flagged.sort((a, b) => a.comfort.overallScore - b.comfort.overallScore);
  }, [buildings, comforts]);

  return (
    <>
      <PageHeader
        title="Facility Dashboard"
        description="Live comfort signal across your buildings, with the locations most in need of attention."
        actions={
          <>
            <Link
              to="/fm/comfort"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 text-sm font-medium transition-colors shadow-sm"
            >
              <BarChart3 className="h-4 w-4" /> Comfort Analytics
            </Link>
            <Link
              to="/fm/notifications"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-2 text-sm font-medium transition-colors"
            >
              <Bell className="h-4 w-4" /> Notifications
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          tone="primary"
          icon={<Building2 className="h-5 w-5" />}
          label="My Buildings"
          value={loading ? '—' : buildings.length}
          loading={loading}
        />
        <KpiCard
          tone="emerald"
          icon={<Thermometer className="h-5 w-5" />}
          label="Avg Comfort"
          value={loading ? '—' : avgComfort != null ? avgComfort.toFixed(1) : '—'}
          hint={avgComfort != null ? '/ 10' : 'no data'}
          loading={loading}
        />
        <KpiCard
          tone="blue"
          icon={<Vote className="h-5 w-5" />}
          label="Total Votes"
          value={loading ? '—' : totalVotes.toLocaleString()}
          loading={loading}
        />
        <KpiCard
          tone="violet"
          icon={<MapPin className="h-5 w-5" />}
          label="Locations"
          value={loading ? '—' : totalLocations}
          hint="monitored"
          loading={loading}
        />
      </div>

      {/* Buildings + attention */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        <SectionCard
          className="xl:col-span-2"
          icon={<Building2 className="h-4 w-4" />}
          title="Your buildings"
          description="Latest comfort signal per building"
          padding="none"
        >
          {buildings.length === 0 && !loading ? (
            <EmptyState
              icon={<Building2 className="h-5 w-5" />}
              title="No buildings assigned"
              description="Once an admin grants access, your buildings will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              {(loading ? Array.from({ length: 4 }).map((_, i) => ({ id: String(i) } as Building)) : buildings).map(
                (b) => {
                  const c = comforts.get(b.id);
                  const score = c?.overallScore;
                  const color =
                    score == null
                      ? '#9ca3af'
                      : score >= 7
                        ? '#10b981'
                        : score >= 5
                          ? '#f59e0b'
                          : '#ef4444';
                  const pct = Math.max(0, Math.min(100, ((score ?? 0) / 10) * 100));
                  return (
                    <Link
                      key={b.id}
                      to={`/fm/comfort?building=${b.id}`}
                      className="group block rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {loading ? 'Loading…' : b.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{b.city || '\u00a0'}</div>
                        </div>
                        {c && (
                          <StatusBadge
                            tone={
                              score != null && score >= 7
                                ? 'success'
                                : score != null && score >= 5
                                  ? 'warning'
                                  : 'danger'
                            }
                            dot
                          >
                            {score!.toFixed(1)}
                          </StatusBadge>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{c?.totalVotes ?? 0} votes</span>
                          <span>{c?.locations.length ?? 0} locations</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View analytics <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Needs attention"
          description={attentionList.length ? `${attentionList.length} building${attentionList.length > 1 ? 's' : ''} below 6.0` : 'All buildings healthy'}
          padding="none"
        >
          {attentionList.length === 0 ? (
            <EmptyState
              icon={<Thermometer className="h-5 w-5" />}
              title="All clear"
              description="No buildings below the comfort threshold right now."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {attentionList.slice(0, 6).map(({ building, comfort }) => {
                const worst = [...comfort.locations]
                  .sort((a, b) => a.comfortScore - b.comfortScore)[0];
                return (
                  <li key={building.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{building.name}</div>
                        {worst && (
                          <div className="text-xs text-gray-500 truncate">
                            Worst: {worst.roomLabel || worst.room} ({worst.comfortScore.toFixed(1)})
                          </div>
                        )}
                      </div>
                      <StatusBadge tone={comfort.overallScore < 4 ? 'danger' : 'warning'} dot>
                        {comfort.overallScore.toFixed(1)}
                      </StatusBadge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Community engagement */}
      {engagement && engagement.summary.totalContributors > 0 && (
        <div className="mt-5">
          <SectionCard
            icon={<Trees className="h-4 w-4" />}
            title="Community engagement"
            description={`Eco contribution · ${engagement.buildingName}`}
            padding="md"
          >
            <div className="grid grid-cols-3 gap-3">
              <EngStat label="Trees grown" value={engagement.summary.treesGrown} icon={<Trees className="h-4 w-4 text-teal-600" />} />
              <EngStat label="Contributors" value={engagement.summary.totalContributors} icon={<Vote className="h-4 w-4 text-teal-500" />} />
              <EngStat label="Active streaks" value={engagement.summary.activeStreaks} icon={<Flame className="h-4 w-4 text-orange-500" />} />
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Top contributors</div>
              {engagement.leaderboard.slice(0, 3).map((e) => (
                <div key={e.userId} className="flex items-center gap-3">
                  <span className="w-4 text-center text-xs font-bold tabular-nums text-gray-400">{e.rank}</span>
                  <EcoTree tier={e.tier} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-800">{e.name}</div>
                    <div className="text-[11px] text-gray-400">{e.tierLabel} · {e.votes} votes</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums text-teal-600">{e.ecoPoints.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-5">
        <SectionCard title="Quick actions" description="Operational shortcuts" padding="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction
              to="/fm/comfort"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Comfort analytics"
              hint="Breakdown by location"
            />
            <QuickAction
              to="/fm/buildings"
              icon={<Building2 className="h-4 w-4" />}
              label="Manage buildings"
              hint="Configuration & details"
            />
            <QuickAction
              to="/fm/dashboard-config"
              icon={<PanelsTopLeft className="h-4 w-4" />}
              label="Dashboard layout"
              hint="What occupants see"
            />
            <QuickAction
              to="/fm/vote-config"
              icon={<FileQuestion className="h-4 w-4" />}
              label="Vote form"
              hint="Tune comfort prompts"
            />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function QuickAction({
  to,
  icon,
  label,
  hint,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 truncate">{hint}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}

function EngStat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50">{icon}</div>
      <div className="text-xl font-bold tabular-nums text-gray-800">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</div>
    </div>
  );
}
