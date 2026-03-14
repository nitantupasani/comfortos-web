import { useEffect, useState } from 'react';
import { FileQuestion, Loader2, Eye, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import VoteFormRenderer from '../../components/sdui/VoteFormRenderer';
import VoteFormVisualEditor from '../../components/fm/VoteFormVisualEditor';
import { useAuthStore } from '../../store/authStore';
import type { Building, VoteFormSchema } from '../../types';
import { DEFAULT_VOTE_FORM } from '../../utils/defaultVoteForm';

export default function FMVoteFormConfig() {
  const user = useAuthStore((s) => s.user);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [voteForm, setVoteForm] = useState<VoteFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    buildingsApi.list(user?.tenantId ?? undefined).then((b) => {
      setBuildings(b);
      if (b.length > 0) setSelected(b[0].id);
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    setConfigLoading(true);
    setSaveStatus('idle');
    setSaveError(null);
    buildingsApi.voteForm(selected).then((v) => {
      setVoteForm(v ?? DEFAULT_VOTE_FORM);
    }).finally(() => setConfigLoading(false));
  }, [selected]);

  const handleVoteFormChange = (updated: VoteFormSchema) => {
    setVoteForm(updated);
    setSaveStatus('idle');
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveError(null);
    try {
      await buildingsApi.updateConfig(selected, { voteFormSchema: voteForm });
      setSaveStatus('success');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save config');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileQuestion className="h-6 w-6 text-teal-500" />
          Vote Form Config
        </h2>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
        >
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {configLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
      ) : (
        <div className="space-y-3">
          {/* Save bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Vote Form
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
              {voteForm && <VoteFormVisualEditor schema={voteForm} onChange={handleVoteFormChange} />}
            </div>
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border overflow-hidden sticky top-6">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Live Preview</span>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                  {voteForm ? (
                    <VoteFormRenderer schema={voteForm} onSubmit={() => {}} isSubmitting={false} />
                  ) : (
                    <p className="text-gray-400 text-sm">No vote form config — default will be used</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
