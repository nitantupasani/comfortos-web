import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  ArrowRight,
  Plus,
  FileQuestion,
  PanelsTopLeft,
  Thermometer,
  BarChart3,
} from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { tenantsApi } from '../../api/tenants';
import { fmRequestsApi, type FMRequestResponse } from '../../api/fmRequests';
import type { Building, Tenant, BuildingComfortData } from '../../types';
import { PageHeader, KpiCard, SectionCard, StatusBadge, EmptyState } from '../../components/common/ui';

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

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform health, building performance, and pending operational tasks at a glance."
        actions={
          <>
            <Link
              to="/admin/buildings/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Building
            </Link>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-2 text-sm font-medium transition-colors"
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          tone="primary"
          icon={<Building2 className="h-5 w-5" />}
          label="Buildings"
          value={loading ? '—' : buildings.length}
          hint={buildings.length ? `${buildings.filter((b) => !b.requiresAccessPermission).length} open` : undefined}
          loading={loading}
        />
        <KpiCard
          tone="violet"
          icon={<Users className="h-5 w-5" />}
          label="Tenants"
          value={loading ? '—' : tenants.length}
          loading={loading}
        />
        <KpiCard
          tone="amber"
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Pending FM Approvals"
          value={loading ? '—' : pendingRequests.length}
          hint={pendingRequests.length ? 'action needed' : 'all clear'}
          onClick={pendingRequests.length ? () => (window.location.href = '/admin/fm-approvals') : undefined}
          loading={loading}
        />
        <KpiCard
          tone="emerald"
          icon={<Activity className="h-5 w-5" />}
          label="Total Votes"
          value={loading ? '—' : totalVotes.toLocaleString()}
          hint={avgComfort != null ? `avg ${avgComfort.toFixed(1)}/10` : undefined}
          loading={loading}
        />
      </div>

      {/* Two-col area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        {/* Pending approvals */}
        <SectionCard
          className="xl:col-span-1"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Pending FM Approvals"
          description={pendingRequests.length ? `${pendingRequests.length} awaiting review` : 'No pending requests'}
          action={
            pendingRequests.length > 0 && (
              <Link
                to="/admin/fm-approvals"
                className="text-xs font-medium text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
              >
                Review all <ArrowRight className="h-3 w-3" />
              </Link>
            )
          }
          padding="none"
        >
          {pendingRequests.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Nothing pending"
              description="New facility-manager requests will appear here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingRequests.slice(0, 5).map((r) => (
                <li key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex items-center justify-center shrink-0">
                    {r.userName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{r.userName || r.userEmail}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {r.buildingName} · {r.roleRequested.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <StatusBadge tone="warning" dot>
                    Pending
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Building health */}
        <SectionCard
          className="xl:col-span-2"
          icon={<Thermometer className="h-4 w-4" />}
          title="Building health"
          description="Comfort signal across the estate"
          action={
            <Link
              to="/admin/buildings"
              className="text-xs font-medium text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
            >
              Manage buildings <ArrowRight className="h-3 w-3" />
            </Link>
          }
          padding="none"
        >
          {buildings.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-5 w-5" />}
              title="No buildings yet"
              description="Set up your first building to start collecting comfort signal."
              action={
                <Link
                  to="/admin/buildings/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Add building
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-medium">Building</th>
                    <th className="px-5 py-2.5 text-left font-medium">City</th>
                    <th className="px-5 py-2.5 text-right font-medium">Comfort</th>
                    <th className="px-5 py-2.5 text-right font-medium">Votes</th>
                    <th className="px-5 py-2.5 text-right font-medium">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buildings.slice(0, 8).map((b) => {
                    const c = comforts.get(b.id);
                    const score = c?.overallScore;
                    const tone =
                      score == null
                        ? 'neutral'
                        : score >= 7
                          ? 'success'
                          : score >= 5
                            ? 'warning'
                            : 'danger';
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">{b.name}</td>
                        <td className="px-5 py-3 text-gray-500">{b.city || '—'}</td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          {score != null ? (
                            <StatusBadge tone={tone} dot>
                              {score.toFixed(1)}
                            </StatusBadge>
                          ) : (
                            <span className="text-xs text-gray-400">no data</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{c?.totalVotes ?? 0}</td>
                        <td className="px-5 py-3 text-right">
                          <StatusBadge tone={b.requiresAccessPermission ? 'warning' : 'success'}>
                            {b.requiresAccessPermission ? 'Restricted' : 'Open'}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      <div className="mt-5">
        <SectionCard
          title="Quick actions"
          description="Common operational tasks"
          padding="md"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction
              to="/admin/buildings/new"
              icon={<Building2 className="h-4 w-4" />}
              label="Add building"
              hint="Run the setup wizard"
            />
            <QuickAction
              to="/admin/tenants"
              icon={<Users className="h-4 w-4" />}
              label="Invite tenant"
              hint="Assign building access"
            />
            <QuickAction
              to="/admin/dashboard-config"
              icon={<PanelsTopLeft className="h-4 w-4" />}
              label="Edit dashboard"
              hint="Customize occupant view"
            />
            <QuickAction
              to="/admin/vote-config"
              icon={<FileQuestion className="h-4 w-4" />}
              label="Edit vote form"
              hint="Tune comfort prompts"
            />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function QuickAction({
  to,
  icon,
  label,
  hint,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 truncate">{hint}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}
