import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  LineChart,
  BarChart3,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import TopNavShell, { type TopNavItem } from './TopNavShell';

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

const nav: TopNavItem[] = [
  { to: '/admin', icon: Activity, label: 'Dashboard', end: true },
  { to: '/admin/buildings', icon: Building2, label: 'Buildings' },
  { to: '/admin/building-analytics', icon: LineChart, label: 'Building Analytics' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Vote Analytics' },
  { to: '/admin/tenants', icon: Users, label: 'Team & Access' },
];

export default function AdminLayout() {
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  const handlePreview = (role: UserRole) => {
    setViewAsRole(role);
    navigate(ROLE_ENTRY_PATHS[role]);
  };

  return (
    <TopNavShell
      roleLabel="Admin"
      workspaceLabel="Admin Console"
      nav={nav}
      previewRoles={PREVIEW_ROLES}
      onPreviewRole={handlePreview}
    />
  );
}
