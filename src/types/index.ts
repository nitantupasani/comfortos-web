/* ── Roles ─────────────────────────────────────────────── */
export type UserRole = 'occupant' | 'tenant_facility_manager' | 'building_facility_manager' | 'admin';

/* ── Auth ──────────────────────────────────────────────── */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  buildingAccess: BuildingAccessGrant[];
  claims: Record<string, unknown>;
}

export interface BuildingAccessGrant {
  buildingId: string;
  grantedBy: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/* ── Buildings ────────────────────────────────────────── */
export interface Building {
  id: string;
  name: string;
  address: string;
  tenantId: string | null;
  city: string;
  latitude: number;
  longitude: number;
  requiresAccessPermission: boolean;
  dailyVoteLimit: number;
  metadata: Record<string, unknown>;
}

/* ── Tenants ──────────────────────────────────────────── */
export interface Tenant {
  id: string;
  name: string;
  emailDomain: string;
  authProvider: string;
  createdAt: string;
}

export interface BuildingTenant {
  id: string;
  buildingId: string;
  tenantId: string;
  floors: string[];
  zones: string[];
  isActive: boolean;
}

/* ── Votes ────────────────────────────────────────────── */
export type VoteStatus = 'pending' | 'queued' | 'submitted' | 'confirmed' | 'failed';

export interface Vote {
  voteUuid: string;
  buildingId: string;
  userId: string;
  payload: Record<string, unknown>;
  schemaVersion: number;
  createdAt: string;
  status: VoteStatus;
}

export interface VoteSubmitResponse {
  status: 'accepted' | 'already_accepted';
  voteUuid: string;
}

/* ── Presence ─────────────────────────────────────────── */
export type PresenceMethod = 'qr' | 'wifi' | 'ble' | 'manual';

export interface PresenceEvent {
  buildingId: string;
  method: PresenceMethod;
  confidence: number;
  isVerified: boolean;
  timestamp: string;
}

/* ── Comfort ──────────────────────────────────────────── */
export interface BuildingComfortData {
  buildingId: string;
  buildingName: string;
  overallScore: number;
  totalVotes: number;
  computedAt: string;
  locations: LocationComfortData[];
  sduiConfig?: Record<string, unknown>;
}

export interface LocationComfortData {
  floor: string;
  floorLabel: string;
  room: string;
  roomLabel: string;
  comfortScore: number;
  voteCount: number;
  breakdown: Record<string, number>;
}

/* ── SDUI ─────────────────────────────────────────────── */
export interface SduiNode {
  type: string;
  [key: string]: unknown;
  children?: SduiNode[];
}

/* ── Vote Form Schema ─────────────────────────────────── */
export interface VoteFormField {
  id: string;
  key?: string;
  type: string;
  question: string;
  label?: string;
  required?: boolean;
  options?: VoteFormOption[];
  maxStars?: number;
  max?: number;
  min?: number;
  defaultValue?: number;
  labels?: Record<string, string>;
  maxLength?: number;
  hint?: string;
  yesLabel?: string;
  noLabel?: string;
}

export interface VoteFormOption {
  value: number | string;
  label: string;
  emoji?: string;
  icon?: string;
  color?: string;
  exclusive?: boolean;
}

export interface VoteFormSchema {
  version: number;
  schemaVersion?: number;
  title: string;
  formTitle?: string;
  description?: string;
  formDescription?: string;
  thanksMessage?: string;
  allowAnonymous?: boolean;
  cooldownMinutes?: number;
  fields: VoteFormField[];
}

/* ── Location Form ────────────────────────────────────── */
export interface LocationFloor {
  id: string;
  label: string;
  rooms: { id: string; label: string }[];
}

export interface LocationFormConfig {
  floors: LocationFloor[];
}

/* ── Building Config ──────────────────────────────────── */
export interface BuildingConfig {
  schemaVersion: number;
  dashboardLayout: SduiNode | null;
  voteFormSchema: VoteFormSchema | null;
  locationFormConfig: LocationFormConfig | null;
  fetchedAt: string;
}

/* ── Weather ──────────────────────────────────────────── */
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  icon: string;
  fetchedAt: string;
}

/* ── Notification ─────────────────────────────────────── */
export interface AppNotification {
  id: string;
  type: 'voteConfirmation' | 'configUpdate' | 'alert' | 'deepLink';
  title: string;
  body: string;
  deepLink?: string;
  data?: Record<string, unknown>;
  receivedAt: string;
}
