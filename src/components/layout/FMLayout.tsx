import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  LineChart,
  BarChart3,
  Bell,
  UserCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import TopNavShell, { type TopNavItem } from './TopNavShell';

const nav: TopNavItem[] = [
  { to: '/fm', icon: Activity, label: 'Dashboard', end: true },
  { to: '/fm/buildings', icon: Building2, label: 'Buildings' },
  { to: '/fm/building-analytics', icon: LineChart, label: 'Building Analytics' },
  { to: '/fm/comfort', icon: BarChart3, label: 'Comfort Analytics' },
  { to: '/fm/notifications', icon: Bell, label: 'Notifications' },
];

export default function FMLayout() {
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  const handleSwitchToOccupant = () => {
    setViewAsRole('occupant');
    navigate('/dashboard');
  };

  return (
    <TopNavShell
      roleLabel="FM"
      workspaceLabel="Facility Manager"
      nav={nav}
      extraMenuItem={{
        label: 'Switch to occupant view',
        onClick: handleSwitchToOccupant,
        icon: UserCircle,
      }}
    />
  );
}
