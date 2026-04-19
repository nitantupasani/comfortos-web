import { useNavigate } from 'react-router-dom';
import {
  Building2,
  BarChart3,
  Bell,
  Activity,
  PanelsTopLeft,
  FileQuestion,
  UserCircle,
  LineChart,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ConsoleShell, { type NavGroup } from './ConsoleShell';

const nav: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { to: '/fm', icon: Activity, label: 'Dashboard', end: true },
      { to: '/fm/buildings', icon: Building2, label: 'Buildings' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/fm/building-analytics', icon: LineChart, label: 'Building Analytics' },
      { to: '/fm/comfort', icon: BarChart3, label: 'Comfort Analytics' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/fm/notifications', icon: Bell, label: 'Notifications' },
      { to: '/fm/dashboard-config', icon: PanelsTopLeft, label: 'Dashboard Layout' },
      { to: '/fm/vote-config', icon: FileQuestion, label: 'Vote Form' },
    ],
  },
];

export default function FMLayout() {
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  const handleSwitchToOccupant = () => {
    setViewAsRole('occupant');
    navigate('/dashboard');
  };

  const footer = (
    <button
      onClick={handleSwitchToOccupant}
      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100 hover:text-primary-700 transition-colors border border-gray-200 bg-gray-50"
    >
      <UserCircle className="h-4 w-4" />
      <span>Switch to Occupant View</span>
    </button>
  );

  return <ConsoleShell roleLabel="FM" workspaceLabel="Facility Manager" nav={nav} sidebarFooter={footer} />;
}
