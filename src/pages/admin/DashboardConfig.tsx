import { Navigate } from 'react-router-dom';

// Dashboard layout is now edited per-building under /admin/buildings?id=X&tab=dashboard.
export default function AdminDashboardConfig() {
  return <Navigate to="/admin/buildings" replace />;
}
