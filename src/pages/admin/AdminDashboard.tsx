import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Activity,
  ArrowRight,
  Plus,
  Thermometer,
  CheckCircle2,
  Circle,
  MapPin,
  Radio,
} from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { tenantsApi } from '../../api/tenants';
import { fmRequestsApi, type FMRequestResponse } from '../../api/fmRequests';
import type { Building, Tenant, BuildingComfortData } from '../../types';
import { PageHeader, KpiCard, SectionCard, StatusBadge } from '../../components/common/ui';

export default function AdminDashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [requests, setRequests] = useState<FMRequestResponse[]>([]);
  const [comforts, setComforts] = useState<Map<string, BuildingComfortData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, t, r] = await Promise.all([
          buildingsApi.list().catch(() => []),
          tenantsApi.list().catch(() => []),
          fmRequestsApi.list().catch(() => [] as FMRequestResponse[]),
        ]);
        setBuildings(b);
        setTenants(t);
        setRequests(r);

        const map = new Map<string, BuildingComfortData>();
        await Promise.all(
          b.map(async (bldg) => {
            try {
              const c = await buildingsApi.comfort(bldg.id);
              if (c) map.set(bldg.id, c);
            } catch {
              /* skip */
            }
          }),
        );
        setComforts(map);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);
  const totalVotes = useMemo(
    () => Array.from(comforts.values()).reduce((sum, c) => sum + c.totalVotes, 0),
    [comforts],
  );
  const avgComfort = useMemo(() => {
    const vals = Array.from(comforts.values()).map((c) => c.overallScore);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [comforts]);

  const isEmpty = !loading && buildings.length === 0;

  // First-use hero: no buildings yet
  if (isEmpty) {
    return (
      <>
        <PageHeader
          title="Welcome to ComfortOS"
          description="Set up your first building to start collecting comfort signal."
        />
        <GetStartedHero />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Comfort signal and setup status across your estate."
        actions={
          <Link
            to="/admin/buildings/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Building
          </Link>
        }
      />

      {/* KPI row — trimmed from 4 → 3, dropped "Tenants" (secondary) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          tone="primary"
          icon={<Building2 className="h-5 w-5" />}
          label="Buildings"
          value={loading ? '—' : buildings.length}
          loading={loading}
        />
        <KpiCard
          tone="emerald"
          icon={<Thermometer className="h-5 w-5" />}
          label="Avg Comfort"
          value={loading ? '—' : avgComfort != null ? avgComfort.toFixed(1) : '—'}
          hint={avgComfort != null ? '/ 10' : 'no data yet'}
          loading={loading}
        />
        <KpiCard
          tone="violet"
          icon={<Activity className="h-5 w-5" />}
          label="Total Votes"
          value={loading ? '—' : totalVotes.toLocaleString()}
          loading={loading}
        />
      </div>

      {/* Pending approvals alert — only when there are any */}
      {pendingRequests.length > 0 && (
        <div className="mt-4">
          <Link
            to="/admin/fm-approvals"
            className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-amber-900">
                {pendingRequests.length} facility-manager request{pendingRequests.length > 1 ? 's' : ''} awaiting review
              </div>
              <div className="text-xs text-amber-700">Approve access so FMs can manage buildings.</div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-600" />
          </Link>
        </div>
      )}

      {/* Buildings grid — primary section */}
      <div className="mt-5">
        <SectionCard
          icon={<Building2 className="h-4 w-4" />}
          title="Buildings"
          description="Setup status and live comfort per building"
          action={
            <Link
              to="/admin/buildings"
              className="text-xs font-medium text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
            >
              Manage all <ArrowRight className="h-3 w-3" />
            </Link>
          }
          padding="none"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {buildings.slice(0, 9).map((b) => (
              <BuildingCard
                key={b.id}
                building={b}
                comfort={comforts.get(b.id)}
              />
            ))}
            <AddBuildingCard />
          </div>
        </SectionCard>
      </div>

      {/* Silent debug: keep tenants count out of the way */}
      {tenants.length > 0 && (
        <div className="mt-3 text-right text-xs text-gray-400">
          {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} configured
        </div>
      )}
    </>
  );
}

function GetStartedHero() {
  const steps = [
    {
      n: 1,
      icon: <Building2 className="h-5 w-5" />,
      title: 'Add your first building',
      body: 'Name, address, and access rules.',
      cta: 'Start setup',
      to: '/admin/buildings/new',
      ready: true,
    },
    {
      n: 2,
      icon: <MapPin className="h-5 w-5" />,
      title: 'Define zones',
      body: 'Floors and rooms inside the building.',
      ready: false,
    },
    {
      n: 3,
      icon: <Radio className="h-5 w-5" />,
      title: 'Connect telemetry',
      body: 'Link your BMS or sensor API.',
      ready: false,
    },
    {
      n: 4,
      icon: <Thermometer className="h-5 w-5" />,
      title: 'Verify data is flowing',
      body: 'See live readings on the dashboard.',
      ready: false,
    },
  ];

  return (
    <div className="mt-2">
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-primary-50 via-white to-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary-700">Get started</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            4 steps to your first live building
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Most teams finish in under 10 minutes. You can skip steps and come back later.
          </div>
        </div>

        <ol className="divide-y divide-gray-100">
          {steps.map((s) => (
            <li key={s.n} className="flex items-center gap-4 px-6 py-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                s.ready
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {s.ready ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 opacity-30" />}
              </div>
              <div className="shrink-0 text-gray-400">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${s.ready ? 'text-gray-900' : 'text-gray-500'}`}>
                  Step {s.n} — {s.title}
                </div>
                <div className="text-xs text-gray-500">{s.body}</div>
              </div>
              {s.ready && s.cta && s.to && (
                <Link
                  to={s.to}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 text-sm font-medium transition-colors shadow-sm"
                >
                  {s.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {!s.ready && (
                <span className="text-xs text-gray-400">Locked</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function BuildingCard({ building, comfort }: { building: Building; comfort?: BuildingComfortData }) {
  const score = comfort?.overallScore;
  const tone =
    score == null ? 'neutral' : score >= 7 ? 'success' : score >= 5 ? 'warning' : 'danger';
  const hasVotes = (comfort?.totalVotes ?? 0) > 0;

  return (
    <Link
      to={`/admin/buildings?id=${building.id}`}
      className="group block rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{building.name}</div>
          <div className="text-xs text-gray-500 truncate">{building.city || '\u00a0'}</div>
        </div>
        {score != null ? (
          <StatusBadge tone={tone} dot>
            {score.toFixed(1)}
          </StatusBadge>
        ) : (
          <StatusBadge tone="neutral">No data</StatusBadge>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{hasVotes ? `${comfort!.totalVotes} votes` : 'Awaiting votes'}</span>
        <StatusBadge tone={building.requiresAccessPermission ? 'warning' : 'success'}>
          {building.requiresAccessPermission ? 'Restricted' : 'Open'}
        </StatusBadge>
      </div>
    </Link>
  );
}

function AddBuildingCard() {
  return (
    <Link
      to="/admin/buildings/new"
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/30 transition-colors min-h-[104px] gap-1"
    >
      <Plus className="h-5 w-5" />
      <span className="text-sm font-medium">Add building</span>
    </Link>
  );
}
