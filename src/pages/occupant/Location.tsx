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
    navigate('/presence');
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
      <div className="text-center">
        <MapPin className="h-10 w-10 text-primary-500 mx-auto mb-2" />
        <h1 className="text-xl font-bold text-gray-800">Select Your Location</h1>
        <p className="text-sm text-gray-500 mt-1">{activeBuilding.name}</p>
      </div>

      {!selectedFloor ? (
        /* Floor list */
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Select Floor</h3>
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloor(floor.id)}
              className="w-full bg-white rounded-xl border p-4 flex items-center justify-between hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <span className="font-medium text-gray-800">{floor.label}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
          {floors.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              No location data available. Using default location.
              <button
                onClick={() => { setLocation('default', 'Default', 'default', 'Default'); navigate('/dashboard'); }}
                className="block mx-auto mt-3 text-primary-600 font-medium"
              >
                Continue anyway
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Room list */
        <div className="space-y-2">
          <button onClick={() => setSelectedFloor(null)} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            ← Back to floors
          </button>
          <h3 className="text-sm font-medium text-gray-500">{currentFloor?.label} — Select Room</h3>
          {currentFloor?.rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomSelect(room.id, room.label)}
              className="w-full bg-white rounded-xl border p-4 flex items-center justify-between hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <span className="font-medium text-gray-800">{room.label}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
