import { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, Plus, X } from 'lucide-react';
import {
  telemetryConfigApi,
  MetricConfig,
  KNOWN_METRICS,
  AGGREGATION_RULES,
  CONFLICT_RESOLUTIONS,
} from '../../api/telemetryConfig';

interface Props {
  buildingId: string;
}

interface CardState {
  metricType: string;
  label: string;
  isEnabled: boolean;
  defaultUnit: string;
  validRangeMin: string;
  validRangeMax: string;
  roomAggregationRule: string;
  staleThresholdMinutes: string;
  conflictResolution: string;
  dirty: boolean;
  saving: boolean;
}

function toCardState(cfg: MetricConfig): CardState {
  const known = KNOWN_METRICS.find(k => k.type === cfg.metricType);
  return {
    metricType: cfg.metricType,
    label: known?.label || cfg.metricType,
    isEnabled: cfg.isEnabled,
    defaultUnit: cfg.defaultUnit || known?.unit || '',
    validRangeMin: cfg.validRangeMin != null ? String(cfg.validRangeMin) : '',
    validRangeMax: cfg.validRangeMax != null ? String(cfg.validRangeMax) : '',
    roomAggregationRule: cfg.roomAggregationRule || 'avg',
    staleThresholdMinutes: cfg.staleThresholdMinutes != null ? String(cfg.staleThresholdMinutes) : '',
    conflictResolution: cfg.conflictResolution || 'newest_wins',
    dirty: false,
    saving: false,
  };
}

function defaultCardState(metricType: string): CardState {
  const known = KNOWN_METRICS.find(k => k.type === metricType);
  return {
    metricType,
    label: known?.label || metricType,
    isEnabled: true,
    defaultUnit: known?.unit || '',
    validRangeMin: '',
    validRangeMax: '',
    roomAggregationRule: 'avg',
    staleThresholdMinutes: '30',
    conflictResolution: 'newest_wins',
    dirty: true,
    saving: false,
  };
}

export default function MetricConfigTab({ buildingId }: Props) {
  const [cards, setCards] = useState<CardState[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customType, setCustomType] = useState('');

  const load = useCallback(async () => {
    try {
      const configs = await telemetryConfigApi.list(buildingId);
      const configMap = new Map(configs.map(c => [c.metricType, c]));

      // Show all known metrics + any custom ones from the backend
      const result: CardState[] = [];
      for (const km of KNOWN_METRICS) {
        const existing = configMap.get(km.type);
        result.push(existing ? toCardState(existing) : defaultCardState(km.type));
        configMap.delete(km.type);
      }
      for (const [, cfg] of configMap) {
        result.push(toCardState(cfg));
      }
      setCards(result);
    } catch {
      setCards(KNOWN_METRICS.map(km => defaultCardState(km.type)));
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => { load(); }, [load]);

  const updateCard = (idx: number, patch: Partial<CardState>) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, ...patch, dirty: true } : c));
  };

  const saveCard = async (idx: number) => {
    const card = cards[idx];
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, saving: true } : c));
    try {
      await telemetryConfigApi.upsert(buildingId, {
        buildingId,
        metricType: card.metricType,
        isEnabled: card.isEnabled,
        defaultUnit: card.defaultUnit || undefined,
        roomAggregationRule: card.roomAggregationRule,
        validRangeMin: card.validRangeMin ? parseFloat(card.validRangeMin) : null,
        validRangeMax: card.validRangeMax ? parseFloat(card.validRangeMax) : null,
        staleThresholdMinutes: card.staleThresholdMinutes ? parseInt(card.staleThresholdMinutes) : null,
        conflictResolution: card.conflictResolution,
      });
      setCards(prev => prev.map((c, i) => i === idx ? { ...c, dirty: false, saving: false } : c));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to save');
      setCards(prev => prev.map((c, i) => i === idx ? { ...c, saving: false } : c));
    }
  };

  const addCustomMetric = () => {
    if (!customType.trim()) return;
    const type = customType.trim().toLowerCase().replace(/\s+/g, '_');
    if (cards.some(c => c.metricType === type)) return;
    setCards(prev => [...prev, defaultCardState(type)]);
    setCustomType('');
    setShowAddCustom(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Metric Configuration</h3>
          <p className="text-sm text-gray-500">Configure aggregation, validation, and conflict resolution per metric</p>
        </div>
        <button
          onClick={() => setShowAddCustom(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" /> Custom Metric
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, idx) => (
          <div key={card.metricType} className={`border rounded-xl p-4 bg-white ${!card.isEnabled ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-gray-800">{card.label}</h4>
              <div className="flex items-center gap-2">
                {card.dirty && (
                  <button
                    onClick={() => saveCard(idx)}
                    disabled={card.saving}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    {card.saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                )}
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={card.isEnabled}
                    onChange={e => updateCard(idx, { isEnabled: e.target.checked })}
                    className="rounded"
                  />
                  Enabled
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Default Unit</label>
                <input
                  value={card.defaultUnit}
                  onChange={e => updateCard(idx, { defaultUnit: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Aggregation Rule</label>
                <select
                  value={card.roomAggregationRule}
                  onChange={e => updateCard(idx, { roomAggregationRule: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  {AGGREGATION_RULES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Valid Range Min</label>
                <input
                  type="number"
                  value={card.validRangeMin}
                  onChange={e => updateCard(idx, { validRangeMin: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="e.g. -10"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Valid Range Max</label>
                <input
                  type="number"
                  value={card.validRangeMax}
                  onChange={e => updateCard(idx, { validRangeMax: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Stale Threshold (min)</label>
                <input
                  type="number"
                  value={card.staleThresholdMinutes}
                  onChange={e => updateCard(idx, { staleThresholdMinutes: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="e.g. 30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Conflict Resolution</label>
                <select
                  value={card.conflictResolution}
                  onChange={e => updateCard(idx, { conflictResolution: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  {CONFLICT_RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom metric modal */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Custom Metric</h3>
              <button onClick={() => setShowAddCustom(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <input
              value={customType}
              onChange={e => setCustomType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
              placeholder="e.g. voc, pm25, illuminance"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddCustom(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={addCustomMetric}
                disabled={!customType.trim()}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
