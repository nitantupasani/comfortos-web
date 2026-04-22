import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Plus,
  ThumbsUp,
  ArrowUpDown,
  MessageSquare,
  Thermometer,
  Snowflake,
  Wind,
  Sparkles,
  HelpCircle,
  Send,
  X,
  Building2,
  Clock,
} from 'lucide-react';
import {
  complaintsApi,
  type Complaint,
  type ComplaintType,
} from '../../api/complaints';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';

const TYPE_META: Record<ComplaintType, { label: string; icon: typeof Thermometer; color: string }> = {
  hot: { label: 'Too hot', icon: Thermometer, color: 'text-red-600 bg-red-50' },
  cold: { label: 'Too cold', icon: Snowflake, color: 'text-blue-600 bg-blue-50' },
  air_quality: { label: 'Air quality', icon: Wind, color: 'text-emerald-600 bg-emerald-50' },
  cleanliness: { label: 'Cleanliness', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-gray-600 bg-gray-100' },
};

type SortMode = 'priority' | 'newest';

export default function Complaints() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const buildings = usePresenceStore((s) => s.buildings);
  const fetchBuildings = usePresenceStore((s) => s.fetchBuildings);
  const user = useAuthStore((s) => s.user);
  const viewAsRole = useAuthStore((s) => s.viewAsRole);

  const effectiveRole = viewAsRole ?? user?.role;
  const isFM =
    effectiveRole === 'tenant_facility_manager' ||
    effectiveRole === 'building_facility_manager' ||
    effectiveRole === 'admin';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortMode>('priority');
  const [showNew, setShowNew] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (buildings.length === 0) void fetchBuildings();
  }, [buildings.length, fetchBuildings]);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await complaintsApi.list(activeBuilding?.id);
      setComplaints(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBuilding?.id]);

  const sorted = useMemo(() => {
    const copy = [...complaints];
    if (sort === 'newest') {
      copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      copy.sort((a, b) => {
        if (b.cosignCount !== a.cosignCount) return b.cosignCount - a.cosignCount;
        return b.createdAt.localeCompare(a.createdAt);
      });
    }
    return copy;
  }, [complaints, sort]);

  const handleCosignToggle = async (c: Complaint) => {
    // Optimistic update
    const updated = complaints.map((x) => {
      if (x.id !== c.id) return x;
      if (c.viewerHasCosigned) {
        return {
          ...x,
          viewerHasCosigned: false,
          cosignCount: Math.max(0, x.cosignCount - 1),
          cosignerIds: x.cosignerIds.filter((id) => id !== user?.id),
        };
      }
      return {
        ...x,
        viewerHasCosigned: true,
        cosignCount: x.cosignCount + 1,
        cosignerIds: user?.id ? [...x.cosignerIds, user.id] : x.cosignerIds,
      };
    });
    setComplaints(updated);
    try {
      const fresh = c.viewerHasCosigned
        ? await complaintsApi.uncosign(c.id)
        : await complaintsApi.cosign(c.id);
      setComplaints((prev) => prev.map((x) => (x.id === fresh.id ? fresh : x)));
    } catch (e) {
      // Roll back on failure
      setComplaints(complaints);
      setError(e instanceof Error ? e.message : 'Failed to update co-sign');
    }
  };

  const handleAdded = (c: Complaint) => {
    setComplaints((prev) => [c, ...prev]);
    setShowNew(false);
  };

  const handleCommented = (c: Complaint) => {
    setComplaints((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Complaints</h1>
          <p className="text-sm text-gray-500">
            {activeBuilding ? `For ${activeBuilding.name}` : 'All buildings you have access to'}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 bg-teal-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Raise
        </button>
      </div>

      {/* Sort control */}
      <div className="flex items-center gap-2 text-xs">
        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
        <button
          onClick={() => setSort('priority')}
          className={`px-2.5 py-1 rounded-full font-medium ${
            sort === 'priority' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Priority (co-signs)
        </button>
        <button
          onClick={() => setSort('newest')}
          className={`px-2.5 py-1 rounded-full font-medium ${
            sort === 'newest' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Newest
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No complaints yet.</p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-3 text-sm text-teal-600 font-medium hover:underline"
          >
            Raise the first one
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              isFM={isFM}
              viewerIsAuthor={c.createdBy === user?.id}
              onToggleCosign={() => handleCosignToggle(c)}
              commentsOpen={activeCommentId === c.id}
              onToggleComments={() =>
                setActiveCommentId((prev) => (prev === c.id ? null : c.id))
              }
              onCommented={handleCommented}
            />
          ))}
        </div>
      )}

      {showNew && (
        <NewComplaintModal onClose={() => setShowNew(false)} onCreated={handleAdded} />
      )}
    </div>
  );
}

// ── Complaint card ─────────────────────────────────────────────────────────

interface CardProps {
  complaint: Complaint;
  isFM: boolean;
  viewerIsAuthor: boolean;
  commentsOpen: boolean;
  onToggleCosign: () => void;
  onToggleComments: () => void;
  onCommented: (c: Complaint) => void;
}

function ComplaintCard({
  complaint,
  isFM,
  viewerIsAuthor,
  commentsOpen,
  onToggleCosign,
  onToggleComments,
  onCommented,
}: CardProps) {
  const { label, icon: Icon, color } = TYPE_META[complaint.complaintType];
  const when = new Date(complaint.createdAt);
  const [commentBody, setCommentBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');

  const handlePostComment = async () => {
    if (!commentBody.trim()) return;
    setPosting(true);
    setErr('');
    try {
      const fresh = await complaintsApi.comment(complaint.id, commentBody.trim());
      setCommentBody('');
      onCommented(fresh);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {label}
            </span>
            <span className="text-[11px] text-gray-400">
              <Clock className="inline h-3 w-3 -mt-0.5 mr-0.5" />
              {when.toLocaleDateString()} {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {viewerIsAuthor && (
              <span className="text-[10px] text-teal-600 bg-teal-50 rounded-full px-2 py-0.5 font-medium">
                Yours
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mt-1 leading-snug">{complaint.title}</h3>
          {complaint.description && (
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{complaint.description}</p>
          )}
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
            <Building2 className="h-3 w-3" />
            {complaint.buildingName}
            <span>·</span>
            <span>By {complaint.authorName || 'an occupant'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={onToggleCosign}
          className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
            complaint.viewerHasCosigned
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {complaint.viewerHasCosigned ? 'Co-signed' : 'Co-sign'}
          <span className="ml-1 text-[11px] font-semibold">({complaint.cosignCount})</span>
        </button>

        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 rounded-lg px-3 py-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {complaint.comments.length} FM {complaint.comments.length === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {commentsOpen && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {complaint.comments.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No FM comments yet.</p>
          ) : (
            complaint.comments.map((cm) => (
              <div key={cm.id} className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {cm.authorName}{' '}
                    <span className="text-[10px] text-teal-600 font-medium bg-teal-50 rounded-full px-1.5 py-0.5 ml-1">
                      FM
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(cm.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{cm.body}</p>
              </div>
            ))
          )}

          {isFM && (
            <div className="flex items-start gap-2 pt-1">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Respond as FM..."
                rows={2}
                maxLength={2000}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-300 outline-none resize-none"
              />
              <button
                onClick={handlePostComment}
                disabled={posting || !commentBody.trim()}
                className="bg-teal-600 text-white rounded-lg px-3 py-2 hover:bg-teal-700 disabled:opacity-50"
                title="Post comment"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
      )}
    </div>
  );
}

// ── New complaint modal ────────────────────────────────────────────────────

interface NewProps {
  onClose: () => void;
  onCreated: (c: Complaint) => void;
}

function NewComplaintModal({ onClose, onCreated }: NewProps) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const buildings = usePresenceStore((s) => s.buildings);
  const [buildingId, setBuildingId] = useState(activeBuilding?.id ?? '');
  const [type, setType] = useState<ComplaintType>('hot');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId || !title.trim()) return;
    setSubmitting(true);
    setErr('');
    try {
      const c = await complaintsApi.create({
        buildingId,
        complaintType: type,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onCreated(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Raise a complaint</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Building</label>
            <select
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
            >
              <option value="">Select a building…</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TYPE_META) as ComplaintType[]).map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-left ${
                      type === t
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              placeholder="Short summary"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Give facility managers useful detail: where, when, how often…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-300 outline-none resize-none"
            />
          </div>

          {err && <p className="text-xs text-red-500">{err}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !buildingId || !title.trim()}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
