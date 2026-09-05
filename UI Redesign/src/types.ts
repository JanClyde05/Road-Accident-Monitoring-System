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
  type: 'alert' | 'test' | 'false_alarm' | 'telemetry' | string;
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

export function getMarkerColor(event: EventData): 'red' | 'amber' | 'green' | 'blue' {
  switch (event.type) {
    case 'alert':
      return 'red';
    case 'test':
      return 'amber';
    case 'false_alarm':
      return 'green';
    case 'telemetry':
      return 'blue';
    default:
      return 'blue';
  }
}

export function getStatusLabel(event: EventData): string {
  switch (event.type) {
    case 'alert':
      return 'CRASH ALERT';
    case 'test':
      return 'TEST PIN';
    case 'false_alarm':
      return 'FALSE ALARM';
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
