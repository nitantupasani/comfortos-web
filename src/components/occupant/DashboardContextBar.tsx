import { Building2, MapPin, ChevronDown, RefreshCw } from 'lucide-react';

interface Props {
  buildingName: string;
  floorLabel: string | null;
  roomLabel: string | null;
  loading: boolean;
  onSwitchBuilding: () => void;
  onChangeLocation: () => void;
  onRefresh: () => void;
}

export default function DashboardContextBar({
  buildingName,
  floorLabel,
  roomLabel,
  loading,
  onSwitchBuilding,
  onChangeLocation,
  onRefresh,
}: Props) {
  const hasLocation = floorLabel && roomLabel;

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur border border-emerald-100/60 px-3 py-2.5 shadow-sm">
      {/* Building selector */}
      <button
        onClick={onSwitchBuilding}
        className="flex items-center gap-1.5 min-w-0 flex-shrink hover:bg-emerald-50 rounded-xl px-2 py-1 transition-colors"
      >
        <Building2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
          {buildingName}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
      </button>

      {/* Separator */}
      {hasLocation && <div className="w-px h-4 bg-gray-200" />}

      {/* Location selector */}
      {hasLocation && (
        <button
          onClick={onChangeLocation}
          className="flex items-center gap-1.5 min-w-0 flex-1 hover:bg-emerald-50 rounded-xl px-2 py-1 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="text-xs text-slate-500 truncate">
            {floorLabel} · {roomLabel}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
        </button>
      )}

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors ml-auto shrink-0"
      >
        <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
