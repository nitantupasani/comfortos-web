import { useEffect, useState } from 'react';
import { Building2, BarChart3, Users, Vote, Loader2 } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { votesApi } from '../../api/votes';
import { useAuthStore } from '../../store/authStore';
import type { Building, Vote as VoteType, BuildingComfortData } from '../../types';

export default function FMDashboard() {
  const user = useAuthStore((s) => s.user);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [comforts, setComforts] = useState<Map<string, BuildingComfortData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const bldgs = await buildingsApi.list(user?.tenantId ?? undefined);
        setBuildings(bldgs);
        const v = await votesApi.history(user!.id).catch(() => []);
        setVotes(v);
        // Fetch comfort for each building
        const comfortMap = new Map<string, BuildingComfortData>();
        await Promise.all(
          bldgs.map(async (b) => {
            try {
              const c = await buildingsApi.comfort(b.id);
              if (c) comfortMap.set(b.id, c);
            } catch { /* skip */ }
          }),
        );
        setComforts(comfortMap);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Facility Overview</h2>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Building2 className="h-6 w-6 text-teal-500" />} label="My Buildings" value={buildings.length} bg="bg-teal-50" />
        <KpiCard icon={<Vote className="h-6 w-6 text-blue-500" />} label="Total Votes" value={votes.length} bg="bg-blue-50" />
        <KpiCard
          icon={<BarChart3 className="h-6 w-6 text-green-500" />}
          label="Avg Comfort"
          value={comforts.size > 0 ? (Array.from(comforts.values()).reduce((s, c) => s + c.overallScore, 0) / comforts.size).toFixed(1) : '--'}
          bg="bg-green-50"
        />
        <KpiCard icon={<Users className="h-6 w-6 text-purple-500" />} label="Locations" value={Array.from(comforts.values()).reduce((s, c) => s + c.locations.length, 0)} bg="bg-purple-50" />
      </div>

      {/* Building comfort cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((b) => {
          const c = comforts.get(b.id);
          return (
            <div key={b.id} className="bg-white rounded-xl border p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-xs text-gray-400">{b.city}</div>
                </div>
              </div>
              {c ? (
                <>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold" style={{ color: c.overallScore >= 7 ? '#22c55e' : c.overallScore >= 5 ? '#eab308' : '#ef4444' }}>
                      {c.overallScore.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400 mb-1">/ 10</span>
                  </div>
                  <div className="text-xs text-gray-500">{c.totalVotes} votes · {c.locations.length} locations</div>
                </>
              ) : (
                <div className="text-sm text-gray-400">No comfort data</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}
