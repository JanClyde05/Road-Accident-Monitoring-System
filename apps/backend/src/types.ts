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
  accidentType?: string;
  accidentDescription?: string;
  isLastKnownLocation?: boolean;
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
  if (event.status === 'RESCUED' || event.status === 'rescued') return 'green';
  switch (event.type) {
    case 'alert':       return 'red';
    case 'test':        return 'amber';
    case 'false_alarm': return 'green';
    case 'telemetry':   return 'blue';
    default:            return 'blue';
  }
}

export function getStatusLabel(event: EventData): string {
  if (event.status === 'RESCUED' || event.status === 'rescued') return 'RESCUED / CLEARED';
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

export interface AccidentClassification {
  category: 'FALL' | 'SKID' | 'CRASH' | 'ROLLOVER' | 'OSCILLATION' | 'FALSE_ALARM' | 'TELEMETRY' | 'TEST';
  label: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE';
  badgeClass: string;
}

export function classifyAccident(event: EventData): AccidentClassification {
  if (event.type === 'false_alarm' || (event.title && event.title.toLowerCase().includes('false alarm'))) {
    return {
      category: 'FALSE_ALARM',
      label: 'FALSE ALARM (CANCELLED)',
      description: 'Impact alert cancelled by rider via hands-free voice or wearable button.',
      severity: 'SAFE',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    };
  }

  if (event.type === 'telemetry') {
    return {
      category: 'TELEMETRY',
      label: 'ROUTINE GPS BEACON',
      description: 'Periodic positioning telemetry and battery health update.',
      severity: 'SAFE',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    };
  }

  if (event.type === 'test') {
    return {
      category: 'TEST',
      label: 'DIAGNOSTIC TEST PIN',
      description: 'Routine hardware sensor diagnostic test sequence.',
      severity: 'LOW',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    };
  }

  // Check eventType numeric enum (from protocol.h: 0=Fall, 1=Skid, 2=Direct Impact, 3=Ground Shock/Rollover, 4=Wave Motion)
  if (event.eventType === 0) {
    return {
      category: 'FALL',
      label: 'RIDER FALL DETECTED',
      description: 'Full FSM-confirmed fall sequence with lateral tilt and kinetic rest.',
      severity: 'CRITICAL',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };
  }
  if (event.eventType === 1) {
    return {
      category: 'SKID',
      label: 'SKID / LOSS OF TRACTION',
      description: 'Loss of tire traction detected with lateral deceleration and angular roll.',
      severity: 'HIGH',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    };
  }
  if (event.eventType === 2) {
    return {
      category: 'CRASH',
      label: 'DIRECT HIGH-G IMPACT',
      description: 'High-energy vehicular collision shockwave with abrupt deceleration.',
      severity: 'CRITICAL',
      badgeClass: 'bg-rose-600/20 text-rose-300 border-rose-600/50'
    };
  }
  if (event.eventType === 3) {
    return {
      category: 'ROLLOVER',
      label: 'GROUND SHOCK / ROLLOVER',
      description: 'Chassis rollover and structural ground shock detected.',
      severity: 'CRITICAL',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    };
  }
  if (event.eventType === 4) {
    return {
      category: 'OSCILLATION',
      label: 'SEVERE CHASSIS OSCILLATION',
      description: 'Speed wobble or severe wave oscillation detected.',
      severity: 'HIGH',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    };
  }

  // Fallback: Infer from eventTypeName or title
  const text = `${event.eventTypeName || ''} ${event.title || ''}`.toLowerCase();
  if (text.includes('fall')) {
    return {
      category: 'FALL',
      label: 'RIDER FALL DETECTED',
      description: 'Kinematic fall sequence with lateral tilt and prolonged rest.',
      severity: 'CRITICAL',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };
  }
  if (text.includes('skid') || text.includes('traction')) {
    return {
      category: 'SKID',
      label: 'SKID / LOSS OF TRACTION',
      description: 'Loss of tire traction detected with high angular roll rate.',
      severity: 'HIGH',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    };
  }
  if ((event.aMag && event.aMag >= 4.0) || text.includes('impact') || text.includes('crash') || text.includes('collision')) {
    return {
      category: 'CRASH',
      label: 'SEVERE COLLISION IMPACT',
      description: 'High-magnitude kinetic deceleration shockwave exceeding 4.0G baseline.',
      severity: 'CRITICAL',
      badgeClass: 'bg-rose-600/20 text-rose-300 border-rose-600/50'
    };
  }

  return {
    category: 'CRASH',
    label: 'VEHICULAR IMPACT EVENT',
    description: 'Kinematic shock event requiring immediate rescuer dispatch.',
    severity: 'HIGH',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  };
}
