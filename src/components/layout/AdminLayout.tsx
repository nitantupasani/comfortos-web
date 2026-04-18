import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Eye,
  Activity,
  Plug,
  PanelsTopLeft,
  FileQuestion,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

const PREVIEW_ROLES: { role: UserRole; label: string }[] = [
  { role: 'occupant', label: 'Occupant' },
  { role: 'building_facility_manager', label: 'FM (Building)' },
  { role: 'tenant_facility_manager', label: 'FM (Tenant)' },
];

const ROLE_ENTRY_PATHS: Record<UserRole, string> = {
  admin: '/admin',
  building_facility_manager: '/fm',
  tenant_facility_manager: '/fm',
  occupant: '/presence',
};

const links = [
  { to: '/admin', icon: Activity, label: 'Dashboard', end: true },
  { to: '/admin/overview', icon: LayoutDashboard, label: 'Platform Overview' },
  { to: '/admin/buildings', icon: Building2, label: 'Buildings' },
  { to: '/admin/tenants', icon: Users, label: 'Tenants' },
  { to: '/admin/fm-approvals', icon: ShieldCheck, label: 'FM Approvals' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Vote Analytics' },
  { to: '/admin/dashboard-config', icon: PanelsTopLeft, label: 'Dashboard Layout' },
  { to: '/admin/vote-config', icon: FileQuestion, label: 'Vote Form Config' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePreview = (role: UserRole) => {
    setViewAsRole(role);
    navigate(ROLE_ENTRY_PATHS[role]);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-900 text-gray-200">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
          <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-sm">C</div>
          <span className="font-semibold text-white text-lg">ComfortOS</span>
          <span className="ml-auto text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Eye className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">Preview as</span>
          </div>
          <div className="flex flex-col gap-1">
            {PREVIEW_ROLES.map(({ role, label }) => (
              <button
                key={role}
                onClick={() => handlePreview(role)}
                className="text-left px-2 py-1.5 rounded text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 text-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
              <span className="font-semibold text-white">ComfortOS Admin</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {links.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-gray-700">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <Eye className="h-3.5 w-3.5" />
                <span className="uppercase tracking-wider">Preview as</span>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                {PREVIEW_ROLES.map(({ role, label }) => (
                  <button
                    key={role}
                    onClick={() => handlePreview(role)}
                    className="text-left px-2 py-1.5 rounded text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-4 border-t border-gray-700">
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
