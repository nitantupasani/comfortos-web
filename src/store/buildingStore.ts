import { create } from 'zustand';
import type { Building, SduiNode, VoteFormSchema, LocationFormConfig, BuildingComfortData } from '../types';
import { buildingsApi } from '../api/buildings';

interface BuildingState {
  buildings: Building[];
  dashboardConfig: SduiNode | null;
  voteFormSchema: VoteFormSchema | null;
  locationForm: LocationFormConfig | null;
  comfortData: BuildingComfortData | null;
  isLoading: boolean;

  fetchAll: () => Promise<void>;
  fetchDashboard: (buildingId: string) => Promise<void>;
  fetchVoteForm: (buildingId: string) => Promise<void>;
  fetchLocationForm: (buildingId: string) => Promise<void>;
  fetchComfort: (buildingId: string) => Promise<void>;
}

export const useBuildingStore = create<BuildingState>((set) => ({
  buildings: [],
  dashboardConfig: null,
  voteFormSchema: null,
  locationForm: null,
  comfortData: null,
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const buildings = await buildingsApi.list();
      set({ buildings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchDashboard: async (buildingId) => {
    try {
      const config = await buildingsApi.dashboard(buildingId);
      set({ dashboardConfig: config });
    } catch { /* use default */ }
  },

  fetchVoteForm: async (buildingId) => {
    try {
      const schema = await buildingsApi.voteForm(buildingId);
      set({ voteFormSchema: schema });
    } catch { /* use default */ }
  },

  fetchLocationForm: async (buildingId) => {
    try {
      const form = await buildingsApi.locationForm(buildingId);
      set({ locationForm: form });
    } catch { /* use default */ }
  },

  fetchComfort: async (buildingId) => {
    try {
      const data = await buildingsApi.comfort(buildingId);
      set({ comfortData: data });
    } catch { /* ignore */ }
  },
}));
