import { useEffect, useState } from 'react';
import { Building2, Star, Clock, Loader2, Plus, Trash2, X, Home } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import BottomSheet from '../common/BottomSheet';
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
} from './PersonalBlocksField';
import type { Building } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (building: Building) => void;
}

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

export default function BuildingQuickSwitch({ isOpen, onClose, onSelect }: Props) {
  const {
    buildings,
    activeBuilding,
    isLoading,
    fetchBuildings,
    recentBuildings,
    favoriteBuildings,
    addFavorite,
    removeFavorite,
    forgetBuilding,
  } = usePresenceStore();
  const user = useAuthStore((s) => s.user);

  const [personal, setPersonal] = useState<Building[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewBuildingForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonal = async () => {
    try {
      setPersonal(await buildingsApi.listPersonal());
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (buildings.length === 0) fetchBuildings(user?.tenantId ?? undefined);
      loadPersonal();
    } else {
      setShowAddForm(false);
      setForm(emptyForm());
      setError(null);
    }
  }, [isOpen, buildings.length, fetchBuildings, user?.tenantId]);

  const isFavorite = (id: string) => favoriteBuildings.includes(id);
  const personalIds = new Set(personal.map((b) => b.id));
  const hidden = getHiddenPersonalIds();
  // A building is "filtered out" of the generic Recent/Favorites/All
  // sections if it's already shown in My Buildings OR if the user has
  // hidden it locally (deleted personal building whose server delete
  // may not have landed).
  const isFiltered = (id: string) => personalIds.has(id) || hidden.has(id);
  const recentIds = new Set(
    recentBuildings.filter((r) => !isFiltered(r.building.id)).map((r) => r.building.id),
  );

  const favorites = buildings.filter((b) => isFavorite(b.id) && !isFiltered(b.id));
  const recent = recentBuildings
    .filter((r) => !isFavorite(r.building.id) && !isFiltered(r.building.id))
    .map((r) => r.building);
  const others = buildings.filter(
    (b) => !isFavorite(b.id) && !recentIds.has(b.id) && !isFiltered(b.id),
  );

  const atLimit = personal.length >= PERSONAL_BUILDING_LIMIT;

  const handleSelect = (building: Building) => {
    onSelect(building);
    onClose();
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

  const handleDelete = async (e: React.MouseEvent, buildingId: string) => {
    e.stopPropagation();
    if (!confirm('Remove this building?')) return;
    // Optimistically drop from every UI surface (My Buildings list,
    // Recent, Favorites, active selection). The API call is
    // best-effort and never throws.
    setPersonal((prev) => prev.filter((b) => b.id !== buildingId));
    forgetBuilding(buildingId);
    await buildingsApi.deletePersonal(buildingId);
    await Promise.all([loadPersonal(), fetchBuildings(user?.tenantId ?? undefined)]);
  };

  const renderBuildingCard = (b: Building) => {
    const isActive = activeBuilding?.id === b.id;

    return (
      <button
        key={b.id}
        onClick={() => handleSelect(b)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
          isActive
            ? 'bg-emerald-50 border border-emerald-200'
            : 'hover:bg-gray-50 border border-transparent'
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">{b.name}</div>
          <div className="text-xs text-slate-400 truncate">{b.address}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            isFavorite(b.id) ? removeFavorite(b.id) : addFavorite(b.id);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Star
            className={`h-4 w-4 ${
              isFavorite(b.id) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
        {isActive && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </button>
    );
  };

  const renderPersonalCard = (b: Building) => {
    const isActive = activeBuilding?.id === b.id;
    const blocks = readPersonalBlocks(b.metadata);
    const rooms = readPersonalRooms(b.metadata);
    const subtitle =
      [
        b.city,
        blocks.length ? `${blocks.length} block${blocks.length === 1 ? '' : 's'}` : null,
        rooms.length ? `${rooms.length} room${rooms.length === 1 ? '' : 's'}` : null,
      ]
        .filter(Boolean)
        .join(' · ') || 'Personal building';

    return (
      <button
        key={b.id}
        onClick={() => handleSelect(b)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
          isActive
            ? 'bg-emerald-50 border border-emerald-200'
            : 'hover:bg-gray-50 border border-transparent'
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">{b.name}</div>
          <div className="text-xs text-slate-400 truncate">{subtitle}</div>
        </div>
        <button
          onClick={(e) => handleDelete(e, b.id)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {isActive && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </button>
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Switch Building">
      <div className="space-y-4">
        {/* Add building bar */}
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setError(null); }}
            disabled={atLimit}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 text-left transition-all hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white disabled:bg-slate-300">
              <Plus className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-emerald-700">
                {atLimit ? 'Maximum buildings added' : 'Add a building'}
              </div>
              <div className="text-xs text-slate-400">{personal.length} of {PERSONAL_BUILDING_LIMIT} personal buildings</div>
            </div>
          </button>
        )}

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-emerald-200 bg-white px-3 py-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">New building</div>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setForm(emptyForm()); setError(null); }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
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
                floors each block has).
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
              <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>
            )}

            <div className="mt-3 flex justify-end gap-2">
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
                Save
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : buildings.length === 0 && personal.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            No buildings available
          </div>
        ) : (
          <>
            {personal.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-2 px-1">
                  <Home className="h-3 w-3" />
                  My Buildings
                </div>
                <div className="space-y-1">{personal.map(renderPersonalCard)}</div>
              </div>
            )}

            {favorites.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-2 px-1">
                  <Star className="h-3 w-3 fill-amber-400" />
                  Favorites
                </div>
                <div className="space-y-1">{favorites.map(renderBuildingCard)}</div>
              </div>
            )}

            {recent.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                <div className="space-y-1">{recent.map(renderBuildingCard)}</div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                  All Buildings
                </div>
                <div className="space-y-1">{others.map(renderBuildingCard)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}
