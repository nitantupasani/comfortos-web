import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { Building2, MapPin, Lock, Loader2 } from 'lucide-react';
import type { Building } from '../../types';

export default function Presence() {
  const { buildings, isLoading, fetchBuildings, selectBuilding } = usePresenceStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuildings(user?.tenantId ?? undefined);
  }, [fetchBuildings, user?.tenantId]);

  const handleSelect = async (building: Building) => {
    await selectBuilding(building);
    navigate('/location');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="h-10 w-10 text-primary-500 mx-auto mb-2" />
        <h1 className="text-xl font-bold text-gray-800">Select Your Building</h1>
        <p className="text-sm text-gray-500 mt-1">Choose the building you're currently in</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No buildings available
        </div>
      ) : (
        <div className="space-y-3">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelect(b)}
              className="w-full bg-white rounded-xl border p-4 flex items-center gap-4 hover:border-primary-300 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">{b.name}</div>
                <div className="text-xs text-gray-400 truncate">{b.address}</div>
              </div>
              {b.requiresAccessPermission && (
                <Lock className="h-4 w-4 text-amber-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
