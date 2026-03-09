import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Layouts
import OccupantLayout from '../components/layout/OccupantLayout';
import AdminLayout from '../components/layout/AdminLayout';
import FMLayout from '../components/layout/FMLayout';

// Pages
import Login from '../pages/Login';

// Occupant
import Presence from '../pages/occupant/Presence';
import Location from '../pages/occupant/Location';
import Dashboard from '../pages/occupant/Dashboard';
import VotePage from '../pages/occupant/Vote';
import Comfort from '../pages/occupant/Comfort';
import HistoryPage from '../pages/occupant/History';
import SettingsPage from '../pages/occupant/Settings';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import BuildingManagement from '../pages/admin/BuildingManagement';
import TenantManagement from '../pages/admin/TenantManagement';
import VoteAnalytics from '../pages/admin/VoteAnalytics';
import ConfigEditor from '../pages/admin/ConfigEditor';

// FM
import FMDashboard from '../pages/fm/FMDashboard';
import BuildingOverview from '../pages/fm/BuildingOverview';
import ComfortAnalytics from '../pages/fm/ComfortAnalytics';
import FMNotifications from '../pages/fm/Notifications';

export default function AppRouter() {
  const user = useAuthStore((s) => s.user);

  /** Role-based root redirect */
  const roleRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'tenant_facility_manager' || user.role === 'building_facility_manager')
      return '/fm';
    return '/presence';
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={roleRedirect()} replace />} />

      {/* ─── Occupant routes (mobile-like) ─── */}
      <Route
        path="/presence"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <Presence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/location"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <Location />
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
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/vote"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-lg mx-auto px-4 py-6">
                <VotePage />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/comfort"
        element={
          <ProtectedRoute allowedRoles={['occupant', 'tenant_facility_manager', 'building_facility_manager', 'admin']}>
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-lg mx-auto px-4 py-6">
                <Comfort />
              </div>
            </div>
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/buildings" element={<BuildingManagement />} />
        <Route path="/admin/tenants" element={<TenantManagement />} />
        <Route path="/admin/analytics" element={<VoteAnalytics />} />
        <Route path="/admin/config" element={<ConfigEditor />} />
      </Route>

      {/* ─── FM routes (sidebar layout) ─── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['tenant_facility_manager', 'building_facility_manager']}>
            <FMLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/fm" element={<FMDashboard />} />
        <Route path="/fm/buildings" element={<BuildingOverview />} />
        <Route path="/fm/comfort" element={<ComfortAnalytics />} />
        <Route path="/fm/notifications" element={<FMNotifications />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
