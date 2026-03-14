import { useEffect, useState } from 'react';
import { Settings, Loader2, Building2, Eye, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import SduiRenderer from '../../components/sdui/SduiRenderer';
import VoteFormRenderer from '../../components/sdui/VoteFormRenderer';
import VoteFormVisualEditor from '../../components/fm/VoteFormVisualEditor';
import type { Building, SduiNode, VoteFormSchema } from '../../types';
import { DEFAULT_VOTE_FORM } from '../../utils/defaultVoteForm';

export default function ConfigEditor() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [dashboard, setDashboard] = useState<SduiNode | null>(null);
  const [voteForm, setVoteForm] = useState<VoteFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vote'>('dashboard');

  const [dashboardText, setDashboardText] = useState('');
  const [voteFormText, setVoteFormText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
    Promise.all([
      buildingsApi.dashboard(selected),
      buildingsApi.voteForm(selected),
    ]).then(([d, v]) => {
      setDashboard(d);
      const form = v ?? DEFAULT_VOTE_FORM;
      setVoteForm(form);
      setDashboardText(JSON.stringify(d, null, 2) ?? 'null');
      setVoteFormText(JSON.stringify(form, null, 2));
      setJsonError(null);
    }).finally(() => setConfigLoading(false));
  }, [selected]);

  const activeText = activeTab === 'dashboard' ? dashboardText : voteFormText;
  const setActiveText = activeTab === 'dashboard' ? setDashboardText : setVoteFormText;

  const handleTextChange = (text: string) => {
    setActiveText(text);
    setJsonError(null);
    setSaveStatus('idle');
    try { JSON.parse(text); } catch { setJsonError('Invalid JSON'); }
  };

  const handleVoteFormVisualChange = (updated: VoteFormSchema) => {
    setVoteForm(updated);
    setVoteFormText(JSON.stringify(updated, null, 2));
    setSaveStatus('idle');
    setJsonError(null);
  };

  const handleSave = async () => {
    setJsonError(null);
    setSaving(true);
    setSaveStatus('idle');
    try {
      if (activeTab === 'dashboard') {
        let parsed: unknown;
        try { parsed = JSON.parse(activeText); } catch { setJsonError('Invalid JSON — fix before saving'); setSaving(false); return; }
        await buildingsApi.updateConfig(selected, { dashboardLayout: parsed });
        setDashboard(parsed as SduiNode);
      } else {
        await buildingsApi.updateConfig(selected, { voteFormSchema: voteForm });
      }
      setSaveStatus('success');
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Failed to save config');
      setSaveStatus('error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary-500" />
          Config Editor
        </h2>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none">
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['dashboard', 'vote'] as const).map((tab) => (
          <button key={tab}
            onClick={() => { setActiveTab(tab); setSaveStatus('idle'); setJsonError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'dashboard' ? 'Dashboard Layout' : 'Vote Form (Questions)'}
          </button>
        ))}
      </div>

      {configLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
      ) : (
        <div className="space-y-3">
          {/* Save bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleSave} disabled={saving || (activeTab === 'dashboard' && !!jsonError)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Config
            </button>
            {saveStatus === 'success' && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" /> Saved</span>}
            {(saveStatus === 'error' || jsonError) && <span className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{jsonError ?? 'Error'}</span>}
          </div>

          {activeTab === 'vote' ? (
            /* ── Visual vote-form editor + live preview ─── */
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                {voteForm && <VoteFormVisualEditor schema={voteForm} onChange={handleVoteFormVisualChange} />}
              </div>
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl border overflow-hidden sticky top-6">
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Live Preview</span>
                  </div>
                  <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {voteForm ? <VoteFormRenderer schema={voteForm} onSubmit={() => {}} isSubmitting={false} />
                      : <p className="text-gray-400 text-sm">No vote form config</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Dashboard JSON editor + preview ───────── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">JSON Configuration</span>
                  {jsonError && <span className="ml-auto text-xs text-red-500">{jsonError}</span>}
                </div>
                <textarea value={activeText} onChange={(e) => handleTextChange(e.target.value)} spellCheck={false}
                  className={`flex-1 p-4 text-xs font-mono text-gray-700 bg-gray-50 resize-none outline-none min-h-[600px] ${jsonError ? 'border-l-4 border-red-400' : ''}`} />
              </div>
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Live Preview</span>
                </div>
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  {dashboard ? <SduiRenderer config={dashboard} /> : <p className="text-gray-400 text-sm">No dashboard config — default will be used</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

