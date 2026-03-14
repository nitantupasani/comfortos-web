import { useState } from 'react';
import { Star } from 'lucide-react';
import type { VoteFormSchema, VoteFormField } from '../../types';

const THERMAL_LABELS = [
  { value: -3, label: 'Cold', color: '#2196F3' },
  { value: -2, label: 'Cool', color: '#00ACC1' },
  { value: -1, label: 'Slightly Cool', color: '#26A69A' },
  { value: 0, label: 'Neutral', color: '#4CAF50' },
  { value: 1, label: 'Slightly Warm', color: '#FFC107' },
  { value: 2, label: 'Warm', color: '#FF9800' },
  { value: 3, label: 'Hot', color: '#F44336' },
];

interface Props {
  schema: VoteFormSchema;
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export default function VoteFormRenderer({ schema, onSubmit, isSubmitting }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const requiredFields = schema.fields.filter((field) => field.required);

  const setValue = (key: string, val: unknown) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const canSubmit = requiredFields.every((field) => {
    const fieldValue = values[field.id];
    if (Array.isArray(fieldValue)) {
      return fieldValue.length > 0;
    }
    if (typeof fieldValue === 'string') {
      return fieldValue.trim().length > 0;
    }
    return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.9)_0%,_rgba(255,255,255,0.96)_100%)] px-5 py-6 text-center shadow-[0_12px_40px_rgba(22,101,52,0.08)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-600/75">Comfort Vote</div>
        <h2 className="mt-2 text-[1.35rem] font-bold text-slate-800">{schema.title}</h2>
        {schema.description && <p className="mt-2 text-sm leading-6 text-slate-500">{schema.description}</p>}
      </div>

      {schema.fields.map((field, index) => (
        <section key={field.id} className="rounded-[26px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <label className="block text-sm font-semibold leading-6 text-slate-800">
              <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-50 px-2 text-[11px] font-bold text-emerald-600">
                {index + 1}
              </span>
              {field.question}
              {field.required && <span className="ml-1 text-rose-400">*</span>}
            </label>
          </div>
          {field.hint && <p className="mb-3 text-xs leading-5 text-slate-400">{field.hint}</p>}
          {renderField(field, values[field.id], (v) => setValue(field.id, v))}
        </section>
      ))}

      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="w-full rounded-[24px] bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(5,150,105,0.28)] transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Vote'}
      </button>
    </form>
  );
}

function renderField(field: VoteFormField, value: unknown, onChange: (v: unknown) => void) {
  switch (field.type) {
    case 'thermal_scale': {
      const min = Math.max(-3, field.min ?? -3);
      const max = Math.min(3, field.max ?? 3);
      const visibleOptions = THERMAL_LABELS.filter((option) => option.value >= min && option.value <= max);
      const labels = field.labels ?? {};
      const midpoint = visibleOptions[Math.floor(visibleOptions.length / 2)]?.value ?? 0;

      return (
        <div className="space-y-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${visibleOptions.length || 7}, minmax(0, 1fr))` }}>
            {visibleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`flex h-12 items-center justify-center rounded-2xl border text-sm font-bold transition-all ${
                  value === option.value
                    ? 'scale-[1.03] border-transparent text-white shadow-sm'
                    : 'border-transparent bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
                style={{
                  backgroundColor: value === option.value ? option.color : `${option.color}1A`,
                  color: value === option.value ? '#ffffff' : option.color,
                }}
                title={option.label}
              >
                {option.value}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-400">
            <span>{labels[min.toString()] ?? visibleOptions[0]?.label ?? 'Cold'}</span>
            <span className="text-center">{labels[midpoint.toString()] ?? visibleOptions.find((option) => option.value === midpoint)?.label ?? 'Neutral'}</span>
            <span className="text-right">{labels[max.toString()] ?? visibleOptions[visibleOptions.length - 1]?.label ?? 'Hot'}</span>
          </div>
        </div>
      );
    }

    case 'emoji_scale':
    case 'emoji_single_select':
      return (
        <div className="flex flex-wrap justify-center gap-3">
          {(field.options ?? []).map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex min-w-[84px] flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all ${
                value === opt.value ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs text-slate-600">{opt.label}</span>
            </button>
          ))}
        </div>
      );

    case 'single_select':
      return (
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-2xl border px-4 py-2.5 text-sm transition-colors ${
                value === opt.value
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300'
              }`}
            >
              {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      );

    case 'multi_select':
    case 'emoji_multi_select': {
      const selected = (value as (string | number)[]) ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  if (opt.exclusive) {
                    onChange(isSelected ? [] : [opt.value]);
                  } else {
                    const cleaned = selected.filter((entry) =>
                      !(field.options ?? []).find((option) => option.value === entry && option.exclusive),
                    );
                    onChange(
                      isSelected ? cleaned.filter((entry) => entry !== opt.value) : [...cleaned, opt.value],
                    );
                  }
                }}
                className={`rounded-2xl border px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300'
                }`}
              >
                {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    case 'rating_stars': {
      const max = field.maxStars ?? 5;
      const current = (value as number) ?? 0;
      return (
        <div className="flex gap-1">
          {Array.from({ length: max }, (_, index) => index + 1).map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className="rounded-xl p-1 transition-colors"
            >
              <Star className={`h-8 w-8 ${rating <= current ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      );
    }

    case 'text_input':
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.maxLength ?? 500}
          rows={3}
          className="w-full resize-none rounded-2xl border border-slate-300 px-3 py-3 text-sm outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          placeholder={field.hint ?? 'Type your feedback…'}
        />
      );

    case 'yes_no':
      return (
        <div className="flex gap-3">
          {[true, false].map((option) => (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              className={`flex-1 rounded-2xl border-2 py-3 text-sm font-medium transition-colors ${
                value === option
                  ? option ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {option ? field.yesLabel ?? '👍 Yes' : field.noLabel ?? '👎 No'}
            </button>
          ))}
        </div>
      );

    case 'slider': {
      const min = 0;
      const max = field.maxStars ?? 10;
      return (
        <div>
          <input
            type="range"
            min={min}
            max={max}
            value={(value as number) ?? Math.round(max / 2)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="text-center text-sm font-medium">{(value as number) ?? Math.round(max / 2)}</div>
        </div>
      );
    }

    default:
      return <div className="text-xs text-gray-400">Unsupported field type: {field.type}</div>;
  }
}
