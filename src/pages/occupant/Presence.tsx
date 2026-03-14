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
      <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.98)_100%)] px-5 py-6 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-600/75">Presence</div>
        <h1 className="mt-2 text-xl font-bold text-slate-800">Select Your Building</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choose the building you are currently in to continue into the occupant app.</p>
        <div className="mt-4 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
          {buildings.length} building{buildings.length === 1 ? '' : 's'} available
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/75 px-4 py-8 text-center text-sm text-slate-400">
          No buildings available
        </div>
      ) : (
        <div className="space-y-3">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelect(b)}
              className="w-full rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(5,150,105,0.12)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{b.name}</div>
                  <div className="mt-1 truncate text-xs text-slate-400">{b.address}</div>
                </div>
                {b.requiresAccessPermission && (
                  <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{b.city ?? 'Active workspace'}</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-600">Select</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
