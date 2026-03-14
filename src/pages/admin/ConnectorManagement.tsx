import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Trash2,
  Play,
  TestTube,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  Database,
} from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import type { Building } from '../../types';
import {
  connectorsApi,
  type BuildingConnector,
  type ConnectorCreate,
  type ConnectorTestResult,
  type AuthType,
} from '../../api/connectors';

const AUTH_TYPE_LABELS: Record<AuthType, { label: string; description: string }> = {
  bearer_token: { label: 'Bearer Token', description: 'Static token in Authorization header' },
  oauth2_client_credentials: { label: 'OAuth 2.0 Client Credentials', description: 'M2M token exchange via client ID & secret' },
  mtls: { label: 'Mutual TLS (mTLS)', description: 'Client certificate authentication' },
  api_key: { label: 'API Key', description: 'Custom header with an API key' },
  basic_auth: { label: 'Basic Auth', description: 'HTTP Basic username & password' },
  hmac: { label: 'HMAC Signature', description: 'Request signature with shared secret' },
};

const AUTH_CONFIG_FIELDS: Record<AuthType, { key: string; label: string; type: 'text' | 'password' | 'textarea' }[]> = {
  bearer_token: [
    { key: 'token', label: 'Token', type: 'password' },
  ],
  oauth2_client_credentials: [
    { key: 'tokenUrl', label: 'Token URL', type: 'text' },
    { key: 'clientId', label: 'Client ID', type: 'text' },
    { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    { key: 'scope', label: 'Scope (optional)', type: 'text' },
  ],
  mtls: [
    { key: 'clientCertPem', label: 'Client Certificate (PEM)', type: 'textarea' },
    { key: 'clientKeyPem', label: 'Client Private Key (PEM)', type: 'textarea' },
    { key: 'caCertPem', label: 'CA Certificate (PEM, optional)', type: 'textarea' },
  ],
  api_key: [
    { key: 'headerName', label: 'Header Name', type: 'text' },
    { key: 'apiKey', label: 'API Key', type: 'password' },
  ],
  basic_auth: [
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' },
  ],
  hmac: [
    { key: 'secret', label: 'HMAC Secret', type: 'password' },
    { key: 'algorithm', label: 'Algorithm (sha256/sha512)', type: 'text' },
    { key: 'headerName', label: 'Signature Header Name', type: 'text' },
  ],
};

function StatusBadge({ status, failures }: { status: string | null; failures: number }) {
  if (!status) return <span className="text-xs text-gray-400">Never polled</span>;
  if (status === 'success')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <CheckCircle2 className="h-3 w-3" /> Success
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
      <XCircle className="h-3 w-3" /> Error ({failures})
    </span>
  );
}

export default function ConnectorManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [connectors, setConnectors] = useState<BuildingConnector[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ConnectorTestResult>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Load buildings
  useEffect(() => {
    buildingsApi.list().then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelectedBuilding(b[0].id);
    });
  }, []);

  // Load connectors
  useEffect(() => {
    if (!selectedBuilding) return;
    setLoading(true);
    connectorsApi
      .list(selectedBuilding)
      .then(setConnectors)
      .catch(() => setConnectors([]))
      .finally(() => setLoading(false));
  }, [selectedBuilding]);

  const handleTest = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await connectorsApi.test(id);
      setTestResults((prev) => ({ ...prev, [id]: res }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, statusCode: null, readingsFound: 0, sampleData: null, error: 'Request failed' },
      }));
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handlePollNow = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [`poll-${id}`]: true }));
    try {
      await connectorsApi.pollNow(id);
      // Refresh connectors to update status
      const res = await connectorsApi.list(selectedBuilding);
      setConnectors(res);
    } catch {
      /* ignore */
    }
    setActionLoading((prev) => ({ ...prev, [`poll-${id}`]: false }));
  };

  const handleToggle = async (conn: BuildingConnector) => {
    try {
      const res = await connectorsApi.update(conn.id, { isEnabled: !conn.isEnabled });
      setConnectors((prev) => prev.map((c) => (c.id === conn.id ? res : c)));
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await connectorsApi.remove(id);
      setConnectors((prev) => prev.filter((c) => c.id !== id));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Building Connectors</h2>
          <p className="text-gray-500 text-sm mt-1">
            Register external building service APIs. ComfortOS polls them automatically for sensor data.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Connector
        </button>
      </div>

      {/* Building selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Building</label>
        <select
          className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs"
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : connectors.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Database className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No connectors registered</p>
          <p className="text-gray-400 text-sm">
            Add a connector to start pulling sensor data from your building service.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {connectors.map((conn) => (
            <div key={conn.id} className="bg-white rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${conn.isEnabled ? 'bg-green-400' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{conn.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500 uppercase">
                      {conn.authType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="font-mono truncate max-w-xs">{conn.baseUrl}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Every {conn.pollingIntervalMinutes} min
                    </span>
                    {conn.lastPolledAt && (
                      <span>Last: {new Date(conn.lastPolledAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <StatusBadge status={conn.lastStatus} failures={conn.consecutiveFailures} />

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{conn.totalReadingsIngested.toLocaleString()} readings</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTest(conn.id)}
                    disabled={actionLoading[conn.id]}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Test connection"
                  >
                    {actionLoading[conn.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handlePollNow(conn.id)}
                    disabled={actionLoading[`poll-${conn.id}`]}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Poll now"
                  >
                    {actionLoading[`poll-${conn.id}`] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggle(conn)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    title={conn.isEnabled ? 'Disable' : 'Enable'}
                  >
                    {conn.isEnabled ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === conn.id ? null : conn.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {expandedId === conn.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(conn.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Test result */}
              {testResults[conn.id] && (
                <div className={`px-6 py-3 border-t text-xs ${testResults[conn.id].success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {testResults[conn.id].success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {testResults[conn.id].success
                        ? `Connection successful — ${testResults[conn.id].readingsFound} readings found`
                        : `Connection failed`}
                    </span>
                    {testResults[conn.id].statusCode && (
                      <span className="text-gray-500">HTTP {testResults[conn.id].statusCode}</span>
                    )}
                  </div>
                  {testResults[conn.id].error && (
                    <p className="text-red-600 font-mono">{testResults[conn.id].error}</p>
                  )}
                  {testResults[conn.id].sampleData && testResults[conn.id].sampleData!.length > 0 && (
                    <pre className="mt-2 bg-white rounded p-2 overflow-x-auto text-[10px] text-gray-700">
                      {JSON.stringify(testResults[conn.id].sampleData, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Expanded details */}
              {expandedId === conn.id && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Connector ID</span>
                      <p className="font-mono text-gray-700">{conn.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">HTTP Method</span>
                      <p className="font-mono text-gray-700">{conn.httpMethod}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Auth Type</span>
                      <p className="text-gray-700">{AUTH_TYPE_LABELS[conn.authType]?.label ?? conn.authType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Polls</span>
                      <p className="text-gray-700">{conn.totalPolls}</p>
                    </div>
                    {conn.description && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Description</span>
                        <p className="text-gray-700">{conn.description}</p>
                      </div>
                    )}
                    {conn.lastError && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Last Error</span>
                        <p className="text-red-600 font-mono">{conn.lastError}</p>
                      </div>
                    )}
                    {conn.responseMapping && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Response Mapping</span>
                        <pre className="mt-1 bg-white rounded p-2 overflow-x-auto text-[10px] text-gray-700">
                          {JSON.stringify(conn.responseMapping, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateConnectorModal
          buildingId={selectedBuilding}
          onClose={() => setShowCreate(false)}
          onCreated={(c) => {
            setConnectors((prev) => [c, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

/* ── Create Connector Modal ──────────────────────────────── */

function CreateConnectorModal({
  buildingId,
  onClose,
  onCreated,
}: {
  buildingId: string;
  onClose: () => void;
  onCreated: (c: BuildingConnector) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [authType, setAuthType] = useState<AuthType>('bearer_token');
  const [authConfig, setAuthConfig] = useState<Record<string, string>>({});
  const [interval, setInterval] = useState(15);
  const [useMappingToggle, setUseMappingToggle] = useState(false);
  const [mappingJson, setMappingJson] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !baseUrl) {
      setError('Name and URL are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let responseMapping = undefined;
      if (useMappingToggle && mappingJson.trim()) {
        responseMapping = JSON.parse(mappingJson);
      }
      const data: ConnectorCreate = {
        buildingId,
        name,
        description: description || undefined,
        baseUrl,
        httpMethod,
        authType,
        authConfig,
        pollingIntervalMinutes: interval,
        responseMapping,
      };
      const res = await connectorsApi.create(data);
      onCreated(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create connector';
      setError(msg);
    }
    setSaving(false);
  };

  const authFields = AUTH_CONFIG_FIELDS[authType] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b">
          <h3 className="text-lg font-bold text-gray-900">Register Building Connector</h3>
          <p className="text-sm text-gray-500 mt-1">
            Connect to your building service API. ComfortOS will poll it automatically.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name + URL */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Connector Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Siemens BMS Floor Sensors"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description (optional)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Brief description of what data this connector provides"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Endpoint */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Method</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Endpoint URL</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="https://your-bms-api.example.com/api/v1/readings"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Polling interval */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Polling Interval (minutes)</label>
            <input
              type="number"
              min={1}
              max={1440}
              className="w-32 border rounded-lg px-3 py-2 text-sm"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 15)}
            />
          </div>

          {/* Auth type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Authentication Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(AUTH_TYPE_LABELS) as AuthType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setAuthType(type);
                    setAuthConfig({});
                  }}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    authType === type
                      ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">{AUTH_TYPE_LABELS[type].label}</div>
                  <div className="text-xs text-gray-500">{AUTH_TYPE_LABELS[type].description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Auth config fields */}
          {authFields.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {AUTH_TYPE_LABELS[authType].label} Configuration
              </div>
              {authFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-mono"
                      placeholder={field.label}
                      value={authConfig[field.key] || ''}
                      onChange={(e) => setAuthConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder={field.label}
                      value={authConfig[field.key] || ''}
                      onChange={(e) => setAuthConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Response mapping toggle */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={useMappingToggle}
                onChange={(e) => setUseMappingToggle(e.target.checked)}
                className="rounded"
              />
              Custom Response Mapping
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Only needed if the building service doesn&apos;t use the ComfortOS standard response format.
            </p>
            {useMappingToggle && (
              <textarea
                rows={6}
                className="w-full border rounded-lg px-3 py-2 text-xs font-mono mt-2"
                placeholder={`{
  "readingsPath": "data.sensors",
  "fields": {
    "metricType": "sensor_type",
    "value": "reading",
    "unit": "unit",
    "floor": "location.floor",
    "recordedAt": "timestamp"
  }
}`}
                value={mappingJson}
                onChange={(e) => setMappingJson(e.target.value)}
              />
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Register Connector
          </button>
        </div>
      </div>
    </div>
  );
}
