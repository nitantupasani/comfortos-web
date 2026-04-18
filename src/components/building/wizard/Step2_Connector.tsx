import { Wifi, Database, FileSpreadsheet, PenTool } from 'lucide-react';
import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

const CONNECTION_TYPES = [
  { id: 'bms_api', label: 'BMS API', desc: 'Connect to a Building Management System', icon: Database },
  { id: 'iot_platform', label: 'IoT Platform', desc: 'Integrate with IoT sensor platform', icon: Wifi },
  { id: 'csv_upload', label: 'CSV Upload', desc: 'Upload sensor data via CSV files', icon: FileSpreadsheet },
  { id: 'manual', label: 'Manual Entry', desc: 'Enter readings manually', icon: PenTool },
] as const;

const AUTH_TYPES = [
  { id: 'api_key', label: 'API Key' },
  { id: 'bearer_token', label: 'Bearer Token' },
  { id: 'basic_auth', label: 'Basic Auth' },
  { id: 'oauth2_client_credentials', label: 'OAuth2' },
];

export default function Step2_Connector() {
  const { connector, setConnector } = useBuildingWizardStore();

  const needsApiConfig = connector.connectionType === 'bms_api' || connector.connectionType === 'iot_platform';

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Data Connector</h3>
        <p className="text-sm text-gray-500 mt-1">
          How does this building receive sensor data?
        </p>
      </div>

      {/* Connection type cards */}
      <div className="grid grid-cols-2 gap-3">
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
            <Icon className={`h-6 w-6 mb-2 ${connector.connectionType === id ? 'text-primary-600' : 'text-gray-400'}`} />
            <div className="text-sm font-semibold text-gray-800">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>

      {/* API Config */}
      {needsApiConfig && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint Name</label>
            <input
              value={connector.endpointName}
              onChange={(e) => setConnector({ endpointName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="e.g. BMS North Wing Sensors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint URL</label>
            <input
              value={connector.endpointUrl}
              onChange={(e) => setConnector({ endpointUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="https://bms.example.com/api/readings"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">HTTP Method</label>
              <select
                value={connector.httpMethod}
                onChange={(e) => setConnector({ httpMethod: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint Mode</label>
              <select
                value={connector.endpointMode}
                onChange={(e) => setConnector({ endpointMode: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="multi_zone">Multi Zone</option>
                <option value="single_zone">Single Zone</option>
                <option value="building_wide">Building Wide</option>
                <option value="sensor_centric">Sensor Centric</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Authentication</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={connector.authType}
                onChange={(e) => setConnector({ authType: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                {AUTH_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              {connector.authType === 'api_key' && (
                <input
                  value={connector.authHeader}
                  onChange={(e) => setConnector({ authHeader: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Header name"
                />
              )}
            </div>
            <input
              value={connector.authKey}
              onChange={(e) => setConnector({ authKey: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-2"
              placeholder={connector.authType === 'bearer_token' ? 'Token' : 'API key value'}
              type="password"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Polling Interval (minutes)</label>
            <input
              type="number"
              min={1}
              value={connector.pollingInterval}
              onChange={(e) => setConnector({ pollingInterval: parseInt(e.target.value) || 15 })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {connector.connectionType === 'csv_upload' && (
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          CSV upload will be available after building creation. You can upload sensor data via the Telemetry Endpoints tab.
        </div>
      )}

      {connector.connectionType === 'manual' && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          You can enter readings manually through the dashboard after setup is complete.
        </div>
      )}
    </div>
  );
}
