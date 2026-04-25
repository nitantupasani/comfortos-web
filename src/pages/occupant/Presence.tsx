import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { Building2, MapPin, Lock, Loader2, Plus, Trash2, X } from 'lucide-react';
import type { Building } from '../../types';
import {
  buildingsApi,
  PERSONAL_BUILDING_LIMIT,
  getHiddenPersonalIds,
  readPersonalBlocks,
  readPersonalRooms,
} from '../../api/buildings';
import PersonalBlocksField, {
  emptyBlockRows,
  blockRowsToPayload,
  type BlockRow,
} from '../../components/occupant/PersonalBlocksField';

interface NewBuildingForm {
  name: string;
  city: string;
  blocks: BlockRow[];
  requiresAccessPermission: boolean;
}

const emptyForm = (): NewBuildingForm => ({
  name: '',
  city: '',
  blocks: emptyBlockRows(),
  requiresAccessPermission: true,
});

export default function Presence() {
  const { buildings, isLoading, fetchBuildings, selectBuilding, forgetBuilding } = usePresenceStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [personal, setPersonal] = useState<Building[]>([]);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewBuildingForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonal = async () => {
    setPersonalLoading(true);
    try {
      setPersonal(await buildingsApi.listPersonal());
    } catch {
      // non-critical, leave list empty
    } finally {
      setPersonalLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings(user?.tenantId ?? undefined);
    loadPersonal();
  }, [fetchBuildings, user?.tenantId]);

  const handleSelect = async (building: Building) => {
    await selectBuilding(building);
    navigate('/location');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Building name is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const blocks = blockRowsToPayload(form.blocks);
      if (blocks.length === 0) {
        setError('Add at least one block with a valid floor range');
        setSubmitting(false);
        return;
      }
      await buildingsApi.createPersonal({
        name: form.name.trim(),
        city: form.city.trim() || undefined,
        blocks,
        requiresAccessPermission: form.requiresAccessPermission,
      });
      setForm(emptyForm());
      setShowAddForm(false);
      await Promise.all([loadPersonal(), fetchBuildings(user?.tenantId ?? undefined)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add building');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (buildingId: string) => {
    if (!confirm('Remove this building? Your votes for it will remain.')) return;
    // Optimistically drop from every UI surface (personal list, recent,
    // favorites, active selection). The API call is best-effort and
    // never throws.
    setPersonal((prev) => prev.filter((b) => b.id !== buildingId));
    forgetBuilding(buildingId);
    await buildingsApi.deletePersonal(buildingId);
    await Promise.all([loadPersonal(), fetchBuildings(user?.tenantId ?? undefined)]);
  };

  const personalIds = new Set(personal.map((b) => b.id));
  const hidden = getHiddenPersonalIds();
  const otherBuildings = buildings.filter(
    (b) => !personalIds.has(b.id) && !hidden.has(b.id),
  );
  const atLimit = personal.length >= PERSONAL_BUILDING_LIMIT;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.98)_100%)] px-5 py-6 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-600/75">Presence</div>
        <h1 className="mt-2 text-xl font-bold text-slate-800">Select Your Building</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choose the building you are currently in to continue into the occupant app.</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600/75">My Buildings</div>
            <div className="text-xs text-slate-400">{personal.length} of {PERSONAL_BUILDING_LIMIT} added</div>
          </div>
          {!showAddForm && (
            <button
              onClick={() => { setShowAddForm(true); setError(null); }}
              disabled={atLimit}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add building
            </button>
          )}
        </div>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-emerald-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">New building</div>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setForm(emptyForm()); setError(null); }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Building name (required)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                maxLength={200}
                autoFocus
              />
              <input
                type="text"
                placeholder="City (optional)"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
                maxLength={100}
              />
              <p className="px-1 text-[11px] text-slate-500">
                Tell us how the building is structured (blocks and the
                floors each block has) so we can ask the right comfort
                questions.
              </p>
              <PersonalBlocksField
                rows={form.blocks}
                onChange={(blocks) => setForm({ ...form, blocks })}
              />
              <label className="flex items-start gap-2 px-1 pt-1 text-[11px] text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.requiresAccessPermission}
                  onChange={(e) => setForm({ ...form, requiresAccessPermission: e.target.checked })}
                  className="mt-0.5 rounded"
                />
                <span>
                  Private — only I can see this building
                  <span className="block text-slate-400">Uncheck for an office or shared building you want other people to find.</span>
                </span>
              </label>
              <p className="px-1 text-[11px] text-slate-400">
                You can add room numbers later from the location picker. Default comfort questions are ready to vote on.
              </p>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setForm(emptyForm()); setError(null); }}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-emerald-300"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save building
              </button>
            </div>
          </form>
        )}

        {personalLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          </div>
        ) : personal.length === 0 && !showAddForm ? (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-white/75 px-4 py-6 text-center text-xs text-slate-400">
            You haven't added any buildings yet. Add up to {PERSONAL_BUILDING_LIMIT}.
          </div>
        ) : (
          <div className="space-y-2.5">
            {personal.map((b) => {
              const blocks = readPersonalBlocks(b.metadata);
              const rooms = readPersonalRooms(b.metadata);
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-[24px] border border-emerald-100 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                >
                  <button
                    onClick={() => handleSelect(b)}
                    className="flex flex-1 items-center gap-4 text-left"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800">{b.name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-400">
                        {[
                          b.city,
                          blocks.length ? `${blocks.length} block${blocks.length === 1 ? '' : 's'}` : null,
                          rooms.length ? `${rooms.length} room${rooms.length === 1 ? '' : 's'}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'Personal building'}
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">Select</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="rounded-full p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    title="Remove building"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Other Buildings</div>
          <div className="text-xs text-slate-400">{otherBuildings.length} available</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : otherBuildings.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-white/75 px-4 py-6 text-center text-xs text-slate-400">
            No other buildings available
          </div>
        ) : (
          <div className="space-y-3">
            {otherBuildings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelect(b)}
                className="w-full rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(5,150,105,0.12)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">{b.name}</div>
                    <div className="mt-1 truncate text-xs text-slate-400">{b.address}</div>
                  </div>
                  {b.requiresAccessPermission && (
                    <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{b.city ?? 'Active workspace'}</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-600">Select</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
