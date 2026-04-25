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
import { Vote, Loader2, Building2, MapPin, Plus, Trash2, X, Home } from 'lucide-react';
import type { SduiNode, WeatherData, Building } from '../../types';
import { buildingsApi, getHiddenPersonalIds, PERSONAL_BUILDING_LIMIT } from '../../api/buildings';

interface NewPersonalBuildingForm {
  name: string;
  city: string;
  floorCount: string;
  zoneCount: string;
}

const EMPTY_PERSONAL_FORM: NewPersonalBuildingForm = { name: '', city: '', floorCount: '', zoneCount: '' };

/**
 * Default dashboard layout — used when the backend has no config.
 * Admins/FMs can override this via PUT /buildings/{id}/config.
 *
 * Supported SDUI node types include:
 *   telemetry_chart  — live line chart + readings grid (configurable)
 *   weather_badge, metric_tile, trend_card, alert_banner, kpi_card,
 *   section_header, stat_row, progress_bar, badge_row, etc.
 *
 * telemetry_chart props:
 *   metricType   "temperature" | "co2" | "humidity" | "noise"
 *   title        Chart heading
 *   unit         "°C", "ppm", "%", "dBA"
 *   groupBy      "room" | "floor" | "wing"
 *   height       Chart height in px (default 240)
 *   timeRanges   [{ label, hours, granularity }]
 */
const DEFAULT_DASHBOARD: SduiNode = {
  type: 'column',
  crossAxisAlignment: 'stretch',
  children: [
    { type: 'weather_badge', temp: '--', unit: '°C', label: 'Outside', icon: 'wb_sunny' },
    { type: 'spacer', height: 12 },
    {
      type: 'telemetry_chart',
      metricType: 'temperature',
      title: 'Temperature',
      unit: '°C',
      groupBy: 'room',
      height: 240,
      timeRanges: [
        { label: 'Last 6 hours', hours: 6, granularity: 'raw' },
        { label: 'Last 24 hours', hours: 24, granularity: 'hourly' },
      ],
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

  const forgetBuilding = usePresenceStore((s) => s.forgetBuilding);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuildingSwitch, setShowBuildingSwitch] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Personal building management for the inline (no-active-building) view.
  const [personal, setPersonal] = useState<Building[]>([]);
  const [showAddPersonalForm, setShowAddPersonalForm] = useState(false);
  const [personalForm, setPersonalForm] = useState<NewPersonalBuildingForm>(EMPTY_PERSONAL_FORM);
  const [personalSubmitting, setPersonalSubmitting] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  const loadPersonal = async () => {
    try {
      setPersonal(await buildingsApi.listPersonal());
    } catch {
      // non-critical — leave list empty
    }
  };

  useEffect(() => {
    if (!activeBuilding) loadPersonal();
  }, [activeBuilding?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalForm.name.trim()) {
      setPersonalError('Building name is required');
      return;
    }
    setPersonalSubmitting(true);
    setPersonalError(null);
    try {
      const floorCount = personalForm.floorCount.trim() ? parseInt(personalForm.floorCount, 10) : undefined;
      const zoneCount = personalForm.zoneCount.trim() ? parseInt(personalForm.zoneCount, 10) : undefined;
      await buildingsApi.createPersonal({
        name: personalForm.name.trim(),
        city: personalForm.city.trim() || undefined,
        floorCount: Number.isFinite(floorCount) ? floorCount : undefined,
        zoneCount: Number.isFinite(zoneCount) ? zoneCount : undefined,
      });
      setPersonalForm(EMPTY_PERSONAL_FORM);
      setShowAddPersonalForm(false);
      await Promise.all([loadPersonal(), fetchBuildings(user?.tenantId ?? undefined)]);
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : 'Failed to add building');
    } finally {
      setPersonalSubmitting(false);
    }
  };

  const deletePersonal = async (e: React.MouseEvent, buildingId: string) => {
    e.stopPropagation();
    if (!confirm('Remove this building?')) return;
    setPersonal((prev) => prev.filter((b) => b.id !== buildingId));
    forgetBuilding(buildingId);
    await buildingsApi.deletePersonal(buildingId);
    await Promise.all([loadPersonal(), fetchBuildings(user?.tenantId ?? undefined)]);
  };

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
    const hidden = getHiddenPersonalIds();
    const personalIds = new Set(personal.map((b) => b.id));
    const isFiltered = (id: string) => hidden.has(id) || personalIds.has(id);
    const visibleRecent = recentBuildings.filter((r) => !isFiltered(r.building.id));
    const visibleAll = buildings.filter((b) => !isFiltered(b.id));
    const atPersonalLimit = personal.length >= PERSONAL_BUILDING_LIMIT;
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.98)_100%)] px-5 py-6 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h1 className="mt-2 text-xl font-bold text-slate-800">Welcome to ComfortOS</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a building to view your dashboard
          </p>
        </div>

        {/* My Buildings + Add building */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              <Home className="h-3 w-3" />
              My Buildings
              <span className="ml-2 normal-case text-[10px] font-normal tracking-normal text-slate-400">
                {personal.length} of {PERSONAL_BUILDING_LIMIT}
              </span>
            </div>
            {!showAddPersonalForm && (
              <button
                onClick={() => { setShowAddPersonalForm(true); setPersonalError(null); }}
                disabled={atPersonalLimit}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Add building
              </button>
            )}
          </div>

          {showAddPersonalForm && (
            <form
              onSubmit={submitPersonal}
              className="rounded-[24px] border border-emerald-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">New building</div>
                <button
                  type="button"
                  onClick={() => { setShowAddPersonalForm(false); setPersonalForm(EMPTY_PERSONAL_FORM); setPersonalError(null); }}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Building name (required)"
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                  maxLength={200}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="City (optional)"
                  value={personalForm.city}
                  onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                  maxLength={100}
                />
                <p className="px-1 text-[11px] text-slate-500">
                  Tell us how the building is structured so we can ask
                  the right comfort questions.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={200}
                    placeholder="How many floors?"
                    value={personalForm.floorCount}
                    onChange={(e) => setPersonalForm({ ...personalForm, floorCount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={50}
                    placeholder="How many blocks/zones?"
                    value={personalForm.zoneCount}
                    onChange={(e) => setPersonalForm({ ...personalForm, zoneCount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                  />
                </div>
                <p className="px-1 text-[11px] text-slate-400">
                  You can add room numbers later from the location picker. Default comfort questions are ready to vote on.
                </p>
              </div>
              {personalError && (
                <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{personalError}</div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddPersonalForm(false); setPersonalForm(EMPTY_PERSONAL_FORM); setPersonalError(null); }}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={personalSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-emerald-300"
                >
                  {personalSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          )}

          {personal.length > 0 && (
            <div className="space-y-2">
              {personal.map((b) => {
                const meta = (b.metadata ?? {}) as Record<string, unknown>;
                const floorMeta = typeof meta.floor === 'string' ? meta.floor : null;
                const zoneMeta = typeof meta.zone === 'string' ? meta.zone : null;
                const subtitle =
                  [b.city, floorMeta && `Floor ${floorMeta}`, zoneMeta && `Zone ${zoneMeta}`]
                    .filter(Boolean)
                    .join(' · ') || 'Personal building';
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-[24px] border border-emerald-100 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                  >
                    <button
                      onClick={() => handleInlineBuildingSelect(b)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-800">{b.name}</div>
                        <div className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">Select</span>
                    </button>
                    <button
                      onClick={(e) => deletePersonal(e, b.id)}
                      className="rounded-full p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent buildings */}
        {visibleRecent.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
              Recent
            </div>
            <div className="space-y-2">
              {visibleRecent.map((r) => (
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
            {visibleAll.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/75 px-5 py-8 text-center">
                <div className="text-sm font-medium text-slate-600">No buildings yet</div>
                <p className="mt-1 text-xs text-slate-400 leading-5">
                  Ask your facility manager to grant you access to a building. Once you're added, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleAll
                  .filter((b) => !visibleRecent.some((r) => r.building.id === b.id))
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

  // Full dashboard view — use server config if available, otherwise DEFAULT_DASHBOARD with chart
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

      {/* Inline location prompt when no location set */}
      {!floor && (
        <button
          onClick={() => setShowLocationPicker(true)}
          className="w-full flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-left transition-colors hover:bg-emerald-100"
        >
          <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-700">Set your location</div>
            <div className="text-xs text-slate-400">Pick floor & room for personalised data</div>
          </div>
        </button>
      )}

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
