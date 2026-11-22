export interface PresenterSlot {
  id: string;
  roleLabel: string;
  name: string;
}

export interface UiCaptureDefinition {
  id: 'android-telemetry' | 'cmd-map' | 'cmd-triage' | 'cmd-hotspot';
  lens: 'rider' | 'rescuer';
  tabLabel: string;
  windowTitle: string;
  aspectLabel: string;
  caption: string;
  recommendedCapture: string;
}

export const DEFAULT_PRESENTERS: PresenterSlot[] = [
  { id: 'presenter-1', roleLabel: '01 · System Lead', name: 'Presenter Name 01' },
  { id: 'presenter-2', roleLabel: '02 · Hardware & PCB', name: 'Presenter Name 02' },
  { id: 'presenter-3', roleLabel: '03 · Phone Sensor App', name: 'Presenter Name 03' },
  { id: 'presenter-4', roleLabel: '04 · LoRa Radio', name: 'Presenter Name 04' },
  { id: 'presenter-5', roleLabel: '05 · Rescue Map UI', name: 'Presenter Name 05' },
];

export const UI_CAPTURE_SLOTS: UiCaptureDefinition[] = [
  {
    id: 'android-telemetry',
    lens: 'rider',
    tabLabel: 'Telemetry Tab',
    windowTitle: 'Android App · Live Motion & Bluetooth Link',
    aspectLabel: '9:16 Mobile Capture',
    caption: 'Smartphone motion and GPS sensors filter bumps on-device and trigger the wearable over Bluetooth.',
    recommendedCapture: 'Drop a PNG/JPG screenshot of the Android Telemetry tab here before presenting.',
  },
  {
    id: 'cmd-map',
    lens: 'rescuer',
    tabLabel: 'Leaflet Map',
    windowTitle: 'Command Center · Live Incident Map',
    aspectLabel: '16:10 Desktop Capture',
    caption: 'Live dispatch map plotting rider coordinates received from the wearable over off-grid LoRa radio.',
    recommendedCapture: 'Capture the active alert pin and alarm banner from the Command Center dashboard.',
  },
  {
    id: 'cmd-triage',
    lens: 'rescuer',
    tabLabel: 'Triage Profile',
    windowTitle: 'Command Center · Medical Triage',
    aspectLabel: '16:10 Desktop Capture',
    caption: 'Displays rider identity, blood type, allergies, and emergency contact ahead of ambulance arrival.',
    recommendedCapture: 'Capture the Triage window showing rider details, blood type, and ICE contact.',
  },
  {
    id: 'cmd-hotspot',
    lens: 'rescuer',
    tabLabel: 'Hotspot Predictor',
    windowTitle: 'Command Center · Hotspot Predictor',
    aspectLabel: '16:10 Desktop Capture',
    caption: 'Groups past road-incident locations to guide standby ambulance staging along risky stretches.',
    recommendedCapture: 'Capture the Hotspot Predictor map tab from the desktop console.',
  },
];

export const PRESENTER_STORAGE_KEY = 'rams_presenter_roster_v1';

export function normalizePresenters(input?: Partial<PresenterSlot>[] | null): PresenterSlot[] {
  return DEFAULT_PRESENTERS.map((fallback, index) => {
    const candidate = input?.[index];
    const trimmed = typeof candidate?.name === 'string' ? candidate.name.trim() : '';
    return {
      id: fallback.id,
      roleLabel: fallback.roleLabel,
      name: trimmed.length > 0 ? trimmed.slice(0, 64) : fallback.name,
    };
  });
}

export function loadPresenters(): PresenterSlot[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_PRESENTERS;
    }
    const raw = window.localStorage.getItem(PRESENTER_STORAGE_KEY);
    if (!raw) return DEFAULT_PRESENTERS;
    const parsed = JSON.parse(raw) as Partial<PresenterSlot>[];
    return Array.isArray(parsed) ? normalizePresenters(parsed) : DEFAULT_PRESENTERS;
  } catch {
    return DEFAULT_PRESENTERS;
  }
}

export function savePresenters(slots: PresenterSlot[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PRESENTER_STORAGE_KEY, JSON.stringify(normalizePresenters(slots)));
  } catch {
    // Ignore quota or private-browsing storage errors
  }
}
