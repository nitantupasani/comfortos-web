import { create } from 'zustand';
import type { Building } from '../types';
import { buildingsApi } from '../api/buildings';
import { presenceApi } from '../api/presence';

interface PresenceState {
  buildings: Building[];
  activeBuilding: Building | null;
  floor: string | null;
  room: string | null;
  floorLabel: string | null;
  roomLabel: string | null;
  isLoading: boolean;

  fetchBuildings: (tenantId?: string) => Promise<void>;
  selectBuilding: (building: Building) => Promise<void>;
  setLocation: (floor: string, floorLabel: string, room: string, roomLabel: string) => void;
  clearBuilding: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  buildings: [],
  activeBuilding: null,
  floor: null,
  room: null,
  floorLabel: null,
  roomLabel: null,
  isLoading: false,

  fetchBuildings: async (tenantId) => {
    set({ isLoading: true });
    try {
      const buildings = await buildingsApi.list(tenantId);
      set({ buildings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectBuilding: async (building) => {
    set({ activeBuilding: building, floor: null, room: null, floorLabel: null, roomLabel: null });
    try {
      await presenceApi.report({
        buildingId: building.id,
        method: 'manual',
        confidence: 0.5,
        isVerified: false,
        timestamp: new Date().toISOString(),
      });
    } catch { /* non-critical */ }
  },

  setLocation: (floor, floorLabel, room, roomLabel) =>
    set({ floor, floorLabel, room, roomLabel }),

  clearBuilding: () =>
    set({ activeBuilding: null, floor: null, room: null, floorLabel: null, roomLabel: null }),
}));
