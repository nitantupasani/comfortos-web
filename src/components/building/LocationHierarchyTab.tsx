import { useEffect, useState, useCallback } from 'react';
import {
  Building2, Layers, LayoutGrid, DoorOpen, MapPin,
  ChevronRight, ChevronDown, Plus, Pencil, Trash2, X, Loader2,
} from 'lucide-react';
import {
  locationsApi,
  LocationTreeNode,
  LocationCreate,
  LocationUpdate,
  LocationType,
  VALID_CHILDREN,
  TYPE_LABELS,
} from '../../api/locations';

const TYPE_ICONS: Record<LocationType, typeof Building2> = {
  building: Building2,
  block_or_wing: Layers,
  floor: LayoutGrid,
  room: DoorOpen,
  placement: MapPin,
};

const TYPE_COLORS: Record<LocationType, string> = {
  building: 'text-blue-600 bg-blue-50',
  block_or_wing: 'text-purple-600 bg-purple-50',
  floor: 'text-green-600 bg-green-50',
  room: 'text-amber-600 bg-amber-50',
  placement: 'text-gray-600 bg-gray-50',
};

interface Props {
  buildingId: string;
}

interface ModalState {
  mode: 'add' | 'edit';
  parentId: string | null;
  parentType: LocationType | null;
  editNode?: LocationTreeNode;
}

export default function LocationHierarchyTab({ buildingId }: Props) {
  const [tree, setTree] = useState<LocationTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<LocationType>('room');
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formOrientation, setFormOrientation] = useState('');
  const [formUsageType, setFormUsageType] = useState('');

  const loadTree = useCallback(async () => {
    try {
      const data = await locationsApi.tree(buildingId);
      setTree(data);
      // Auto-expand all nodes on first load
      const ids = new Set<string>();
      const collect = (nodes: LocationTreeNode[]) => {
        for (const n of nodes) {
          if (n.children.length > 0) ids.add(n.id);
          collect(n.children);
        }
      };
      collect(data);
      setExpanded(ids);
    } catch {
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => { loadTree(); }, [loadTree]);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openAddRoot = () => {
    setModal({ mode: 'add', parentId: null, parentType: null });
    setFormType('building');
    setFormName('');
    setFormCode('');
    setFormOrientation('');
    setFormUsageType('');
  };

  const openAddChild = (parent: LocationTreeNode) => {
    const validChildren = VALID_CHILDREN[parent.type];
    if (validChildren.length === 0) return;
    setModal({ mode: 'add', parentId: parent.id, parentType: parent.type });
    setFormType(validChildren[0]);
    setFormName('');
    setFormCode('');
    setFormOrientation('');
    setFormUsageType('');
  };

  const openEdit = (node: LocationTreeNode) => {
    setModal({ mode: 'edit', parentId: node.parentId, parentType: null, editNode: node });
    setFormType(node.type);
    setFormName(node.name);
    setFormCode(node.code || '');
    setFormOrientation(node.orientation || '');
    setFormUsageType(node.usageType || '');
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (modal?.mode === 'add') {
        const data: LocationCreate = {
          buildingId,
          parentId: modal.parentId,
          type: formType,
          name: formName.trim(),
          code: formCode.trim() || undefined,
          orientation: formOrientation.trim() || undefined,
          usageType: formUsageType.trim() || undefined,
        };
        await locationsApi.create(data);
      } else if (modal?.mode === 'edit' && modal.editNode) {
        const data: LocationUpdate = {
          name: formName.trim(),
          code: formCode.trim() || undefined,
          orientation: formOrientation.trim() || undefined,
          usageType: formUsageType.trim() || undefined,
        };
        await locationsApi.update(modal.editNode.id, data);
      }
      setModal(null);
      await loadTree();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (node: LocationTreeNode) => {
    if (!confirm(`Delete "${node.name}"? This will fail if it has children.`)) return;
    try {
      await locationsApi.remove(node.id);
      await loadTree();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const allowedTypes: LocationType[] = modal?.mode === 'add' && modal.parentType
    ? VALID_CHILDREN[modal.parentType]
    : modal?.mode === 'add' && !modal?.parentId
      ? ['building']
      : [];

  const renderNode = (node: LocationTreeNode, depth: number) => {
    const Icon = TYPE_ICONS[node.type];
    const colorClass = TYPE_COLORS[node.type];
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const canAddChild = VALID_CHILDREN[node.type].length > 0;

    return (
      <div key={node.id}>
        <div
          className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
        >
          {/* Expand toggle */}
          <button
            onClick={() => toggle(node.id)}
            className={`w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 ${!hasChildren ? 'invisible' : ''}`}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {/* Type icon */}
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </span>

          {/* Name and badges */}
          <span className="font-medium text-sm text-gray-800">{node.name}</span>
          {node.code && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">{node.code}</span>
          )}
          <span className="text-xs text-gray-400">{TYPE_LABELS[node.type]}</span>
          {node.orientation && (
            <span className="text-xs text-gray-400">({node.orientation})</span>
          )}
          {node.usageType && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-50 text-gray-400">{node.usageType}</span>
          )}

          {/* Action buttons */}
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canAddChild && (
              <button
                onClick={() => openAddChild(node)}
                className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                title="Add child"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => openEdit(node)}
              className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {node.type !== 'building' && (
              <button
                onClick={() => handleDelete(node)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        {isExpanded && node.children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Location Hierarchy</h3>
          <p className="text-sm text-gray-500">Define the physical structure: wings, floors, rooms, and placements</p>
        </div>
        {tree.length === 0 && (
          <button
            onClick={openAddRoot}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> Add Building Root
          </button>
        )}
      </div>

      {/* Tree */}
      {tree.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No location hierarchy defined yet.</p>
          <p className="text-xs mt-1">Start by adding the building root node.</p>
        </div>
      ) : (
        <div className="border rounded-xl p-3 bg-white">
          {tree.map(n => renderNode(n, 0))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {modal.mode === 'add' ? 'Add Location' : 'Edit Location'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

            <div className="space-y-3">
              {/* Type (only for add mode) */}
              {modal.mode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as LocationType)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {allowedTypes.map(t => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. North Wing, Floor 2, Room 201"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Short identifier, e.g. NW, F2, R201"
                />
              </div>

              {(formType === 'block_or_wing' || formType === 'room') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                  <input
                    value={formOrientation}
                    onChange={e => setFormOrientation(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. north, south_east, street_side"
                  />
                </div>
              )}

              {formType === 'room' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Type</label>
                  <input
                    value={formUsageType}
                    onChange={e => setFormUsageType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. office, lecture_hall, meeting_room"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : modal.mode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
