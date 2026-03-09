import { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { useAuthStore } from '../../store/authStore';
import type { Building, BuildingComfortData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

export default function ComfortAnalytics() {
  const user = useAuthStore((s) => s.user);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBldg, setSelectedBldg] = useState('');
  const [comfort, setComfort] = useState<BuildingComfortData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildingsApi.list(user?.tenantId ?? undefined).then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelectedBldg(b[0].id);
    }).finally(() => setLoading(false));
  }, [user?.tenantId]);

  useEffect(() => {
    if (!selectedBldg) return;
    buildingsApi.comfort(selectedBldg).then(setComfort).catch(() => setComfort(null));
  }, [selectedBldg]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal-400" /></div>;

  // Aggregate breakdown across locations
  const breakdown: Record<string, number[]> = {};
  comfort?.locations.forEach((loc) => {
    Object.entries(loc.breakdown).forEach(([key, val]) => {
      if (!breakdown[key]) breakdown[key] = [];
      breakdown[key].push(val);
    });
  });
  const avgBreakdown = Object.entries(breakdown).map(([key, vals]) => ({
    category: key.replace(/_/g, ' '),
    score: vals.reduce((a, b) => a + b, 0) / vals.length,
  }));

  // Location scores for bar chart
  const locationScores = (comfort?.locations ?? []).map((loc) => ({
    name: `${loc.floorLabel} – ${loc.roomLabel}`,
    score: loc.comfortScore,
    votes: loc.voteCount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-500" />
          Comfort Analytics
        </h2>
        <select
          value={selectedBldg}
          onChange={(e) => setSelectedBldg(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
        >
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {comfort ? (
        <>
          {/* Overall score */}
          <div className="bg-white rounded-xl border p-6 flex items-center gap-6">
            <div className="text-5xl font-bold" style={{ color: comfort.overallScore >= 7 ? '#22c55e' : comfort.overallScore >= 5 ? '#eab308' : '#ef4444' }}>
              {comfort.overallScore.toFixed(1)}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-700">{comfort.buildingName}</div>
              <div className="text-sm text-gray-500">{comfort.totalVotes} total votes · Computed {new Date(comfort.computedAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location scores */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Comfort by Location</h3>
              <div className="h-64">
                {locationScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationScores} layout="vertical">
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No location data</div>
                )}
              </div>
            </div>

            {/* Radar breakdown */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Category Breakdown</h3>
              <div className="h-64">
                {avgBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={avgBreakdown}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No breakdown data</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          No comfort data available for this building
        </div>
      )}
    </div>
  );
}
