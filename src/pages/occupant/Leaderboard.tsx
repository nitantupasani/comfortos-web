import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Flame, Vote, Trees, Trophy, Building2, Sprout } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { votesApi } from '../../api/votes';
import type { LeaderboardResponse, LeaderboardEntry } from '../../types';
import EcoTree from '../../components/gamification/EcoTree';
import { TIER_VISUALS, PODIUM } from '../../components/gamification/tiers';

export default function Leaderboard() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBuilding) {
      setLoading(false);
      return;
    }
    setLoading(true);
    votesApi
      .leaderboard(activeBuilding.id, 50)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [activeBuilding?.id]);

  if (!activeBuilding) {
    return (
      <div className="rounded-3xl border border-teal-100 bg-teal-50/60 px-5 py-10 text-center">
        <Building2 className="mx-auto mb-3 h-9 w-9 text-teal-600" />
        <h1 className="text-lg font-bold text-slate-800">Pick a building first</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          The eco leaderboard is per building. Select one from your dashboard.
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
      </div>
    );
  }

  const entries = data?.leaderboard ?? [];
  const summary = data?.summary;
  const me = user ? entries.find((e) => e.userId === user.id) ?? null : null;
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Trees className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-800">Eco Leaderboard</h1>
          <p className="text-xs text-slate-400">{activeBuilding.name} · grow your tree by voting</p>
        </div>
      </div>

      {/* Your standing */}
      <YourStanding me={me} />

      {/* Building eco summary */}
      {summary && summary.totalContributors > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Trees grown" value={summary.treesGrown} icon={<Trees className="h-4 w-4" />} />
          <MiniStat label="Contributors" value={summary.totalContributors} icon={<Sprout className="h-4 w-4" />} />
          <MiniStat label="Eco-points" value={summary.totalEcoPoints.toLocaleString()} icon={<Trophy className="h-4 w-4" />} />
        </div>
      )}

      {/* Podium */}
      {podium.length >= 3 && (
        <div className="grid grid-cols-3 items-end gap-2">
          <PodiumCard entry={podium[1]} place={1} meId={user?.id} />
          <PodiumCard entry={podium[0]} place={0} meId={user?.id} />
          <PodiumCard entry={podium[2]} place={2} meId={user?.id} />
        </div>
      )}

      {/* Full list */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
          <Sprout className="mx-auto mb-2 h-8 w-8 text-teal-400" />
          <div className="text-sm font-medium text-slate-600">No contributors yet</div>
          <p className="mt-1 text-xs text-slate-400">Be the first to cast a comfort vote and plant your tree.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(podium.length >= 3 ? rest : entries).map((e) => (
            <Row key={e.userId} entry={e} isMe={e.userId === user?.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function YourStanding({ me }: { me: LeaderboardEntry | null }) {
  if (!me) {
    return (
      <div className="rounded-3xl border border-teal-100 bg-gradient-to-b from-teal-50/80 to-white px-5 py-5">
        <div className="flex items-center gap-4">
          <EcoTree tier="seedling" size={64} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-800">Plant your tree</div>
            <p className="mt-0.5 text-xs text-slate-500">
              You haven't voted here yet. Cast a comfort vote to start growing and join the board.
            </p>
            <Link
              to="/vote"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Vote className="h-3.5 w-3.5" /> Cast a vote
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const v = TIER_VISUALS[me.tier];
  const pct = Math.round(me.progress * 100);
  return (
    <div className={`rounded-3xl border bg-gradient-to-b from-teal-50/80 to-white px-5 py-5 ring-1 ${v.ring}`}>
      <div className="flex items-center gap-4">
        <EcoTree tier={me.tier} size={76} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${v.bg} ${v.text}`}>{me.tierLabel}</span>
            <span className="text-[11px] font-medium text-slate-400">Rank #{me.rank}</span>
          </div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-800">
            {me.ecoPoints.toLocaleString()} <span className="text-sm font-semibold text-slate-400">eco-pts</span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Vote className="h-3.5 w-3.5 text-teal-500" />{me.votes} votes</span>
            <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" />{me.currentStreak}-day streak</span>
          </div>
        </div>
      </div>
      {me.nextLabel && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{v.blurb}</span>
            <span>{me.nextPoints! - me.ecoPoints} pts to {me.nextLabel}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white px-3 py-3 text-center shadow-sm">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">{icon}</div>
      <div className="text-base font-bold tabular-nums text-slate-800">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

function PodiumCard({ entry, place, meId }: { entry: LeaderboardEntry; place: number; meId?: string }) {
  const medal = PODIUM[place];
  const isMe = entry.userId === meId;
  const big = place === 0;
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border bg-white px-2 pb-3 pt-3 text-center shadow-sm ring-1 ${medal.ring} ${big ? 'pb-4' : ''} ${isMe ? 'border-teal-300' : 'border-slate-200/70'}`}
    >
      <div className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${medal.bg} ${medal.text}`}>
        {medal.label}
      </div>
      <EcoTree tier={entry.tier} size={big ? 60 : 46} />
      <div className="mt-1 w-full truncate text-xs font-semibold text-slate-800">{firstName(entry.name)}</div>
      <div className="text-[11px] font-bold tabular-nums text-teal-600">{entry.ecoPoints.toLocaleString()}</div>
    </div>
  );
}

function Row({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const v = TIER_VISUALS[entry.tier];
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 shadow-sm ${isMe ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200/70 bg-white'}`}
    >
      <div className="w-6 shrink-0 text-center text-sm font-bold tabular-nums text-slate-400">{entry.rank}</div>
      <EcoTree tier={entry.tier} size={36} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">
          {entry.name}
          {isMe && <span className="ml-1.5 text-[10px] font-semibold text-teal-600">You</span>}
        </div>
        <div className="mt-0.5 flex items-center gap-2.5 text-[11px] text-slate-400">
          <span className={`font-medium ${v.text}`}>{entry.tierLabel}</span>
          <span className="inline-flex items-center gap-0.5"><Vote className="h-3 w-3" />{entry.votes}</span>
          {entry.currentStreak >= 2 && (
            <span className="inline-flex items-center gap-0.5 text-orange-500"><Flame className="h-3 w-3" />{entry.currentStreak}</span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-bold tabular-nums text-slate-800">{entry.ecoPoints.toLocaleString()}</div>
        <div className="text-[10px] text-slate-400">eco-pts</div>
      </div>
    </div>
  );
}

function firstName(full: string): string {
  return full.split(' ')[0];
}
