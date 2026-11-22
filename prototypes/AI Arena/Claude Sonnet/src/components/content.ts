// Slide content for the RAMS InnovateX 2026 3D deck.
// Facts come from the public repo README / MASTER_SYSTEM_LOG (JanClyde05/Road-Accident-Monitoring-System).
// Anything that must come from YOUR testing is a "verify" card: replace the [INSERT ...] text before presenting.

export type Tone = "cyan" | "crimson" | "gold" | "emerald" | "verify";

export type Card = { k: string; v: string; tone?: Tone };

export type Slide = {
  id: string;
  tag: string;
  t0: number; // seconds
  t1: number;
  kind?: "hero" | "closing";
  assertion: string;
  cards?: Card[];
  table?: { head: string[]; rows: string[][] };
  foot?: string;
  notes: string;
};

export const REPO_URL = "https://github.com/JanClyde05/Road-Accident-Monitoring-System";

export const TEAM = [
  { name: "[Presenter 1 Name]", role: "Team Lead · Edge-AI" },
  { name: "[Presenter 2 Name]", role: "Hardware · PCB Design" },
  { name: "[Presenter 3 Name]", role: "Firmware · Sensor Fusion" },
  { name: "[Presenter 4 Name]", role: "Command Center · Web-GIS" },
  { name: "[Presenter 5 Name]", role: "Validation · Analytics" },
];
export const ADVISER = "Engr. [Adviser Name], PECE";

export const SLIDES: Slide[] = [
  {
    id: "hero",
    kind: "hero",
    tag: "STATE 01 · TITLE & TEAM",
    t0: 0,
    t1: 25,
    assertion: "RAMS: AI-Enabled Road Accident Monitoring, Classification & Rapid Rescue Dispatch",
    foot: "Edge sensor fusion · off-grid LoRa telemetry · rescuer command center",
    notes:
      "Introduce the team and adviser. One sentence: RAMS detects a crash on the rider, tells the difference between a crash and a pothole using edge AI, and alerts rescuers even where cellular signal does not reach. Then move on.",
  },
  {
    id: "problem",
    tag: "STATE 02 · (a) RESEARCH PROBLEM",
    t0: 25,
    t1: 55,
    assertion: "Late crash reports cost lives, and naive impact sensors cry wolf on potholes.",
    cards: [
      { k: "Global toll", v: "≈1.19 million road deaths per year (WHO, 2023)", tone: "crimson" },
      { k: "Local toll (PH)", v: "[INSERT PSA / WHO PH figure + year, verified]", tone: "verify" },
      { k: "Why fixed G-limits fail", v: "Potholes spike to 4.5 G, then the vehicle recovers upright", tone: "gold" },
      { k: "What gives a crash away", v: "Spike >5 G, then rest at >45° tilt", tone: "cyan" },
    ],
    notes:
      "WHO Global Status Report on Road Safety 2023: about 1.19 million deaths a year. Delay between crash and rescue matters, especially at night and on rural corridors with no coverage. Old systems use one fixed G threshold, so potholes trigger false alarms and trust collapses. The repo's discriminator: crashes rest tilted over 45 degrees, bumps recover under 5 degrees. State the PH figure only after you verify it against PSA.",
  },
  {
    id: "objectives",
    tag: "STATE 03 · (b) OBJECTIVES",
    t0: 55,
    t1: 80,
    assertion: "Four objectives: build it, classify it, relay it, prove it.",
    cards: [
      { k: "01 Hardware", v: "Fabricate a compact wearable relay PCB (ESP32-S3 + IMU + GNSS + LoRa)", tone: "emerald" },
      { k: "02 Edge AI", v: "Separate crashes from potholes, drops and daily motion on-device", tone: "cyan" },
      { k: "03 Telemetry", v: "Deliver location + severity by LoRa to a rescuer command center", tone: "gold" },
      { k: "04 Validation", v: "Measure accuracy, false alarms, latency and range", tone: "crimson" },
    ],
    notes:
      "Read the four objectives as a chain: hardware, intelligence, communication, validation. Each one maps to a results slide later. Keep it under 25 seconds.",
  },
  {
    id: "architecture",
    tag: "STATE 04 · (c) PROPOSED SOLUTION",
    t0: 80,
    t1: 110,
    assertion: "A four-tier chain carries a crash from the rider to the dispatcher, even without cell signal.",
    cards: [
      { k: "Wearable relay", v: "ESP32-S3 · MPU-6050 @100 Hz · ATGM336H GNSS", tone: "emerald" },
      { k: "Rider phone", v: "Android app · BLE GATT · 1D-CNN + SLM · SMS fallback", tone: "cyan" },
      { k: "Base station", v: "SX1278 LoRa 433 MHz · LittleFS store-and-forward", tone: "gold" },
      { k: "Command center", v: "Windows app · Leaflet radar · Netlify web mirror", tone: "crimson" },
    ],
    notes:
      "Follow the glowing packets. Wearable senses and runs a freefall-impact-rest-latch state machine. It talks BLE to the phone and LoRa to the base station. The base forwards over USB serial or Wi-Fi TCP to the desktop command center, which also mirrors to a Netlify web map. If the phone has no signal, LoRa still gets the alert out.",
  },
  {
    id: "hardware",
    tag: "STATE 05 · HARDWARE EVOLUTION",
    t0: 110,
    t1: 150,
    assertion: "From a lab-built Alpha board to a compact Rev C production PCB.",
    table: {
      head: ["", "Alpha (self-fabricated)", "Rev C (production)"],
      rows: [
        ["Build", "[VERIFY: etched / milled]", "KiCad · DOST-ASTI EPDC rules"],
        ["Parts", "[VERIFY: module headers]", "ESP32-S3FH4R2 + SMD"],
        ["Rules", "n/a", "0.30 mm trace · 0.40 mm drill"],
        ["Power", "[VERIFY]", "TP4054 + DW01A/FS8205A"],
        ["Size", "[INSERT mm]", "[INSERT mm] · [X]% smaller"],
      ],
    },
    foot: "Repo documents DOST-ASTI EPDC design rules for Rev C. Confirm the fabricator (EPDC or JLCPCB) before you say it on stage.",
    notes:
      "Left: the self-fabricated Alpha board, rotating. Right: Rev C, shown exploded. Rev C is documented in the repo as passing DOST-ASTI EPDC design rules: 0.30 mm track, 0.254 mm clearance, 0.40 mm drill, 0.95 mm via. It integrates the ESP32-S3FH4R2, MPU-6050, SX1278, GNSS, WS2812B status LED, TP4054 charger and battery protection. Insert your real size numbers. Name the fabricator only after confirming it.",
  },
  {
    id: "ai",
    tag: "STATE 06 · (d) AI METHODOLOGY",
    t0: 150,
    t1: 190,
    assertion: "Dual-tier edge AI separates real crashes from potholes, drops and daily motion.",
    cards: [
      { k: "Input", v: "6-axis IMU · 50 Hz · 50-sample windows", tone: "cyan" },
      { k: "Features", v: "14 per window: SVM, jerk, gyro, tilt delta, SMA, ZCR", tone: "gold" },
      { k: "Models", v: "1D-CNN feature extractor + SLM reasoner", tone: "emerald" },
      { k: "Safeguard", v: "3 matching windows to switch state; real crash latches at once", tone: "crimson" },
    ],
    foot: "Network drawn is illustrative. Output classes follow the repo taxonomy: fall, skid, collision, rollover, speed wobble, suppressed.",
    notes:
      "Why AI: one threshold cannot tell a pothole from a crash. We compute 14 kinematic features per one-second window: mean, peak, minimum and deviation of acceleration magnitude, gyro statistics, jerk, tilt delta, signal magnitude area, spectral energy and zero-crossing rate. The tilt delta is the key discriminator. A 1D-CNN and a small language-model reasoner classify, and a 3-window hysteresis prevents flicker. Confirm the exact model sizes from your code before the Q&A.",
  },
  {
    id: "dataset",
    tag: "STATE 07 · (e) DATA & VALIDATION PROTOCOL",
    t0: 190,
    t1: 225,
    assertion: "Calibrated on public motion benchmarks, then tested on our own rider trials.",
    cards: [
      { k: "SisFall", v: "4,510 trials · 38 subjects · 200 Hz", tone: "cyan" },
      { k: "MobiAct", v: "3,200 trials · 67 participants", tone: "cyan" },
      { k: "Pothole + bump (IEEE DataPort)", v: "False-positive suppression signatures", tone: "gold" },
      { k: "Our own trials", v: "[INSERT counts, split, k-fold, test rig]", tone: "verify" },
    ],
    foot: "Cluster scatter is illustrative geometry, not measured data.",
    notes:
      "Public datasets calibrate the freefall, impact and rest thresholds and provide negative examples: SisFall, MobiAct, UP-Fall, the IEEE DataPort pothole set and UCI HAR. Then say exactly what you collected yourselves, how it was split, and how you tested safely without putting people in a crash.",
  },
  {
    id: "results",
    tag: "STATE 08 · (f) RESULTS",
    t0: 225,
    t1: 265,
    assertion: "Results: accuracy, false alarms and alert latency, measured not assumed.",
    cards: [
      { k: "Confusion matrix", v: "[INSERT from test logs]", tone: "verify" },
      { k: "Precision · Recall · F1", v: "[INSERT per class]", tone: "verify" },
      { k: "False alarms: AI vs fixed-G", v: "[INSERT N trials, FPR]", tone: "verify" },
      { k: "LoRa delivery vs distance", v: "[INSERT PER, RSSI, range]", tone: "verify" },
      { k: "Crash → dashboard latency", v: "[INSERT seconds, n]", tone: "verify" },
      { k: "Offline AI brief (repo log)", v: "0.18 s, PASS", tone: "emerald" },
    ],
    foot: "Floor tiles are placeholder geometry. Do not present any number you cannot trace to a log file.",
    notes:
      "Fill every bracket from your logs before presenting. The only figure the repo itself records is the offline deterministic incident brief generated in 0.18 seconds. Everything else needs your measurements. Judges will ask for the denominator of every percentage.",
  },
  {
    id: "dashboard",
    tag: "STATE 09 · (g) PROTOTYPE & COMMAND CENTER",
    t0: 265,
    t1: 295,
    assertion: "Rescuers see who, where and how severe, the moment an alert lands.",
    cards: [
      { k: "Ingest", v: "COM-port auto-detect · audible klaxon · priority queue", tone: "crimson" },
      { k: "Map", v: "Leaflet radar · live pins · ETA", tone: "cyan" },
      { k: "Hotspots", v: "DBSCAN danger zones, 180 m outer / 50 m core", tone: "gold" },
      { k: "Copilot", v: "Local LLM, or instant rule-based brief if offline", tone: "emerald" },
    ],
    notes:
      "Walk through the screen: one card per registered rider with battery, GPS and alert state; color-coded CRASH, FALL, SKID badges; medical profile drawer. DBSCAN clusters past incidents into hotspot zones. The AI copilot uses a local Ollama model and falls back to a deterministic brief if it is offline. Transition to the live demo.",
  },
  {
    id: "ethics",
    tag: "STATE 10 · (i) LIMITATIONS & ETHICS",
    t0: 295,
    t1: 320,
    assertion: "Responsible deployment: honest limits, a human veto, and privacy by design.",
    cards: [
      { k: "Human veto", v: "30 s warning · cancel button · offline voice \"Hey RAMS\"", tone: "emerald" },
      { k: "Dead zones", v: "LoRa + LittleFS store-and-forward", tone: "gold" },
      { k: "Privacy (RA 10173)", v: "Medical profiles need consent, minimization, secure storage", tone: "cyan" },
      { k: "Limits", v: "[INSERT LoS range, domain gap, wearable placement]", tone: "verify" },
    ],
    notes:
      "Limits to state plainly: LoRa range depends on line of sight, public datasets are not real crashes, and no destructive human testing was done. Safeguards: 30-second warning with button or voice cancel, store-and-forward queue, and Data Privacy Act obligations for the medical profiles. Verify what encryption your app really uses before claiming any.",
  },
  {
    id: "impact",
    tag: "STATE 11 · (j) IMPACT & SUSTAINABILITY",
    t0: 320,
    t1: 345,
    assertion: "Low-cost corridor coverage that supports UN SDG 3.6 and 11.2.",
    cards: [
      { k: "SDG 3.6", v: "Halve road-traffic deaths and injuries", tone: "crimson" },
      { k: "SDG 11.2", v: "Safe, affordable transport systems", tone: "cyan" },
      { k: "Who benefits", v: "Riders, LGU DRRMOs, hospitals, road-safety planners", tone: "emerald" },
      { k: "Unit cost", v: "[INSERT BOM total, quantity, date]", tone: "verify" },
    ],
    foot: "Terrain is stylized, not a survey map.",
    notes:
      "Impact: LoRa corridors extend coverage beyond cell towers, and hotspot analytics give LGUs evidence for where to fix roads. Quote a bill-of-materials figure only from your actual parts list. Keep claims to what the prototype shows.",
  },
  {
    id: "closing",
    kind: "closing",
    tag: "STATE 12 · SUMMARY → LIVE DEMO",
    t0: 345,
    t1: 360,
    assertion: "Detect it. Classify it. Relay it. Now watch it work.",
    cards: [
      { k: "Detect", v: "On-wearable motion state machine", tone: "emerald" },
      { k: "Classify", v: "Dual-tier edge AI", tone: "cyan" },
      { k: "Relay", v: "BLE + LoRa + command center", tone: "gold" },
    ],
    notes: "Three-line recap, then hand over to the 4-minute live prototype demonstration. Point at the QR code for the repository.",
  },
];

export const TOTAL_SECONDS = 360;
