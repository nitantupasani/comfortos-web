import { create } from 'zustand';
import type { BuildingCreatePayload } from '../api/buildings';

export interface FloorEntry {
  name: string;
  code: string;
  rooms: { name: string; code: string }[];
  /** Optional block / wing this floor belongs to. When set on any
   * floor, the wizard creates a block_or_wing node under the building
   * and parents the floor to that block. */
  blockName?: string;
  blockCode?: string;
}

export interface ConnectorEntry {
  connectionType: 'bms_api' | 'iot_platform' | 'csv_upload' | 'manual';
  endpointName: string;
  endpointUrl: string;
  httpMethod: string;
  endpointMode: string;
  authType: string;
  authKey: string;
  authHeader: string;
  pollingInterval: number;
  metrics: string[];
}

interface BuildingWizardState {
  currentStep: number;
  completedSteps: Set<number>;
  buildingForm: BuildingCreatePayload;
  createdBuildingId: string | null;
  floors: FloorEntry[];
  connector: ConnectorEntry;
  metricsEnabled: Record<string, boolean>;
  dashboardTemplate: 'default' | 'minimal' | 'full';

  setStep: (step: number) => void;
  completeStep: (step: number) => void;
  setBuildingForm: (form: Partial<BuildingCreatePayload>) => void;
  setCreatedBuildingId: (id: string) => void;
  setFloors: (floors: FloorEntry[]) => void;
  setConnector: (connector: Partial<ConnectorEntry>) => void;
  setMetricsEnabled: (metrics: Record<string, boolean>) => void;
  setDashboardTemplate: (template: 'default' | 'minimal' | 'full') => void;
  reset: () => void;
}

const defaultBuildingForm: BuildingCreatePayload = {
  name: '',
  address: '',
  city: '',
  latitude: undefined,
  longitude: undefined,
  requiresAccessPermission: false,
};

const defaultConnector: ConnectorEntry = {
  connectionType: 'bms_api',
  endpointName: '',
  endpointUrl: '',
  httpMethod: 'GET',
  endpointMode: 'multi_zone',
  authType: 'api_key',
  authKey: '',
  authHeader: 'X-Api-Key',
  pollingInterval: 15,
  metrics: ['temperature'],
};

export const useBuildingWizardStore = create<BuildingWizardState>((set) => ({
  currentStep: 0,
  completedSteps: new Set(),
  buildingForm: { ...defaultBuildingForm },
  createdBuildingId: null,
  floors: [],
  connector: { ...defaultConnector },
  metricsEnabled: {
    temperature: true,
    co2: true,
    relative_humidity: true,
    noise: true,
  },
  dashboardTemplate: 'default',

  setStep: (step) => set({ currentStep: step }),

  completeStep: (step) =>
    set((s) => {
      const next = new Set(s.completedSteps);
      next.add(step);
      return { completedSteps: next };
    }),

  setBuildingForm: (form) =>
    set((s) => ({ buildingForm: { ...s.buildingForm, ...form } })),

  setCreatedBuildingId: (id) => set({ createdBuildingId: id }),

  setFloors: (floors) => set({ floors }),

  setConnector: (connector) =>
    set((s) => ({ connector: { ...s.connector, ...connector } })),

  setMetricsEnabled: (metrics) => set({ metricsEnabled: metrics }),

  setDashboardTemplate: (template) => set({ dashboardTemplate: template }),

  reset: () =>
    set({
      currentStep: 0,
      completedSteps: new Set(),
      buildingForm: { ...defaultBuildingForm },
      createdBuildingId: null,
      floors: [],
      connector: { ...defaultConnector },
      metricsEnabled: {
        temperature: true,
        co2: true,
        relative_humidity: true,
        noise: true,
      },
      dashboardTemplate: 'default',
    }),
}));
