import { useState } from 'react';
import { ChevronDown, ChevronRight, ShieldAlert, ListChecks } from 'lucide-react';
import { useBuildingWizardStore } from '../../../store/buildingWizardStore';

/**
 * Priva Cloud onboarding fields.
 *
 * Priva Operator has no public token for buildings without the Historical Data
 * API add-on, so ComfortOS replays the GUI's authenticated session: an operator
 * (the ComfortOS team or an automated agent) logs in with 2FA, then captures the
 * BFF session cookie + the building's SignalR identifiers. This form collects
 * those. See backend/docs/PRIVA_FINDINGS.md for the full protocol.
 */
export default function PrivaConnectorFields() {
  const { connector, setConnector } = useBuildingWizardStore();
  const [showGuide, setShowGuide] = useState(true);

  return (
    <div className="space-y-4 border-t border-gray-100 pt-5">
      {/* Unofficial-API warning */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <span className="font-medium">Priva Cloud uses a replayed login session.</span>{' '}
          There is no machine login for this building, so a person or agent must sign in
          (with 2FA) and capture a session cookie. The cookie expires and is re-captured
          periodically. This is unofficial; the supported path is Priva's Historical Data
          API add-on.
        </div>
      </div>

      {/* Capture guide */}
      <button
        type="button"
        onClick={() => setShowGuide((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-800"
      >
        {showGuide ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        How the ComfortOS team / agent captures these values
      </button>
      {showGuide && (
        <ol className="list-decimal ml-5 space-y-1.5 text-xs text-gray-600 rounded-xl bg-gray-50 border border-gray-200 p-4">
          <li>Sign in to <span className="font-mono">operator.priva.com</span> for this building (email + password + 2FA).</li>
          <li>Open DevTools → <span className="font-semibold">Network</span>, click any <span className="font-mono">/operator/api/…</span> request → <span className="font-semibold">Headers</span> → copy the <span className="font-mono">__Host-bff=…</span> pair from the <span className="font-mono">cookie</span> header into <span className="font-semibold">Session cookie</span> below.</li>
          <li>Open the room/temperature view, then DevTools → <span className="font-semibold">Network → Socket → telemetryhub → Messages</span>. Copy the <span className="font-mono">subscribe</span> frame.</li>
          <li>From that frame read <span className="font-semibold">siteId</span>, <span className="font-semibold">serverId</span>, <span className="font-semibold">deviceGroupId</span>, and the <span className="font-semibold">controller serial</span> (2nd argument) into the fields below.</li>
          <li>The per-sensor variable → room mapping is configured after the building is created (Telemetry tab).</li>
        </ol>
      )}

      {/* Session cookie */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Session cookie <span className="text-gray-400">(secret — stored encrypted)</span>
        </label>
        <textarea
          value={connector.privaBffCookie}
          onChange={(e) => setConnector({ privaBffCookie: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-xs font-mono h-20 focus:ring-2 focus:ring-primary-300 outline-none"
          placeholder="__Host-bff=CfDJ8M…"
          spellCheck={false}
        />
      </div>

      {/* Identifiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Site ID</label>
          <input
            value={connector.privaSiteId}
            onChange={(e) => setConnector({ privaSiteId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="77512949-…"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Server / controller ID</label>
          <input
            value={connector.privaServerId}
            onChange={(e) => setConnector({ privaServerId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="fd38d24d-…"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Device group ID</label>
          <input
            value={connector.privaGroupId}
            onChange={(e) => setConnector({ privaGroupId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="p57560"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Controller serial</label>
          <input
            value={connector.privaController}
            onChange={(e) => setConnector({ privaController: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="AX202305100382"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Store reading every (minutes)</label>
          <input
            type="number"
            min={1}
            value={connector.privaFlushMinutes}
            onChange={(e) => setConnector({ privaFlushMinutes: parseInt(e.target.value) || 15 })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800">
        <ListChecks className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          After the building is created, map each Priva variable to a room and metric in the
          building's Telemetry tab. Live data starts streaming once the connector is enabled.
        </span>
      </div>
    </div>
  );
}
