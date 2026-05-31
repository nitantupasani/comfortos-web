import { useEffect, useState, useCallback } from 'react';
import {
  Plus, X, Loader2, Plug, ChevronDown, ChevronRight,
  Trash2, ToggleLeft, ToggleRight, Clock, AlertCircle, CheckCircle2,
  Cloud, RefreshCw, ShieldCheck, ShieldAlert, KeyRound,
} from 'lucide-react';
import {
  telemetryEndpointsApi,
  TelemetryEndpoint,
  EndpointCreate,
  EndpointMode,
  MODE_LABELS,
} from '../../api/telemetryEndpoints';
import {
  connectorsApi,
  BuildingConnector,
  isPrivaConnector,
  privaCookieHealth,
} from '../../api/connectors';

const STANDARD_METRICS = ['temperature', 'co2', 'relative_humidity', 'noise'];

function relativeTime(iso: string | null): string {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

interface Props {
  buildingId: string;
}

export default function TelemetryEndpointsTab({ buildingId }: Props) {
  const [endpoints, setEndpoints] = useState<TelemetryEndpoint[]>([]);
  const [connectors, setConnectors] = useState<BuildingConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Priva cookie-refresh modal
  const [cookieTarget, setCookieTarget] = useState<BuildingConnector | null>(null);
  const [cookieValue, setCookieValue] = useState('');
  const [cookieSaving, setCookieSaving] = useState(false);
  const [cookieError, setCookieError] = useState<string | null>(null);

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
      const [eps, cons] = await Promise.all([
        telemetryEndpointsApi.list(buildingId).catch(() => [] as TelemetryEndpoint[]),
        connectorsApi.list(buildingId).catch(() => [] as BuildingConnector[]),
      ]);
      setEndpoints(eps);
      setConnectors(cons);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  const privaConnectors = connectors.filter(isPrivaConnector);

  const handleConnectorToggle = async (c: BuildingConnector) => {
    try {
      await connectorsApi.update(c.id, { isEnabled: !c.isEnabled });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to toggle');
    }
  };

  const handleConnectorDelete = async (c: BuildingConnector) => {
    if (!confirm(`Delete connector "${c.name}"?`)) return;
    try {
      await connectorsApi.remove(c.id);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const openCookieModal = (c: BuildingConnector) => {
    setCookieTarget(c);
    setCookieValue('');
    setCookieError(null);
  };

  const handleCookieRefresh = async () => {
    if (!cookieTarget || !cookieValue.trim()) return;
    setCookieSaving(true);
    setCookieError(null);
    try {
      await connectorsApi.refreshPrivaCookie(
        cookieTarget.id,
        cookieTarget.authConfig ?? {},
        cookieValue,
      );
      setCookieTarget(null);
      setCookieValue('');
      await load();
    } catch (e: unknown) {
      setCookieError(e instanceof Error ? e.message : 'Failed to update cookie');
    } finally {
      setCookieSaving(false);
    }
  };

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

      {/* Priva Cloud connectors */}
      {privaConnectors.length > 0 && (
        <div className="mb-5 space-y-3">
          {privaConnectors.map(c => {
            const health = privaCookieHealth(c);
            return (
              <div key={c.id} className="border border-sky-200 rounded-xl bg-sky-50/50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">{c.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-medium">
                        Priva Cloud
                      </span>
                      <span className={`w-2 h-2 rounded-full ${c.isEnabled ? 'bg-green-400' : 'bg-gray-300'}`}
                        title={c.isEnabled ? 'Ingesting' : 'Disabled'} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                      <span>last poll {relativeTime(c.lastPolledAt)}</span>
                      <span>{c.totalReadingsIngested.toLocaleString()} readings</span>
                      <span>every {c.pollingIntervalMinutes}m</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectorToggle(c)}
                    className={`p-1 ${c.isEnabled ? 'text-green-500' : 'text-gray-400'}`}
                    title={c.isEnabled ? 'Disable ingestion' : 'Enable ingestion'}
                  >
                    {c.isEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => handleConnectorDelete(c)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete connector"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Session cookie health */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-sky-100 bg-white/60">
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    {health === 'stale' ? (
                      <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : health === 'healthy' ? (
                      <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <span className={`truncate ${health === 'stale' ? 'text-amber-700' : 'text-gray-500'}`}>
                      {health === 'stale'
                        ? (c.lastError || 'Session cookie may be expired — refresh it to resume ingestion.')
                        : health === 'healthy'
                          ? 'Session cookie active. Cookies expire after ~5 days.'
                          : 'Not polled yet. Paste a fresh session cookie to start.'}
                    </span>
                  </div>
                  <button
                    onClick={() => openCookieModal(c)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 shrink-0"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Refresh cookie
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Endpoint list */}
      {endpoints.length === 0 ? (
        privaConnectors.length > 0 ? null : (
        <div className="text-center py-12 text-gray-400">
          <Plug className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No telemetry endpoints configured.</p>
        </div>
        )
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

      {/* Priva cookie refresh modal */}
      {cookieTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-sky-600" /> Refresh Priva session cookie
              </h3>
              <button onClick={() => setCookieTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Sign in to <span className="font-mono">operator.priva.com</span>, copy the fresh{' '}
              <span className="font-mono">__Host-bff=…</span> cookie, and paste it below. The other
              Priva settings ({cookieTarget.name}) are kept as-is.
            </p>

            {cookieError && <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">{cookieError}</div>}

            <textarea
              value={cookieValue}
              onChange={e => setCookieValue(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="__Host-bff=eyJhbGc..."
            />

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setCookieTarget(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={handleCookieRefresh}
                disabled={cookieSaving || !cookieValue.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {cookieSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {cookieSaving ? 'Saving...' : 'Update cookie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
