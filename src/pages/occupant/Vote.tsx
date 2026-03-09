import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useBuildingStore } from '../../store/buildingStore';
import { useVoteStore } from '../../store/voteStore';
import { useAuthStore } from '../../store/authStore';
import VoteFormRenderer from '../../components/sdui/VoteFormRenderer';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import type { VoteFormSchema } from '../../types';

const DEFAULT_FORM: VoteFormSchema = {
  version: 2,
  title: 'How do you feel right now?',
  fields: [
    { id: 'thermal_comfort', type: 'thermal_scale', question: 'How do you feel thermally?', required: true },
    { id: 'air_quality', type: 'emoji_scale', question: 'How is the air quality?', required: true, options: [
      { value: 1, emoji: '🤢', label: 'Stuffy' },
      { value: 2, emoji: '😐', label: 'Okay' },
      { value: 3, emoji: '😊', label: 'Fresh' },
    ] },
    { id: 'noise_level', type: 'rating_stars', question: 'Rate the noise level', maxStars: 5, required: false },
    { id: 'feedback', type: 'text_input', question: 'Any additional comments?', required: false },
  ],
};

export default function VotePage() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const floor = usePresenceStore((s) => s.floor);
  const room = usePresenceStore((s) => s.room);
  const { voteFormSchema, fetchVoteForm } = useBuildingStore();
  const { submit, isSubmitting, lastResult, clearResult } = useVoteStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeBuilding) fetchVoteForm(activeBuilding.id);
    return () => clearResult();
  }, [activeBuilding, fetchVoteForm, clearResult]);

  if (!activeBuilding || !user) {
    navigate('/presence');
    return null;
  }

  const schema = voteFormSchema ?? DEFAULT_FORM;

  const handleSubmit = async (payload: Record<string, unknown>) => {
    const voteUuid = crypto.randomUUID();
    const ok = await submit({
      voteUuid,
      buildingId: activeBuilding.id,
      userId: user.id,
      payload: { ...payload, floor, room },
      schemaVersion: schema.version,
      createdAt: new Date().toISOString(),
    });
    if (ok) {
      setTimeout(() => navigate('/comfort'), 2000);
    }
  };

  if (lastResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Thank you!</h2>
        <p className="text-sm text-gray-500">
          {lastResult === 'already_accepted' ? 'Your vote was already recorded.' : 'Your comfort vote has been submitted.'}
        </p>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <p className="text-xs text-gray-400">Redirecting to comfort results…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <VoteFormRenderer
        schema={schema}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
