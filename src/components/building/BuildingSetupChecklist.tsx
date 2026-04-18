import { useEffect, useState } from 'react';
import { Check, Circle, Loader2, MapPin, Plug, LayoutDashboard, ClipboardList } from 'lucide-react';
import { fetchBuildingSetupStatus, type SetupStatus } from '../../api/buildingSetup';

interface Props {
  buildingId: string;
  onNavigateTab: (tab: string) => void;
}

const ITEMS = [
  { key: 'hasLocations', label: 'Location Hierarchy', desc: 'Floors and rooms defined', tab: 'locations', icon: MapPin },
  { key: 'hasEndpoints', label: 'Telemetry Endpoints', desc: 'Data sources configured', tab: 'endpoints', icon: Plug },
  { key: 'hasDashboard', label: 'Dashboard Layout', desc: 'SDUI dashboard configured', tab: 'dashboard-config', icon: LayoutDashboard },
  { key: 'hasVoteForm', label: 'Vote Form', desc: 'Comfort vote form set up', tab: 'vote-config', icon: ClipboardList },
] as const;

export default function BuildingSetupChecklist({ buildingId, onNavigateTab }: Props) {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBuildingSetupStatus(buildingId)
      .then(setStatus)
      .finally(() => setLoading(false));
  }, [buildingId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking setup status...
      </div>
    );
  }

  if (!status) return null;

  if (status.completedCount === status.totalSteps) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
        <span className="text-sm font-medium text-emerald-700">Setup Complete</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700 text-sm">Setup Progress</h4>
        <span className="text-xs text-gray-500">
          {status.completedCount}/{status.totalSteps} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${(status.completedCount / status.totalSteps) * 100}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {ITEMS.map(({ key, label, desc, tab, icon: Icon }) => {
          const done = status[key as keyof SetupStatus] as boolean;
          return (
            <button
              key={key}
              onClick={() => onNavigateTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                done ? 'bg-emerald-50/50' : 'bg-amber-50/50 hover:bg-amber-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                done ? 'bg-emerald-500 text-white' : 'bg-amber-200 text-amber-600'
              }`}>
                {done ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              </div>
              <Icon className={`h-4 w-4 ${done ? 'text-emerald-500' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{label}</div>
                <div className="text-xs text-gray-500">{done ? 'Configured' : desc}</div>
              </div>
              {!done && (
                <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  Set up
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
