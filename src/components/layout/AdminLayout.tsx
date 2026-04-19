import { useNavigate } from 'react-router-dom';
import {
  Building2,
  BarChart3,
  Activity,
  PanelsTopLeft,
  FileQuestion,
  Eye,
  Users,
  LineChart,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import ConsoleShell, { type NavGroup } from './ConsoleShell';

const PREVIEW_ROLES: { role: UserRole; label: string }[] = [
  { role: 'occupant', label: 'Occupant' },
  { role: 'building_facility_manager', label: 'FM (Building)' },
  { role: 'tenant_facility_manager', label: 'FM (Tenant)' },
];

const ROLE_ENTRY_PATHS: Record<UserRole, string> = {
  admin: '/admin',
  building_facility_manager: '/fm',
  tenant_facility_manager: '/fm',
  occupant: '/dashboard',
};

const nav: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { to: '/admin', icon: Activity, label: 'Dashboard', end: true },
      { to: '/admin/buildings', icon: Building2, label: 'Buildings' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/building-analytics', icon: LineChart, label: 'Building Analytics' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Vote Analytics' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/tenants', icon: Users, label: 'Team & Access' },
      { to: '/admin/dashboard-config', icon: PanelsTopLeft, label: 'Dashboard Layout' },
      { to: '/admin/vote-config', icon: FileQuestion, label: 'Vote Form' },
    ],
  },
];

export default function AdminLayout() {
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  const handlePreview = (role: UserRole) => {
    setViewAsRole(role);
    navigate(ROLE_ENTRY_PATHS[role]);
  };

  const footer = (
    <div className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        <Eye className="h-3 w-3" />
        <span>Preview as</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {PREVIEW_ROLES.map(({ role, label }) => (
          <button
            key={role}
            onClick={() => handlePreview(role)}
            className="text-left px-2 py-1 rounded-md text-xs text-gray-600 hover:bg-white hover:text-primary-700 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return <ConsoleShell roleLabel="Admin" workspaceLabel="Admin Console" nav={nav} sidebarFooter={footer} />;
}
