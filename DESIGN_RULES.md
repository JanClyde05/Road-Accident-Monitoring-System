# Road Accident Monitoring System (RAMS)
## UI/UX Design System Specification & Architectural Rules

*Derived from the AI Studio UI Architecture & Netlify Production Dashboard*  
*Applicable to: Netlify Web Dashboard, AI Studio Simulator, Wearable Captive Portal (`wearable/data/`), and Receiver Portal (`receiver/data/`)*

---

## 1. The Prime Directive: Zero-Emoji Mandate & Custom Vector Design

> [!IMPORTANT]
> **STRICT ZERO-EMOJI MANDATE**  
> System emojis (e.g., 🚨, 📋, 📍, ⚠️, 🔴, 🟢, 🚗, 🚴, 🏃, 👤, 🛰️) are **strictly prohibited** across all interfaces, firmware web pages, simulators, and dashboard views.  
> **Always use a tailored, custom-engineered vector component or crisp geometric SVG glyph instead.**

### Why Emojis Are Banned
1. **Operating System Inconsistency**: Emojis render completely differently across Apple iOS/macOS, Android, Windows, and Linux (varying colors, shapes, and visual weights), breaking intentional design harmony.
2. **Line-Height & Baseline Distortion**: Emoji glyphs have irregular bounding boxes that break vertical rhythm, causing erratic padding, clipped text, and card height jumping.
3. **Toy-Like Aesthetic**: System emojis impart a casual, cartoonish feel that compromises the authority of a critical public safety and emergency accident detection system.
4. **Disrupted Tabular Alignment**: In high-density monospace telemetry views, emojis ruin column alignment and monospace character cell math.

---

### The Custom Design Solution (Case Study: Map Pin Architecture)
Rather than using generic pin emojis (📍) or alert emojis (🚨), RAMS employs custom-crafted vector components designed to scale, pulse, and communicate precise operational states.

#### Reference Standard: `RAMSMapView.tsx` Custom Map Pin
```
                  ┌──────────────────────┐
                  │    Custom SVG Pin    │
                  │   (36px x 46px SVG)  │
                  │                      │
       Alert Ring │   ┌──────────────┐   │
      ((((  ))))  │   │  White Disc  │   │
                  │   │  ┌────────┐  │   │
                  │   │  │ Vector │  │   │
                  │   │  │ Glyph  │  │   │  <-- Shock (!), GPS crosshairs,
                  │   │  └────────┘  │   │      shield check, or wrench
                  │   └──────────────┘   │
                  │          ▼           │  <-- Precision anchor point
                  └──────────┬───────────┘
                             │
                  ┌──────────┴───────────┐
                  │  [ ! PATROL-01 ]     │  <-- Monospace Label Pill
                  └──────────────────────┘      (1px hairline border)
```

#### Pin Design Elements:
1. **SVG Teardrop Geometry (`viewBox="0 0 36 46"`)**:
   - Precision pointer tip anchored directly to the latitude/longitude coordinate:
     ```svg
     <path d="M18 1C8.611 1 1 8.611 1 18C1 28.5 15.5 42.5 17.2 44.3C17.6 44.8 18.4 44.8 18.8 44.3C20.5 42.5 35 28.5 35 18C35 8.611 27.389 1 18 1Z"
       fill="${pinColor}" stroke="rgba(255,255,255,0.9)" stroke-width="2" />
     ```
2. **Inner High-Contrast Disc**:
   - Pure white circular core (`<circle cx="18" cy="18" r="11" fill="#ffffff" />`) providing maximum contrast against any map tile background.
3. **Bespoke Vector Glyphs**:
   - **Active Alert / Crash**: Shock exclamation vector (`stroke="#ef4444" stroke-width="2.6"`).
   - **Telemetry Beacon**: GPS navigation crosshairs with center beacon dot (`stroke="#3b82f6"`).
   - **Safe / False Alarm**: Geometric shield checkmark (`stroke="#10b981"`).
   - **Diagnostic / Test**: Precision angular wrench vector (`stroke="#f59e0b"`).
4. **Dynamic Contextual Radar Rings**:
   - Emergency alerts trigger an animated expanding pulse ring (`.pin-radar-ring` with `animation: pin-radar-expand 2s infinite`) to immediately draw dispatchers' eyes.
5. **Calibrated Colored Drop Shadows**:
   - Alert: `0 8px 18px rgba(239, 68, 68, 0.65)`
   - Telemetry: `0 6px 14px rgba(59, 130, 246, 0.45)`
   - Safe: `0 6px 14px rgba(16, 185, 129, 0.45)`
6. **Attached Monospace Pill**:
   - JetBrains Mono 700 uppercase label enclosed in a dark translucent capsule (`bg-neutral-900/90`, border `1px solid #3f3f46`), completely avoiding emoji prefixes.

---

### Other Custom Vector Paradigms in the System
- **Pulsing Beacon Dots**: Use `.pin-pulse` (pinging outer ring) + `.pin-marker` + `.pin-core` instead of red/green circle emojis (🔴/🟢).
- **Road User Category Selectors**: Use high-contrast button grids (`Pedestrian`, `Cyclist`, `Car Driver`, `Motorcycle Rider`) styled with active state transitions instead of car/bike emojis (🚗/🚴).
- **Tuguegarao City Vector Map**: Render clean vector corridors (Maharlika Highway dashed centerlines, Cagayan River blue ribbon, Buntun Bridge badge) instead of raw map pin emojis.
- **Icons**: Use crisp Lucide SVG vector icons (`Activity`, `Radio`, `Navigation`, `ShieldAlert`, `Send`, `RefreshCw`, `Zap`) styled with exact stroke widths (`stroke-width="2"` or `"2.2"`).

---

## 2. Typographic Hierarchy & Character

The typography system creates structural clarity through weight contrast rather than decorative visual noise.

| Role | Font Family | Weights | Tracking / Style | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Display & Headings** | `Plus Jakarta Sans` | `900` (Black), `800` (ExtraBold) | `-0.025em` (Tight), Uppercase | Hero headers, modal titles, page banners |
| **Body & UI Controls** | `Plus Jakarta Sans` / `Inter` | `600` (SemiBold), `500` (Medium) | Normal (`0`) | Paragraphs, button text, form labels |
| **Telemetry & Metrics** | `JetBrains Mono` | `700` (Bold), `500` (Medium) | Tabular figures (`tnum`), Uppercase | G-force values, gyro deg/s, GPS coordinates, tokens |
| **Micro Badges & Pills** | `JetBrains Mono` | `700` (Bold) | `+0.05em` to `+0.1em`, All Caps | Status pills, packet counts, sector tags, latency |

---

## 3. Spatial Mathematics & Modular 8pt Grid

All container dimensions, padding, margins, and gutters adhere strictly to an 8-point base scale:

$$\text{Spacing Scale} = \{ 4\text{px}, 8\text{px}, 12\text{px}, 16\text{px}, 24\text{px}, 32\text{px}, 48\text{px} \}$$

### Core Spatial Rules:
1. **Outer Padding Rule**: Container outer padding ($\ge 20\text{px}$) must always equal or exceed the inner gap between children ($8\text{px} - 16\text{px}$).
2. **Nested Corner Radius Rule**:
   $$R_{\text{inner}} = \max(0, R_{\text{outer}} - \text{Padding})$$
   *Example: An outer card with $R = 12\text{px}$ and $8\text{px}$ padding requires inner elements to have $R = 4\text{px}$ to prevent optical corner collisions.*
3. **Unnested Bento Grid**:
   - Cards inside cards are prohibited. Visual grouping is achieved via single-level bento grid cells separated by hairline borders.
4. **Single-Line Atomic Badges**:
   - Status pills, chips, and telemetry metadata must **never wrap or truncate awkwardly**. Use `whitespace-nowrap`, fixed height, and flex alignment.

---

## 4. Calibrated Monochromatic Palette & Contrast Control

Surfaces rely on deep zinc/slate tones with calibrated dark-mode contrast meeting WCAG AA standards ($\ge 4.5:1$).

### Neutral Palette (Dark Theme Canvas)
```
  ┌────────────────────────────────────────────────────────┐
  │  Ink High Contrast Base Canvas    #09090b              │
  │  Card & Module Surface            #121214 / #18181b    │
  │  Elevated Input / Pill Capsule    #27272a / #1f1f23    │
  │  Hairline Structural Border       1px solid #27272a    │
  └────────────────────────────────────────────────────────┘
```

### Functional Accent Tokens (Strict Use Only)
Accents are reserved strictly for semantic state and never used as decorative gradients:
- **Emergency Alert / Crash**: Rose `#ef4444` (`bg-rose-950/60`, `border-rose-800`, `text-rose-300`)
- **Safe / Connected / Verified**: Emerald `#10b981` (`bg-emerald-950/60`, `border-emerald-800`, `text-emerald-300`)
- **Warning / Standby / Test**: Amber `#f59e0b` (`bg-amber-950/60`, `border-amber-800`, `text-amber-300`)
- **Telemetry / Uplink Stream**: Sky/Blue `#3b82f6` (`bg-blue-950/60`, `border-blue-800`, `text-blue-300`)

### Prohibited Visual Slop:
- ❌ Arbitrary multicolor rainbow gradients.
- ❌ Glowing neon drop shadows on random UI text or containers.
- ❌ Low-contrast cyan text on dark gray surfaces.

---

## 5. Form & Profile Registration Ergonomics

1. **Placeholders Over Pre-Filled Text**:
   - Form inputs must never have hardcoded dummy values pre-filled in `value`.
   - Use clear placeholders:
     - Name: `placeholder="Input your name here"`
     - Google Drive Link: `placeholder="Input you GDrive 2x2 Picture here"`
2. **Dashed Standby Previews**:
   - When no profile is registered, user name and device token preview fields must display dashes (`"------"`).
3. **Interface-Friendly Deterministic Hash Token**:
   - Token format: `"RAMS-"` + 4 uppercase hex characters derived from FNV-1a hash over registered details (e.g. `RAMS-4A2F`).
   - Compact enough to fit in tiny OLED/TFT displays and 24-byte LoRa RF payload headers.
4. **Circular Logo & Photo Crops**:
   - Official logos and profile avatar thumbnails must be styled with `border-radius: 50%` (`rounded-full`), `overflow: hidden`, and `object-fit: cover`.

---

## 6. Truthful Telemetry & Map Behavior

1. **Zero Invented Data**:
   - Telemetry gauges, charts, and coordinate readouts must remain in a truthful standby state (`STANDBY (AWAITING WEBSOCKET)`, `0.00g`, `0 deg/s`, `0 Sats`) until live hardware stream packets arrive.
   - Never inject artificial oscillating sine waves or simulated coordinates when offline.
2. **Map Pin Fix Rule**:
   - If GPS fix is missing (`fix === false` or `lat <= 0`), **do NOT place any pin on the map**.
   - Show the full city overview (Tuguegarao City) with a status badge:
     `NO GPS FIX • TUGUEGARAO OVERVIEW (NO PIN PLACED)`
   - The pin appears only after a valid 2D/3D satellite fix is locked.

---

## 7. Hardware & Network Decoupling in UI

To maintain clean public-facing branding:
- **Zero Mentions of Internal Chips**: Do not mention `ESP32-S3` or internal material component names in UI labels or buttons.
- **Zero Mentions of Port Numbers**: Do not display `PORT 81` in badges or headers.
- **Clean Connection Pills**: The connection status pill must strictly display:
  - `WEBSOCKET: CONNECTED` (Emerald pill)
  - `WEBSOCKET: DISCONNECTED` (Rose pill)

---

## Quick Reference Checklist

| Design Element | Allowed / Required | Prohibited |
| :--- | :--- | :--- |
| **Icons & Indicators** | Custom SVG vectors, Lucide icons, pulsing radar dots | System emojis (🚨, 📍, ⚠️, 🔴) |
| **Typography** | Plus Jakarta Sans 900, JetBrains Mono 700 | Comic Sans, default Times, unstyled serif |
| **Color System** | Deep Slate/Zinc neutrals, 4 semantic functional accents | Rainbow gradients, neon drop shadows |
| **Spacing** | 8pt grid (8px, 16px, 24px, 32px), outer $\ge$ inner | Arbitrary pixel values (e.g. 7px, 13px, 39px) |
| **Borders** | Hairline `1px solid #27272a` | Thick colored borders, heavy bevels |
| **Map Pins** | Custom SVG teardrop + glyph + radar ring | Standard Google/Leaflet red pin or 📍 emoji |
| **Forms** | Input placeholders, `------` standby dashes | Hardcoded pre-filled dummy strings |
| **Branding** | "Wearable Safety Device", "Autonomous Uplink" | "ESP32-S3 Module", "Port 81 WebServer" |
