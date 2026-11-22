# RAMS: High-End 3D Agency Presentation Redesign Plan

Redesign the Road Accident Monitoring System (RAMS) showcase from a boxed sidebar layout into an agency-grade, full-bleed 3D scrollytelling website driven by smooth scroll choreography, custom GLSL shaders, particle fields, and an accurate smartphone-IMU + ESP32-S3 SuperMini + LoRa Ra-02 hardware architecture.

## User Review & Critical Decisions

> [!IMPORTANT]
> Confirm these architectural and visual commitments before execution begins.

- **Hardware Sensor Ownership (Corrected)**: The wearable PCB contains **no onboard IMU and no onboard GPS**. It consists strictly of the **ESP32-S3 SuperMini**, **LoRa Ra-02 (SX1278 433 MHz)**, **Piezo Buzzer**, and **3.7V LiPo (500mAh / 1000mAh) Battery**. Motion (`50 Hz` accelerometer/gyroscope) and GPS location tracking run **exclusively on the rider's smartphone**, streaming triggers over BLE to the wearable.
- **Agency Scrollytelling Visual Shift**: Replace the static boxed left sidebar card with full-bleed, unboxed editorial typography that glides across scroll sections while leaving the central 3D studio stage open and unobstructed.
- **Interactive UI Capture Placeholders**: Include dedicated desktop Command Center and Android companion tab frames (Map View, Triage Profile Modal, Hotspot Predictor, Smartphone Telemetry Tab) that render crisp architectural placeholders by default and also allow presenters to upload local `.png`/`.jpg` captures directly in-browser for live demos.
- **Presenter Roster**: Include **5 editable presenter name placeholders** (`Presenter 01` through `Presenter 05`) integrated cleanly into the Opening Hero and Closing Credits.

---

## 1. Overview & Core Concept

- **What It Does**: Presents RAMS as an interactive, scroll-choreographed 3D engineering showcase covering the complete arc: Problem → Impact of Problem → RAMS Approach → Three Interactive Lenses (**User/Rider**, **Accident**, **Rescuer**) → Measured Impact & System Highlights.
- **Target Audience**: Technical defense panels (e.g., IECEP Nationals), hardware engineering reviewers, and design-focused stakeholders evaluating both system rigor and real-world clarity.
- **Key Value**: Ties every 3D shader, particle flow, and camera cut directly to verifiable system evidence—contrasting true crash detection against pothole suppression, demonstrating off-grid 433 MHz LoRa survival when cellular drops, and showcasing the exact lean wearable BOM.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Cold Open & Presenter Intro**: Full-viewport dark obsidian stage (`#05070b`) with subtle volumetric fog, a single sculpted motorcycle headlamp cutting across wet asphalt, global/Philippine daily toll counters (`3,200+ / day` global, `~30 / day` PH), and a clean horizontal strip of **5 Presenter Placeholders**.
2. **Smooth Scroll Storytelling (8 Chapters)**: Scrolling smoothly (`wheel`, scrollbar, touch, or keyboard/clicker `Next`/`Prev` controls) interpolates camera keyframes, particle color palettes, and 3D actor states seamlessly without jarring page cuts.
3. **Hardware Studio Reveal (Chapter 04)**: Center-stage studio inspection of the **Smartphone Sensor Node** (live OLED telemetry shader + 50 Hz IMU/GPS core) feeding a glowing **BLE particle stream** into the **ESP32-S3 SuperMini**, **LoRa Ra-02 (SX1278)** with helical antenna, **Piezo Buzzer**, and **3.7V LiPo pouch**—controlled by an interactive **Explode** slider and module spotlight selector.
4. **Three Lenses Interactive Proofs (Chapters 05–07)**:
   - *Rider Lens*: Chase view with live BLE bridge, rider medical profile, Android app UI placeholder slot, and a **Simulate Pothole Spike** button proving false-alarm suppression.
   - *Accident Lens*: Slow-motion crash vector with a **3D GLSL Acceleration Magnitude Ribbon** (`Freefall → Impact 5.8g → Rest → Latch` vs. pothole waveform) and an interactive **30-second Piezo Buzzer / "Hey RAMS" Voice Veto** countdown.
   - *Rescuer Lens*: Elevated panoramic view showing the **433 MHz LoRa packet arc** (`0.21 s` alert / `1.15 s` medical profile at SF9) bypassing darkened cellular towers to reach the **ESP32-S3 Base Station**, alongside Command Center UI tab placeholders (**Leaflet Map**, **Triage Modal**, **Hotspot Predictor**) and an interactive **Drop Cellular & Wi-Fi** offline proof toggle.
5. **Measured Impact & Highlights (Chapter 08)**: Clean editorial grid separating verified RAMS metrics from labeled EU eCall modeled benchmarks (`40%–50%` faster response), 5 system highlights, and presenter credits.

### Visual Identity & Theme
- **Aesthetic Direction**: High-craft dark industrial agency showcase inspired by precision hardware launches—clean negative space, unboxed editorial typography directly over atmospheric 3D space, and disciplined restraint (zero static pill badges, zero pulsing dots, zero `//` pseudo-code prefixes).
- **Color Tokens & 60-30-10 Budget**:
  - `--background` (`60%`): Deep obsidian `#05070b` with subtle cool atmospheric horizon fog.
  - `--surface` (`30%`): Translucent charcoal panels `#0b1018` (`rgba(11, 16, 24, 0.86)`) with crisp `1px` hairline borders `rgba(255, 255, 255, 0.09)` and zero `backdrop-filter` over WebGL.
  - `--accent` (`10%`): Precision Amber `#f59e0b` for primary CTAs and active timeline indicators, paired with semantic telemetry hues (Telemetry Cyan `#38bdf8`, LoRa Emerald `#10b981`, Impact Crimson `#ef4444`).
- **Typography & Hierarchy (`2+1` Font System)**:
  - *Display*: `Outfit` (`clamp(2.4rem, 4.8vw, 4.5rem)`, `tracking-tight`, `text-wrap: balance`).
  - *Body Prose*: `Plus Jakarta Sans` (`15px–16px`, `1.6` line-height, `65ch` measure).
  - *Telemetry & Tabular Numerals*: `JetBrains Mono` (`tabular-nums`) strictly for sensor metrics, airtimes, and chapter indices.
- **Top Bar Contract & Floating Controls**:
  - Single-row, 3-zone header: `RAMS` wordmark — 4 concise section links (`Problem`, `Hardware`, `Three Lenses`, `Impact`) — 1 primary CTA (`Auto-Play Tour`).
  - Collapsible bottom presentation dock (`Hide Controls` / `H` shortcut and `3D Focus` / `Z` Zen mode) keeping `<= 15%` viewport footprint.

---

## 3. Researched Presentation Tools & Key Decisions

- **Decision 1: Core WebGL Stack & Post-Processing**
  - *Chosen Approach*: `Three.js` with `RoomEnvironment` PBR reflections, custom GLSL `ShaderMaterial` / `onBeforeCompile` extensions, GPU-safe selective `UnrealBloomPass` (automatically bypassed on software WebGL via `isSoftwareGl` detection), and exponential camera damping (`1 - Math.exp(-k * dt)`).
  - *Why*: Runs natively alongside React 19 with zero external asset 404 risk, silky 60fps performance on GPUs, and safe `afterDraw` pacing in headless/software WebGL environments.
  - *Alternatives Considered*: Importing external `.glb` / `.hdr` packs from Poly Haven or Sketchfab introduces network/404 fragility in sandboxed venues; procedural multi-part geometry + custom shaders guarantees offline reliability.
- **Decision 2: Venue Safety & Authoring Toolchain (For Live Defense Prep)**
  - *Chosen Approach*: Document the researched production workflow directly in the presentation's **Presenter & Export Guide** drawer (KiCad `pcb export glb` / `pcb render` for final Rev C hardware stills, OBS Studio MP4 screen-capture fallback on USB, and PowerPoint 365 Morph backup deck).
  - *Why*: Protects the live presentation against venue projector/GPU surprises while keeping the browser app 100% self-contained.
- **Decision 3: Interactive UI Screenshot Placeholders**
  - *Chosen Approach*: Build clean, aspect-locked showcase frames for **Android Telemetry Tab**, **Command Center Map**, **Triage Profile Modal**, and **Hotspot Predictor**, pre-populated with crisp architectural SVG schematics and supporting local file selection (`URL.createObjectURL`) so presenters can swap in real captured screenshots on demand without touching code.
  - *Why*: Directly supports the user's request for desktop UI and app tab placeholders while avoiding mock/broken image frames.
- **Decision 4: State & Persistence**
  - *Chosen Approach*: Client-side state for scroll progress, active simulation toggles, uploaded preview object URLs, and editable presenter names (saved optionally to `localStorage` for convenience across browser refreshes during rehearsal).
  - *Why*: Single-presenter presentation tool requiring zero backend/database friction or login walls.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Presentation Shell                            │
│  TopBar (3-Zone) · Scroll Track (8 Chapters) · Collapsible Bottom    │
│  Dock · Presenter Roster (5 Placeholders) · UI Capture Dropzones     │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ scrollProgress (0..1) + Interactive
                                │ Proof Flags (Explode, Pothole,
                                │ Crash Veto, Cellular Drop)
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Pure Logic & Telemetry Engine                       │
│  · Smartphone 50 Hz IMU + GPS Crash FSM (Freefall→Impact→Rest→Latch) │
│  · False-Alarm Filter (Pothole, Drop, Tremor, Walking Rules)         │
│  · SX1278 LoRa SF9 Airtime Calculator (26B = 0.21s, 233B = 1.15s)    │
│  · Scroll-to-Chapter Interpolation & Easing                          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ Damped Uniforms & Camera Targets
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Full-Bleed Three.js Stage                         │
│  · Custom GLSL Shaders: Curl Particle Field, Wet Asphalt Grid,       │
│    Volumetric Headlamp, 3D Acceleration Ribbon, BLE/LoRa Packet Arcs │
│  · Composite 3–12 Part Models: Sport Motorcycle + Rider, Smartphone  │
│    Sensor Unit, ESP32-S3 SuperMini, LoRa Ra-02, Buzzer, 3.7V LiPo,   │
│    Base Station, Offline Cell Towers, Emergency Ambulance            │
│  · GPU Bloom Composer + Software-WebGL afterDraw Safe Path           │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Model & Interactive State Mapping
- **Presentation Beats (`01`–`08`)**: Each beat binds editorial copy, quantified claims, camera position/target/FOV keyframes, and particle palette RGB targets.
- **Hardware BOM Nodes (5 Modules)**: `Smartphone Sensor Hub` (owns 50 Hz IMU + GPS), `ESP32-S3 SuperMini` (BLE-to-LoRa bridge, no IMU), `LoRa Ra-02 SX1278` (433 MHz radio), `Piezo Buzzer` (30 s warning), and `3.7V LiPo 500mAh/1000mAh`. Selecting a node highlights it in 3D and opens the exploded layer spacing.
- **UI Capture Placeholders (4 Slots)**: Keyed by tab ID (`android-telemetry`, `cmd-map`, `cmd-triage`, `cmd-hotspot`) allowing one-click local screenshot previewing inside the Rider and Rescuer Lens sections.
- **Presenter Roster (5 Slots)**: Editable array of 5 presenter placeholders (`Presenter 01`–`05`) surfaced in the Hero and Closing Credits.
