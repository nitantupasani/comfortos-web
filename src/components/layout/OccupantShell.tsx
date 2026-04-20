import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Thermometer, History, Settings, Building2, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import BuildingQuickSwitch from '../occupant/BuildingQuickSwitch';
import type { Building } from '../../types';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/environment', icon: Thermometer, label: 'Temp' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface OccupantShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function OccupantShell({ children, showNav = false }: OccupantShellProps) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const selectBuilding = usePresenceStore((s) => s.selectBuilding);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const viewAsRole = useAuthStore((s) => s.viewAsRole);
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);

  const [showBuildingSwitch, setShowBuildingSwitch] = useState(false);

  const isFMViewingAsOccupant = viewAsRole === 'occupant' &&
    (user?.role === 'tenant_facility_manager' || user?.role === 'building_facility_manager');

  const handleSwitchBackToFM = () => {
    setViewAsRole(null);
    navigate('/fm');
  };

  const handleBuildingSelect = async (building: Building) => {
    await selectBuilding(building);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-0 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-white md:min-h-[820px] md:rounded-xl md:border md:border-gray-200 md:shadow-sm">
        {isFMViewingAsOccupant && (
          <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-xs">
            <span>Viewing as Occupant</span>
            <button
              onClick={handleSwitchBackToFM}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-md transition-colors font-medium"
            >
              <ArrowLeftRight className="h-3 w-3" />
              Back to FM
            </button>
          </div>
        )}
        <header className="border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-600 text-sm font-bold text-white">C</div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700">Occupant App</div>
                <span className="text-base font-semibold text-gray-900">ComfortOS</span>
              </div>
            </div>
            {activeBuilding && (
              <button
                onClick={() => setShowBuildingSwitch(true)}
                className="flex max-w-[170px] items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <Building2 className="h-4 w-4 shrink-0 text-teal-600" />
                <span className="truncate font-medium">{activeBuilding.name}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className={`px-4 py-5 ${showNav ? 'pb-24' : 'pb-6'}`}>
            {children}
          </div>
        </main>

        {showNav && (
          <nav className="border-t border-gray-200 bg-white/95 px-3 py-3 backdrop-blur">
            <div className="flex items-center justify-around gap-2 rounded-xl bg-gray-50 px-2 py-2">
              {tabs.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex min-w-[88px] flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-white text-teal-700 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>

      <BuildingQuickSwitch
        isOpen={showBuildingSwitch}
        onClose={() => setShowBuildingSwitch(false)}
        onSelect={handleBuildingSelect}
      />
    </div>
  );
}
