import { useEffect, useState } from 'react';
import { Users, Plus, Loader2 } from 'lucide-react';
import { tenantsApi } from '../../api/tenants';
import type { Tenant, BuildingTenant } from '../../types';

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [mappings, setMappings] = useState<BuildingTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', emailDomain: '', authProvider: 'local' });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, m] = await Promise.all([
        tenantsApi.list().catch(() => []),
        tenantsApi.buildingTenants().catch(() => []),
      ]);
      setTenants(t);
      setMappings(m);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await tenantsApi.create(formData);
      setShowForm(false);
      setFormData({ name: '', emailDomain: '', authProvider: 'local' });
      await load();
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tenant Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold text-gray-700">New Tenant</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email Domain</label>
              <input
                value={formData.emailDomain}
                onChange={(e) => setFormData({ ...formData, emailDomain: e.target.value })}
                placeholder="example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Auth Provider</label>
              <select
                value={formData.authProvider}
                onChange={(e) => setFormData({ ...formData, authProvider: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              >
                <option value="local">Local</option>
                <option value="google">Google</option>
                <option value="saml">SAML</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {creating ? 'Creating…' : 'Create Tenant'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tenants table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-800">Tenants ({tenants.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email Domain</th>
                <th className="px-5 py-3 text-left">Auth</th>
                <th className="px-5 py-3 text-center">Building Mappings</th>
                <th className="px-5 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((t) => {
                const maps = mappings.filter((m) => m.tenantId === t.id);
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{t.name}</td>
                    <td className="px-5 py-3 text-gray-500">{t.emailDomain}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{t.authProvider}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="bg-primary-50 text-primary-600 text-xs px-2 py-0.5 rounded-full">{maps.length}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No tenants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
