import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Building } from '../types';
import { buildingsApi } from '../api/buildings';
import { presenceApi } from '../api/presence';

interface RecentBuilding {
  building: Building;
  lastVisited: string;
}

interface PresenceState {
  buildings: Building[];
  activeBuilding: Building | null;
  floor: string | null;
  room: string | null;
  floorLabel: string | null;
  roomLabel: string | null;
  isLoading: boolean;
  recentBuildings: RecentBuilding[];
  favoriteBuildings: string[];

  fetchBuildings: (tenantId?: string) => Promise<void>;
  selectBuilding: (building: Building) => Promise<void>;
  setLocation: (floor: string, floorLabel: string, room: string, roomLabel: string) => void;
  clearBuilding: () => void;
  addFavorite: (buildingId: string) => void;
  removeFavorite: (buildingId: string) => void;
  forgetBuilding: (buildingId: string) => void;
}

export const usePresenceStore = create<PresenceState>()(
  persist(
    (set, get) => ({
      buildings: [],
      activeBuilding: null,
      floor: null,
      room: null,
      floorLabel: null,
      roomLabel: null,
      isLoading: false,
      recentBuildings: [],
      favoriteBuildings: [],

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
        // Update recent buildings (keep last 5)
        const { recentBuildings } = get();
        const filtered = recentBuildings.filter((r) => r.building.id !== building.id);
        const updated = [{ building, lastVisited: new Date().toISOString() }, ...filtered].slice(0, 5);

        set({
          activeBuilding: building,
          floor: null,
          room: null,
          floorLabel: null,
          roomLabel: null,
          recentBuildings: updated,
        });
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

      addFavorite: (buildingId) =>
        set((s) => ({
          favoriteBuildings: s.favoriteBuildings.includes(buildingId)
            ? s.favoriteBuildings
            : [...s.favoriteBuildings, buildingId],
        })),

      removeFavorite: (buildingId) =>
        set((s) => ({
          favoriteBuildings: s.favoriteBuildings.filter((id) => id !== buildingId),
        })),

      forgetBuilding: (buildingId) =>
        set((s) => ({
          buildings: s.buildings.filter((b) => b.id !== buildingId),
          recentBuildings: s.recentBuildings.filter((r) => r.building.id !== buildingId),
          favoriteBuildings: s.favoriteBuildings.filter((id) => id !== buildingId),
          activeBuilding: s.activeBuilding?.id === buildingId ? null : s.activeBuilding,
          floor: s.activeBuilding?.id === buildingId ? null : s.floor,
          room: s.activeBuilding?.id === buildingId ? null : s.room,
          floorLabel: s.activeBuilding?.id === buildingId ? null : s.floorLabel,
          roomLabel: s.activeBuilding?.id === buildingId ? null : s.roomLabel,
        })),
    }),
    {
      name: 'comfortos-presence',
      partialize: (state) => ({
        activeBuilding: state.activeBuilding,
        floor: state.floor,
        room: state.room,
        floorLabel: state.floorLabel,
        roomLabel: state.roomLabel,
        recentBuildings: state.recentBuildings,
        favoriteBuildings: state.favoriteBuildings,
      }),
    },
  ),
);
