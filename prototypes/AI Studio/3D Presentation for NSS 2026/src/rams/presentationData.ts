export interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  rollDeg: number;
  shotLabel: string;
}

export interface HardwareNodeSpec {
  id: string;
  name: string;
  role: string;
  specs: string;
  accent: string;
  ownership: 'Smartphone' | 'RAMS AI' | 'Wearable PCB';
}

export interface PresentationBeat {
  id: string;
  indexLabel: string;
  chapter: string;
  layoutAlign: 'left' | 'right' | 'center-bottom';
  title: string;
  subtitle: string;
  summary: string;
  metrics: { label: string; value: string; note: string }[];
  camera: CameraKeyframe;
  particleHue: [number, number, number]; // RGB 0..1
  skyZenith: [number, number, number]; // RGB 0..1
  skyHorizon: [number, number, number]; // RGB 0..1
}

export interface ResearchedToolItem {
  category: string;
  name: string;
  licenseOrTier: string;
  role: string;
}

export const RIDER_MEDICAL_PROFILE = {
  riderName: 'Marco Villanueva',
  userCategory: 'All Road Users · Sample: Motorcycle',
  plateNumber: 'NGR-4821',
  bloodType: 'O+',
  allergies: 'Penicillin · Sulfa Drugs',
  emergencyContact: 'Elena Villanueva (+63 917 555 0194)',
  deviceNode: 'RAMS Wearable Unit #04',
  corridor: 'Maharlika Hwy · Tuguegarao',
};

export interface HardwareRevisionSpec {
  id: 'tht' | 'smd';
  label: string;
  shortLabel: string;
  boardTitle: string;
  statusTag: string;
  architectureNote: string;
  topPreviewUrl?: string;
  isoPreviewUrl?: string;
  bottomPreviewUrl?: string;
}

export const HARDWARE_REVISIONS: HardwareRevisionSpec[] = [
  {
    id: 'tht',
    label: 'Design 01 · Self-Fabricated Prototype',
    shortLabel: 'Self-Built THT',
    boardTitle: 'Self-Built Copper THT Board',
    statusTag: 'Working Prototype · Wire-Free PCB',
    architectureNote:
      'Self-fabricated copper-trace circuit board with zero loose wires. Connects the ESP32-S3 SuperMini, Ra-02 LoRa radio, buzzer, 3.7V battery, and battery divider cleanly.',
  },
  {
    id: 'smd',
    label: 'Design 02 · Astra Custom SMD PCB',
    shortLabel: 'Astra Custom SMD',
    boardTitle: 'Astra Custom SMD Board (42 × 32 mm)',
    statusTag: 'Custom CAD · Production Candidate',
    architectureNote:
      'Compact 42 × 32 mm wearable board co-designed with Astra inside GPT6 Astra Build, placing the ESP32-S3, USB-C charging, buzzer, and underside Ra-02 radio cleanly on a pocket-sized PCB.',
    topPreviewUrl: '/assets/hardware/smd_top_3d.png',
    isoPreviewUrl: '/assets/hardware/smd_top_iso_3d.png',
    bottomPreviewUrl: '/assets/hardware/smd_bottom_3d.png',
  },
];

export const HARDWARE_BOM_NODES: HardwareNodeSpec[] = [
  {
    id: 'smartphone',
    name: 'User Smartphone',
    role: 'Motion Sensors & GPS',
    specs: 'Reads speed, tilt, and GPS directly for pedestrians, cyclists, drivers, and riders',
    accent: '#38bdf8',
    ownership: 'Smartphone',
  },
  {
    id: 'rams-ai',
    name: 'RAMS AI Engine',
    role: 'Smart Crash Filtering',
    specs: 'Separates bumps, walking, and drops from true impacts on-device and flags risk zones',
    accent: '#2dd4bf',
    ownership: 'RAMS AI',
  },
  {
    id: 'esp32',
    name: 'ESP32-S3 SuperMini',
    role: 'Wearable Controller',
    specs: 'Receives the Bluetooth trigger and drives the alert buzzer, RGB LED, and LoRa',
    accent: '#f59e0b',
    ownership: 'Wearable PCB',
  },
  {
    id: 'lora',
    name: 'Ra-02 433 MHz LoRa',
    role: 'Off-Grid Radio Link',
    specs: 'Sends the SOS location and medical card to rescuers even with zero mobile signal',
    accent: '#10b981',
    ownership: 'Wearable PCB',
  },
  {
    id: 'divider',
    name: 'Battery Divider',
    role: 'Safe Power Sensing',
    specs: 'Monitors battery charge through copper PCB traces without loose jumper wires',
    accent: '#38bdf8',
    ownership: 'Wearable PCB',
  },
  {
    id: 'buzzer',
    name: 'Active Buzzer & Cancel',
    role: '10-Second Safety Check',
    specs: 'Alerts the user right after impact so false alarms can be stopped in 10 seconds',
    accent: '#fb7185',
    ownership: 'Wearable PCB',
  },
  {
    id: 'battery',
    name: '3.7V LiPo Battery',
    role: 'Wearable Power',
    specs: 'Powers the wearable ESP32-S3 controller, alarm buzzer, and LoRa radio link',
    accent: '#a78bfa',
    ownership: 'Wearable PCB',
  },
];

export const SYSTEM_HIGHLIGHTS = [
  {
    index: '01',
    title: 'Zero Sensor Duplication',
    detail: 'Uses the smartphone’s existing GPS and motion sensors, keeping the wearable light and affordable.',
  },
  {
    index: '02',
    title: 'Works Without Mobile Signal',
    detail: '433 MHz LoRa radio delivers the SOS alert and medical details to rescue base stations in deadzones.',
  },
  {
    index: '03',
    title: 'Dual Prototype Path',
    detail: 'Proven on our wire-free Self-Built THT board and scaled to Astra’s 42 × 32 mm Custom SMD design.',
  },
  {
    index: '04',
    title: 'Built for All Road Users',
    detail: 'Supports Pedestrian, Cyclist, Car Driver, and Motorcycle modes with 10-second or "Hey RAMS" cancel.',
  },
  {
    index: '05',
    title: 'Ready-to-Treat Rescuer View',
    detail: 'Responders see exact GPS location, blood type, allergies, and emergency contacts immediately.',
  },
];

export const RESEARCHED_PRESENTATION_TOOLS: ResearchedToolItem[] = [
  {
    category: 'Real-Time 3D Engine',
    name: 'Three.js + Real CAD & Vehicle Assets',
    licenseOrTier: 'Open Source · Runs Offline',
    role: 'Renders the highway, rider, ambulance, streetlights, and Astra’s 3D SMD PCB directly in the browser.',
  },
  {
    category: 'Motion & Camera',
    name: 'Lenis Scroll + Damped Camera System',
    licenseOrTier: 'MIT · Smooth Playback',
    role: 'Keeps transitions, wheel spin, and exploded PCB inspection responsive and fluid.',
  },
  {
    category: 'PCB 3D Slot',
    name: 'Astra CAD (.GLB) + Custom THT .GLB Upload',
    licenseOrTier: 'Project Hardware Files',
    role: 'Supports KiCad GLB export directly—drop in your Self-Built THT .GLB at any time.',
  },
  {
    category: 'Venue Controls',
    name: 'Arrow Keys · 3D Focus (Z) · Hide Bar (H)',
    licenseOrTier: 'Built-In Defense Controls',
    role: 'Navigate cleanly with Left/Right arrows, Z for full-screen 3D focus, or H to collapse the bottom bar.',
  },
];

export const PRESENTATION_BEATS: PresentationBeat[] = [
  {
    id: 'cold-open',
    indexLabel: '01',
    chapter: 'Cold Open',
    layoutAlign: 'left',
    title: 'The silent mile',
    subtitle: 'When an accident happens out of sight, every unseen minute matters.',
    summary:
      'Around 3,200 lives are lost on roads worldwide every day—including roughly 30 daily in the Philippines. Across rural highways and blind curves, the biggest danger after a crash is how long nobody knows a pedestrian, cyclist, driver, or rider needs help.',
    metrics: [
      { label: 'Global Road Deaths', value: '1.19M / yr', note: 'WHO 2023 Status Report' },
      { label: 'Philippines Daily', value: '~30 / day', note: '11,096 deaths in 2021 (PSA)' },
    ],
    camera: {
      position: [4.2, 1.8, 10.9],
      target: [-1.1, 0.95, -0.6],
      fov: 40,
      rollDeg: 0,
      shotLabel: 'Night Highway Approach',
    },
    particleHue: [0.32, 0.72, 0.96],
    skyZenith: [0.02, 0.04, 0.09],
    skyHorizon: [0.07, 0.14, 0.26],
  },
  {
    id: 'the-problem',
    indexLabel: '02',
    chapter: 'Main Problems',
    layoutAlign: 'left',
    title: 'Three broken links after a crash',
    subtitle: 'No witness, no cellular signal, and no medical details.',
    summary:
      'Along quiet and rural roads, three gaps slow rescue for every traveler: no one sees the crash, weak mobile signal blocks calls for help, and ambulance crews arrive without knowing the patient’s blood type or allergies.',
    metrics: [
      { label: 'Link 01 · Visibility', value: 'No Witness', note: 'Unseen crashes on quiet roads' },
      { label: 'Link 02 · Coverage', value: 'Signal Gaps', note: 'Mobile data drops in blind spots' },
      { label: 'Link 03 · Readiness', value: 'Blind Dispatch', note: 'Missing medical context en route' },
    ],
    camera: {
      position: [-9.4, 4.3, 9.2],
      target: [2.0, 2.2, -10.8],
      fov: 45,
      rollDeg: -1.0,
      shotLabel: 'Deadzone Overlook',
    },
    particleHue: [0.96, 0.34, 0.32],
    skyZenith: [0.06, 0.04, 0.09],
    skyHorizon: [0.22, 0.08, 0.12],
  },
  {
    id: 'impact-problem',
    indexLabel: '03',
    chapter: 'Impact of the Problem',
    layoutAlign: 'left',
    title: 'A 39% rise hitting all road users',
    subtitle: 'Why protection must cover pedestrians, cyclists, drivers, and riders.',
    summary:
      'Philippine Statistics Authority records show road deaths rose 39% from 7,938 in 2011 to 11,096 in 2021. Over half involve pedestrians, cyclists, and two-wheelers alongside passenger cars—yet most people on the road have no built-in automated emergency alert.',
    metrics: [
      { label: 'PSA 2011–2021', value: '+39% Rise', note: '7,938 → 11,096 deaths per year' },
      { label: 'Vulnerable Share', value: '53% VRU', note: 'Pedestrians, cyclists & riders (WHO)' },
      { label: 'User Support', value: '4 Profiles', note: 'Foot · Cycle · Car · Motorcycle' },
    ],
    camera: {
      position: [-2.6, 3.8, -11.5],
      target: [0.6, 4.2, -22.5],
      fov: 42,
      rollDeg: 0.4,
      shotLabel: 'Impact & Risk Profile',
    },
    particleHue: [0.98, 0.65, 0.22],
    skyZenith: [0.07, 0.05, 0.08],
    skyHorizon: [0.24, 0.14, 0.09],
  },
  {
    id: 'our-approach',
    indexLabel: '04',
    chapter: 'Our Approach · Dual Hardware',
    layoutAlign: 'left',
    title: 'Phone sensors + two wearable PCB designs',
    subtitle: 'Self-fabricated copper prototype alongside Astra’s custom SMD board.',
    summary:
      'RAMS lets the user’s smartphone handle GPS and motion sensing across all four road modes, keeping the wearable compact and dependable. Switch between our working Self-Fabricated THT board (wire-free copper traces) and Astra’s 42 × 32 mm Custom SMD board candidate.',
    metrics: [
      { label: 'Phone Responsibility', value: 'GPS + Motion', note: 'Zero duplicate sensors on PCB' },
      { label: 'Hardware Path', value: 'THT → 42×32mm', note: 'Bench unit to Astra custom SMD' },
    ],
    camera: {
      position: [-0.25, 10.65, 10.9],
      target: [0.45, 10.2, 0.0],
      fov: 38,
      rollDeg: 0,
      shotLabel: 'Dual-Prototype Showcase',
    },
    particleHue: [0.24, 0.84, 0.94],
    skyZenith: [0.02, 0.05, 0.12],
    skyHorizon: [0.06, 0.19, 0.27],
  },
  {
    id: 'lens-rider',
    indexLabel: '05',
    chapter: 'How It Works · User Side',
    layoutAlign: 'left',
    title: 'RAMS AI ignores everyday bumps & drops',
    subtitle: 'Smart motion checks protect travelers without nuisance alerts.',
    summary:
      'Whether walking, cycling, driving, or riding a motorcycle, the RAMS app evaluates motion and GPS speed together. Potholes, speed bumps, running gait, and stationary phone drops are filtered out automatically.',
    metrics: [
      { label: 'Road User Modes', value: '4 Profiles', note: 'Pedestrian · Cycle · Car · Moto' },
      { label: 'Bump Filtering', value: 'Auto Ignored', note: 'Keeps moving upright → no alarm' },
    ],
    camera: {
      position: [1.55, 2.2, 8.0],
      target: [-0.85, 1.1, -1.8],
      fov: 45,
      rollDeg: -1.4,
      shotLabel: 'User Motion View',
    },
    particleHue: [0.18, 0.88, 0.72],
    skyZenith: [0.03, 0.07, 0.11],
    skyHorizon: [0.06, 0.22, 0.23],
  },
  {
    id: 'lens-accident',
    indexLabel: '06',
    chapter: 'How It Works · Accident Side',
    layoutAlign: 'left',
    title: 'Confirmed impact & "Hey RAMS" cancel',
    subtitle: 'Three-step crash check plus a 10-second human safety window.',
    summary:
      'A true crash follows a clear sequence: sudden drop, violent impact, and stillness on the road. The phone locks the alert, sounds the wearable buzzer, and gives the person 10 seconds to cancel by tap, button, or saying "Hey RAMS" offline.',
    metrics: [
      { label: 'Crash Sequence', value: 'Drop → Hit → Still', note: 'Verified before alerting rescue' },
      { label: 'Safety Check', value: '10s Cancel', note: 'App tap, button, or "Hey RAMS"' },
    ],
    camera: {
      position: [-6.8, 3.05, -3.5],
      target: [0.85, 1.45, -6.1],
      fov: 37,
      rollDeg: 2.2,
      shotLabel: 'Crash & 10s Cancel View',
    },
    particleHue: [0.98, 0.34, 0.38],
    skyZenith: [0.07, 0.04, 0.11],
    skyHorizon: [0.24, 0.09, 0.14],
  },
  {
    id: 'lens-rescuer',
    indexLabel: '07',
    chapter: 'How It Works · Rescuer Side',
    layoutAlign: 'left',
    title: 'Off-grid LoRa SOS & hotspot map',
    subtitle: 'Coordinates and medical card reach responders without cell service.',
    summary:
      'When cellular networks are unreachable, the wearable beams an instant LoRa radio SOS plus the patient’s blood type and allergies to the base station. Responders get an audible alert, live map pin, and AI-highlighted accident zones.',
    metrics: [
      { label: 'Off-Grid Delivery', value: '433 MHz LoRa', note: 'Alert + full medical card' },
      { label: 'Dispatch Support', value: 'Risk Hotspots', note: 'Flags repeat crash stretches' },
    ],
    camera: {
      position: [3.2, 5.4, -2.5],
      target: [2.2, 1.8, -19.5],
      fov: 44,
      rollDeg: -0.6,
      shotLabel: 'Off-Grid LoRa & Rescue',
    },
    particleHue: [0.2, 0.88, 0.74],
    skyZenith: [0.03, 0.07, 0.13],
    skyHorizon: [0.07, 0.24, 0.23],
  },
  {
    id: 'impact-highlights',
    indexLabel: '08',
    chapter: 'Impact & System Highlights',
    layoutAlign: 'left',
    title: 'Honest engineering, built for the field',
    subtitle: 'Practical hardware design paired with proven dispatch goals.',
    summary:
      'RAMS aligns with national road-safety post-crash response goals and EU eCall benchmarks showing 40%–50% faster emergency dispatch through automation. Our Self-Fabricated THT unit proves the flow today while Astra’s 42 × 32 mm SMD design maps the compact road ahead.',
    metrics: [
      { label: 'Dispatch Benchmark', value: '40%–50% Faster', note: 'EU eCall response-time model' },
      { label: 'Two Prototypes', value: 'THT + SMD', note: 'Working bench unit + Astra CAD' },
    ],
    camera: {
      position: [-3.6, 3.1, -3.8],
      target: [2.2, 1.6, -18.0],
      fov: 42,
      rollDeg: 0,
      shotLabel: 'System Summary',
    },
    particleHue: [0.96, 0.72, 0.28],
    skyZenith: [0.04, 0.07, 0.14],
    skyHorizon: [0.16, 0.18, 0.24],
  },
];
