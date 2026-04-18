import { Thermometer, Wind, Volume2, Droplets } from 'lucide-react';
import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

const METRICS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: 'text-red-500 bg-red-50' },
  { key: 'co2', label: 'CO₂', unit: 'ppm', icon: Wind, color: 'text-blue-500 bg-blue-50' },
  { key: 'relative_humidity', label: 'Humidity', unit: '%', icon: Droplets, color: 'text-cyan-500 bg-cyan-50' },
  { key: 'noise', label: 'Noise', unit: 'dBA', icon: Volume2, color: 'text-amber-500 bg-amber-50' },
];

export default function Step3_Metrics() {
  const { metricsEnabled, setMetricsEnabled, connector } = useBuildingWizardStore();

  const toggle = (key: string) => {
    setMetricsEnabled({ ...metricsEnabled, [key]: !metricsEnabled[key] });
  };

  const enabledCount = Object.values(metricsEnabled).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Metric Configuration</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose which environmental metrics to track.
          {connector.metrics.length > 0 && ' Pre-selected based on your connector.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(({ key, label, unit, icon: Icon, color }) => {
          const enabled = metricsEnabled[key] ?? false;
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                enabled
                  ? 'border-primary-400 bg-white ring-2 ring-primary-100'
                  : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-gray-800">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{unit}</div>

              {/* Toggle indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                enabled ? 'border-primary-500 bg-primary-500' : 'border-gray-300 bg-white'
              }`}>
                {enabled && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-sm text-gray-500 text-center">
        {enabledCount} of {METRICS.length} metrics enabled
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="text-xs font-medium text-gray-600 mb-2">Smart Defaults Applied</div>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>Aggregation rule: Average (per room)</li>
          <li>Stale threshold: 30 minutes</li>
          <li>Conflict resolution: Newest wins</li>
        </ul>
        <p className="text-xs text-gray-400 mt-2">
          You can fine-tune these in the Metric Config tab after setup.
        </p>
      </div>
    </div>
  );
}
