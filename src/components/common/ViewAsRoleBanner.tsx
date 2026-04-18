import { useNavigate } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  building_facility_manager: 'Facility Manager (Building)',
  tenant_facility_manager: 'Facility Manager (Tenant)',
  occupant: 'Occupant',
};

const ROLE_ENTRY_PATHS: Record<UserRole, string> = {
  admin: '/admin',
  building_facility_manager: '/fm',
  tenant_facility_manager: '/fm',
  occupant: '/dashboard',
};

const PREVIEWABLE_ROLES: UserRole[] = [
  'occupant',
  'building_facility_manager',
  'tenant_facility_manager',
];

export default function ViewAsRoleBanner() {
  const user = useAuthStore((s) => s.user);
  const viewAsRole = useAuthStore((s) => s.viewAsRole);
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole);
  const navigate = useNavigate();

  if (!user || user.role !== 'admin' || !viewAsRole) return null;

  const handleExit = () => {
    setViewAsRole(null);
    navigate('/admin');
  };

  const switchTo = (role: UserRole) => {
    setViewAsRole(role);
    navigate(ROLE_ENTRY_PATHS[role]);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center gap-3 shadow-lg text-sm">
      <Eye className="h-4 w-4 shrink-0" />
      <span className="font-medium whitespace-nowrap">
        Previewing as: <span className="font-bold">{ROLE_LABELS[viewAsRole]}</span>
      </span>

      <div className="flex items-center gap-1 ml-2 flex-wrap">
        {PREVIEWABLE_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => switchTo(role)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              viewAsRole === role
                ? 'bg-white text-amber-700'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      <button
        onClick={handleExit}
        className="ml-auto flex items-center gap-1 bg-white text-amber-700 hover:bg-amber-100 px-3 py-1 rounded font-medium text-xs transition-colors whitespace-nowrap"
      >
        <X className="h-3 w-3" />
        Exit Preview
      </button>
    </div>
  );
}
