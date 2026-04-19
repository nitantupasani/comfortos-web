import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Eye, ChevronDown, User as UserIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

export interface TopNavItem {
  to: string;
  icon?: LucideIcon;
  label: string;
  end?: boolean;
}

interface PreviewRole {
  role: UserRole;
  label: string;
}

interface Props {
  roleLabel: string;
  workspaceLabel: string;
  nav: TopNavItem[];
  /** Optional preview-as submenu inside the user dropdown. */
  previewRoles?: PreviewRole[];
  onPreviewRole?: (role: UserRole) => void;
  /** Optional extra action visible in user menu (e.g. "Switch to occupant view"). */
  extraMenuItem?: { label: string; onClick: () => void; icon?: LucideIcon };
}

export default function TopNavShell({
  roleLabel,
  workspaceLabel,
  nav,
  previewRoles,
  onPreviewRole,
  extraMenuItem,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.email || '?')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center gap-4">
          {/* Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              C
            </div>
            <span className="font-semibold text-gray-900 tracking-tight hidden sm:inline">ComfortOS</span>
            <span className="text-[10px] font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
              {roleLabel}
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {nav.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Right-side controls */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 pr-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>System healthy</span>
            </div>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center">
                  {initials}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg py-1 text-sm z-40">
                  {/* Account header */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="font-medium text-gray-900 truncate">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>

                  {extraMenuItem && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        extraMenuItem.onClick();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      {extraMenuItem.icon ? (
                        <extraMenuItem.icon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-gray-400" />
                      )}
                      {extraMenuItem.label}
                    </button>
                  )}

                  {previewRoles && onPreviewRole && previewRoles.length > 0 && (
                    <div className="border-t border-gray-100 py-1">
                      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Eye className="h-3 w-3" />
                        Preview as
                      </div>
                      {previewRoles.map((p) => (
                        <button
                          key={p.role}
                          onClick={() => {
                            setMenuOpen(false);
                            onPreviewRole(p.role);
                          }}
                          className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Secondary workspace bar */}
        <div className="hidden md:flex max-w-[1600px] mx-auto px-4 lg:px-6 h-8 items-center text-xs text-gray-500">
          <span>{workspaceLabel}</span>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm">
                  C
                </div>
                <span className="font-semibold text-gray-900">ComfortOS</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {nav.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {Icon && <Icon className="h-[18px] w-[18px] text-gray-400" />}
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
