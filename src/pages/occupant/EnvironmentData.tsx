import { usePresenceStore } from '../../store/presenceStore';
import { MapPin } from 'lucide-react';
import TelemetryChartNode from '../../components/sdui/TelemetryChartNode';

export default function EnvironmentData() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);

  if (!activeBuilding) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <MapPin className="h-10 w-10 mb-3" />
        <p className="text-sm">Select a building first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TelemetryChartNode
        metricType="temperature"
        title="Temperature"
        unit="°C"
        height={280}
        showReadings={true}
      />
    </div>
  );
}
