import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  badge?: string | number;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface ConsoleShellProps {
  /** Human-readable label shown in sidebar badge (e.g. "Admin", "FM"). */
  roleLabel: string;
  /** Page title / workspace name shown in topbar. */
  workspaceLabel: string;
  /** Navigation, optionally grouped into sections. */
  nav: NavGroup[];
  /** Optional extra footer controls (role-switcher, etc.) rendered above the user card. */
  sidebarFooter?: ReactNode;
}

const COLLAPSE_KEY = 'console.sidebar.collapsed';

export default function ConsoleShell({ roleLabel, workspaceLabel, nav, sidebarFooter }: ConsoleShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  });
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    }
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.email || '?')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const sidebarWidth = collapsed ? 'lg:w-16' : 'lg:w-64';

  const renderNav = (onNavigate?: () => void, isCollapsed = false) => (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {nav.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {group.label && !isCollapsed && (
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              {group.label}
            </div>
          )}
          {group.items.map(({ to, icon: Icon, label, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                  {!isCollapsed && badge != null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'}`}>
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );

  const renderBrand = (isCollapsed = false) => (
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-5 py-4 border-b border-gray-200`}>
      <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-[13px] shrink-0">
        C
      </div>
      {!isCollapsed && (
        <>
          <span className="font-semibold text-gray-900 tracking-tight text-[15px]">ComfortOS</span>
          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200 rounded uppercase tracking-wider">
            {roleLabel}
          </span>
        </>
      )}
    </div>
  );

  const renderUserCard = (isCollapsed = false) => (
    <div className={`border-t border-gray-200 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
      {sidebarFooter && !isCollapsed && <div className="mb-2">{sidebarFooter}</div>}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 px-2 py-1.5'}`}>
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0">
          {initials}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={handleLogout}
            title="Sign out"
            className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
      {isCollapsed && (
        <button
          onClick={handleLogout}
          title="Sign out"
          className="mt-2 w-full flex justify-center p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — desktop */}
      <aside
        className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-[width] duration-200 ${sidebarWidth}`}
      >
        {renderBrand(collapsed)}
        {renderNav(undefined, collapsed)}
        <div className={`border-t border-gray-200 ${collapsed ? 'py-2' : 'px-3 py-2'}`}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex items-center ${collapsed ? 'w-full justify-center py-1.5' : 'gap-2 px-2 py-1.5'} rounded-md text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full transition-colors`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
        {renderUserCard(collapsed)}
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-[13px]">
                  C
                </div>
                <span className="font-semibold text-gray-900 text-[15px]">ComfortOS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200 rounded uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {renderNav(() => setSidebarOpen(false), false)}
            {renderUserCard(false)}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-14 px-4 lg:px-6 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-1 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate">{workspaceLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>System healthy</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-5 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
