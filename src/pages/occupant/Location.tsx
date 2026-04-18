import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useBuildingStore } from '../../store/buildingStore';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';

export default function Location() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const setLocation = usePresenceStore((s) => s.setLocation);
  const { locationForm, fetchLocationForm } = useBuildingStore();
  const navigate = useNavigate();

  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeBuilding) {
      fetchLocationForm(activeBuilding.id).finally(() => setIsLoading(false));
    }
  }, [activeBuilding, fetchLocationForm]);

  if (!activeBuilding) {
    navigate('/dashboard');
    return null;
  }

  const floors = locationForm?.floors ?? [];
  const currentFloor = floors.find((f) => f.id === selectedFloor);

  const handleRoomSelect = (roomId: string, roomLabel: string) => {
    const floor = floors.find((f) => f.id === selectedFloor)!;
    setLocation(floor.id, floor.label, roomId, roomLabel);
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.98)_100%)] px-5 py-6 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-600/75">Location</div>
        <h1 className="mt-2 text-xl font-bold text-slate-800">Select Your Location</h1>
        <p className="mt-2 text-sm font-semibold text-slate-700">{activeBuilding.name}</p>
        <p className="mt-1 text-sm text-slate-500">Choose your floor first, then the room you are in.</p>
      </div>

      {!selectedFloor ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Select Floor</div>
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(floor.id)}
              className="w-full rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(5,150,105,0.12)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xs font-bold text-emerald-600">
                  {floor.label.replace(/[^0-9A-Za-z]/g, '').slice(0, 2) || 'F'}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800">{floor.label}</div>
                  <div className="text-xs text-slate-400">{floor.rooms.length} room{floor.rooms.length === 1 ? '' : 's'}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
          {floors.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/75 px-4 py-6 text-center text-sm text-slate-400">
              No location data available. Using default location.
              <button
                onClick={() => { setLocation('default', 'Default', 'default', 'Default'); navigate('/dashboard'); }}
                className="mx-auto mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-600"
              >
                Continue anyway
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setSelectedFloor(null)} className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
            ← Back to floors
          </button>
          <div className="rounded-[24px] border border-white/80 bg-white/80 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected Floor</div>
            <div className="mt-2 text-sm font-semibold text-slate-800">{currentFloor?.label}</div>
          </div>
          {currentFloor?.rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomSelect(room.id, room.label)}
              className="w-full rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(5,150,105,0.12)]"
            >
              <div className="text-left">
                <div className="font-semibold text-slate-800">{room.label}</div>
                <div className="text-xs text-slate-400">Tap to set your current room</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
