import { useState, useRef } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  Type, Smile, Star, ToggleLeft, Sliders, Hash, MessageSquare,
  ThermometerSun, CheckSquare, Circle, Settings2, Info, X,
} from 'lucide-react';
import type { VoteFormSchema, VoteFormField, VoteFormOption } from '../../types';

/* ── Field type metadata ─────────────────────────────── */
const FIELD_TYPES = [
  { value: 'thermal_scale',       label: 'Thermal Scale (−3 to +3)', icon: ThermometerSun, category: 'scale',  hasOptions: false },
  { value: 'emoji_scale',         label: 'Emoji Scale',            icon: Smile,          category: 'emoji',  hasOptions: true  },
  { value: 'emoji_single_select', label: 'Emoji Single Select',    icon: Smile,          category: 'emoji',  hasOptions: true  },
  { value: 'emoji_multi_select',  label: 'Emoji Multi Select',     icon: Smile,          category: 'emoji',  hasOptions: true  },
  { value: 'single_select',       label: 'Single Select',          icon: Circle,         category: 'choice', hasOptions: true  },
  { value: 'multi_select',        label: 'Multi Select',           icon: CheckSquare,    category: 'choice', hasOptions: true  },
  { value: 'rating_stars',        label: 'Star Rating',            icon: Star,           category: 'scale',  hasOptions: false },
  { value: 'text_input',          label: 'Text Input',             icon: Type,           category: 'text',   hasOptions: false },
  { value: 'yes_no',              label: 'Yes / No',               icon: ToggleLeft,     category: 'binary', hasOptions: false },
  { value: 'slider',              label: 'Slider',                 icon: Sliders,        category: 'scale',  hasOptions: false },
] as const;

const fieldMeta = (type: string) => FIELD_TYPES.find((t) => t.value === type) ?? FIELD_TYPES[0];

/* ── Common emoji palette ────────────────────────────── */
const EMOJI_PALETTE = [
  // temperature
  '🥶','❄️','🧊','🌡️','🔥','☀️','🥵',
  // comfort
  '😊','😐','😟','😤','😓','😌','🤗',
  // air
  '💨','🌬️','😶‍🌫️','💧','🏜️','🤢','🌿',
  // rating
  '👍','👎','✅','⚠️','❌','⭐','💯',
  // misc
  '🪴','☕','🍕','📶','🎵','💡','🔔','🪟','🚿','🏢',
];

/* ── Props ───────────────────────────────────────────── */
interface Props {
  schema: VoteFormSchema;
  onChange: (schema: VoteFormSchema) => void;
}

/* ── Helpers ─────────────────────────────────────────── */
let _nextId = Date.now();
const uid = () => `field_${++_nextId}`;

function defaultFieldForType(type: string): VoteFormField {
  const base: VoteFormField = { id: uid(), type, question: '', required: true };
  switch (type) {
    case 'thermal_scale':       return { ...base, min: -3, max: 3, labels: { '-3': 'Cold', '0': 'Neutral', '3': 'Hot' } };
    case 'rating_stars':        return { ...base, maxStars: 5 };
    case 'text_input':          return { ...base, required: false, maxLength: 300, hint: '' };
    case 'yes_no':              return { ...base, yesLabel: 'Yes', noLabel: 'No' };
    case 'slider':              return { ...base, min: 0, max: 10 };
    case 'emoji_scale':
    case 'emoji_single_select':
    case 'emoji_multi_select':  return { ...base, options: [{ emoji: '😊', label: 'Good', value: 1 }] };
    case 'single_select':
    case 'multi_select':        return { ...base, options: [{ label: 'Option 1', value: 1 }] };
    default:                    return base;
  }
}

function cloneOption(opt: VoteFormOption, newValue: number | string): VoteFormOption {
  return { ...opt, value: newValue, label: '', emoji: '' };
}

/* ════════════════════════════════════════════════════════ */
export default function VoteFormVisualEditor({ schema, onChange }: Props) {
  const emit = (patch: Partial<VoteFormSchema>) => onChange({ ...schema, ...patch });
  const setFields = (fields: VoteFormField[]) => emit({ fields });

  const updateField = (index: number, patch: Partial<VoteFormField>) => {
    const f = [...schema.fields];
    f[index] = { ...f[index], ...patch };
    setFields(f);
  };
  const removeField = (index: number) => setFields(schema.fields.filter((_, i) => i !== index));
  const moveField = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= schema.fields.length) return;
    const f = [...schema.fields];
    [f[from], f[to]] = [f[to], f[from]];
    setFields(f);
  };

  const [addingType, setAddingType] = useState<string | null>(null);

  const addField = (type: string) => {
    setFields([...schema.fields, defaultFieldForType(type)]);
    setAddingType(null);
  };

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* ── Form settings ─────────────────────────────── */}
      <FormSettingsPanel schema={schema} emit={emit} />

      {/* ── Question cards ────────────────────────────── */}
      {schema.fields.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
          <MessageSquare className="mx-auto h-10 w-10 mb-2" />
          <p className="text-sm font-medium">No questions yet</p>
          <p className="text-xs mt-1">Add your first question below to get started</p>
        </div>
      )}

      {schema.fields.map((field, idx) => (
        <QuestionCard
          key={field.id}
          field={field}
          index={idx}
          total={schema.fields.length}
          onUpdate={(p) => updateField(idx, p)}
          onRemove={() => removeField(idx)}
          onMove={(dir) => moveField(idx, dir)}
        />
      ))}

      {/* ── Add question ──────────────────────────────── */}
      {addingType === null ? (
        <button
          onClick={() => setAddingType('pick')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 py-4 text-sm font-semibold text-teal-600 transition hover:bg-teal-50 hover:border-teal-400"
        >
          <Plus className="h-5 w-5" /> Add Question
        </button>
      ) : (
        <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Choose question type</span>
            <button onClick={() => setAddingType(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FIELD_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => addField(t.value)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm hover:border-teal-400 hover:bg-teal-50 transition"
                >
                  <Icon className="h-4 w-4 text-teal-500 shrink-0" />
                  <span className="text-gray-700">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Form-level settings                                 */
/* ──────────────────────────────────────────────────────── */
function FormSettingsPanel({ schema, emit }: { schema: VoteFormSchema; emit: (p: Partial<VoteFormSchema>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Settings2 className="h-4 w-4 text-teal-500" />
          Form Settings
          <span className="text-xs font-normal text-gray-400">— {schema.title || 'Untitled'}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-3 bg-gray-50/50">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Form Title">
              <input
                value={schema.title ?? ''}
                onChange={(e) => emit({ title: e.target.value })}
                placeholder="Comfort Vote"
                className="input"
              />
            </Field>
            <Field label="Thanks Message">
              <input
                value={schema.thanksMessage ?? ''}
                onChange={(e) => emit({ thanksMessage: e.target.value })}
                placeholder="Thanks for your feedback!"
                className="input"
              />
            </Field>
          </div>
          <Field label="Description">
            <input
              value={schema.description ?? ''}
              onChange={(e) => emit({ description: e.target.value })}
              placeholder="Quick 1-minute survey about your office environment."
              className="input"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Cooldown (minutes)">
              <input
                type="number"
                min={0}
                value={schema.cooldownMinutes ?? 0}
                onChange={(e) => emit({ cooldownMinutes: Number(e.target.value) })}
                className="input w-28"
              />
            </Field>
            <Field label="Allow Anonymous Votes">
              <Toggle value={schema.allowAnonymous ?? false} onChange={(v) => emit({ allowAnonymous: v })} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Individual question card                            */
/* ──────────────────────────────────────────────────────── */
interface QuestionCardProps {
  field: VoteFormField;
  index: number;
  total: number;
  onUpdate: (patch: Partial<VoteFormField>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

function QuestionCard({ field, index, total, onUpdate, onRemove, onMove }: QuestionCardProps) {
  const meta = fieldMeta(field.type);
  const Icon = meta.icon;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b">
        <GripVertical className="h-4 w-4 text-gray-300" />
        <span className="flex items-center justify-center h-6 min-w-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold px-2">
          {index + 1}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white border rounded-full px-2.5 py-0.5">
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        {field.required && (
          <span className="text-xs font-medium text-rose-500 bg-rose-50 rounded-full px-2 py-0.5">Required</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition" title="Move up">
            <ChevronUp className="h-4 w-4 text-gray-500" />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition" title="Move down">
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="p-1 rounded hover:bg-red-50 transition" title="Delete question">
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </button>
          ) : (
            <span className="flex items-center gap-1 ml-1">
              <button onClick={onRemove} className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 transition">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:text-gray-700 px-1">Cancel</button>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3">
        {/* Question text */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
            <input
              value={field.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              placeholder="Enter your question…"
              className="input text-base font-medium"
            />
          </div>
          <div className="flex flex-col items-center pt-5">
            <label className="text-xs font-medium text-gray-400 mb-1">Req.</label>
            <Toggle value={field.required ?? true} onChange={(v) => onUpdate({ required: v })} />
          </div>
        </div>

        {/* Hint */}
        <Field label="Hint text (optional)">
          <input
            value={field.hint ?? ''}
            onChange={(e) => onUpdate({ hint: e.target.value || undefined })}
            placeholder="E.g., 'Select what best describes your feeling'"
            className="input text-xs"
          />
        </Field>

        {/* Type-specific settings */}
        <TypeSpecificSettings field={field} onUpdate={onUpdate} />

        {/* Options editor for option-based types */}
        {meta.hasOptions && (
          <OptionsEditor
            field={field}
            onUpdate={onUpdate}
            showEmoji={meta.category === 'emoji'}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Type-specific settings                              */
/* ──────────────────────────────────────────────────────── */
function TypeSpecificSettings({ field, onUpdate }: { field: VoteFormField; onUpdate: (p: Partial<VoteFormField>) => void }) {
  switch (field.type) {
    case 'thermal_scale':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min value">
            <input type="number" min={-3} max={3} value={field.min ?? -3} onChange={(e) => onUpdate({ min: Number(e.target.value) })} className="input w-20" />
          </Field>
          <Field label="Max value">
            <input type="number" min={-3} max={3} value={field.max ?? 3} onChange={(e) => onUpdate({ max: Number(e.target.value) })} className="input w-20" />
          </Field>
        </div>
      );

    case 'rating_stars':
      return (
        <Field label="Number of stars">
          <input type="number" min={1} max={10} value={field.maxStars ?? 5} onChange={(e) => onUpdate({ maxStars: Number(e.target.value) })} className="input w-20" />
        </Field>
      );

    case 'text_input':
      return (
        <Field label="Max character length">
          <input type="number" min={1} max={2000} value={field.maxLength ?? 500} onChange={(e) => onUpdate({ maxLength: Number(e.target.value) })} className="input w-28" />
        </Field>
      );

    case 'yes_no':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label={'Yes label'}>
            <input value={field.yesLabel ?? 'Yes'} onChange={(e) => onUpdate({ yesLabel: e.target.value })} className="input" placeholder="Yes" />
          </Field>
          <Field label={'No label'}>
            <input value={field.noLabel ?? 'No'} onChange={(e) => onUpdate({ noLabel: e.target.value })} className="input" placeholder="No" />
          </Field>
        </div>
      );

    case 'slider':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min"><input type="number" value={field.min ?? 0} onChange={(e) => onUpdate({ min: Number(e.target.value) })} className="input w-20" /></Field>
          <Field label="Max"><input type="number" value={field.max ?? 10} onChange={(e) => onUpdate({ max: Number(e.target.value) })} className="input w-20" /></Field>
        </div>
      );

    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────── */
/* ── Options editor (for select / emoji types)           */
/* ──────────────────────────────────────────────────────── */
function OptionsEditor({ field, onUpdate, showEmoji }: { field: VoteFormField; onUpdate: (p: Partial<VoteFormField>) => void; showEmoji: boolean }) {
  const options = field.options ?? [];
  const setOptions = (opts: VoteFormOption[]) => onUpdate({ options: opts });

  const updateOption = (idx: number, patch: Partial<VoteFormOption>) => {
    const o = [...options];
    o[idx] = { ...o[idx], ...patch };
    setOptions(o);
  };
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const addOption = () => {
    const nextVal = options.length > 0
      ? Math.max(...options.map((o) => typeof o.value === 'number' ? o.value : 0)) + 1
      : 1;
    setOptions([...options, { label: '', value: nextVal, ...(showEmoji ? { emoji: '😊' } : {}) }]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">Answer Options</label>
        <span className="text-xs text-gray-400">{options.length} option{options.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <span className="text-xs text-gray-300 w-5 text-center font-mono">{idx + 1}</span>

            {showEmoji && (
              <EmojiPicker
                value={opt.emoji ?? ''}
                onChange={(emoji) => updateOption(idx, { emoji })}
              />
            )}

            <input
              value={opt.label}
              onChange={(e) => updateOption(idx, { label: e.target.value })}
              placeholder="Label"
              className="input flex-1 text-sm"
            />

            <input
              value={String(opt.value)}
              onChange={(e) => {
                const raw = e.target.value;
                const num = Number(raw);
                updateOption(idx, { value: raw !== '' && !isNaN(num) ? num : raw });
              }}
              placeholder="Value"
              className="input w-20 text-xs text-center font-mono"
              title="Value sent when user picks this option"
            />

            <button onClick={() => removeOption(idx)} className="p-1 rounded hover:bg-red-50 transition" title="Remove option">
              <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addOption}
        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 transition"
      >
        <Plus className="h-3.5 w-3.5" /> Add option
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Emoji picker (inline popover)                       */
/* ──────────────────────────────────────────────────────── */
function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-lg hover:border-teal-300 transition"
        title="Pick emoji"
      >
        {value || <Smile className="h-4 w-4 text-gray-300" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Palette */}
          <div className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white p-2 shadow-lg w-[260px]">
            <p className="text-[10px] font-medium text-gray-400 mb-1.5 px-1">Pick an emoji</p>
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => { onChange(emoji); setOpen(false); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-teal-50 transition ${value === emoji ? 'bg-teal-100 ring-1 ring-teal-400' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mt-2 border-t pt-2 px-1">
              <label className="text-[10px] text-gray-400">Or type any emoji:</label>
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-teal-400"
                placeholder="Paste or type emoji…"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Small reusable primitives                           */
/* ──────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-teal-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}
