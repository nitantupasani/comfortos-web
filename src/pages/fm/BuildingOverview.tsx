import { useEffect, useState } from 'react';
import { Building2, Loader2, MapPin, Eye } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { useAuthStore } from '../../store/authStore';
import SduiRenderer from '../../components/sdui/SduiRenderer';
import type { Building, SduiNode } from '../../types';

export default function BuildingOverview() {
  const user = useAuthStore((s) => s.user);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<Building | null>(null);
  const [dashboard, setDashboard] = useState<SduiNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashLoading, setDashLoading] = useState(false);

  useEffect(() => {
    buildingsApi.listManaged().then((b) => {
      setBuildings(b);
      if (b.length > 0) { setSelected(b[0]); }
    }).finally(() => setLoading(false));
  }, [user?.tenantId]);

  useEffect(() => {
    if (!selected) return;
    setDashLoading(true);
    buildingsApi.dashboard(selected.id).then(setDashboard).finally(() => setDashLoading(false));
  }, [selected?.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Building Overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building list */}
        <div className="space-y-3">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                selected?.id === b.id ? 'border-teal-400 ring-2 ring-teal-100 bg-white' : 'bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-teal-500" />
                <div>
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{b.city}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Dashboard Preview — {selected?.name ?? 'Select a building'}
            </span>
          </div>
          <div className="p-4 max-w-lg mx-auto">
            {dashLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal-400" /></div>
            ) : dashboard ? (
              <SduiRenderer config={dashboard} />
            ) : (
              <p className="text-center text-gray-400 py-12 text-sm">No dashboard config for this building</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
