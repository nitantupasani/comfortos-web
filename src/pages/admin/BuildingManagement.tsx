import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Lock,
  Globe,
  Loader2,
  Plus,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import type { Building, BuildingComfortData } from '../../types';
import LocationHierarchyTab from '../../components/building/LocationHierarchyTab';
import TelemetryEndpointsTab from '../../components/building/TelemetryEndpointsTab';
import MetricConfigTab from '../../components/building/MetricConfigTab';
import DashboardLayoutTab from '../../components/building/DashboardLayoutTab';
import VoteFormTab from '../../components/building/VoteFormTab';
import BuildingSetupChecklist from '../../components/building/BuildingSetupChecklist';
import { PageHeader, StatusBadge } from '../../components/common/ui';

type TabKey = 'overview' | 'locations' | 'endpoints' | 'config' | 'dashboard' | 'vote-form';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'locations', label: 'Zones' },
  { key: 'endpoints', label: 'Telemetry' },
  { key: 'config', label: 'Metrics' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'vote-form', label: 'Vote form' },
];

interface Props {
  managedOnly?: boolean;
}

export default function BuildingManagement({ managedOnly = false }: Props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const tabParam = searchParams.get('tab') as TabKey | null;

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [comforts, setComforts] = useState<Map<string, BuildingComfortData>>(new Map());
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Building | null>(null);
  const [comfort, setComfort] = useState<BuildingComfortData | null>(null);
  const [comfortLoading, setComfortLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam ?? 'overview');
  const [deleting, setDeleting] = useState(false);

  const basePath = managedOnly ? '/fm/buildings' : '/admin/buildings';

  useEffect(() => {
    const loader = managedOnly ? buildingsApi.listManaged() : buildingsApi.list();
    loader
      .then(async (bs) => {
        setBuildings(bs);
        const map = new Map<string, BuildingComfortData>();
        await Promise.all(
          bs.map(async (b) => {
            try {
              const c = await buildingsApi.comfort(b.id);
              if (c) map.set(b.id, c);
            } catch {
              /* skip */
            }
          }),
        );
        setComforts(map);
      })
      .finally(() => setLoading(false));
  }, [managedOnly]);

  const loadBuilding = useCallback(
    async (id: string) => {
      const b = buildings.find((x) => x.id === id);
      setSelected(b ?? null);
      if (!b) return;
      setComfortLoading(true);
      try {
        const data = await buildingsApi.comfort(id);
        setComfort(data);
      } catch {
        setComfort(null);
      }
      setComfortLoading(false);
    },
    [buildings],
  );

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setComfort(null);
      return;
    }
    loadBuilding(selectedId);
  }, [selectedId, loadBuilding]);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview');
    }
  }, [tabParam, selectedId]);

  const openBuilding = (b: Building) => {
    setSearchParams({ id: b.id });
  };

  const closeDetail = () => {
    setSearchParams({});
  };

  const setTab = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === 'overview') params.delete('tab');
    else params.set('tab', tab);
    setSearchParams(params);
  };

  const handleDelete = async (b: Building) => {
    const confirmed = window.confirm(
      `Permanently delete "${b.name}"?\n\nThis removes the building plus every vote, sensor, telemetry reading, zone, and complaint tied to it. Cannot be undone.`,
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await buildingsApi.delete(b.id);
      setBuildings((prev) => prev.filter((x) => x.id !== b.id));
      setComforts((prev) => {
        const next = new Map(prev);
        next.delete(b.id);
        return next;
      });
      setSearchParams({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      window.alert(`Failed to delete building: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleBuildingUpdated = (updated: Building) => {
    setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelected(updated);
  };

  const handleChecklistNav = (tab: string) => {
    const map: Record<string, TabKey> = {
      locations: 'locations',
      endpoints: 'endpoints',
      'dashboard-config': 'dashboard',
      'vote-config': 'vote-form',
    };
    const target = map[tab];
    if (target) setTab(target);
  };

  const filtered = useMemo(() => buildings, [buildings]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  // Full-width detail when a building is selected
  if (selected) {
    return (
      <div className="space-y-5">
        <div>
          <button
            onClick={closeDetail}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> All buildings
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selected.address}
                {selected.city ? ` · ${selected.city}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone={selected.requiresAccessPermission ? 'warning' : 'success'}>
                {selected.requiresAccessPermission ? 'Restricted' : 'Open'}
              </StatusBadge>
              {!managedOnly && (
                <button
                  onClick={() => handleDelete(selected)}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 px-4 overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewPanel
                building={selected}
                comfort={comfort}
                comfortLoading={comfortLoading}
                onNavigateTab={handleChecklistNav}
                onUpdated={handleBuildingUpdated}
              />
            )}
            {activeTab === 'locations' && <LocationHierarchyTab buildingId={selected.id} />}
            {activeTab === 'endpoints' && <TelemetryEndpointsTab buildingId={selected.id} />}
            {activeTab === 'config' && <MetricConfigTab buildingId={selected.id} />}
            {activeTab === 'dashboard' && <DashboardLayoutTab buildingId={selected.id} />}
            {activeTab === 'vote-form' && <VoteFormTab buildingId={selected.id} />}
          </div>
        </div>
      </div>
    );
  }

  // Grid view (no building selected)
  return (
    <>
      <PageHeader
        title={managedOnly ? 'My buildings' : 'Buildings'}
        description="Select a building to view and configure setup, zones, telemetry, and dashboards."
        actions={
          <button
            onClick={() => navigate(managedOnly ? '/fm/buildings/new' : '/admin/buildings/new')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Building
          </button>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Building2 className="mx-auto h-8 w-8 text-gray-300" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">No buildings yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first building to get started.
          </p>
          <button
            onClick={() => navigate(managedOnly ? '/fm/buildings/new' : '/admin/buildings/new')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add building
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const c = comforts.get(b.id);
            const score = c?.overallScore;
            const tone =
              score == null
                ? 'neutral'
                : score >= 7
                  ? 'success'
                  : score >= 5
                    ? 'warning'
                    : 'danger';
            return (
              <button
                key={b.id}
                onClick={() => openBuilding(b)}
                className="text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-gray-900 truncate">{b.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="h-3 w-3" />
                      {b.city || b.address}
                    </div>
                  </div>
                  {b.requiresAccessPermission ? (
                    <Lock className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>{c ? `${c.totalVotes} votes` : 'No votes yet'}</span>
                  {score != null ? (
                    <StatusBadge tone={tone} dot>
                      {score.toFixed(1)}
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">No data</StatusBadge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function OverviewPanel({
  building,
  comfort,
  comfortLoading,
  onNavigateTab,
  onUpdated,
}: {
  building: Building;
  comfort: BuildingComfortData | null;
  comfortLoading: boolean;
  onNavigateTab: (tab: string) => void;
  onUpdated: (b: Building) => void;
}) {
  return (
    <div className="space-y-6">
      <BuildingSetupChecklist buildingId={building.id} onNavigateTab={onNavigateTab} />

      <BuildingDetailsEditor building={building} onUpdated={onUpdated} />

      <div>
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Comfort score</h4>
        {comfortLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
        ) : comfort ? (
          <div className="flex items-center gap-4">
            <div
              className="text-4xl font-bold"
              style={{
                color:
                  comfort.overallScore >= 7
                    ? '#22c55e'
                    : comfort.overallScore >= 5
                      ? '#eab308'
                      : '#ef4444',
              }}
            >
              {comfort.overallScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">
              <div>/10 overall score</div>
              <div>{comfort.totalVotes} total votes</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No comfort data available yet.</p>
        )}
      </div>

      {comfort && comfort.locations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Per-location breakdown</h4>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Floor</th>
                  <th className="px-4 py-2 text-left font-medium">Room</th>
                  <th className="px-4 py-2 text-right font-medium">Score</th>
                  <th className="px-4 py-2 text-right font-medium">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comfort.locations.map((loc) => (
                  <tr key={`${loc.floor}-${loc.room}`}>
                    <td className="px-4 py-2">{loc.floorLabel}</td>
                    <td className="px-4 py-2">{loc.roomLabel}</td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">
                      {loc.comfortScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500 tabular-nums">
                      {loc.voteCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
      <div className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`font-semibold text-sm mt-0.5 truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function BuildingDetailsEditor({
  building,
  onUpdated,
}: {
  building: Building;
  onUpdated: (b: Building) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState(building.city ?? '');
  const [latitude, setLatitude] = useState<string>(
    building.latitude != null ? String(building.latitude) : '',
  );
  const [longitude, setLongitude] = useState<string>(
    building.longitude != null ? String(building.longitude) : '',
  );
  const [restricted, setRestricted] = useState<boolean>(building.requiresAccessPermission);

  useEffect(() => {
    setCity(building.city ?? '');
    setLatitude(building.latitude != null ? String(building.latitude) : '');
    setLongitude(building.longitude != null ? String(building.longitude) : '');
    setRestricted(building.requiresAccessPermission);
    setError(null);
  }, [building.id, building.city, building.latitude, building.longitude, building.requiresAccessPermission]);

  const cancel = () => {
    setCity(building.city ?? '');
    setLatitude(building.latitude != null ? String(building.latitude) : '');
    setLongitude(building.longitude != null ? String(building.longitude) : '');
    setRestricted(building.requiresAccessPermission);
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    setError(null);
    const parseCoord = (raw: string, label: string): number | undefined | 'invalid' => {
      const trimmed = raw.trim();
      if (trimmed === '') return undefined;
      const n = Number(trimmed);
      if (!Number.isFinite(n)) {
        setError(`${label} must be a number`);
        return 'invalid';
      }
      return n;
    };
    const lat = parseCoord(latitude, 'Latitude');
    if (lat === 'invalid') return;
    const lng = parseCoord(longitude, 'Longitude');
    if (lng === 'invalid') return;
    if (typeof lat === 'number' && (lat < -90 || lat > 90)) {
      setError('Latitude must be between -90 and 90');
      return;
    }
    if (typeof lng === 'number' && (lng < -180 || lng > 180)) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setSaving(true);
    try {
      const updated = await buildingsApi.update(building.id, {
        city: city.trim() || undefined,
        latitude: lat,
        longitude: lng,
        requiresAccessPermission: restricted,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DetailCard label="City" value={building.city || '—'} />
          <DetailCard
            label="Latitude"
            value={building.latitude != null ? building.latitude.toFixed(4) : '—'}
          />
          <DetailCard
            label="Longitude"
            value={building.longitude != null ? building.longitude.toFixed(4) : '—'}
          />
          <DetailCard label="ID" value={building.id} mono />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-primary-700 hover:text-primary-800"
          >
            Edit details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            placeholder="52.0667"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            placeholder="4.3279"
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={restricted}
          onChange={(e) => setRestricted(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span>
          Restricted building
          <span className="block text-xs text-gray-500">
            Occupants need an access grant or matching tenant before they can view or vote.
          </span>
        </span>
      </label>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
}
