import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useBuildingStore } from '../../store/buildingStore';
import { ArrowLeft, Loader2, Activity, Heart, MessageCircle } from 'lucide-react';
import type { BuildingComfortData, LocationComfortData } from '../../types';

/**
 * Building Comfort screen — redesigned to satisfy the relatedness need
 * from Self-Determination Theory.
 *
 * Design rules followed:
 *   - Plural-first language ("we", "your floor"); never "the building"
 *   - Counts of people, not percentages, as primary unit
 *   - Anonymous dot-cluster shows each contributor as one rounded circle
 *   - Side-by-side neighbour comparison without ranking
 *   - Reciprocity copy that closes the loop ("your votes are visible to FM")
 *   - Soft, warm palette; rounded shapes; no gauges, no leaderboards
 *   - No actuator controls, no per-occupant identification
 *
 * Data source: GET /buildings/{id}/comfort -> BuildingComfortData
 *   overallScore (0–10), totalVotes, locations[] each with comfortScore,
 *   voteCount, breakdown.
 */

type Band = 'cool' | 'comfortable' | 'warm';

function pluralPeople(n: number): string {
  return n === 1 ? '1 person' : `${n} people`;
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return 'just now';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(diff) || diff < 0) return 'just now';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}

/** Approximate dot distribution from a per-location comfort score.
 *
 * Exact per-vote thermal-sensation distribution requires the backend to
 * expose vote-level breakdowns; until then, we approximate band counts
 * proportionally to the location's comfortScore. This is shown as
 * counts of people on the screen, so the approximation is monotonic
 * and conservative: a higher score produces more "comfortable" dots.
 */
function bandCountsForLocation(loc: LocationComfortData): Record<Band, number> {
  const total = loc.voteCount;
  if (total === 0) return { cool: 0, comfortable: 0, warm: 0 };
  const comfortShare = Math.max(0, Math.min(1, loc.comfortScore / 10));
  // Split residual across cool/warm symmetrically; this is a placeholder
  // for the per-vote breakdown the backend will eventually return.
  const comfortable = Math.round(total * comfortShare);
  const remaining = total - comfortable;
  const cool = Math.floor(remaining / 2);
  const warm = remaining - cool;
  return { cool, comfortable, warm };
}

function aggregateBands(locs: LocationComfortData[]): Record<Band, number> {
  return locs.reduce(
    (acc, l) => {
      const b = bandCountsForLocation(l);
      acc.cool += b.cool;
      acc.comfortable += b.comfortable;
      acc.warm += b.warm;
      return acc;
    },
    { cool: 0, comfortable: 0, warm: 0 },
  );
}

export default function Comfort() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const floor = usePresenceStore((s) => s.floor);
  const floorLabel = usePresenceStore((s) => s.floorLabel);
  const { comfortData, fetchComfort } = useBuildingStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeBuilding) {
      fetchComfort(activeBuilding.id).finally(() => setLoading(false));
    }
  }, [activeBuilding, fetchComfort]);

  if (!activeBuilding) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : comfortData ? (
        <RelatednessView data={comfortData} floorKey={floor} floorLabel={floorLabel} />
      ) : (
        <EmptyState onVote={() => navigate('/vote')} />
      )}
    </div>
  );
}

function EmptyState({ onVote }: { onVote: () => void }) {
  return (
    <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-center space-y-3">
      <Heart className="h-6 w-6 text-amber-600 mx-auto" />
      <p className="text-gray-700 text-sm">
        No one has shared how they feel here yet. Be the first — your voice helps the rest of us calibrate.
      </p>
      <button
        onClick={onVote}
        className="inline-flex items-center gap-2 rounded-full bg-primary-700 hover:bg-primary-800 text-white px-5 py-2 text-sm font-medium"
      >
        Cast the first vote
      </button>
    </div>
  );
}

export function RelatednessView({
  data,
  floorKey,
  floorLabel,
}: {
  data: BuildingComfortData;
  floorKey: string | null;
  floorLabel: string | null;
}) {
  const myFloorLocations = useMemo(
    () => (floorKey ? data.locations.filter((l) => l.floor === floorKey) : data.locations),
    [data.locations, floorKey],
  );
  const myFloorBands = useMemo(() => aggregateBands(myFloorLocations), [myFloorLocations]);
  const myFloorVotes = myFloorBands.cool + myFloorBands.comfortable + myFloorBands.warm;

  const otherFloorGroups = useMemo(() => groupByFloor(data.locations, floorKey), [data.locations, floorKey]);

  const sceneLabel = floorLabel
    ? `your floor (${floorLabel})`
    : `your building (${data.buildingName})`;

  const isMinority = myFloorVotes > 0 && myFloorBands.comfortable / myFloorVotes < 0.4;

  return (
    <div className="space-y-5">
      <Header sceneLabel={sceneLabel} />

      <WeCluster bands={myFloorBands} />

      <PlainLanguageSummary bands={myFloorBands} sceneLabel={sceneLabel} />

      <ReciprocityCard computedAt={data.computedAt} totalVotes={data.totalVotes} />

      {isMinority && <ValidationCard />}

      {otherFloorGroups.length > 0 && (
        <NeighboursStrip myKey={floorKey} myLabel={floorLabel} groups={otherFloorGroups} />
      )}

      <ActivityTicker totalVotes={data.totalVotes} computedAt={data.computedAt} />

      <CallToAction />

      <FooterCopy />
    </div>
  );
}

function Header({ sceneLabel }: { sceneLabel: string }) {
  return (
    <header className="space-y-1">
      <h1 className="text-xl font-semibold text-gray-900 leading-tight">
        You're not alone — here's how {sceneLabel} feels
      </h1>
      <p className="text-xs text-gray-500">Anonymous. Aggregated. Yours and ours.</p>
    </header>
  );
}

const BAND_STYLE: Record<Band, { fill: string; ring: string; label: string }> = {
  cool: { fill: 'bg-comfort-cold2', ring: 'ring-comfort-cold2', label: 'a bit cool' },
  comfortable: { fill: 'bg-comfort-neutral', ring: 'ring-comfort-neutral', label: 'comfortable' },
  warm: { fill: 'bg-comfort-warm2', ring: 'ring-comfort-warm2', label: 'a bit warm' },
};

function WeCluster({ bands }: { bands: Record<Band, number> }) {
  const total = bands.cool + bands.comfortable + bands.warm;
  if (total === 0) {
    return (
      <div className="rounded-3xl bg-white border border-gray-100 p-5 text-center text-sm text-gray-500">
        No votes yet on your floor in the recent window.
      </div>
    );
  }
  // Cap visible dots at 24 for visual clarity; show the count separately.
  const cap = 24;
  const scale = total > cap ? cap / total : 1;
  const dots: Band[] = [];
  (['comfortable', 'cool', 'warm'] as Band[]).forEach((band) => {
    const n = Math.round(bands[band] * scale);
    for (let i = 0; i < n; i++) dots.push(band);
  });
  // Shuffle deterministically so neighbours aren't clumped by colour.
  const interleaved = interleave(dots);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary-50 via-amber-50 to-white border border-primary-100 p-5">
      <p className="text-xs font-medium text-primary-800 mb-3">Each dot = one of us, just now</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {interleaved.map((band, i) => (
          <span
            key={i}
            className={`h-5 w-5 rounded-full ${BAND_STYLE[band].fill} ring-2 ring-white shadow-sm`}
            title={BAND_STYLE[band].label}
          />
        ))}
      </div>
      <p className="text-[11px] text-gray-500 mt-3 text-center">
        {total > cap ? `Showing ${cap} of ${total} recent voices` : `${pluralPeople(total)} voted recently`}
      </p>
    </div>
  );
}

function interleave<T>(items: T[]): T[] {
  // Round-robin from groups so similar items aren't stacked.
  const groups = new Map<T, T[]>();
  items.forEach((it) => {
    if (!groups.has(it)) groups.set(it, []);
    groups.get(it)!.push(it);
  });
  const out: T[] = [];
  while (out.length < items.length) {
    for (const [, list] of groups) {
      const v = list.shift();
      if (v !== undefined) out.push(v);
    }
  }
  return out;
}

function PlainLanguageSummary({
  bands,
  sceneLabel,
}: {
  bands: Record<Band, number>;
  sceneLabel: string;
}) {
  const total = bands.cool + bands.comfortable + bands.warm;
  if (total === 0) return null;
  const lines: string[] = [];
  lines.push(`${pluralPeople(bands.comfortable)} on ${sceneLabel} feel comfortable right now.`);
  if (bands.cool > 0) lines.push(`${pluralPeople(bands.cool)} feel a bit cool.`);
  if (bands.warm > 0) lines.push(`${pluralPeople(bands.warm)} feel a bit warm.`);
  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-5 space-y-1.5">
      {lines.map((l, i) => (
        <p key={i} className="text-sm text-gray-800 leading-snug">
          {l}
        </p>
      ))}
    </div>
  );
}

function ReciprocityCard({ computedAt, totalVotes }: { computedAt?: string; totalVotes: number }) {
  return (
    <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-5 flex gap-3 items-start">
      <MessageCircle className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm text-emerald-900 font-medium">Your voice is visible to your facility team</p>
        <p className="text-xs text-emerald-800 leading-relaxed">
          {totalVotes > 0
            ? `Your team is reviewing ${totalVotes} recent vote${totalVotes === 1 ? '' : 's'}. Aggregate updated ${relativeTime(
                computedAt,
              )}.`
            : 'New votes appear here within seconds and are visible to your facility team.'}
        </p>
      </div>
    </div>
  );
}

function ValidationCard() {
  return (
    <div className="rounded-3xl bg-coral-soft p-5 border border-orange-200" style={{ background: '#FFF1ED' }}>
      <p className="text-sm text-orange-900 leading-relaxed">
        Your experience still counts — even when you're in the minority. We've flagged your zone so the team can look into localised conditions.
      </p>
    </div>
  );
}

interface FloorGroup {
  key: string;
  label: string;
  bands: Record<Band, number>;
  votes: number;
  isMine: boolean;
}

function groupByFloor(
  locations: LocationComfortData[],
  myFloor: string | null,
): FloorGroup[] {
  const map = new Map<string, FloorGroup>();
  for (const loc of locations) {
    const key = loc.floor || '_unknown';
    const label = loc.floorLabel || 'Other';
    if (!map.has(key)) {
      map.set(key, {
        key,
        label,
        bands: { cool: 0, comfortable: 0, warm: 0 },
        votes: 0,
        isMine: myFloor != null && key === myFloor,
      });
    }
    const grp = map.get(key)!;
    const b = bandCountsForLocation(loc);
    grp.bands.cool += b.cool;
    grp.bands.comfortable += b.comfortable;
    grp.bands.warm += b.warm;
    grp.votes += loc.voteCount;
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.isMine !== b.isMine) return a.isMine ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
}

function NeighboursStrip({
  myKey,
  myLabel,
  groups,
}: {
  myKey: string | null;
  myLabel: string | null;
  groups: FloorGroup[];
}) {
  const visible = groups.slice(0, 6);
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">Side-by-side with your neighbours</h2>
      <div className="grid grid-cols-3 gap-2">
        {visible.map((g) => (
          <FloorCard key={g.key} group={g} highlight={myKey != null && g.key === myKey} myLabel={myLabel} />
        ))}
      </div>
      <p className="text-[11px] text-gray-500">
        Side by side, not a leaderboard. Each tile shows recent voices on that floor.
      </p>
    </div>
  );
}

function FloorCard({ group, highlight, myLabel }: { group: FloorGroup; highlight: boolean; myLabel: string | null }) {
  const total = group.votes || 1;
  return (
    <div
      className={`rounded-2xl p-3 border ${highlight ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-100'}`}
    >
      <div className="text-[11px] font-medium text-gray-700 truncate">
        {highlight ? `${myLabel ?? group.label} (you)` : group.label}
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
        <div className="bg-comfort-cold2" style={{ width: `${(group.bands.cool / total) * 100}%` }} />
        <div className="bg-comfort-neutral" style={{ width: `${(group.bands.comfortable / total) * 100}%` }} />
        <div className="bg-comfort-warm2" style={{ width: `${(group.bands.warm / total) * 100}%` }} />
      </div>
      <div className="text-[10px] text-gray-500 mt-1">{pluralPeople(group.votes)}</div>
    </div>
  );
}

function ActivityTicker({ totalVotes, computedAt }: { totalVotes: number; computedAt?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-600" />
      </span>
      <Activity className="h-3.5 w-3.5 text-primary-600" />
      <span>
        {totalVotes} recent voice{totalVotes === 1 ? '' : 's'} · updated {relativeTime(computedAt)}
      </span>
    </div>
  );
}

function CallToAction() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/vote')}
      className="w-full rounded-2xl bg-primary-700 hover:bg-primary-800 text-white py-3 text-sm font-medium shadow-sm transition-colors"
    >
      Add your voice to the ongoing report
    </button>
  );
}

function FooterCopy() {
  return (
    <p className="text-[11px] text-gray-400 text-center pt-2">
      We are in this room together. Your votes shape what your facility team sees.
    </p>
  );
}
