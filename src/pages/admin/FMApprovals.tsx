import { useEffect, useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  Building2,
} from 'lucide-react';
import { fmRequestsApi, type FMRequestResponse } from '../../api/fmRequests';

export default function FMApprovals() {
  const [requests, setRequests] = useState<FMRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fmRequestsApi.list()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const updated = await fmRequestsApi.review(id, {
        action,
        reviewNote: reviewNotes[id] || undefined,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      // Silently fail — the UI will show the unchanged status
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">FM Role Requests</h2>
      </div>

      {/* Pending requests */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Pending Requests</h3>
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
            {pendingRequests.length} pending
          </span>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            No pending FM role requests
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((r) => (
              <div key={r.id} className="px-5 py-5 space-y-3">
                {/* User info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{r.userName}</div>
                      <div className="text-xs text-gray-500">{r.userEmail}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {r.buildingName}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Message */}
                {r.message && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 italic">
                    "{r.message}"
                  </div>
                )}

                {/* Role requested */}
                <div className="text-xs text-gray-500">
                  Role requested: <span className="font-medium text-gray-700">{r.roleRequested.replace(/_/g, ' ')}</span>
                </div>

                {/* Review note input + action buttons */}
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Review note (optional)"
                      value={reviewNotes[r.id] || ''}
                      onChange={(e) => setReviewNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleReview(r.id, 'approve')}
                    disabled={processingId === r.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {processingId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(r.id, 'reject')}
                    disabled={processingId === r.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {processingId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed requests history */}
      {reviewedRequests.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-800">Review History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Building</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-left">Note</th>
                  <th className="px-5 py-3 text-left">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviewedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium">{r.userName}</div>
                      <div className="text-xs text-gray-400">{r.userEmail}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{r.buildingName}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.roleRequested.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          r.status === 'approved'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {r.status === 'approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.reviewNote || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
