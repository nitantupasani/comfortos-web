import { useCallback, useEffect, useState } from 'react';
import { Loader2, Eye, Save, CheckCircle, AlertCircle, Key, Copy, RefreshCw } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import SduiRenderer from '../sdui/SduiRenderer';
import DashboardVisualEditor from '../fm/DashboardVisualEditor';
import type { SduiNode } from '../../types';

function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

interface Props {
  buildingId: string;
}

export default function DashboardLayoutTab({ buildingId }: Props) {
  const [dashboard, setDashboard] = useState<SduiNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const [telemetryApiKey, setTelemetryApiKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSaveStatus('idle');
    setSaveError(null);
    buildingsApi
      .dashboard(buildingId)
      .then((d) => {
        setDashboard(d);
        const layout = d as Record<string, unknown> | null;
        setTelemetryApiKey((layout?.telemetryApiKey as string) ?? '');
      })
      .finally(() => setLoading(false));
  }, [buildingId]);

  const handleChange = (updated: SduiNode) => {
    setDashboard(updated);
    setSaveStatus('idle');
    setSaveError(null);
  };

  const copyApiKey = useCallback(() => {
    navigator.clipboard.writeText(telemetryApiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  }, [telemetryApiKey]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveError(null);
    try {
      const layout = (dashboard ?? {}) as Record<string, unknown>;
      if (telemetryApiKey) {
        layout.telemetryApiKey = telemetryApiKey;
      } else {
        delete layout.telemetryApiKey;
      }
      await buildingsApi.updateConfig(buildingId, { dashboardLayout: layout });
      setDashboard(layout as unknown as SduiNode);
      setSaveStatus('success');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save config');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save dashboard
        </button>
        {saveStatus === 'success' && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" /> Saved
          </span>
        )}
        {(saveStatus === 'error' || saveError) && (
          <span className="flex items-center gap-1 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" /> {saveError ?? 'Error'}
          </span>
        )}
      </div>

      {/* Telemetry API Key */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-gray-700">Telemetry API key</span>
          <span className="text-xs text-gray-400">
            — used by building services to push sensor data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={telemetryApiKey}
            onChange={(e) => {
              setTelemetryApiKey(e.target.value);
              setSaveStatus('idle');
            }}
            placeholder="No key set — generate or enter one"
            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono text-gray-700 focus:ring-2 focus:ring-primary-300 outline-none"
          />
          <button
            onClick={() => {
              setTelemetryApiKey(generateApiKey());
              setSaveStatus('idle');
            }}
            title="Generate a new random key"
            className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Generate
          </button>
          {telemetryApiKey && (
            <button
              onClick={copyApiKey}
              title="Copy key to clipboard"
              className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Copy className="h-4 w-4" /> {keyCopied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Visual editor + live preview */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <DashboardVisualEditor config={dashboard} onChange={handleChange} />
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Live preview</span>
            </div>
            <div className="p-4 max-h-[75vh] overflow-y-auto">
              {dashboard ? (
                <SduiRenderer config={dashboard} />
              ) : (
                <p className="text-gray-400 text-sm">
                  No dashboard config — add widgets to get started
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
