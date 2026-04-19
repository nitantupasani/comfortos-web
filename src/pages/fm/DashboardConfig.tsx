import { Navigate } from 'react-router-dom';

// Dashboard layout is now edited per-building under /fm/buildings?id=X&tab=dashboard.
export default function FMDashboardConfig() {
  return <Navigate to="/fm/buildings" replace />;
}
