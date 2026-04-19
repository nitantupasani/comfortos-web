import { useEffect, useState } from 'react';
import { Loader2, Eye, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import VoteFormRenderer from '../sdui/VoteFormRenderer';
import VoteFormVisualEditor from '../fm/VoteFormVisualEditor';
import type { VoteFormSchema } from '../../types';
import { DEFAULT_VOTE_FORM } from '../../utils/defaultVoteForm';

interface Props {
  buildingId: string;
}

export default function VoteFormTab({ buildingId }: Props) {
  const [voteForm, setVoteForm] = useState<VoteFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setSaveStatus('idle');
    setSaveError(null);
    buildingsApi
      .voteForm(buildingId)
      .then((v) => setVoteForm(v ?? DEFAULT_VOTE_FORM))
      .finally(() => setLoading(false));
  }, [buildingId]);

  const handleChange = (updated: VoteFormSchema) => {
    setVoteForm(updated);
    setSaveStatus('idle');
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveError(null);
    try {
      await buildingsApi.updateConfig(buildingId, { voteFormSchema: voteForm });
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
          Save vote form
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          {voteForm && <VoteFormVisualEditor schema={voteForm} onChange={handleChange} />}
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Live preview</span>
            </div>
            <div className="p-4 max-h-[75vh] overflow-y-auto">
              {voteForm ? (
                <VoteFormRenderer schema={voteForm} onSubmit={() => {}} isSubmitting={false} />
              ) : (
                <p className="text-gray-400 text-sm">
                  No vote form config — default will be used
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
