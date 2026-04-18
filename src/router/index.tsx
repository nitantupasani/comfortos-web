import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Layouts
import OccupantLayout from '../components/layout/OccupantLayout';
import OccupantShell from '../components/layout/OccupantShell';
import AdminLayout from '../components/layout/AdminLayout';
import FMLayout from '../components/layout/FMLayout';

// Pages
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';

// Occupant
import Presence from '../pages/occupant/Presence';
import Location from '../pages/occupant/Location';
import Dashboard from '../pages/occupant/Dashboard';
import VotePage from '../pages/occupant/Vote';
import Comfort from '../pages/occupant/Comfort';
import HistoryPage from '../pages/occupant/History';
import SettingsPage from '../pages/occupant/Settings';
import EnvironmentData from '../pages/occupant/EnvironmentData';
import RequestFMRole from '../pages/occupant/RequestFMRole';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import BuildingManagement from '../pages/admin/BuildingManagement';
import BuildingSetupWizard from '../pages/admin/BuildingSetupWizard';
import TenantManagement from '../pages/admin/TenantManagement';
import VoteAnalytics from '../pages/admin/VoteAnalytics';
import BuildingAnalytics from '../pages/admin/BuildingAnalytics';
import AdminDashboardConfig from '../pages/admin/DashboardConfig';
import AdminVoteFormConfig from '../pages/admin/VoteFormConfig';
import FMApprovals from '../pages/admin/FMApprovals';
// FM
import FMDashboard from '../pages/fm/FMDashboard';
import ComfortAnalytics from '../pages/fm/ComfortAnalytics';
import FMBuildingAnalytics from '../pages/fm/BuildingAnalytics';
import FMNotifications from '../pages/fm/Notifications';
import FMDashboardConfig from '../pages/fm/DashboardConfig';
import FMVoteFormConfig from '../pages/fm/VoteFormConfig';

export default function AppRouter() {
  const user = useAuthStore((s) => s.user);
  const viewAsRole = useAuthStore((s) => s.viewAsRole);

  const effectiveRole = viewAsRole && (user?.role === 'admin' || (viewAsRole === 'occupant' && (user?.role === 'tenant_facility_manager' || user?.role === 'building_facility_manager')))
    ? viewAsRole
    : user?.role;

  /** Role-based root redirect */
  const roleRedirect = () => {
    if (!user) return '/login';
    if (effectiveRole === 'admin') return '/admin';
    if (effectiveRole === 'tenant_facility_manager' || effectiveRole === 'building_facility_manager')
      return '/fm';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={roleRedirect()} replace />} />

      {/* ─── Occupant routes (mobile-like) ─── */}
      {/* Legacy presence/location routes — redirect to dashboard which handles everything inline */}
      <Route
        path="/presence"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/location"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute allowedRoles={['occupant']}>
            <OccupantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/environment" element={<EnvironmentData />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/request-fm" element={<RequestFMRole />} />
      </Route>

      <Route
        path="/vote"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <OccupantShell>
              <VotePage />
            </OccupantShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/comfort"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <OccupantShell>
              <Comfort />
            </OccupantShell>
          </ProtectedRoute>
        }
      />

      {/* ─── Admin routes (sidebar layout) ─── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<BuildingAnalytics />} />
        <Route path="/admin/overview" element={<AdminDashboard />} />
        <Route path="/admin/buildings" element={<BuildingManagement />} />
        <Route path="/admin/buildings/new" element={<BuildingSetupWizard />} />
        <Route path="/admin/tenants" element={<TenantManagement />} />
        <Route path="/admin/analytics" element={<VoteAnalytics />} />
        <Route path="/admin/building-analytics" element={<BuildingAnalytics />} />
        <Route path="/admin/dashboard-config" element={<AdminDashboardConfig />} />
        <Route path="/admin/vote-config" element={<AdminVoteFormConfig />} />
        <Route path="/admin/fm-approvals" element={<FMApprovals />} />
      </Route>

      {/* ─── FM routes (sidebar layout) ─── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['tenant_facility_manager', 'building_facility_manager']}>
            <FMLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/fm" element={<FMBuildingAnalytics />} />
        <Route path="/fm/overview" element={<FMDashboard />} />
        <Route path="/fm/buildings" element={<BuildingManagement managedOnly />} />
        <Route path="/fm/comfort" element={<ComfortAnalytics />} />
        <Route path="/fm/building-analytics" element={<FMBuildingAnalytics />} />
        <Route path="/fm/dashboard-config" element={<FMDashboardConfig />} />
        <Route path="/fm/vote-config" element={<FMVoteFormConfig />} />
        <Route path="/fm/notifications" element={<FMNotifications />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
