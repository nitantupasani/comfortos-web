import { useEffect, useState } from 'react';
import { Building2, Users, BarChart3, Vote, Loader2 } from 'lucide-react';
import { buildingsApi } from '../../api/buildings';
import { tenantsApi } from '../../api/tenants';
import type { Building, Tenant } from '../../types';

export default function AdminDashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([buildingsApi.list(), tenantsApi.list().catch(() => [])])
      .then(([b, t]) => { setBuildings(b); setTenants(t); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  const stats = [
    { icon: Building2, label: 'Buildings', value: buildings.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Tenants', value: tenants.length, color: 'bg-purple-50 text-purple-600' },
    { icon: Vote, label: 'Total Capacity', value: buildings.reduce((s, b) => s + b.dailyVoteLimit, 0), color: 'bg-green-50 text-green-600' },
    { icon: BarChart3, label: 'Restricted', value: buildings.filter((b) => b.requiresAccessPermission).length, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Buildings Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">All Buildings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">City</th>
                <th className="px-5 py-3 text-left">Address</th>
                <th className="px-5 py-3 text-center">Restricted</th>
                <th className="px-5 py-3 text-center">Vote Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{b.name}</td>
                  <td className="px-5 py-3 text-gray-500">{b.city}</td>
                  <td className="px-5 py-3 text-gray-500">{b.address}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.requiresAccessPermission ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                      {b.requiresAccessPermission ? 'Yes' : 'Open'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-medium">{b.dailyVoteLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">All Tenants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email Domain</th>
                <th className="px-5 py-3 text-left">Auth Provider</th>
                <th className="px-5 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-gray-500">{t.emailDomain}</td>
                  <td className="px-5 py-3 text-gray-500">{t.authProvider}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No tenants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
