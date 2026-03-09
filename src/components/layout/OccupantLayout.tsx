import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Building2 } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function OccupantLayout() {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">C</div>
          <span className="font-semibold text-gray-800">ComfortOS</span>
        </div>
        {activeBuilding && (
          <button
            onClick={() => navigate('/presence')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
          >
            <Building2 className="h-4 w-4" />
            <span className="max-w-[140px] truncate">{activeBuilding.name}</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t flex justify-around py-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary-600 font-medium' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
