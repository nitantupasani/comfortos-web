import { Check, Circle, LayoutDashboard, Gauge, Zap } from 'lucide-react';
import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

const TEMPLATES = [
  {
    id: 'default' as const,
    label: 'Default',
    desc: 'Weather, metrics grid, and welcome banner',
    icon: LayoutDashboard,
  },
  {
    id: 'minimal' as const,
    label: 'Minimal',
    desc: 'Clean layout with key metrics only',
    icon: Gauge,
  },
  {
    id: 'full' as const,
    label: 'Full Telemetry',
    desc: 'All metrics, trends, KPIs, and alerts',
    icon: Zap,
  },
];

export default function Step4_Finish() {
  const {
    completedSteps,
    buildingForm,
    floors,
    connector,
    metricsEnabled,
    dashboardTemplate,
    setDashboardTemplate,
  } = useBuildingWizardStore();

  const enabledMetrics = Object.entries(metricsEnabled).filter(([, v]) => v).map(([k]) => k);
  const totalRooms = floors.reduce((sum, f) => sum + f.rooms.length, 0);

  const checklist = [
    { label: 'Building Info', done: completedSteps.has(0), detail: buildingForm.name },
    { label: 'Location Hierarchy', done: completedSteps.has(1), detail: `${floors.length} floors, ${totalRooms} rooms` },
    { label: 'Data Connector', done: completedSteps.has(2), detail: connector.connectionType },
    { label: 'Metrics', done: completedSteps.has(3), detail: `${enabledMetrics.length} enabled` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Review & Launch</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review your setup and choose a dashboard template
        </p>
      </div>

      {/* Setup checklist */}
      <div className="space-y-2">
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              item.done ? 'bg-emerald-500 text-white' : 'bg-amber-200 text-amber-600'
            }`}>
              {item.done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{item.label}</div>
              <div className="text-xs text-gray-500">{item.detail || 'Skipped'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard template */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">Dashboard Template</div>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map(({ id, label, desc, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDashboardTemplate(id)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                dashboardTemplate === id
                  ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${dashboardTemplate === id ? 'text-primary-600' : 'text-gray-400'}`} />
              <div className="text-xs font-semibold text-gray-800">{label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        After launch, you can further customize the dashboard using the visual editor, configure vote forms, and manage access control.
      </div>
    </div>
  );
}
