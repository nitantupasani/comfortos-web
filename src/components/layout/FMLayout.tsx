import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  Activity,
  Plug,
  PanelsTopLeft,
  FileQuestion,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const links = [
  { to: '/fm', icon: Activity, label: 'Dashboard', end: true },
  { to: '/fm/overview', icon: LayoutDashboard, label: 'Facility Overview' },
  { to: '/fm/buildings', icon: Building2, label: 'Buildings' },
  { to: '/fm/comfort', icon: BarChart3, label: 'Comfort Analytics' },
  { to: '/fm/dashboard-config', icon: PanelsTopLeft, label: 'Dashboard Layout' },
  { to: '/fm/vote-config', icon: FileQuestion, label: 'Vote Form Config' },
  { to: '/fm/notifications', icon: Bell, label: 'Notifications' },
];

export default function FMLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchToOccupant = () => {
    setViewAsRole('occupant');
    navigate('/presence');
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-800 text-gray-200">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-sm">C</div>
          <span className="font-semibold text-white text-lg">ComfortOS</span>
          <span className="ml-auto text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">FM</span>
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
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="text-xs text-gray-400 mb-2 truncate">{user?.email}</div>
          <button
            onClick={handleSwitchToOccupant}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-teal-400 transition-colors mb-2 w-full"
          >
            <UserCircle className="h-4 w-4" />
            Switch to Occupant View
          </button>
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
          <aside className="relative w-64 bg-slate-800 text-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
              <span className="font-semibold text-white">Facility Manager</span>
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
                      isActive ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-slate-700">
              <button
                onClick={handleSwitchToOccupant}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-teal-400 transition-colors mb-2 w-full"
              >
                <UserCircle className="h-4 w-4" />
                Switch to Occupant View
              </button>
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
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Facility Manager</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
