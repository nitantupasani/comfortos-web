import { useEffect, useState } from 'react';
import { Settings, Loader2, Building2, Eye } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import SduiRenderer from '../../components/sdui/SduiRenderer';
import type { Building, SduiNode, VoteFormSchema } from '../../types';
import VoteFormRenderer from '../../components/sdui/VoteFormRenderer';

export default function ConfigEditor() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [dashboard, setDashboard] = useState<SduiNode | null>(null);
  const [voteForm, setVoteForm] = useState<VoteFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vote'>('dashboard');

  useEffect(() => {
    buildingsApi.list().then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelected(b[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setConfigLoading(true);
    Promise.all([
      buildingsApi.dashboard(selected),
      buildingsApi.voteForm(selected),
    ]).then(([d, v]) => {
      setDashboard(d);
      setVoteForm(v);
    }).finally(() => setConfigLoading(false));
  }, [selected]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary-500" />
          Config Editor
        </h2>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
        >
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['dashboard', 'vote'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'dashboard' ? 'Dashboard Layout' : 'Vote Form'}
          </button>
        ))}
      </div>

      {configLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON view */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">JSON Configuration</span>
            </div>
            <pre className="p-4 text-xs text-gray-700 overflow-auto max-h-[600px] bg-gray-50">
              {JSON.stringify(activeTab === 'dashboard' ? dashboard : voteForm, null, 2) ?? 'null (using default)'}
            </pre>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Live Preview</span>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {activeTab === 'dashboard' ? (
                dashboard ? <SduiRenderer config={dashboard} /> : <p className="text-gray-400 text-sm">No dashboard config — default will be used</p>
              ) : (
                voteForm ? (
                  <VoteFormRenderer schema={voteForm} onSubmit={() => {}} isSubmitting={false} />
                ) : (
                  <p className="text-gray-400 text-sm">No vote form config — default will be used</p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
