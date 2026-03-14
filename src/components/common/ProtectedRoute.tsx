import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, token, viewAsRole } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (!user) return null; // still loading

  // When admin is previewing another role, treat them as that role for access checks.
  const effectiveRole: UserRole = user.role === 'admin' && viewAsRole ? viewAsRole : user.role;

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    // Redirect to the entry point appropriate for the effective role
    if (effectiveRole === 'admin') return <Navigate to="/admin" replace />;
    if (effectiveRole === 'tenant_facility_manager' || effectiveRole === 'building_facility_manager')
      return <Navigate to="/fm" replace />;
    return <Navigate to="/presence" replace />;
  }

  return <>{children}</>;
}
