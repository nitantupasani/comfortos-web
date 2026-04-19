import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type KpiTone = 'primary' | 'blue' | 'violet' | 'amber' | 'emerald' | 'rose' | 'slate';

const TONE_MAP: Record<KpiTone, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200' },
};

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  tone?: KpiTone;
  delta?: { value: number; label?: string; direction?: 'up' | 'down' | 'flat' };
  loading?: boolean;
  onClick?: () => void;
}

export default function KpiCard({ icon, label, value, hint, tone = 'primary', delta, loading, onClick }: KpiCardProps) {
  const t = TONE_MAP[tone];
  const interactive = onClick
    ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
    : '';

  const deltaEl = delta && (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        delta.direction === 'up' ? 'text-emerald-600' : delta.direction === 'down' ? 'text-rose-600' : 'text-gray-500'
      }`}
    >
      {delta.direction === 'up' && <ArrowUpRight className="h-3 w-3" />}
      {delta.direction === 'down' && <ArrowDownRight className="h-3 w-3" />}
      {delta.direction === 'flat' && <Minus className="h-3 w-3" />}
      {delta.value > 0 ? '+' : ''}
      {delta.value}
      {delta.label && <span className="text-gray-400 font-normal ml-1">{delta.label}</span>}
    </span>
  );

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-5 transition-all ${interactive}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-lg ${t.bg} ${t.text} ring-1 ${t.ring} flex items-center justify-center`}>
          {icon}
        </div>
        {deltaEl}
      </div>
      <div className="mt-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{label}</div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-gray-900 tabular-nums">
            {loading ? <span className="inline-block w-12 h-7 rounded bg-gray-100 animate-pulse" /> : value}
          </span>
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
