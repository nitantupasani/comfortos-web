import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useBuildingStore } from '../../store/buildingStore';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { BuildingComfortData } from '../../types';

function scoreColor(score: number): string {
  if (score >= 8) return '#22c55e';
  if (score >= 6) return '#eab308';
  if (score >= 4) return '#f97316';
  return '#ef4444';
}

export default function Comfort() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const { comfortData, fetchComfort } = useBuildingStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeBuilding) {
      fetchComfort(activeBuilding.id).finally(() => setLoading(false));
    }
  }, [activeBuilding, fetchComfort]);

  if (!activeBuilding) {
    navigate('/presence');
    return null;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <h1 className="text-xl font-bold text-gray-800 text-center">Building Comfort</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : comfortData ? (
        <ComfortView data={comfortData} />
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          No comfort data available yet. Cast a vote to contribute!
        </div>
      )}
    </div>
  );
}

function ComfortView({ data }: { data: BuildingComfortData }) {
  const score = data.overallScore;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (score / 10) * circumference;
  const color = scoreColor(score);

  return (
    <div className="space-y-6">
      {/* Overall score ring */}
      <div className="flex flex-col items-center">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            className="score-ring"
          />
          <text x="60" y="55" textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="bold" fill="#1f2937">
            {score.toFixed(1)}
          </text>
          <text x="60" y="75" textAnchor="middle" fontSize="10" fill="#9ca3af">/10</text>
        </svg>
        <div className="text-sm text-gray-500 mt-2">{data.totalVotes} votes</div>
      </div>

      {/* Per-location breakdown */}
      {data.locations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600">By Location</h3>
          {data.locations.map((loc) => (
            <div key={`${loc.floor}-${loc.room}`} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">{loc.floorLabel}</div>
                  <div className="text-xs text-gray-400">{loc.roomLabel}</div>
                </div>
                <div className="text-lg font-bold" style={{ color: scoreColor(loc.comfortScore) }}>
                  {loc.comfortScore.toFixed(1)}
                </div>
              </div>
              {Object.keys(loc.breakdown).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(loc.breakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{typeof val === 'number' ? val.toFixed(1) : val}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">{loc.voteCount} votes</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
