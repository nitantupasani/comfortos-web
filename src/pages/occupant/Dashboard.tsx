import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useBuildingStore } from '../../store/buildingStore';
import { useAuthStore } from '../../store/authStore';
import { fetchWeather } from '../../utils/weather';
import SduiRenderer from '../../components/sdui/SduiRenderer';
import DashboardContextBar from '../../components/occupant/DashboardContextBar';
import BuildingQuickSwitch from '../../components/occupant/BuildingQuickSwitch';
import LocationQuickPicker from '../../components/occupant/LocationQuickPicker';
import { Vote, Loader2, Building2, MapPin } from 'lucide-react';
import type { SduiNode, WeatherData, Building } from '../../types';

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
  const floor = usePresenceStore((s) => s.floor);
  const selectBuilding = usePresenceStore((s) => s.selectBuilding);
  const buildings = usePresenceStore((s) => s.buildings);
  const fetchBuildings = usePresenceStore((s) => s.fetchBuildings);
  const recentBuildings = usePresenceStore((s) => s.recentBuildings);
  const user = useAuthStore((s) => s.user);
  const { dashboardConfig, fetchDashboard, fetchLocationForm } = useBuildingStore();
  const navigate = useNavigate();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuildingSwitch, setShowBuildingSwitch] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const loadData = async () => {
    if (!activeBuilding) return;
    setLoading(true);
    await fetchDashboard(activeBuilding.id);
    const w = await fetchWeather(activeBuilding.latitude, activeBuilding.longitude);
    if (w) setWeather(w);
    setLoading(false);
  };

  useEffect(() => {
    if (activeBuilding) {
      loadData();
    }
  }, [activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load buildings list if we don't have it yet (for inline selector)
  useEffect(() => {
    if (!activeBuilding && buildings.length === 0) {
      fetchBuildings(user?.tenantId ?? undefined);
    }
  }, [activeBuilding, buildings.length, fetchBuildings, user?.tenantId]);

  const handleBuildingSelect = async (building: Building) => {
    await selectBuilding(building);
    // If the building has location data, show the location picker
    await fetchLocationForm(building.id);
    setShowLocationPicker(true);
  };

  const handleInlineBuildingSelect = async (building: Building) => {
    await selectBuilding(building);
    await fetchLocationForm(building.id);
    setShowLocationPicker(true);
  };

  // If no building selected, show inline building selector
  if (!activeBuilding) {
    const isLoading = usePresenceStore.getState().isLoading;
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.98)_100%)] px-5 py-6 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h1 className="mt-2 text-xl font-bold text-slate-800">Welcome to ComfortOS</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a building to view your dashboard
          </p>
        </div>

        {/* Recent buildings */}
        {recentBuildings.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
              Recent
            </div>
            <div className="space-y-2">
              {recentBuildings.map((r) => (
                <button
                  key={r.building.id}
                  onClick={() => handleInlineBuildingSelect(r.building)}
                  className="w-full rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(5,150,105,0.12)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800 truncate">{r.building.name}</div>
                      <div className="text-xs text-slate-400 truncate">{r.building.address}</div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Select
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All buildings */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
              All Buildings
            </div>
            {buildings.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/75 px-4 py-8 text-center text-sm text-slate-400">
                No buildings available
              </div>
            ) : (
              <div className="space-y-2">
                {buildings
                  .filter((b) => !recentBuildings.some((r) => r.building.id === b.id))
                  .map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleInlineBuildingSelect(b)}
                      className="w-full rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(5,150,105,0.12)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-800 truncate">{b.name}</div>
                          <div className="text-xs text-slate-400 truncate">{b.address}</div>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        <LocationQuickPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
        />
      </div>
    );
  }

  // If building selected but no location, prompt to pick location
  if (!floor) {
    return (
      <div className="space-y-4">
        <DashboardContextBar
          buildingName={activeBuilding.name}
          floorLabel={null}
          roomLabel={null}
          loading={false}
          onSwitchBuilding={() => setShowBuildingSwitch(true)}
          onChangeLocation={() => setShowLocationPicker(true)}
          onRefresh={loadData}
        />

        <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.98)_100%)] px-5 py-8 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-800">Set Your Location</h2>
          <p className="mt-2 text-sm text-slate-500">Choose your floor and room to see environment data</p>
          <button
            onClick={() => setShowLocationPicker(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Select Location
          </button>
        </div>

        <BuildingQuickSwitch
          isOpen={showBuildingSwitch}
          onClose={() => setShowBuildingSwitch(false)}
          onSelect={handleBuildingSelect}
        />
        <LocationQuickPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
        />
      </div>
    );
  }

  // Full dashboard view
  const hasContent = dashboardConfig && dashboardConfig.children && dashboardConfig.children.length > 0;
  const config = hasContent ? dashboardConfig : DEFAULT_DASHBOARD;
  const injected = weather ? injectWeather(config, weather) : config;

  return (
    <div className="space-y-4">
      <DashboardContextBar
        buildingName={activeBuilding.name}
        floorLabel={floorLabel}
        roomLabel={roomLabel}
        loading={loading}
        onSwitchBuilding={() => setShowBuildingSwitch(true)}
        onChangeLocation={() => setShowLocationPicker(true)}
        onRefresh={loadData}
      />

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

      <BuildingQuickSwitch
        isOpen={showBuildingSwitch}
        onClose={() => setShowBuildingSwitch(false)}
        onSelect={handleBuildingSelect}
      />
      <LocationQuickPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
      />
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
