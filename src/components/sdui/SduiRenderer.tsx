import type { SduiNode } from '../../types';
import {
  Thermometer, Wind, Volume2, Sun, Cloud, Droplets, Zap, Leaf, Activity,
  Users, Clock, AlertTriangle, Info, Building2, Wifi, Eye,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import TelemetryChartNode from './TelemetryChartNode';

const ICON_MAP: Record<string, React.ElementType> = {
  thermostat: Thermometer, thermometer: Thermometer,
  air: Wind, co2: Cloud, wind: Wind,
  volume_up: Volume2, noise: Volume2,
  wb_sunny: Sun, sunny: Sun, light: Sun,
  cloud: Cloud, humidity: Droplets, water_drop: Droplets,
  bolt: Zap, solar_power: Zap, energy: Zap,
  eco: Leaf, grass: Leaf,
  favorite: Activity, health: Activity, monitor_heart: Activity,
  people: Users, groups: Users, person: Users,
  schedule: Clock, timer: Clock, access_time: Clock,
  warning: AlertTriangle, error: AlertTriangle,
  info: Info,
  apartment: Building2, business: Building2,
  wifi: Wifi, sensors: Wifi,
  visibility: Eye,
};

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
  green: '#22c55e', teal: '#14b8a6', cyan: '#06b6d4', blue: '#3b82f6',
  indigo: '#6366f1', purple: '#a855f7', pink: '#ec4899', brown: '#92400e',
  grey: '#6b7280', gray: '#6b7280',
};

function resolveIcon(name?: string) {
  if (!name) return null;
  const Comp = ICON_MAP[name] ?? ICON_MAP[name.toLowerCase()];
  return Comp ? <Comp className="h-5 w-5" /> : null;
}

function resolveColor(name?: string): string {
  return COLOR_MAP[name ?? ''] ?? '#3b82f6';
}

/* ─── Render a single SDUI node ─── */
function renderNode(node: SduiNode): React.ReactNode {
  const { type } = node;
  const children = (node.children as SduiNode[] | undefined) ?? [];

  switch (type) {
    /* Layouts */
    case 'column':
      return (
        <div className="flex flex-col gap-1" style={{ alignItems: node.crossAxisAlignment === 'center' ? 'center' : 'stretch' }}>
          {children.map((c, i) => <div key={i}>{renderNode(c)}</div>)}
        </div>
      );
    case 'row':
      return (
        <div className="flex gap-2 items-center">
          {children.map((c, i) => <div key={i} className="flex-1">{renderNode(c)}</div>)}
        </div>
      );
    case 'grid': {
      const cols = (node.columns as number) ?? 3;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {children.map((c, i) => <div key={i}>{renderNode(c)}</div>)}
        </div>
      );
    }
    case 'spacer':
      return <div style={{ height: Number(node.height ?? 8) }} />;
    case 'divider':
      return <hr className="border-gray-200 my-2" />;
    case 'padding':
      return (
        <div style={{ padding: Number(node.all ?? node.padding ?? 8) }}>
          {children.map((c, i) => <div key={i}>{renderNode(c)}</div>)}
        </div>
      );
    case 'container':
      return (
        <div className="rounded-lg" style={{ backgroundColor: node.color ? resolveColor(node.color as string) + '10' : undefined }}>
          {children.map((c, i) => <div key={i}>{renderNode(c)}</div>)}
        </div>
      );
    case 'sizedBox':
      return <div style={{ width: Number(node.width ?? 0), height: Number(node.height ?? 0) }} />;

    /* Dashboard Widgets */
    case 'weather_badge':
      return (
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-medium w-fit">
          <span>{node.icon === 'wb_sunny' ? '☀️' : '🌤️'}</span>
          <span>{String(node.temp ?? '')}{String(node.unit ?? '')}</span>
          <span className="text-blue-500">{String(node.label ?? '')}</span>
        </div>
      );

    case 'metric_tile':
      return (
        <div className="bg-white rounded-xl border p-4 flex flex-col items-center gap-1 shadow-sm">
          <div className="text-primary-500">{resolveIcon(node.icon as string)}</div>
          <div className="text-2xl font-bold">{node.value as string}</div>
          <div className="text-xs text-gray-400">{node.unit as string}</div>
          <div className="text-xs text-gray-500 font-medium">{node.label as string}</div>
        </div>
      );

    case 'trend_card': {
      const data = ((node.data as number[]) ?? []).map((v, i) => ({ v, i }));
      return (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold text-sm">{node.title as string}</div>
              <div className="text-xs text-gray-400">{node.subtitle as string}</div>
            </div>
            {node.change ? (
              <span className="text-xs font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                {String(node.change)}
              </span>
            ) : null}
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#trendGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    case 'alert_banner': {
      const color = resolveColor(node.color as string);
      return (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: color + '15', color }}>
          <div className="mt-0.5">{resolveIcon(node.icon as string)}</div>
          <div>
            <div className="font-semibold text-sm">{node.title as string}</div>
            <div className="text-xs opacity-80 mt-0.5">{node.subtitle as string}</div>
          </div>
        </div>
      );
    }

    case 'primary_action':
      return (
        <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm">
          {node.label as string}
        </button>
      );

    case 'section_header':
      return (
        <div className="flex items-center gap-2 mt-2">
          {resolveIcon(node.icon as string)}
          <h3 className="font-semibold text-gray-800">{String(node.title ?? '')}</h3>
          {node.subtitle ? <span className="text-xs text-gray-400 ml-auto">{String(node.subtitle)}</span> : null}
        </div>
      );

    case 'stat_row':
      return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {resolveIcon(node.icon as string)}
            {node.label as string}
          </div>
          <span className="font-semibold text-sm">{node.value as string}</span>
        </div>
      );

    case 'progress_bar': {
      const pct = Number(node.value ?? node.progress ?? 0);
      const color = resolveColor(node.color as string);
      return (
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{node.label as string}</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
        </div>
      );
    }

    case 'kpi_card': {
      const trend = node.trend as string | undefined;
      return (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">{node.label as string}</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{node.value as string}</span>
            {node.unit ? <span className="text-sm text-gray-400 mb-1">{String(node.unit)}</span> : null}
            {trend ? <span className={`text-xs ml-auto ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{trend === 'up' ? '↑' : '↓'}</span> : null}
          </div>
        </div>
      );
    }

    case 'occupancy_indicator': {
      const pct = Number(node.value ?? 0);
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (pct / 100) * circumference;
      return (
        <div className="flex flex-col items-center p-4">
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="45" fill="none" stroke={resolveColor(node.color as string ?? 'blue')}
              strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference}
              strokeDashoffset={offset} transform="rotate(-90 50 50)"
              className="score-ring"
            />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="text-lg font-bold" fill="#1f2937">
              {pct}%
            </text>
          </svg>
          {node.label ? <div className="text-sm text-gray-500 mt-1">{String(node.label)}</div> : null}
        </div>
      );
    }

    case 'schedule_item':
      return (
        <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
          <div className="text-xs text-gray-400 w-14 shrink-0 pt-0.5">{node.time as string}</div>
          <div>
            <div className="text-sm font-medium">{node.title as string}</div>
            {node.subtitle ? <div className="text-xs text-gray-400">{String(node.subtitle)}</div> : null}
          </div>
        </div>
      );

    case 'badge_row': {
      const badges = (node.badges ?? node.items ?? []) as { label: string; color: string }[];
      return (
        <div className="flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ backgroundColor: resolveColor(b.color) }}>
              {b.label}
            </span>
          ))}
        </div>
      );
    }

    case 'image_banner': {
      const color = resolveColor(node.color as string ?? 'blue');
      return (
        <div className="rounded-xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
          <div className="text-xl font-bold">{node.title as string}</div>
          {node.subtitle ? <div className="text-sm opacity-90 mt-1">{String(node.subtitle)}</div> : null}
        </div>
      );
    }

    case 'info_row':
      return (
        <div className="flex items-center gap-2 py-1 text-sm">
          {resolveIcon(node.icon as string)}
          <span className="text-gray-500">{node.label as string}</span>
          <span className="ml-auto font-medium">{node.value as string}</span>
        </div>
      );

    case 'room_selector':
      return (
        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600">
          📍 {node.room as string}
        </div>
      );

    case 'gauge': {
      const value = Number(node.value ?? 0);
      const min = Number(node.min ?? 0);
      const max = Number(node.max ?? 100);
      const range = Math.max(max - min, 0.0001);
      const pct = Math.min(Math.max((value - min) / range, 0), 1);
      const color = resolveColor(node.color as string);
      // Half-circle gauge: 180° arc from left to right.
      const r = 60;
      const cx = 80;
      const cy = 80;
      const circumference = Math.PI * r;
      const dash = pct * circumference;
      // Threshold band markers (optional)
      const bands = (node.bands as { from: number; to: number; color: string }[] | undefined) ?? [];
      return (
        <div className="bg-white rounded-xl border p-4 shadow-sm flex flex-col items-center">
          {node.label ? <div className="text-xs text-gray-400 mb-1">{String(node.label)}</div> : null}
          <svg width="160" height="100" viewBox="0 0 160 100">
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round"
            />
            {bands.map((b, i) => {
              const bandStart = Math.min(Math.max((b.from - min) / range, 0), 1);
              const bandEnd = Math.min(Math.max((b.to - min) / range, 0), 1);
              const offset = bandStart * circumference;
              const len = (bandEnd - bandStart) * circumference;
              return (
                <path
                  key={i}
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none"
                  stroke={resolveColor(b.color)}
                  strokeOpacity={0.25}
                  strokeWidth="12"
                  strokeLinecap="butt"
                  strokeDasharray={`${len} ${circumference}`}
                  strokeDashoffset={-offset}
                />
              );
            })}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
            <text x={cx} y={cy - 6} textAnchor="middle" className="text-xl font-bold" fill="#1f2937">
              {value}
            </text>
            {node.unit ? (
              <text x={cx} y={cy + 12} textAnchor="middle" className="text-[10px]" fill="#94a3b8">
                {String(node.unit)}
              </text>
            ) : null}
          </svg>
          <div className="flex justify-between w-full text-[10px] text-gray-400 px-2">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    case 'heatmap_strip': {
      const cells = (node.cells as { label: string; value: number; color?: string }[] | undefined) ?? [];
      const min = Number(node.min ?? 0);
      const max = Number(node.max ?? 100);
      const range = Math.max(max - min, 0.0001);
      // Pick color from a 5-stop scale by value; cell.color overrides.
      const stops = ['#1d4ed8', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      const pickColor = (v: number) => {
        const t = Math.min(Math.max((v - min) / range, 0), 1);
        const idx = Math.min(Math.floor(t * stops.length), stops.length - 1);
        return stops[idx];
      };
      const cols = Number(node.columns ?? 7);
      return (
        <div className="bg-white rounded-xl border p-3 shadow-sm">
          {node.title ? <div className="text-sm font-semibold text-gray-700 mb-2">{String(node.title)}</div> : null}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {cells.map((c, i) => (
              <div
                key={i}
                className="rounded-md flex flex-col items-center justify-center py-2 text-white text-[10px] font-medium"
                style={{ backgroundColor: c.color ? resolveColor(c.color) : pickColor(c.value) }}
                title={`${c.label}: ${c.value}${node.unit ? String(node.unit) : ''}`}
              >
                <span className="opacity-90">{c.label}</span>
                <span className="font-bold text-[12px]">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
            <span>{min}{node.unit ? String(node.unit) : ''}</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: `linear-gradient(to right, ${stops.join(',')})` }} />
            <span>{max}{node.unit ? String(node.unit) : ''}</span>
          </div>
        </div>
      );
    }

    case 'bar_list': {
      const items = (node.items as { label: string; value: number; color?: string }[] | undefined) ?? [];
      const maxV = items.reduce((m, it) => Math.max(m, it.value), 1);
      return (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          {node.title ? <div className="text-sm font-semibold text-gray-700 mb-3">{String(node.title)}</div> : null}
          <div className="space-y-2">
            {items.map((it, i) => {
              const w = Math.max((it.value / maxV) * 100, 4);
              const color = resolveColor(it.color ?? (node.color as string) ?? 'teal');
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-gray-600 truncate">{it.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: color }} />
                  </div>
                  <span className="w-12 text-right font-semibold tabular-nums">
                    {it.value}{node.unit ? String(node.unit) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'telemetry_chart':
      return (
        <TelemetryChartNode
          metricType={node.metricType as string | undefined}
          title={node.title as string | undefined}
          unit={node.unit as string | undefined}
          timeRanges={node.timeRanges as { label: string; hours: number; granularity: 'raw' | 'hourly' | 'daily' }[] | undefined}
          groupBy={node.groupBy as 'room' | 'floor' | 'wing' | undefined}
          height={node.height as number | undefined}
          chartKind={node.chartKind as 'line' | 'area' | 'bar' | undefined}
        />
      );

    default:
      return null;
  }
}

/* ─── Main Component ─── */
export default function SduiRenderer({ config }: { config: SduiNode }) {
  return <div>{renderNode(config)}</div>;
}
