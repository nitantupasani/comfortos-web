import { useState } from 'react';
import { Database, FileSpreadsheet, PenTool, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

const CONNECTION_TYPES = [
  {
    id: 'bms_api',
    label: 'API connection',
    desc: 'BMS, IoT platform, or custom sensor API',
    icon: Database,
  },
  {
    id: 'csv_upload',
    label: 'CSV upload',
    desc: 'Upload sensor readings as a file',
    icon: FileSpreadsheet,
  },
  {
    id: 'manual',
    label: 'Manual entry',
    desc: 'Record readings by hand',
    icon: PenTool,
  },
] as const;

const AUTH_TYPES = [
  { id: 'api_key', label: 'API key' },
  { id: 'bearer_token', label: 'Bearer token' },
  { id: 'basic_auth', label: 'Basic auth' },
  { id: 'oauth2_client_credentials', label: 'OAuth2' },
];

export default function Step2_Connector() {
  const { connector, setConnector } = useBuildingWizardStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const needsApi =
    connector.connectionType === 'bms_api' || connector.connectionType === 'iot_platform';

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Connect telemetry</h3>
        <p className="text-sm text-gray-500 mt-1">
          How will this building send sensor readings to ComfortOS? You can set this up later if needed.
        </p>
      </div>

      {/* Connection type cards — 3 options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CONNECTION_TYPES.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setConnector({ connectionType: id })}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              connector.connectionType === id
                ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon
              className={`h-5 w-5 mb-2 ${
                connector.connectionType === id ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <div className="text-sm font-semibold text-gray-800">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>

      {needsApi && (
        <div className="space-y-4 border-t border-gray-100 pt-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint URL</label>
            <input
              value={connector.endpointUrl}
              onChange={(e) => setConnector({ endpointUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="https://bms.example.com/api/readings"
            />
            <p className="text-xs text-gray-500 mt-1">
              Where ComfortOS should fetch sensor readings from.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Authentication</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={connector.authType}
                onChange={(e) => setConnector({ authType: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {AUTH_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                value={connector.authKey}
                onChange={(e) => setConnector({ authKey: e.target.value })}
                className="sm:col-span-2 border rounded-lg px-3 py-2 text-sm"
                placeholder={
                  connector.authType === 'bearer_token' ? 'Token' : 'API key value'
                }
                type="password"
              />
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            {showAdvanced ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint name</label>
                <input
                  value={connector.endpointName}
                  onChange={(e) => setConnector({ endpointName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. BMS North Wing"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">HTTP method</label>
                  <select
                    value={connector.httpMethod}
                    onChange={(e) => setConnector({ httpMethod: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Payload layout
                  </label>
                  <select
                    value={connector.endpointMode}
                    onChange={(e) => setConnector({ endpointMode: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="multi_zone">Multi-zone</option>
                    <option value="single_zone">Single zone</option>
                    <option value="building_wide">Building wide</option>
                    <option value="sensor_centric">Sensor-centric</option>
                  </select>
                </div>
              </div>
              {connector.authType === 'api_key' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    API key header name
                  </label>
                  <input
                    value={connector.authHeader}
                    onChange={(e) => setConnector({ authHeader: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="X-Api-Key"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Poll every (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={connector.pollingInterval}
                  onChange={(e) =>
                    setConnector({ pollingInterval: parseInt(e.target.value) || 15 })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {connector.connectionType === 'csv_upload' && (
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            You'll upload the first CSV after setup from the building's Telemetry tab.
          </span>
        </div>
      )}

      {connector.connectionType === 'manual' && (
        <div className="flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
          <span>
            You can log readings directly from the building dashboard after setup.
          </span>
        </div>
      )}
    </div>
  );
}
