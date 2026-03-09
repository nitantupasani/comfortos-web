import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useVoteStore } from '../../store/voteStore';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Vote } from '../../types';

function statusIcon(status: string) {
  switch (status) {
    case 'confirmed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'pending':
    case 'queued':
    case 'submitted':
      return <Clock className="h-4 w-4 text-amber-500" />;
    default: return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const { history, fetchHistory } = useVoteStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory(user.id).finally(() => setLoading(false));
    }
  }, [user, fetchHistory]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Vote History</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No votes yet. Cast your first comfort vote from the dashboard!
        </div>
      ) : (
        <div className="space-y-3">
          {[...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((vote) => (
            <VoteCard key={vote.voteUuid} vote={vote} />
          ))}
        </div>
      )}
    </div>
  );
}

function VoteCard({ vote }: { vote: Vote }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          {statusIcon(vote.status)}
          <div>
            <div className="text-sm font-medium text-gray-800">
              Comfort Vote
            </div>
            <div className="text-xs text-gray-400">{formatDate(vote.createdAt)}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          vote.status === 'confirmed' ? 'bg-green-50 text-green-600' :
          vote.status === 'failed' ? 'bg-red-50 text-red-600' :
          'bg-amber-50 text-amber-600'
        }`}>
          {vote.status}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div><span className="font-medium">Building:</span> {vote.buildingId}</div>
            <div><span className="font-medium">Schema v{vote.schemaVersion}</span></div>
            {Object.entries(vote.payload).map(([key, val]) => (
              <div key={key}>
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
