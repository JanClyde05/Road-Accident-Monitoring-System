// Road Accident Monitoring System — TypeScript Interfaces

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

export interface EventData {
  id: string;
  deviceToken: string;
  type: 'telemetry' | 'alert' | 'false_alarm' | 'test' | string;
  lat: number;
  lon: number;
  eventType?: number;
  eventTypeName?: string;
  battPct?: number;
  aMag?: number;
  timestamp?: number | string;
  createdAt: string;
  status?: string;
  title: string;
  deviceName?: string;
  photoUrl?: string;
  // Wearable Registration & Incident Profile Details
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

export interface EventsResponse {
  events: EventData[];
  total?: number;
}

export type MarkerColor = 'red' | 'amber' | 'green' | 'blue';
export type ThemeMode = 'dark' | 'light';

export function getMarkerColor(event: EventData): MarkerColor {
  switch (event.type) {
    case 'alert':       return 'red';
    case 'test':        return 'amber';
    case 'false_alarm': return 'green';
    case 'telemetry':   return 'blue';
    default:            return 'blue';
  }
}

export function getStatusLabel(event: EventData): string {
  switch (event.type) {
    case 'alert':       return 'CRASH ALERT';
    case 'test':        return 'TEST PIN';
    case 'false_alarm': return 'FALSE ALARM';
    case 'telemetry':   return 'LIVE TRACKING';
    default:            return (event.type || '').toUpperCase();
  }
}

export function formatTimestamp(iso: string | number): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-PH', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    });
  } catch {
    return String(iso);
  }
}
