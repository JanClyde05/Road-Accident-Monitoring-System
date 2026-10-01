export interface WearableRegistration {
  fullName: string;
  role?: string;
  photoUrl?: string;
  contactNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  bloodType?: string;
  allergies?: string;
  vehicleModel?: string;
  plateNumber?: string;
  deviceToken: string;
  formFactor?: string;
  firmware?: string;
  registeredDate?: string;
  locationAddress?: string;
}

export interface GuardianEvent {
  id: string;
  lat: number;
  lon: number;
  type: string;
  isTelemetry?: boolean;
  audioKey?: string;
  audioUrl?: string;
  audioSize?: number;
  batt?: number | string;
  battPct?: number;
  aMag?: number;
  signal?: number | string;
  speed?: number;
  accuracy?: number;
  createdAt: string | number;
  timestamp?: string | number;
  deviceModel?: string;
  deviceName?: string;
  deviceToken?: string;
  status?: 'normal' | 'alert' | 'critical';
  title?: string;
  eventTypeName?: string;
  photoUrl?: string;
  notes?: string;
  // Registration Profile Details
  riderName?: string;
  riderRole?: string;
  contactNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  bloodType?: string;
  allergies?: string;
  vehicleModel?: string;
  plateNumber?: string;
  locationAddress?: string;
  formFactor?: string;
  firmware?: string;
}

export interface EventData {
  id: string;
  deviceName?: string;
  deviceToken?: string;
  lat: number;
  lon: number;
  type: 'alert' | 'test' | 'false_alarm' | 'telemetry' | 'register' | 'rider_profile' | string;
  title: string;
  eventTypeName?: string;
  aMag?: number;
  battPct?: number;
  photoUrl?: string;
  createdAt: string;
  status?: 'normal' | 'alert' | 'critical';
  // Wearable Registration & Incident Showcase Details
  riderName?: string;
  riderRole?: string;
  contactNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  bloodType?: string;
  allergies?: string;
  vehicleModel?: string;
  plateNumber?: string;
  locationAddress?: string;
  formFactor?: string;
  firmware?: string;
  audioUrl?: string;
}

export interface EventsResponse {
  events: EventData[];
}

export type EventFilter = 'all' | 'audio' | 'telemetry' | 'alert' | 'test';
export type ThemeMode = 'dark' | 'light';
export type ViewDensity = 'comfortable' | 'compact';

export function isEventFalseAlarm(event: EventData | null | undefined): boolean {
  if (!event) return false;
  if (event.type === 'false_alarm') return true;
  if (event.status && event.status.trim().toUpperCase() === 'FALSE ALARM') return true;
  return false;
}

export function isEventRescued(event: EventData | null | undefined): boolean {
  if (!event) return false;
  if (event.type === 'rescued') return true;
  if (event.status && event.status.trim().toUpperCase() === 'RESCUED') return true;
  return false;
}

export function isEventActiveAlert(event: EventData | null | undefined): boolean {
  if (!event) return false;
  if (event.type !== 'alert') return false;
  if (isEventFalseAlarm(event)) return false;
  if (isEventRescued(event)) return false;
  return true;
}

export function getMarkerColor(event: EventData): 'red' | 'amber' | 'green' | 'blue' | 'purple' {
  if (isEventRescued(event)) {
    return 'green';
  }
  if (isEventFalseAlarm(event)) {
    return 'green';
  }
  switch (event.type) {
    case 'alert':
      return 'red';
    case 'test':
      return 'amber';
    case 'false_alarm':
      return 'green';
    case 'register':
    case 'rider_profile':
      return 'purple';
    case 'telemetry':
      return 'blue';
    default:
      return 'blue';
  }
}

export function getStatusLabel(event: EventData): string {
  if (isEventRescued(event)) {
    return 'RESCUED';
  }
  if (isEventFalseAlarm(event)) {
    return 'FALSE ALARM';
  }
  switch (event.type) {
    case 'alert':
      return 'CRASH ALERT';
    case 'test':
      return 'TEST PIN';
    case 'false_alarm':
      return 'FALSE ALARM';
    case 'register':
      return 'REGISTERED';
    case 'rider_profile':
      return 'PROFILE SYNC';
    case 'telemetry':
      return 'LIVE TRACKING';
    default:
      return (event.type || '').toUpperCase();
  }
}

export function formatTimestamp(iso: string | number): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return String(iso);
  }
}

export function formatDirectDriveUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '/logo.png' || trimmed === '/logo.jpg') return trimmed;
  if (trimmed.includes('lh3.googleusercontent.com')) return trimmed;
  const match = trimmed.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}
