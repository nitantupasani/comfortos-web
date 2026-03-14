import { useState } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  Thermometer, Wind, Cloud, Sun, Zap, Droplets, Users, Clock,
  Activity, AlertTriangle, BarChart3, TrendingUp, Image, Info,
  LayoutGrid, Columns, Rows, Minus, X, Settings2, ChevronDown as ChevronD,
  Copy, BookOpen, ExternalLink,
} from 'lucide-react';
import type { SduiNode } from '../../types';

/* ── Widget type metadata ───────────────────────────── */
const WIDGET_TYPES = [
  // Layout
  { value: 'column',    label: 'Column',         icon: Columns,         category: 'layout',    desc: 'Vertical stack of children' },
  { value: 'row',       label: 'Row',            icon: Rows,            category: 'layout',    desc: 'Horizontal stack of children' },
  { value: 'grid',      label: 'Grid',           icon: LayoutGrid,      category: 'layout',    desc: 'N-column grid layout' },
  { value: 'spacer',    label: 'Spacer',         icon: Minus,           category: 'layout',    desc: 'Vertical whitespace' },
  { value: 'divider',   label: 'Divider',        icon: Minus,           category: 'layout',    desc: 'Horizontal line separator' },

  // Dashboard widgets
  { value: 'weather_badge',       label: 'Weather Badge',       icon: Sun,             category: 'dashboard', desc: 'Outdoor weather pill (auto-filled)' },
  { value: 'metric_tile',         label: 'Metric Tile',         icon: Thermometer,     category: 'dashboard', desc: 'Card with icon, value, unit, label' },
  { value: 'trend_card',          label: 'Trend Card',          icon: TrendingUp,      category: 'dashboard', desc: 'Area chart with change badge' },
  { value: 'alert_banner',        label: 'Alert Banner',        icon: AlertTriangle,   category: 'dashboard', desc: 'Colored alert notification' },
  { value: 'kpi_card',            label: 'KPI Card',            icon: BarChart3,       category: 'dashboard', desc: 'Big number with trend arrow' },
  { value: 'occupancy_indicator', label: 'Occupancy Ring',      icon: Users,           category: 'dashboard', desc: 'Circular progress ring' },
  { value: 'progress_bar',        label: 'Progress Bar',        icon: Activity,        category: 'dashboard', desc: 'Horizontal progress indicator' },

  // Extended widgets
  { value: 'section_header',  label: 'Section Header',  icon: Info,     category: 'extended', desc: 'Section title with icon' },
  { value: 'stat_row',        label: 'Stat Row',         icon: Rows,     category: 'extended', desc: 'Key-value row' },
  { value: 'info_row',        label: 'Info Row',         icon: Info,     category: 'extended', desc: 'Icon + label + value row' },
  { value: 'badge_row',       label: 'Badge Row',        icon: LayoutGrid, category: 'extended', desc: 'Colored chip badges' },
  { value: 'schedule_item',   label: 'Schedule Item',    icon: Clock,    category: 'extended', desc: 'Timeline event' },
  { value: 'image_banner',    label: 'Image Banner',     icon: Image,    category: 'extended', desc: 'Gradient hero banner' },
] as const;

const ICON_OPTIONS = [
  'thermostat', 'thermometer', 'air', 'co2', 'wind', 'volume_up', 'noise',
  'wb_sunny', 'sunny', 'light', 'cloud', 'humidity', 'water_drop',
  'bolt', 'solar_power', 'energy', 'eco', 'grass',
  'favorite', 'health', 'monitor_heart', 'people', 'groups', 'person',
  'schedule', 'timer', 'access_time', 'warning', 'error', 'info',
  'apartment', 'business', 'wifi', 'sensors', 'visibility',
];

const COLOR_OPTIONS = [
  'red', 'orange', 'amber', 'yellow', 'green', 'teal', 'cyan',
  'blue', 'indigo', 'purple', 'pink', 'brown', 'grey',
];

const COLOR_HEX: Record<string, string> = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
  green: '#22c55e', teal: '#14b8a6', cyan: '#06b6d4', blue: '#3b82f6',
  indigo: '#6366f1', purple: '#a855f7', pink: '#ec4899', brown: '#92400e',
  grey: '#6b7280', gray: '#6b7280',
};

/* ── API Endpoint examples ──────────────────────────── */
const API_ENDPOINT_EXAMPLES = [
  {
    title: 'Latest readings (all metrics)',
    method: 'GET',
    path: '/telemetry/{building_id}/latest',
    description: 'Returns the most recent reading per metric type per floor/zone. Use this to populate metric_tile widgets with live sensor data.',
    example: `// Response
[
  { "metricType": "temperature", "value": 22.5, "unit": "°C", "floor": "Floor 1", "zone": "Zone A" },
  { "metricType": "co2",         "value": 420,  "unit": "ppm", "floor": "Floor 1", "zone": "Zone A" },
  { "metricType": "humidity",    "value": 55,   "unit": "%",   "floor": "Floor 1", "zone": "Zone A" },
  { "metricType": "noise",       "value": 38,   "unit": "dB",  "floor": "Floor 1", "zone": "Zone A" }
]`,
  },
  {
    title: 'Time-series data (for trend cards)',
    method: 'GET',
    path: '/telemetry/{building_id}/series?metricType=temperature&granularity=hourly',
    description: 'Returns aggregated time-series sensor data. Use for trend_card widgets showing historical patterns.',
    example: `// Query parameters:
//   metricType  = temperature | co2 | humidity | noise | ...
//   granularity = raw | hourly | daily
//   dateFrom    = 2025-03-01  (ISO date)
//   dateTo      = 2025-03-07  (ISO date)
//   floor       = Floor 1     (optional filter)
//   zone        = Zone A      (optional filter)

// Response
{
  "buildingId": "bld_abc",
  "metricType": "temperature",
  "unit": "°C",
  "granularity": "hourly",
  "series": [
    {
      "label": "Floor 1",
      "floor": "Floor 1",
      "zone": null,
      "points": [
        { "recordedAt": "2025-03-07T08:00:00Z", "value": 21.3 },
        { "recordedAt": "2025-03-07T09:00:00Z", "value": 22.1 }
      ]
    }
  ]
}`,
  },
  {
    title: 'Available metric types',
    method: 'GET',
    path: '/telemetry/{building_id}/metrics',
    description: 'Lists the distinct sensor metric types available for a building. Check this to know which metrics you can display.',
    example: `// Response
[
  { "metricType": "temperature", "unit": "°C" },
  { "metricType": "co2",         "unit": "ppm" },
  { "metricType": "humidity",    "unit": "%" },
  { "metricType": "noise",       "unit": "dB" },
  { "metricType": "light",       "unit": "lux" }
]`,
  },
  {
    title: 'Building comfort score',
    method: 'GET',
    path: '/buildings/{building_id}/comfort',
    description: 'Returns the aggregate comfort score (0–10) computed from recent votes, plus per-location breakdowns.',
    example: `// Response
{
  "buildingId": "bld_abc",
  "buildingName": "Corporate HQ",
  "overallScore": 7.4,
  "totalVotes": 128,
  "computedAt": "2025-03-14T10:30:00Z",
  "locations": [
    {
      "floor": "1", "floorLabel": "Floor 1",
      "room": "open_plan", "roomLabel": "Open Plan",
      "comfortScore": 7.8, "voteCount": 45,
      "breakdown": { "thermal_comfort": 6.2, "air_quality": 8.1, "noise_level": 7.5 }
    }
  ]
}`,
  },
  {
    title: 'Push sensor data (ingestion)',
    method: 'POST',
    path: '/telemetry/ingest',
    description: 'Batch-push sensor readings from building services. Requires X-Api-Key header (set in building config).',
    example: `// Headers: { "X-Api-Key": "your-building-api-key" }
// Request body
{
  "buildingId": "bld_abc",
  "readings": [
    {
      "metricType": "temperature",
      "value": 22.5,
      "unit": "°C",
      "floor": "Floor 1",
      "zone": "Zone A",
      "recordedAt": "2025-03-14T10:00:00Z"
    },
    {
      "metricType": "co2",
      "value": 420,
      "unit": "ppm",
      "floor": "Floor 1",
      "zone": "Zone A",
      "recordedAt": "2025-03-14T10:00:00Z"
    }
  ]
}`,
  },
  {
    title: 'Building connectors (pull-based)',
    method: 'GET',
    path: '/connectors/{building_id}',
    description: 'List registered data connectors that periodically poll external building APIs (BACnet, Modbus gateways, etc.).',
    example: `// Response
[
  {
    "id": "conn_xyz",
    "buildingId": "bld_abc",
    "name": "BMS Temperature Feed",
    "baseUrl": "https://bms.example.com/api/sensors",
    "httpMethod": "GET",
    "authType": "bearer_token",
    "pollIntervalSeconds": 300,
    "isActive": true,
    "lastPolledAt": "2025-03-14T10:00:00Z",
    "lastStatus": "success"
  }
]`,
  },
];

/* ── Helpers ─────────────────────────────────────────── */
function widgetMeta(type: string) {
  return WIDGET_TYPES.find((t) => t.value === type);
}

function defaultNode(type: string): SduiNode {
  switch (type) {
    case 'column':              return { type, crossAxisAlignment: 'stretch', children: [] };
    case 'row':                 return { type, mainAxisAlignment: 'spaceBetween', children: [] };
    case 'grid':                return { type, columns: 3, children: [] };
    case 'spacer':              return { type, height: 16 };
    case 'divider':             return { type };
    case 'weather_badge':       return { type, temp: '--', unit: '°C', label: 'Outside', icon: 'wb_sunny' };
    case 'metric_tile':         return { type, icon: 'thermostat', value: '22', unit: '°C', label: 'Temperature' };
    case 'trend_card':          return { type, title: 'Temperature', subtitle: 'Last 24h', change: '+0.5°C', data: [20, 21, 22, 21.5, 22, 23, 22] };
    case 'alert_banner':        return { type, icon: 'warning', title: 'Alert', subtitle: 'Check HVAC system', color: 'orange' };
    case 'kpi_card':            return { type, label: 'Comfort Score', value: '7.4', unit: '/10', trend: 'up' };
    case 'occupancy_indicator': return { type, value: 65, label: 'Occupancy', color: 'blue' };
    case 'progress_bar':        return { type, label: 'Energy Target', value: 72, color: 'green' };
    case 'section_header':      return { type, title: 'Section', icon: 'info' };
    case 'stat_row':            return { type, icon: 'thermostat', label: 'Temperature', value: '22°C' };
    case 'info_row':            return { type, icon: 'info', label: 'Status', value: 'Normal' };
    case 'badge_row':           return { type, badges: [{ label: 'Good', color: 'green' }, { label: 'Stable', color: 'blue' }] };
    case 'schedule_item':       return { type, time: '09:00', title: 'Team Standup', subtitle: 'Room 3A' };
    case 'image_banner':        return { type, title: 'Welcome', subtitle: 'Building comfort dashboard', color: 'blue' };
    default:                    return { type };
  }
}

/* ── Props ───────────────────────────────────────────── */
interface Props {
  config: SduiNode | null;
  onChange: (config: SduiNode) => void;
}

/* ════════════════════════════════════════════════════════ */
export default function DashboardVisualEditor({ config, onChange }: Props) {
  const root: SduiNode = config ?? { type: 'column', crossAxisAlignment: 'stretch', children: [] };
  const children = (root.children as SduiNode[]) ?? [];

  const setChildren = (newChildren: SduiNode[]) => {
    onChange({ ...root, children: newChildren });
  };

  const addWidget = (type: string) => {
    setChildren([...children, defaultNode(type)]);
    setAddingType(null);
  };

  const updateChild = (index: number, updated: SduiNode) => {
    const c = [...children];
    c[index] = updated;
    setChildren(c);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const moveChild = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= children.length) return;
    const c = [...children];
    [c[from], c[to]] = [c[to], c[from]];
    setChildren(c);
  };

  const [addingType, setAddingType] = useState<string | null>(null);
  const [showApiRef, setShowApiRef] = useState(false);

  return (
    <div className="space-y-6">
      {/* ── Root settings ──────────────────────────────── */}
      <RootSettingsPanel root={root} onChange={onChange} />

      {/* ── API Reference ──────────────────────────────── */}
      <ApiEndpointReference open={showApiRef} onToggle={() => setShowApiRef(!showApiRef)} />

      {/* ── Widget cards ───────────────────────────────── */}
      {children.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
          <LayoutGrid className="mx-auto h-10 w-10 mb-2" />
          <p className="text-sm font-medium">No widgets yet</p>
          <p className="text-xs mt-1">Add widgets below to build your dashboard layout</p>
        </div>
      )}

      {children.map((child, idx) => (
        <WidgetCard
          key={idx}
          node={child}
          index={idx}
          total={children.length}
          onUpdate={(n) => updateChild(idx, n)}
          onRemove={() => removeChild(idx)}
          onMove={(dir) => moveChild(idx, dir)}
        />
      ))}

      {/* ── Add widget button ──────────────────────────── */}
      {addingType === null ? (
        <button
          onClick={() => setAddingType('pick')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 py-4 text-sm font-semibold text-teal-600 transition hover:bg-teal-50 hover:border-teal-400"
        >
          <Plus className="h-5 w-5" /> Add Widget
        </button>
      ) : (
        <WidgetPicker onPick={addWidget} onCancel={() => setAddingType(null)} />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Root column settings                                */
/* ──────────────────────────────────────────────────────── */
function RootSettingsPanel({ root, onChange }: { root: SduiNode; onChange: (n: SduiNode) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Settings2 className="h-4 w-4 text-teal-500" />
          Dashboard Root Settings
          <span className="text-xs font-normal text-gray-400">— {root.type} layout</span>
        </span>
        <ChevronD className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t px-4 py-4 space-y-3 bg-gray-50/50">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Root Type">
              <select
                value={root.type}
                onChange={(e) => onChange({ ...root, type: e.target.value })}
                className="input"
              >
                <option value="column">Column (vertical)</option>
                <option value="row">Row (horizontal)</option>
              </select>
            </Field>
            <Field label="Cross Axis Alignment">
              <select
                value={(root.crossAxisAlignment as string) ?? 'stretch'}
                onChange={(e) => onChange({ ...root, crossAxisAlignment: e.target.value })}
                className="input"
              >
                <option value="stretch">Stretch</option>
                <option value="center">Center</option>
                <option value="start">Start</option>
                <option value="end">End</option>
              </select>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── API endpoint reference panel                        */
/* ──────────────────────────────────────────────────────── */
function ApiEndpointReference({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-white overflow-hidden">
      <button onClick={onToggle} className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-blue-50/50 transition">
        <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <BookOpen className="h-4 w-4 text-blue-500" />
          Environment Data API Endpoints
          <span className="text-xs font-normal text-blue-400">— reference for populating dashboard widgets</span>
        </span>
        <ChevronD className={`h-4 w-4 text-blue-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-blue-100 divide-y divide-blue-50">
          {API_ENDPOINT_EXAMPLES.map((ep, idx) => (
            <div key={idx} className="px-4 py-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      ep.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-gray-800">{ep.path}</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{ep.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(ep.path, idx)}
                    className="p-1.5 rounded hover:bg-blue-50 transition"
                    title="Copy endpoint path"
                  >
                    {copiedIdx === idx
                      ? <span className="text-xs text-green-600 font-medium">Copied!</span>
                      : <Copy className="h-3.5 w-3.5 text-gray-400" />
                    }
                  </button>
                </div>
              </div>
              <details className="group">
                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Show example response
                </summary>
                <pre className="mt-2 text-[11px] leading-relaxed font-mono bg-gray-900 text-green-300 rounded-lg p-3 overflow-x-auto max-h-56 whitespace-pre">
                  {ep.example}
                </pre>
              </details>
            </div>
          ))}
          <div className="px-4 py-3 bg-blue-50/80">
            <p className="text-xs text-blue-600">
              <strong>Tip:</strong> Use <code className="bg-blue-100 px-1 rounded">metric_tile</code> widgets with data from <code className="bg-blue-100 px-1 rounded">/telemetry/&#123;id&#125;/latest</code> for live sensor values.
              Use <code className="bg-blue-100 px-1 rounded">trend_card</code> widgets with <code className="bg-blue-100 px-1 rounded">/telemetry/&#123;id&#125;/series</code> for historical charts.
              The <code className="bg-blue-100 px-1 rounded">weather_badge</code> is auto-populated from live weather data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Widget picker                                       */
/* ──────────────────────────────────────────────────────── */
function WidgetPicker({ onPick, onCancel }: { onPick: (type: string) => void; onCancel: () => void }) {
  const categories = [
    { key: 'layout', label: 'Layout', color: 'gray' },
    { key: 'dashboard', label: 'Dashboard Widgets', color: 'teal' },
    { key: 'extended', label: 'Extended Widgets', color: 'indigo' },
  ];

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">Choose widget type</span>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>
      {categories.map(({ key, label }) => {
        const items = WIDGET_TYPES.filter((t) => t.category === key);
        return (
          <div key={key} className="mb-4 last:mb-0">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => onPick(t.value)}
                    className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm hover:border-teal-400 hover:bg-teal-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-teal-500 shrink-0" />
                      <span className="text-gray-700 font-medium">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 leading-tight">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Individual widget card                              */
/* ──────────────────────────────────────────────────────── */
interface WidgetCardProps {
  node: SduiNode;
  index: number;
  total: number;
  onUpdate: (node: SduiNode) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

function WidgetCard({ node, index, total, onUpdate, onRemove, onMove }: WidgetCardProps) {
  const meta = widgetMeta(node.type);
  const Icon = meta?.icon ?? Info;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isContainer = ['column', 'row', 'grid', 'padding', 'container'].includes(node.type);

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
          {meta?.label ?? node.type}
        </span>
        <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${
          meta?.category === 'layout' ? 'bg-gray-100 text-gray-500' :
          meta?.category === 'dashboard' ? 'bg-teal-50 text-teal-600' :
          'bg-indigo-50 text-indigo-600'
        }`}>
          {meta?.category ?? 'widget'}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition" title="Move up">
            <ChevronUp className="h-4 w-4 text-gray-500" />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition" title="Move down">
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="p-1 rounded hover:bg-red-50 transition" title="Delete widget">
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

      {/* Body — type-specific fields */}
      <div className="px-4 py-4 space-y-3">
        <WidgetPropertyEditor node={node} onUpdate={onUpdate} />

        {/* Nested children for containers */}
        {isContainer && (
          <NestedChildrenEditor node={node} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Property editor per widget type                     */
/* ──────────────────────────────────────────────────────── */
function WidgetPropertyEditor({ node, onUpdate }: { node: SduiNode; onUpdate: (n: SduiNode) => void }) {
  const set = (patch: Record<string, unknown>) => onUpdate({ ...node, ...patch });

  switch (node.type) {
    case 'spacer':
      return (
        <Field label="Height (px)">
          <input type="number" min={0} max={200} value={Number(node.height ?? 16)} onChange={(e) => set({ height: Number(e.target.value) })} className="input w-24" />
        </Field>
      );

    case 'grid':
      return (
        <Field label="Columns">
          <input type="number" min={1} max={6} value={Number(node.columns ?? 3)} onChange={(e) => set({ columns: Number(e.target.value) })} className="input w-24" />
        </Field>
      );

    case 'weather_badge':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Temperature"><input value={String(node.temp ?? '')} onChange={(e) => set({ temp: e.target.value })} className="input" placeholder="22" /></Field>
          <Field label="Unit"><input value={String(node.unit ?? '')} onChange={(e) => set({ unit: e.target.value })} className="input" placeholder="°C" /></Field>
          <Field label="Label"><input value={String(node.label ?? '')} onChange={(e) => set({ label: e.target.value })} className="input" placeholder="Outside" /></Field>
          <Field label="Icon"><IconPicker value={String(node.icon ?? '')} onChange={(v) => set({ icon: v })} /></Field>
        </div>
      );

    case 'metric_tile':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Value"><input value={String(node.value ?? '')} onChange={(e) => set({ value: e.target.value })} className="input" placeholder="22.5" /></Field>
          <Field label="Unit"><input value={String(node.unit ?? '')} onChange={(e) => set({ unit: e.target.value })} className="input" placeholder="°C" /></Field>
          <Field label="Label"><input value={String(node.label ?? '')} onChange={(e) => set({ label: e.target.value })} className="input" placeholder="Temperature" /></Field>
          <Field label="Icon"><IconPicker value={String(node.icon ?? '')} onChange={(v) => set({ icon: v })} /></Field>
        </div>
      );

    case 'trend_card':
      return (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title"><input value={String(node.title ?? '')} onChange={(e) => set({ title: e.target.value })} className="input" /></Field>
            <Field label="Subtitle"><input value={String(node.subtitle ?? '')} onChange={(e) => set({ subtitle: e.target.value })} className="input" /></Field>
          </div>
          <Field label="Change badge"><input value={String(node.change ?? '')} onChange={(e) => set({ change: e.target.value })} className="input" placeholder="+0.5°C" /></Field>
          <Field label="Data points (comma-separated numbers)">
            <input
              value={Array.isArray(node.data) ? (node.data as number[]).join(', ') : ''}
              onChange={(e) => {
                const nums = e.target.value.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
                set({ data: nums });
              }}
              className="input text-xs font-mono"
              placeholder="20, 21, 22, 21.5, 22, 23, 22"
            />
          </Field>
        </div>
      );

    case 'alert_banner':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title"><input value={String(node.title ?? '')} onChange={(e) => set({ title: e.target.value })} className="input" /></Field>
          <Field label="Subtitle"><input value={String(node.subtitle ?? '')} onChange={(e) => set({ subtitle: e.target.value })} className="input" /></Field>
          <Field label="Icon"><IconPicker value={String(node.icon ?? '')} onChange={(v) => set({ icon: v })} /></Field>
          <Field label="Color"><ColorPicker value={String(node.color ?? '')} onChange={(v) => set({ color: v })} /></Field>
        </div>
      );

    case 'kpi_card':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Label"><input value={String(node.label ?? '')} onChange={(e) => set({ label: e.target.value })} className="input" /></Field>
          <Field label="Value"><input value={String(node.value ?? '')} onChange={(e) => set({ value: e.target.value })} className="input" /></Field>
          <Field label="Unit"><input value={String(node.unit ?? '')} onChange={(e) => set({ unit: e.target.value })} className="input" placeholder="/10" /></Field>
          <Field label="Trend">
            <select value={String(node.trend ?? '')} onChange={(e) => set({ trend: e.target.value || undefined })} className="input">
              <option value="">None</option>
              <option value="up">↑ Up</option>
              <option value="down">↓ Down</option>
            </select>
          </Field>
        </div>
      );

    case 'occupancy_indicator':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Value (%)"><input type="number" min={0} max={100} value={Number(node.value ?? 0)} onChange={(e) => set({ value: Number(e.target.value) })} className="input w-24" /></Field>
          <Field label="Label"><input value={String(node.label ?? '')} onChange={(e) => set({ label: e.target.value })} className="input" /></Field>
          <Field label="Color"><ColorPicker value={String(node.color ?? '')} onChange={(v) => set({ color: v })} /></Field>
        </div>
      );

    case 'progress_bar':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Label"><input value={String(node.label ?? '')} onChange={(e) => set({ label: e.target.value })} className="input" /></Field>
          <Field label="Value (%)"><input type="number" min={0} max={100} value={Number(node.value ?? 0)} onChange={(e) => set({ value: Number(e.target.value) })} className="input w-24" /></Field>
          <Field label="Color"><ColorPicker value={String(node.color ?? '')} onChange={(v) => set({ color: v })} /></Field>
        </div>
      );

    case 'section_header':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title"><input value={String(node.title ?? '')} onChange={(e) => set({ title: e.target.value })} className="input" /></Field>
          <Field label="Subtitle"><input value={String(node.subtitle ?? '')} onChange={(e) => set({ subtitle: e.target.value })} className="input" /></Field>
          <Field label="Icon"><IconPicker value={String(node.icon ?? '')} onChange={(v) => set({ icon: v })} /></Field>
        </div>
      );

    case 'stat_row':
    case 'info_row':
      return (
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Icon"><IconPicker value={String(node.icon ?? '')} onChange={(v) => set({ icon: v })} /></Field>
          <Field label="Label"><input value={String(node.label ?? '')} onChange={(e) => set({ label: e.target.value })} className="input" /></Field>
          <Field label="Value"><input value={String(node.value ?? '')} onChange={(e) => set({ value: e.target.value })} className="input" /></Field>
        </div>
      );

    case 'badge_row': {
      const badges = ((node.badges ?? node.items ?? []) as { label: string; color: string }[]);
      return (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">Badges</label>
          {badges.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={b.label} onChange={(e) => {
                const updated = [...badges];
                updated[i] = { ...updated[i], label: e.target.value };
                set({ badges: updated });
              }} className="input flex-1 text-sm" placeholder="Label" />
              <ColorPicker value={b.color} onChange={(c) => {
                const updated = [...badges];
                updated[i] = { ...updated[i], color: c };
                set({ badges: updated });
              }} />
              <button onClick={() => set({ badges: badges.filter((_, j) => j !== i) })} className="p-1 rounded hover:bg-red-50">
                <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))}
          <button onClick={() => set({ badges: [...badges, { label: 'New', color: 'blue' }] })} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add badge
          </button>
        </div>
      );
    }

    case 'schedule_item':
      return (
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Time"><input value={String(node.time ?? '')} onChange={(e) => set({ time: e.target.value })} className="input" placeholder="09:00" /></Field>
          <Field label="Title"><input value={String(node.title ?? '')} onChange={(e) => set({ title: e.target.value })} className="input" /></Field>
          <Field label="Subtitle"><input value={String(node.subtitle ?? '')} onChange={(e) => set({ subtitle: e.target.value })} className="input" /></Field>
        </div>
      );

    case 'image_banner':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title"><input value={String(node.title ?? '')} onChange={(e) => set({ title: e.target.value })} className="input" /></Field>
          <Field label="Subtitle"><input value={String(node.subtitle ?? '')} onChange={(e) => set({ subtitle: e.target.value })} className="input" /></Field>
          <Field label="Color"><ColorPicker value={String(node.color ?? '')} onChange={(v) => set({ color: v })} /></Field>
        </div>
      );

    case 'column':
    case 'row':
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Cross Axis Alignment">
            <select value={String(node.crossAxisAlignment ?? 'center')} onChange={(e) => set({ crossAxisAlignment: e.target.value })} className="input">
              <option value="stretch">Stretch</option><option value="center">Center</option><option value="start">Start</option><option value="end">End</option>
            </select>
          </Field>
          <Field label="Main Axis Alignment">
            <select value={String(node.mainAxisAlignment ?? 'start')} onChange={(e) => set({ mainAxisAlignment: e.target.value })} className="input">
              <option value="start">Start</option><option value="end">End</option><option value="center">Center</option>
              <option value="spaceBetween">Space Between</option><option value="spaceAround">Space Around</option><option value="spaceEvenly">Space Evenly</option>
            </select>
          </Field>
        </div>
      );

    case 'divider':
    case 'padding':
    case 'container':
    case 'sizedBox':
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────── */
/* ── Nested children editor for container widgets        */
/* ──────────────────────────────────────────────────────── */
function NestedChildrenEditor({ node, onUpdate }: { node: SduiNode; onUpdate: (n: SduiNode) => void }) {
  const children = (node.children as SduiNode[]) ?? [];
  const [adding, setAdding] = useState(false);

  const setChildren = (c: SduiNode[]) => onUpdate({ ...node, children: c });

  const addChild = (type: string) => {
    setChildren([...children, defaultNode(type)]);
    setAdding(false);
  };

  const moveChild = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= children.length) return;
    const c = [...children];
    [c[from], c[to]] = [c[to], c[from]];
    setChildren(c);
  };

  return (
    <div className="mt-3 pl-4 border-l-2 border-teal-200 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">Nested children ({children.length})</label>
      </div>

      {children.map((child, idx) => (
        <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{idx + 1}.</span>
            <span className="text-xs font-medium text-gray-600">{widgetMeta(child.type)?.label ?? child.type}</span>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => moveChild(idx, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30">
                <ChevronUp className="h-3 w-3 text-gray-400" />
              </button>
              <button onClick={() => moveChild(idx, 1)} disabled={idx === children.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
              <button onClick={() => setChildren(children.filter((_, i) => i !== idx))} className="p-0.5 rounded hover:bg-red-50">
                <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
          <WidgetPropertyEditor node={child} onUpdate={(updated) => {
            const c = [...children];
            c[idx] = updated;
            setChildren(c);
          }} />
        </div>
      ))}

      {!adding ? (
        <button onClick={() => setAdding(true)} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> Add nested widget
        </button>
      ) : (
        <div className="rounded-lg border border-teal-100 bg-white p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Choose type</span>
            <button onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {WIDGET_TYPES.filter((t) => t.category !== 'layout' || t.value === 'spacer' || t.value === 'divider').map((t) => {
              const WIcon = t.icon;
              return (
                <button key={t.value} onClick={() => addChild(t.value)} className="flex items-center gap-1.5 rounded border border-gray-100 px-2 py-1.5 text-xs hover:border-teal-300 hover:bg-teal-50 transition text-left">
                  <WIcon className="h-3 w-3 text-teal-500 shrink-0" />
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
/* ── Icon picker                                         */
/* ──────────────────────────────────────────────────────── */
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="input w-full text-left flex items-center justify-between">
        <span className="text-xs font-mono">{value || 'Select…'}</span>
        <ChevronD className="h-3 w-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 w-64 max-h-48 overflow-y-auto grid grid-cols-3 gap-1">
          {ICON_OPTIONS.map((ico) => (
            <button
              key={ico}
              onClick={() => { onChange(ico); setOpen(false); }}
              className={`text-xs px-2 py-1.5 rounded text-left hover:bg-teal-50 transition ${value === ico ? 'bg-teal-100 text-teal-700 font-medium' : 'text-gray-600'}`}
            >
              {ico}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Color picker                                        */
/* ──────────────────────────────────────────────────────── */
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="input w-full text-left flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: COLOR_HEX[value] ?? '#6b7280' }} />
        <span className="text-xs">{value || 'Select…'}</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1.5 w-52">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-gray-50 transition ${value === c ? 'ring-2 ring-teal-400' : ''}`}
            >
              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COLOR_HEX[c] }} />
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* ── Shared field wrapper                                */
/* ──────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
