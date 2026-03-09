import { api } from './client';
import type { Tenant, BuildingTenant } from '../types';

export const tenantsApi = {
  list: () => api.get<Tenant[]>('/tenants'),

  get: (id: string) => api.get<Tenant>(`/tenants/${id}`),

  create: (data: { name: string; emailDomain: string; authProvider: string }) =>
    api.post<Tenant>('/tenants', data),

  buildingTenants: (buildingId?: string, tenantId?: string) => {
    const params = new URLSearchParams();
    if (buildingId) params.set('buildingId', buildingId);
    if (tenantId) params.set('tenantId', tenantId);
    const qs = params.toString();
    return api.get<BuildingTenant[]>(`/building-tenants${qs ? `?${qs}` : ''}`);
  },

  assignBuilding: (data: { buildingId: string; tenantId: string; floors: string[]; zones: string[] }) =>
    api.post<BuildingTenant>('/building-tenants', data),
};
