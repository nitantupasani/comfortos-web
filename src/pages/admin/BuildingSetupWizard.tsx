import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildingWizardStore } from '../../store/buildingWizardStore';
import { buildingsApi } from '../../api/buildings';
import { locationsApi, type LocationCreate } from '../../api/locations';
import { telemetryEndpointsApi, type EndpointCreate } from '../../api/telemetryEndpoints';
import { telemetryConfigApi } from '../../api/telemetryConfig';
import WizardShell from '../../components/building/wizard/WizardShell';
import Step0_BuildingInfo from '../../components/building/wizard/Step0_BuildingInfo';
import Step1_LocationHierarchy from '../../components/building/wizard/Step1_LocationHierarchy';
import Step2_Connector from '../../components/building/wizard/Step2_Connector';
import Step3_Metrics from '../../components/building/wizard/Step3_Metrics';
import Step4_Finish from '../../components/building/wizard/Step4_Finish';
import type { SduiNode } from '../../types';

function getDashboardTemplate(template: 'default' | 'minimal' | 'full', metrics: string[]): SduiNode {
  const metricTiles: SduiNode[] = [];
  const metricMap: Record<string, { icon: string; unit: string; label: string }> = {
    temperature: { icon: 'thermostat', unit: '°C', label: 'Temp' },
    co2: { icon: 'co2', unit: 'ppm', label: 'CO₂' },
    relative_humidity: { icon: 'water_drop', unit: '%', label: 'Humidity' },
    noise: { icon: 'volume_up', unit: 'dB', label: 'Noise' },
  };

  for (const m of metrics) {
    const info = metricMap[m] || { icon: 'sensors', unit: '', label: m };
    metricTiles.push({ type: 'metric_tile', icon: info.icon, value: '--', unit: info.unit, label: info.label });
  }

  if (template === 'minimal') {
    return {
      type: 'column', crossAxisAlignment: 'stretch',
      children: [
        { type: 'grid', columns: Math.min(metricTiles.length, 3), spacing: 10, children: metricTiles },
      ],
    };
  }

  if (template === 'full') {
    return {
      type: 'column', crossAxisAlignment: 'stretch',
      children: [
        { type: 'weather_badge', temp: '--', unit: '°C', label: 'Outside', icon: 'wb_sunny' },
        { type: 'spacer', height: 8 },
        { type: 'grid', columns: Math.min(metricTiles.length, 3), spacing: 10, children: metricTiles },
        { type: 'spacer', height: 16 },
        ...metricTiles.map((t) => ({
          type: 'trend_card' as const,
          icon: t.icon as string,
          label: `${t.label} Trend`,
          unit: t.unit as string,
          data: [],
        })),
        { type: 'spacer', height: 8 },
        { type: 'alert_banner', icon: 'info', color: 'blue', title: 'Building Active', subtitle: 'Telemetry data will appear once sensors report.' },
      ],
    };
  }

  // default
  return {
    type: 'column', crossAxisAlignment: 'stretch',
    children: [
      { type: 'weather_badge', temp: '--', unit: '°C', label: 'Outside', icon: 'wb_sunny' },
      { type: 'spacer', height: 8 },
      { type: 'grid', columns: Math.min(metricTiles.length, 3), spacing: 10, children: metricTiles },
      { type: 'spacer', height: 16 },
      { type: 'alert_banner', icon: 'info', color: 'blue', title: 'Welcome to ComfortOS', subtitle: 'Select your location and cast a comfort vote to help improve this space.' },
    ],
  };
}

export default function BuildingSetupWizard() {
  const navigate = useNavigate();
  const store = useBuildingWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async (): Promise<boolean> => {
    setError(null);

    try {
      switch (store.currentStep) {
        case 0: {
          // Validate & create building
          if (!store.buildingForm.name.trim() || !store.buildingForm.address.trim()) {
            setError('Name and address are required');
            return false;
          }
          if (store.createdBuildingId) return true; // already created
          setIsSubmitting(true);
          const building = await buildingsApi.create({
            name: store.buildingForm.name.trim(),
            address: store.buildingForm.address.trim(),
            city: store.buildingForm.city?.trim() || undefined,
            latitude: store.buildingForm.latitude,
            longitude: store.buildingForm.longitude,
            requiresAccessPermission: store.buildingForm.requiresAccessPermission,
          });
          store.setCreatedBuildingId(building.id);
          setIsSubmitting(false);
          return true;
        }

        case 1: {
          // Create locations in batch
          if (!store.createdBuildingId || store.floors.length === 0) return true; // skip if no floors
          setIsSubmitting(true);

          // First create building root node
          const buildingRoot = await locationsApi.create({
            buildingId: store.createdBuildingId,
            type: 'building',
            name: store.buildingForm.name.trim(),
            code: 'ROOT',
          });

          // Then create floors and rooms
          for (const floor of store.floors) {
            const floorNode = await locationsApi.create({
              buildingId: store.createdBuildingId,
              parentId: buildingRoot.id,
              type: 'floor',
              name: floor.name,
              code: floor.code || undefined,
            });

            if (floor.rooms.length > 0) {
              const roomLocations: LocationCreate[] = floor.rooms.map((room) => ({
                buildingId: store.createdBuildingId!,
                parentId: floorNode.id,
                type: 'room' as const,
                name: room.name,
                code: room.code || undefined,
              }));
              await locationsApi.batchCreate(store.createdBuildingId, roomLocations);
            }
          }

          setIsSubmitting(false);
          return true;
        }

        case 2: {
          // Create telemetry endpoint if API-based connector
          const ct = store.connector.connectionType;
          if ((ct === 'bms_api' || ct === 'iot_platform') && store.createdBuildingId) {
            if (!store.connector.endpointUrl.trim()) return true; // skip if no URL
            setIsSubmitting(true);

            const authConfig: Record<string, string> = { type: store.connector.authType };
            if (store.connector.authType === 'api_key') {
              authConfig.header = store.connector.authHeader;
              authConfig.api_key = store.connector.authKey;
            } else if (store.connector.authType === 'bearer_token') {
              authConfig.token = store.connector.authKey;
            }

            const data: EndpointCreate = {
              buildingId: store.createdBuildingId,
              endpointName: store.connector.endpointName.trim() || 'Default Endpoint',
              endpointUrl: store.connector.endpointUrl.trim(),
              httpMethod: store.connector.httpMethod,
              endpointMode: store.connector.endpointMode as EndpointCreate['endpointMode'],
              authenticationConfig: authConfig,
              availableMetrics: store.connector.metrics,
              pollingConfig: {
                interval_minutes: store.connector.pollingInterval,
                timeout_seconds: 30,
                retry_count: 3,
                backoff_strategy: 'exponential',
              },
            };
            await telemetryEndpointsApi.create(data);
            setIsSubmitting(false);
          }
          return true;
        }

        case 3: {
          // Save metric configs
          if (!store.createdBuildingId) return true;
          setIsSubmitting(true);
          const enabledMetrics = Object.entries(store.metricsEnabled);
          for (const [metricType, isEnabled] of enabledMetrics) {
            await telemetryConfigApi.upsert(store.createdBuildingId, {
              buildingId: store.createdBuildingId,
              metricType,
              isEnabled,
            });
          }
          setIsSubmitting(false);
          return true;
        }

        case 4: {
          // Apply dashboard template and finish
          if (!store.createdBuildingId) return true;
          setIsSubmitting(true);
          const enabledMetrics = Object.entries(store.metricsEnabled)
            .filter(([, v]) => v)
            .map(([k]) => k);
          const dashboardLayout = getDashboardTemplate(store.dashboardTemplate, enabledMetrics);
          await buildingsApi.updateConfig(store.createdBuildingId, { dashboardLayout });
          setIsSubmitting(false);

          // Reset and navigate
          store.reset();
          navigate('/admin/buildings');
          return true;
        }

        default:
          return true;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
      setIsSubmitting(false);
      return false;
    }
  };

  const handleBack = () => {
    if (store.currentStep === 0) {
      store.reset();
      navigate('/admin/buildings');
    }
  };

  const stepComponents = [
    <Step0_BuildingInfo key={0} />,
    <Step1_LocationHierarchy key={1} />,
    <Step2_Connector key={2} />,
    <Step3_Metrics key={3} />,
    <Step4_Finish key={4} />,
  ];

  const canSkip = store.currentStep > 0 && store.currentStep < 4;
  const nextDisabled =
    store.currentStep === 0 &&
    (!store.buildingForm.name.trim() || !store.buildingForm.address.trim());

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
      <WizardShell
        onNext={handleNext}
        onBack={store.currentStep === 0 ? handleBack : undefined}
        canSkip={canSkip}
        nextDisabled={nextDisabled}
        isSubmitting={isSubmitting}
        nextLabel={store.currentStep === 4 ? 'Launch Building' : undefined}
      >
        {stepComponents[store.currentStep]}
      </WizardShell>
    </div>
  );
}
