import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (!user) return null; // still loading

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // redirect based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'tenant_facility_manager' || user.role === 'building_facility_manager')
      return <Navigate to="/fm" replace />;
    return <Navigate to="/presence" replace />;
  }

  return <>{children}</>;
}
