import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useBuildingStore } from '../../store/buildingStore';
import { fetchWeather } from '../../utils/weather';
import SduiRenderer from '../../components/sdui/SduiRenderer';
import { RefreshCw, MapPin, Vote, Loader2 } from 'lucide-react';
import type { SduiNode, WeatherData } from '../../types';

/* Default dashboard when backend returns null */
const DEFAULT_DASHBOARD: SduiNode = {
  type: 'column',
  crossAxisAlignment: 'stretch',
  children: [
    { type: 'weather_badge', temp: '--', unit: '°C', label: 'Outside', icon: 'wb_sunny' },
    { type: 'spacer', height: 8 },
    {
      type: 'grid', columns: 3, spacing: 10,
      children: [
        { type: 'metric_tile', icon: 'thermostat', value: '--', unit: '°C', label: 'Temp' },
        { type: 'metric_tile', icon: 'co2', value: '--', unit: 'ppm', label: 'CO₂' },
        { type: 'metric_tile', icon: 'volume_up', value: '--', unit: 'dB', label: 'Noise' },
      ],
    },
    { type: 'spacer', height: 16 },
    {
      type: 'alert_banner', icon: 'info', color: 'blue',
      title: 'Welcome to ComfortOS',
      subtitle: 'Select your location and cast a comfort vote to help improve this space.',
    },
  ],
};

export default function Dashboard() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const roomLabel = usePresenceStore((s) => s.roomLabel);
  const floorLabel = usePresenceStore((s) => s.floorLabel);
  const { dashboardConfig, fetchDashboard } = useBuildingStore();
  const navigate = useNavigate();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeBuilding) return;
    setLoading(true);
    await fetchDashboard(activeBuilding.id);
    const w = await fetchWeather(activeBuilding.latitude, activeBuilding.longitude);
    if (w) setWeather(w);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeBuilding) {
    navigate('/presence');
    return null;
  }

  // Inject weather data into dashboard config
  // Fall back to default if config is null or has no renderable children
  const hasContent = dashboardConfig && dashboardConfig.children && dashboardConfig.children.length > 0;
  const config = hasContent ? dashboardConfig : DEFAULT_DASHBOARD;
  const injected = weather ? injectWeather(config, weather) : config;

  return (
    <div className="space-y-4">
      {/* Location bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/location')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
        >
          <MapPin className="h-4 w-4" />
          <span>{floorLabel} · {roomLabel}</span>
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <SduiRenderer config={injected} />
      )}

      {/* Vote CTA */}
      <button
        onClick={() => navigate('/vote')}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-4"
      >
        <Vote className="h-5 w-5" />
        Cast Comfort Vote
      </button>
    </div>
  );
}

/** Inject live weather data into weather_badge nodes */
function injectWeather(node: SduiNode, w: WeatherData): SduiNode {
  if (node.type === 'weather_badge') {
    return { ...node, temp: String(Math.round(w.temperature)), label: w.description, icon: 'wb_sunny' };
  }
  if (node.children) {
    return { ...node, children: node.children.map((c) => injectWeather(c, w)) };
  }
  return node;
}
