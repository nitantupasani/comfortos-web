import { useEffect } from 'react';
import { Building2, Star, Clock, Loader2 } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import BottomSheet from '../common/BottomSheet';
import type { Building } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (building: Building) => void;
}

export default function BuildingQuickSwitch({ isOpen, onClose, onSelect }: Props) {
  const {
    buildings,
    activeBuilding,
    isLoading,
    fetchBuildings,
    recentBuildings,
    favoriteBuildings,
    addFavorite,
    removeFavorite,
  } = usePresenceStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isOpen && buildings.length === 0) {
      fetchBuildings(user?.tenantId ?? undefined);
    }
  }, [isOpen, buildings.length, fetchBuildings, user?.tenantId]);

  const isFavorite = (id: string) => favoriteBuildings.includes(id);
  const recentIds = new Set(recentBuildings.map((r) => r.building.id));

  // Split buildings into sections
  const favorites = buildings.filter((b) => isFavorite(b.id));
  const recent = recentBuildings
    .filter((r) => !isFavorite(r.building.id))
    .map((r) => r.building);
  const others = buildings.filter(
    (b) => !isFavorite(b.id) && !recentIds.has(b.id),
  );

  const handleSelect = (building: Building) => {
    onSelect(building);
    onClose();
  };

  const renderBuildingCard = (b: Building) => {
    const isActive = activeBuilding?.id === b.id;

    return (
      <button
        key={b.id}
        onClick={() => handleSelect(b)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
          isActive
            ? 'bg-emerald-50 border border-emerald-200'
            : 'hover:bg-gray-50 border border-transparent'
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">{b.name}</div>
          <div className="text-xs text-slate-400 truncate">{b.address}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            isFavorite(b.id) ? removeFavorite(b.id) : addFavorite(b.id);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Star
            className={`h-4 w-4 ${
              isFavorite(b.id) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
        {isActive && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </button>
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Switch Building">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400">
          No buildings available
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-2 px-1">
                <Star className="h-3 w-3 fill-amber-400" />
                Favorites
              </div>
              <div className="space-y-1">{favorites.map(renderBuildingCard)}</div>
            </div>
          )}

          {recent.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                <Clock className="h-3 w-3" />
                Recent
              </div>
              <div className="space-y-1">{recent.map(renderBuildingCard)}</div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                All Buildings
              </div>
              <div className="space-y-1">{others.map(renderBuildingCard)}</div>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
