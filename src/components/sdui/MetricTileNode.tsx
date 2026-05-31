import { createContext, useContext, useEffect, useState } from 'react';
import { Thermometer, Wind, Volume2, Cloud, Droplets } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { useAuthStore } from '../../store/authStore';
import { telemetryApi, type TelemetryLatestReading } from '../../api/telemetry';

/* ── Shared latest-readings context ──────────────────────────
 * Fetched ONCE per active building (the /latest endpoint returns the most
 * recent reading per metric per location, so every metric_tile on the
 * dashboard shares a single request and filters down to the occupant's room.
 */

interface LatestState {
  readings: TelemetryLatestReading[];
  loading: boolean;
}

const LatestReadingsContext = createContext<LatestState>({ readings: [], loading: false });

export function LatestReadingsProvider({
  children,
  refreshKey = 0,
}: {
  children: React.ReactNode;
  /** Bump to force a re-fetch (e.g. wired to a manual refresh button). */
  refreshKey?: number;
}) {
  const activeBuilding = usePresenceStore((s) => s.activeBuilding);
  const token = useAuthStore((s) => s.token);
  const [state, setState] = useState<LatestState>({ readings: [], loading: false });

  useEffect(() => {
    if (!activeBuilding || !token) {
      setState({ readings: [], loading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    telemetryApi
      .latest(activeBuilding.id)
      .then((readings) => { if (!cancelled) setState({ readings, loading: false }); })
      .catch(() => { if (!cancelled) setState({ readings: [], loading: false }); });
    return () => { cancelled = true; };
  }, [activeBuilding?.id, token, refreshKey]);

  return (
    <LatestReadingsContext.Provider value={state}>{children}</LatestReadingsContext.Provider>
  );
}

/* ── Metric resolution ─────────────────────────────────────── */

/** Map an icon name or label to a telemetry metric type. */
function resolveMetricType(icon?: string, label?: string): string | null {
  const hay = `${icon ?? ''} ${label ?? ''}`.toLowerCase();
  if (/(temp|thermo)/.test(hay)) return 'temperature';
  if (/(co2|co₂)/.test(hay)) return 'co2';
  if (/(humid|water_drop)/.test(hay)) return 'relative_humidity';
  if (/(noise|volume|sound|db)/.test(hay)) return 'noise';
  return null;
}

/** Humidity is stored as relative_humidity; accept either spelling. */
function metricMatches(reading: string, wanted: string): boolean {
  if (reading === wanted) return true;
  const norm = (m: string) => (m === 'humidity' ? 'relative_humidity' : m);
  return norm(reading) === norm(wanted);
}

function formatValue(metricType: string, value: number): string {
  if (metricType === 'temperature') return value.toFixed(1);
  return String(Math.round(value));
}

/* ── Component ─────────────────────────────────────────────── */

interface Props {
  icon?: string;
  unit?: string;
  label?: string;
  /** Static fallback used in previews / when no live reading is available. */
  value?: string;
  /** Optional explicit metric; inferred from icon/label when omitted. */
  metricType?: string;
}

export default function MetricTileNode({ icon, unit, label, value, metricType }: Props) {
  const room = usePresenceStore((s) => s.room);
  const roomLabel = usePresenceStore((s) => s.roomLabel);
  const { readings } = useContext(LatestReadingsContext);

  const metric = metricType ?? resolveMetricType(icon, label);

  // Pick the reading for the occupant's room: prefer a location-id match,
  // fall back to the legacy zone (room label) when readings carry no id.
  let live: TelemetryLatestReading | undefined;
  if (metric) {
    const forMetric = readings.filter((r) => metricMatches(r.metricType, metric));
    live =
      (room ? forMetric.find((r) => r.locationId === room) : undefined) ??
      (roomLabel ? forMetric.find((r) => r.zone === roomLabel) : undefined);
  }

  const displayValue = live ? formatValue(metric!, live.value) : (value ?? '--');
  const displayUnit = live?.unit || unit || '';

  return (
    <div className="bg-white rounded-xl border p-4 flex flex-col items-center gap-1 shadow-sm">
      <div className="text-primary-500">{resolveIcon(icon)}</div>
      <div className="text-2xl font-bold">{displayValue}</div>
      <div className="text-xs text-gray-400">{displayUnit}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}

/* Icon resolution kept local so the tile renders standalone. Mirrors the
 * ICON_MAP in SduiRenderer for the metric icons in use. */
const TILE_ICONS: Record<string, React.ElementType> = {
  thermostat: Thermometer, thermometer: Thermometer,
  air: Wind, co2: Cloud, wind: Wind, cloud: Cloud,
  volume_up: Volume2, noise: Volume2,
  humidity: Droplets, water_drop: Droplets,
};

function resolveIcon(name?: string) {
  if (!name) return null;
  const Comp = TILE_ICONS[name] ?? TILE_ICONS[name.toLowerCase()];
  return Comp ? <Comp className="h-5 w-5" /> : null;
}
