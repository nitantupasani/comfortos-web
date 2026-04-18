import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Lock, Globe, Loader2, Plus } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import type { Building, BuildingComfortData } from '../../types';
import LocationHierarchyTab from '../../components/building/LocationHierarchyTab';
import TelemetryEndpointsTab from '../../components/building/TelemetryEndpointsTab';
import MetricConfigTab from '../../components/building/MetricConfigTab';
import BuildingSetupChecklist from '../../components/building/BuildingSetupChecklist';

type TabKey = 'overview' | 'locations' | 'endpoints' | 'config';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'locations', label: 'Location Hierarchy' },
  { key: 'endpoints', label: 'Telemetry Endpoints' },
  { key: 'config', label: 'Metric Config' },
];

interface Props {
  managedOnly?: boolean;
}

export default function BuildingManagement({ managedOnly = false }: Props) {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<Building | null>(null);
  const [comfort, setComfort] = useState<BuildingComfortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comfortLoading, setComfortLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    const loader = managedOnly ? buildingsApi.listManaged() : buildingsApi.list();
    loader.then(setBuildings).finally(() => setLoading(false));
  }, [managedOnly]);

  const selectBuilding = async (b: Building) => {
    setSelected(b);
    setActiveTab('overview');
    setComfortLoading(true);
    try {
      const data = await buildingsApi.comfort(b.id);
      setComfort(data);
    } catch {
      setComfort(null);
    }
    setComfortLoading(false);
  };

  const handleChecklistNav = (tab: string) => {
    if (tab === 'dashboard-config') {
      navigate(managedOnly ? '/fm/dashboard-config' : '/admin/dashboard-config');
    } else if (tab === 'vote-config') {
      navigate(managedOnly ? '/fm/vote-config' : '/admin/vote-config');
    } else {
      setActiveTab(tab as TabKey);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {managedOnly ? 'My Buildings' : 'Building Management'}
        </h2>
        {!managedOnly && (
          <button
            onClick={() => navigate('/admin/buildings/new')}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Building
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building List */}
        <div className="lg:col-span-1 space-y-3">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => selectBuilding(b)}
              className={`w-full text-left bg-white rounded-xl border p-4 transition-all ${
                selected?.id === b.id ? 'border-primary-400 ring-2 ring-primary-100' : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{b.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {b.city}
                  </div>
                </div>
                {b.requiresAccessPermission ? (
                  <Lock className="h-4 w-4 text-amber-400" />
                ) : (
                  <Globe className="h-4 w-4 text-green-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Building Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-xl font-bold text-gray-800">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.address}</p>
              </div>

              {/* Tab Bar */}
              <div className="px-6 border-b">
                <nav className="flex gap-6">
                  {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Setup Checklist */}
                    <BuildingSetupChecklist
                      buildingId={selected.id}
                      onNavigateTab={handleChecklistNav}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <DetailCard label="City" value={selected.city} />
                      <DetailCard label="Latitude" value={selected.latitude?.toFixed(4) || '-'} />
                      <DetailCard label="Longitude" value={selected.longitude?.toFixed(4) || '-'} />
                      <DetailCard label="ID" value={selected.id} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Access</h4>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        selected.requiresAccessPermission ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {selected.requiresAccessPermission ? 'Restricted (Tenant Mapping Required)' : 'Open to All Authenticated Users'}
                      </span>
                    </div>

                    {/* Comfort Data */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Comfort Score</h4>
                      {comfortLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
                      ) : comfort ? (
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-bold" style={{ color: comfort.overallScore >= 7 ? '#22c55e' : comfort.overallScore >= 5 ? '#eab308' : '#ef4444' }}>
                            {comfort.overallScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            <div>/10 overall score</div>
                            <div>{comfort.totalVotes} total votes</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No comfort data available</p>
                      )}
                    </div>

                    {/* Location breakdown */}
                    {comfort && comfort.locations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Location Breakdown</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                              <tr>
                                <th className="px-4 py-2 text-left">Floor</th>
                                <th className="px-4 py-2 text-left">Room</th>
                                <th className="px-4 py-2 text-center">Score</th>
                                <th className="px-4 py-2 text-center">Votes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {comfort.locations.map((loc) => (
                                <tr key={`${loc.floor}-${loc.room}`}>
                                  <td className="px-4 py-2">{loc.floorLabel}</td>
                                  <td className="px-4 py-2">{loc.roomLabel}</td>
                                  <td className="px-4 py-2 text-center font-medium">{loc.comfortScore.toFixed(1)}</td>
                                  <td className="px-4 py-2 text-center text-gray-500">{loc.voteCount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'locations' && <LocationHierarchyTab buildingId={selected.id} />}
                {activeTab === 'endpoints' && <TelemetryEndpointsTab buildingId={selected.id} />}
                {activeTab === 'config' && <MetricConfigTab buildingId={selected.id} />}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              Select a building to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-sm mt-0.5 truncate">{value}</div>
    </div>
  );
}
