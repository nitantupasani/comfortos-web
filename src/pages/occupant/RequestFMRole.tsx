import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, Send, ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { fmRequestsApi, type FMRequestResponse } from '../../api/fmRequests';
import type { Building } from '../../types';

export default function RequestFMRole() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [myRequests, setMyRequests] = useState<FMRequestResponse[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([buildingsApi.list(), fmRequestsApi.list()])
      .then(([b, r]) => { setBuildings(b); setMyRequests(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasPendingRequest = myRequests.some((r) => r.status === 'pending');
  const selectedBuildingObj = buildings.find((b) => b.id === selectedBuilding);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding || hasPendingRequest) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const req = await fmRequestsApi.create({
        buildingId: selectedBuilding,
        message: message || undefined,
      });
      setMyRequests((prev) => [req, ...prev]);
      setSuccess('Request submitted! The admin will review it.');
      setSelectedBuilding('');
      setMessage('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600',
      approved: 'bg-green-50 text-green-600',
      rejected: 'bg-red-50 text-red-600',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${colors[status] || ''}`}>
        {statusIcon(status)} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Request FM Role</h2>
          <p className="text-sm text-gray-500">Ask the admin to grant you Facility Manager access for a building</p>
        </div>
      </div>

      {/* Submit new request */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary-500" />
          New Request
        </h3>

        {success && (
          <div className="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        {hasPendingRequest ? (
          <div className="bg-amber-50 text-amber-700 text-sm rounded-lg px-4 py-3">
            <Clock className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            You already have a pending FM request. Only one request is allowed at a time. Please wait for the admin to review it before submitting another.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
                required
              >
                <option value="">Select a building...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">You can only apply for one building at a time.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-none"
                rows={3}
                placeholder="Why do you need FM access?"
                maxLength={500}
              />
            </div>

            {selectedBuildingObj && (
              <div className="bg-blue-50 text-blue-700 text-sm rounded-lg px-4 py-3">
                <Building2 className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                You are requesting FM access for <strong>{selectedBuildingObj.name}</strong> in {selectedBuildingObj.city}.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedBuilding}
              className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Request
            </button>
          </form>
        )}
      </div>

      {/* My requests */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">My Requests</h3>
        </div>
        {myRequests.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">No requests yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myRequests.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{r.buildingName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Requested: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  {r.message && <div className="text-xs text-gray-400 mt-1 italic">"{r.message}"</div>}
                  {r.reviewNote && (
                    <div className="text-xs text-gray-500 mt-1">Admin note: {r.reviewNote}</div>
                  )}
                </div>
                <div className="flex-shrink-0">{statusBadge(r.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
