import { useState } from 'react';
import { Star } from 'lucide-react';
import type { VoteFormSchema, VoteFormField } from '../../types';

const THERMAL_LABELS = [
  { value: -3, label: 'Cold', color: '#1565C0' },
  { value: -2, label: 'Cool', color: '#42A5F5' },
  { value: -1, label: 'Slightly Cool', color: '#90CAF9' },
  { value: 0, label: 'Neutral', color: '#66BB6A' },
  { value: 1, label: 'Slightly Warm', color: '#FFB74D' },
  { value: 2, label: 'Warm', color: '#FF7043' },
  { value: 3, label: 'Hot', color: '#D32F2F' },
];

interface Props {
  schema: VoteFormSchema;
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export default function VoteFormRenderer({ schema, onSubmit, isSubmitting }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const setValue = (key: string, val: unknown) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{schema.title}</h2>
        {schema.description && <p className="text-sm text-gray-500 mt-1">{schema.description}</p>}
      </div>

      {schema.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.question}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {renderField(field, values[field.id], (v) => setValue(field.id, v))}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Vote'}
      </button>
    </form>
  );
}

function renderField(field: VoteFormField, value: unknown, onChange: (v: unknown) => void) {
  switch (field.type) {
    case 'thermal_scale':
      return (
        <div className="flex gap-2 justify-center flex-wrap">
          {THERMAL_LABELS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`w-11 h-11 rounded-full text-white text-xs font-bold transition-all ${
                value === t.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: t.color }}
              title={t.label}
            >
              {t.value > 0 ? `+${t.value}` : t.value}
            </button>
          ))}
        </div>
      );

    case 'emoji_scale':
    case 'emoji_single_select':
      return (
        <div className="flex gap-3 justify-center flex-wrap">
          {(field.options ?? []).map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                value === opt.value ? 'border-primary-500 bg-primary-50 scale-105' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs text-gray-600">{opt.label}</span>
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
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                value === opt.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
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
                    const cleaned = selected.filter((v) =>
                      !(field.options ?? []).find((o) => o.value === v && o.exclusive),
                    );
                    onChange(
                      isSelected ? cleaned.filter((v) => v !== opt.value) : [...cleaned, opt.value],
                    );
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
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
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="p-1 transition-colors"
            >
              <Star
                className={`h-8 w-8 ${n <= current ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none resize-none"
          placeholder="Type your feedback…"
        />
      );

    case 'yes_no':
      return (
        <div className="flex gap-3">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => onChange(v)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                value === v
                  ? v ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {v ? '👍 Yes' : '👎 No'}
            </button>
          ))}
        </div>
      );

    case 'slider': {
      const min = 0;
      const max = (field.maxStars ?? 10);
      return (
        <div>
          <input
            type="range"
            min={min}
            max={max}
            value={(value as number) ?? Math.round(max / 2)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="text-center text-sm font-medium">{(value as number) ?? Math.round(max / 2)}</div>
        </div>
      );
    }

    default:
      return <div className="text-xs text-gray-400">Unsupported field type: {field.type}</div>;
  }
}
