import { useEffect, useState, useCallback } from 'react';
import {
  Plus, X, Loader2, Plug, ChevronDown, ChevronRight,
  Trash2, ToggleLeft, ToggleRight, Clock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import {
  telemetryEndpointsApi,
  TelemetryEndpoint,
  EndpointCreate,
  EndpointMode,
  MODE_LABELS,
} from '../../api/telemetryEndpoints';

const STANDARD_METRICS = ['temperature', 'co2', 'relative_humidity', 'noise'];

interface Props {
  buildingId: string;
}

export default function TelemetryEndpointsTab({ buildingId }: Props) {
  const [endpoints, setEndpoints] = useState<TelemetryEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formMethod, setFormMethod] = useState('GET');
  const [formMode, setFormMode] = useState<EndpointMode>('multi_zone');
  const [formAuthType, setFormAuthType] = useState('api_key');
  const [formAuthKey, setFormAuthKey] = useState('');
  const [formAuthHeader, setFormAuthHeader] = useState('X-Api-Key');
  const [formMetrics, setFormMetrics] = useState<string[]>(['temperature']);
  const [formInterval, setFormInterval] = useState(15);

  const load = useCallback(async () => {
    try {
      const data = await telemetryEndpointsApi.list(buildingId);
      setEndpoints(data);
    } catch {
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormMethod('GET');
    setFormMode('multi_zone');
    setFormAuthType('api_key');
    setFormAuthKey('');
    setFormAuthHeader('X-Api-Key');
    setFormMetrics(['temperature']);
    setFormInterval(15);
    setError(null);
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formUrl.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const authConfig: Record<string, string> = { type: formAuthType };
      if (formAuthType === 'api_key') {
        authConfig.header = formAuthHeader;
        authConfig.api_key = formAuthKey;
      } else if (formAuthType === 'bearer_token') {
        authConfig.token = formAuthKey;
      }

      const data: EndpointCreate = {
        buildingId,
        endpointName: formName.trim(),
        endpointUrl: formUrl.trim(),
        httpMethod: formMethod,
        endpointMode: formMode,
        authenticationConfig: authConfig,
        availableMetrics: formMetrics,
        pollingConfig: {
          interval_minutes: formInterval,
          timeout_seconds: 30,
          retry_count: 3,
          backoff_strategy: 'exponential',
        },
      };
      await telemetryEndpointsApi.create(data);
      setShowAdd(false);
      resetForm();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ep: TelemetryEndpoint) => {
    try {
      await telemetryEndpointsApi.update(ep.endpointId, { isEnabled: !ep.isEnabled });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to toggle');
    }
  };

  const handleDelete = async (ep: TelemetryEndpoint) => {
    if (!confirm(`Delete endpoint "${ep.endpointName}"?`)) return;
    try {
      await telemetryEndpointsApi.remove(ep.endpointId);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const toggleMetric = (m: string) => {
    setFormMetrics(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const statusColor = (status: string | null) => {
    if (status === 'success') return 'text-green-600';
    if (status === 'error') return 'text-red-600';
    if (status === 'timeout') return 'text-yellow-600';
    return 'text-gray-400';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Telemetry Endpoints</h3>
          <p className="text-sm text-gray-500">Configure data sources that provide sensor readings for this building</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Add Endpoint
        </button>
      </div>

      {/* Endpoint list */}
      {endpoints.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Plug className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No telemetry endpoints configured.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {endpoints.map(ep => {
            const isExpanded = expandedId === ep.endpointId;
            const StatusIcon = ep.lastStatus === 'success' ? CheckCircle2
              : ep.lastStatus === 'error' ? AlertCircle : Clock;

            return (
              <div key={ep.endpointId} className="border rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full ${ep.isEnabled ? 'bg-green-400' : 'bg-gray-300'}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">{ep.endpointName}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {MODE_LABELS[ep.endpointMode as EndpointMode] || ep.endpointMode}
                      </span>
                      {ep.availableMetrics && (
                        <span className="text-xs text-gray-400">
                          {ep.availableMetrics.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                      <span className="truncate max-w-xs">{ep.endpointUrl}</span>
                      <span>every {ep.pollingConfig.interval_minutes}m</span>
                      {ep.lastPolledAt && (
                        <span className={statusColor(ep.lastStatus)}>
                          <StatusIcon className="h-3 w-3 inline mr-0.5" />
                          {ep.totalReadingsIngested.toLocaleString()} readings
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleToggle(ep)}
                    className={`p-1 ${ep.isEnabled ? 'text-green-500' : 'text-gray-400'}`}
                    title={ep.isEnabled ? 'Disable' : 'Enable'}
                  >
                    {ep.isEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ep.endpointId)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(ep)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 border-t bg-gray-50 text-xs space-y-1">
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div><span className="text-gray-500">ID:</span> <span className="font-mono">{ep.endpointId}</span></div>
                      <div><span className="text-gray-500">HTTP:</span> {ep.httpMethod}</div>
                      <div><span className="text-gray-500">Auth:</span> {ep.authenticationConfig?.type || 'none'}</div>
                      <div><span className="text-gray-500">Priority:</span> {ep.priority}</div>
                      <div><span className="text-gray-500">Failures:</span> {ep.consecutiveFailures}</div>
                      <div><span className="text-gray-500">Total Polls:</span> {ep.totalPolls}</div>
                    </div>
                    {ep.lastError && (
                      <div className="mt-1 p-2 bg-red-50 text-red-700 rounded text-xs">{ep.lastError}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Endpoint Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Telemetry Endpoint</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint Name *</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. BMS North Wing Sensors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL *</label>
                <input
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="https://bms.example.com/api/readings"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
                  <select value={formMethod} onChange={e => setFormMethod(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint Mode *</label>
                  <select value={formMode} onChange={e => setFormMode(e.target.value as EndpointMode)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {(Object.keys(MODE_LABELS) as EndpointMode[]).map(m => (
                      <option key={m} value={m}>{MODE_LABELS[m]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={formAuthType} onChange={e => setFormAuthType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                    <option value="api_key">API Key</option>
                    <option value="bearer_token">Bearer Token</option>
                    <option value="basic_auth">Basic Auth</option>
                    <option value="oauth2_client_credentials">OAuth2</option>
                  </select>
                  {formAuthType === 'api_key' && (
                    <input value={formAuthHeader} onChange={e => setFormAuthHeader(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" placeholder="Header name" />
                  )}
                </div>
                <input
                  value={formAuthKey}
                  onChange={e => setFormAuthKey(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-2"
                  placeholder={formAuthType === 'bearer_token' ? 'Token' : 'API key value'}
                  type="password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_METRICS.map(m => (
                    <button
                      key={m}
                      onClick={() => toggleMetric(m)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        formMetrics.includes(m)
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Polling Interval (minutes)</label>
                <input
                  type="number"
                  value={formInterval}
                  onChange={e => setFormInterval(parseInt(e.target.value) || 15)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  min={1}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={saving || !formName.trim() || !formUrl.trim()}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Endpoint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
