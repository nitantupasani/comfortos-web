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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.14),_transparent_38%),linear-gradient(180deg,_#eef7f0_0%,_#f7faf8_45%,_#edf4ef_100%)] px-0 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#f7faf7] md:min-h-[820px] md:rounded-[32px] md:border md:border-white/70 md:shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
        {isFMViewingAsOccupant && (
          <div className="bg-teal-600 text-white px-4 py-2 flex items-center justify-between text-xs">
            <span>Viewing as Occupant</span>
            <button
              onClick={handleSwitchBackToFM}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              <ArrowLeftRight className="h-3 w-3" />
              Back to FM
            </button>
          </div>
        )}
        <header className="border-b border-emerald-100/80 bg-white/90 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-sm">C</div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600/80">Occupant App</div>
                <span className="text-base font-semibold text-slate-800">ComfortOS</span>
              </div>
            </div>
            {activeBuilding && (
              <button
                onClick={() => setShowBuildingSwitch(true)}
                className="flex max-w-[170px] items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Building2 className="h-4 w-4 shrink-0 text-emerald-600" />
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
          <nav className="border-t border-emerald-100/80 bg-white/92 px-3 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex items-center justify-around gap-2 rounded-[24px] bg-slate-50/90 px-2 py-2">
              {tabs.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex min-w-[88px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
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
