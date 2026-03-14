import { useEffect, useState } from 'react';
import { BarChart3, Loader2, Building2 } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { votesApi } from '../../api/votes';
import { useAuthStore } from '../../store/authStore';
import type { Building, Vote } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#ec4899'];

export default function VoteAnalytics() {
  const user = useAuthStore((s) => s.user);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBldg, setSelectedBldg] = useState<string>('');
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildingsApi.list().then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelectedBldg(b[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      votesApi.history(user.id).then(setVotes).catch(() => setVotes([]));
    }
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  const bldgVotes = selectedBldg ? votes.filter((v) => v.buildingId === selectedBldg) : votes;

  // Aggregate thermal comfort distribution
  const thermalDist = [
    { name: '1 Cold', value: 0 },
    { name: '2 Cool', value: 0 },
    { name: '3 Slightly Cool', value: 0 },
    { name: '4 Neutral', value: 0 },
    { name: '5 Slightly Warm', value: 0 },
    { name: '6 Warm', value: 0 },
    { name: '7 Hot', value: 0 },
  ];
  bldgVotes.forEach((v) => {
    const raw = v.payload.thermal_comfort;
    if (typeof raw !== 'number') {
      return;
    }

    const normalized = raw >= 1 && raw <= 7
      ? Math.round(raw)
      : raw >= -3 && raw <= 3
        ? Math.round(raw) + 4
        : null;

    if (normalized !== null) {
      thermalDist[normalized - 1].value++;
    }
  });

  // Status distribution
  const statusDist: Record<string, number> = {};
  bldgVotes.forEach((v) => { statusDist[v.status] = (statusDist[v.status] ?? 0) + 1; });
  const statusData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

  // Votes per day (last 7 days)
  const dailyCounts: Record<string, number> = {};
  bldgVotes.forEach((v) => {
    const day = new Date(v.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
  });
  const dailyData = Object.entries(dailyCounts).slice(-7).map(([day, count]) => ({ day, count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-500" />
          Vote Analytics
        </h2>
        <select
          value={selectedBldg}
          onChange={(e) => setSelectedBldg(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
        >
          <option value="">All Buildings</option>
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Votes" value={bldgVotes.length} icon={<BarChart3 className="h-5 w-5 text-primary-500" />} />
        <StatCard label="Confirmed" value={bldgVotes.filter((v) => v.status === 'confirmed').length} icon={<Building2 className="h-5 w-5 text-green-500" />} />
        <StatCard label="Schema Versions" value={new Set(bldgVotes.map((v) => v.schemaVersion)).size} icon={<Building2 className="h-5 w-5 text-purple-500" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thermal distribution */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Thermal Comfort Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={thermalDist}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {thermalDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status pie */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Vote Status</h3>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} label dataKey="value" nameKey="name">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Daily votes */}
        <div className="bg-white rounded-xl border p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Votes Per Day</h3>
          <div className="h-48">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No vote data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}
