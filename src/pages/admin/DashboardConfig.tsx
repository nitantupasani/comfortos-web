import { useEffect, useState } from 'react';
import { LayoutDashboard, Loader2, Eye, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import SduiRenderer from '../../components/sdui/SduiRenderer';
import DashboardVisualEditor from '../../components/fm/DashboardVisualEditor';
import type { Building, SduiNode } from '../../types';

export default function AdminDashboardConfig() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [dashboard, setDashboard] = useState<SduiNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    buildingsApi.list().then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelected(b[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setConfigLoading(true);
    setSaveStatus('idle');
    setSaveError(null);
    buildingsApi.dashboard(selected).then((d) => {
      setDashboard(d);
    }).finally(() => setConfigLoading(false));
  }, [selected]);

  const handleDashboardChange = (updated: SduiNode) => {
    setDashboard(updated);
    setSaveStatus('idle');
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveError(null);
    try {
      await buildingsApi.updateConfig(selected, { dashboardLayout: dashboard });
      setSaveStatus('success');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save config');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary-500" />
          Dashboard Layout
        </h2>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
        >
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {configLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
      ) : (
        <div className="space-y-3">
          {/* Save bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Dashboard
            </button>
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" /> Saved</span>
            )}
            {(saveStatus === 'error' || saveError) && (
              <span className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" /> {saveError ?? 'Error'}</span>
            )}
          </div>

          {/* Visual editor + live preview */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
              <DashboardVisualEditor config={dashboard} onChange={handleDashboardChange} />
            </div>
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border overflow-hidden sticky top-6">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Live Preview</span>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                  {dashboard ? <SduiRenderer config={dashboard} /> : <p className="text-gray-400 text-sm">No dashboard config — add widgets to get started</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
