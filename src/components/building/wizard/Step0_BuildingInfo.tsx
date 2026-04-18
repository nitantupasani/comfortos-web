import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

export default function Step0_BuildingInfo() {
  const { buildingForm, setBuildingForm } = useBuildingWizardStore();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Building Information</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter the basic details for the new building
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Building Name *</label>
          <input
            type="text"
            value={buildingForm.name}
            onChange={(e) => setBuildingForm({ name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
            placeholder="e.g. HHS Main Campus Building A"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
          <input
            type="text"
            value={buildingForm.address}
            onChange={(e) => setBuildingForm({ address: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
            placeholder="e.g. Johanna Westerdijkplein 75, 2521 EN Den Haag"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
          <input
            type="text"
            value={buildingForm.city ?? ''}
            onChange={(e) => setBuildingForm({ city: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
            placeholder="e.g. The Hague"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={buildingForm.latitude ?? ''}
              onChange={(e) => setBuildingForm({ latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="52.0667"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={buildingForm.longitude ?? ''}
              onChange={(e) => setBuildingForm({ longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="4.3279"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={buildingForm.requiresAccessPermission ?? false}
            onChange={(e) => setBuildingForm({ requiresAccessPermission: e.target.checked })}
            className="rounded"
          />
          Requires access permission (restricted building)
        </label>
      </div>
    </div>
  );
}
