import { locationsApi } from './locations';
import { telemetryEndpointsApi } from './telemetryEndpoints';
import { buildingsApi } from './buildings';

export interface SetupStatus {
  hasLocations: boolean;
  hasEndpoints: boolean;
  hasDashboard: boolean;
  hasVoteForm: boolean;
  completedCount: number;
  totalSteps: number;
}

export async function fetchBuildingSetupStatus(buildingId: string): Promise<SetupStatus> {
  const [tree, endpoints, config] = await Promise.all([
    locationsApi.tree(buildingId).catch(() => []),
    telemetryEndpointsApi.list(buildingId).catch(() => []),
    buildingsApi.config(buildingId).catch(() => null),
  ]);

  const hasLocations = tree.length > 0;
  const hasEndpoints = endpoints.length > 0;
  const hasDashboard = !!(config?.dashboardLayout);
  const hasVoteForm = !!(config?.voteFormSchema);

  const checks = [hasLocations, hasEndpoints, hasDashboard, hasVoteForm];

  return {
    hasLocations,
    hasEndpoints,
    hasDashboard,
    hasVoteForm,
    completedCount: checks.filter(Boolean).length,
    totalSteps: checks.length,
  };
}
