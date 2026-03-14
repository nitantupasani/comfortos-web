import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePresenceStore } from '../../store/presenceStore';
import { User, Building2, LogOut, RefreshCw, MapPin, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { activeBuilding, floorLabel, roomLabel, clearBuilding } = usePresenceStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangeBuilding = () => {
    clearBuilding();
    navigate('/presence');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Settings</h1>

      {/* Account */}
      <section className="bg-white rounded-xl border p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
          <User className="h-4 w-4" />
          Account
        </h3>
        <InfoRow label="Name" value={user.name} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Role" value={user.role.replace(/_/g, ' ')} />
        {user.tenantId && <InfoRow label="Tenant" value={user.tenantId} />}
      </section>

      {/* Active Building */}
      {activeBuilding && (
        <section className="bg-white rounded-xl border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Current Building
          </h3>
          <InfoRow label="Building" value={activeBuilding.name} />
          {floorLabel && <InfoRow label="Floor" value={floorLabel} />}
          {roomLabel && <InfoRow label="Room" value={roomLabel} />}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => navigate('/location')}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
            >
              <MapPin className="h-3 w-3" />
              Change location
            </button>
            <button
              onClick={handleChangeBuilding}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-3 w-3" />
              Change building
            </button>
          </div>
        </section>
      )}

      {/* Request FM Role */}
      {user.role === 'occupant' && (
        <button
          onClick={() => navigate('/request-fm')}
          className="w-full flex items-center justify-center gap-2 bg-primary-50 text-primary-600 py-3 rounded-xl font-medium hover:bg-primary-100 transition-colors"
        >
          <ShieldCheck className="h-5 w-5" />
          Request Facility Manager Role
        </button>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 capitalize">{value}</span>
    </div>
  );
}
