# RAMS Wearable PCB -- Parts List for Ordering

**Board:** RAMS (Road Accident Monitoring System) Wearable Sensor Unit
**PCB Revision:** Post Q3 SOT-23-6 Migration
**Assembly Service:** JLCPCB SMT (Top Side, Economic PCBA)
**Date:** 2026-10-16

---

## 1. SMT-Assembled Parts (JLCPCB Auto-Places These)

All parts below have verified LCSC stock and are included in the BOM/CPL upload.

### Capacitors

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| C2, C5, C6, C13, C14, C15, C16, C20, C27, C28, C29 | 0.1uF | 0402 | C1525 | 11 | Basic part |
| C21 | 10nF | 0402 | C1524 | 1 | Basic part |
| C24, C25 | 12pF | 0402 | C1547 | 2 | Crystal load caps |
| C3, C12, C17, C22, C23 | 1uF | 0402 | C52923 | 5 | Basic part |
| C19 | 2.4pF | 0402 | C48346 | 1 | RF matching (Fenghua 0402CG2R4C500NT) |
| C18 | 2.7pF | 0402 | C1561 | 1 | RF matching |
| C1, C7, C9, C11, C26 | 10uF | 0603 | C19702 | 5 | Basic part |
| C4 | 4.7uF | 0603 | C19666 | 1 | Basic part |
| C8, C10 | 47uF | 0805 | C76636 | 2 | TDK 47uF 10V MLCC, LoRa TX sag buffer |

### Resistors

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| R10 | 0R | 0402 | C17168 | 1 | Basic part, jumper |
| R9 | 22R | 0402 | C114765 | 1 | USB data line |
| R11 | 33R | 0402 | C138002 | 1 | |
| R4 | 330R | 0402 | C105875 | 1 | LED current limit |
| R5, R12 | 1k | 0402 | C11702 | 2 | Basic part |
| R3 | 4.02k | 0402 | C43251 | 1 | TP4054 charge current set (1% Uni-Royal) |
| R1, R2 | 5.1k | 0402 | C25905 | 2 | USB-C CC pull-downs |
| R8 | 10k | 0402 | C25744 | 1 | Basic part |
| R6, R7, R13 | 100k | 0402 | C25741 | 3 | Basic part |
| R15 | 180k | 0402 | C138046 | 1 | |
| R14 | 330k | 0402 | C25778 | 1 | |

### Inductors and Ferrite

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| L1 | 2nH | 0402 | C18216 | 1 | Murata LQG15HS2N0S02D RF inductor |
| L2 | 2.4nH | 0402 | C22727 | 1 | Sunlord SDCL1005C2N4STDF RF inductor |
| FB1 | Ferrite Bead | 0402 | C1017 | 1 | Basic part |

### Diodes

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| D1 | USBLC6-2SC6 | SOT-23-6 | C7519 | 1 | USB ESD protection |
| D2 | SS14W | SOD-123FL | C2909920 | 1 | 1A 40V Schottky |
| D3 | 1N4148W | SOD-123 | C81598 | 1 | Signal diode |

### Transistors and MOSFETs

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| Q1 | AO3401A | SOT-23 | C15127 | 1 | P-channel MOSFET, power path |
| Q2 | BC817-25 | SOT-23 | C908259 | 1 | NPN transistor |
| Q3 | FS8205A | SOT-23-6 | C908265 | 1 | Dual N-ch MOSFET, battery protection |

### ICs

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| U1 | ESP32-S3FH4R2 | QFN-56 (7x7mm) | C3013940 | 1 | Main MCU, 4MB flash, 2MB PSRAM |
| U3 | LTH7R (TP4054) | SOT-23-5 | C668215 | 1 | Li-Ion charger IC |
| U4 | DW01A | SOT-23-6 | C42380662 | 1 | Battery protection IC (Slkor) |
| U5 | AP2112K-3.3 | SOT-23-5 | C51118 | 1 | 3.3V LDO regulator |

### Connectors and Switches

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| J1 | TYPE-C-31-M-12 | USB-C 16-pin | C165948 | 1 | USB Type-C connector |
| J2 | SM02B-SRSS-TB | JST-SH 2-pin | C160402 | 1 | Battery connector |
| SW1 | MSK12C02 | SPDT slide | C431540 | 1 | Power switch |
| SW2, SW3 | KMR2 | Tactile | C318884 | 2 | Boot/Reset buttons |

### Passives and Misc

| Ref | Value | Package | LCSC Part # | Qty | Notes |
|:----|:------|:--------|:------------|:----|:------|
| BZ1 | SMD-9650-3327 | 9.6x6.5mm | C42420997 | 1 | Piezo buzzer |
| LED1 | SK6805-EC20 | 2.0x2.0mm | C2890036 | 1 | Addressable RGB LED |
| Y1 | 40MHz | 3.2x2.5mm | C426988 | 1 | Crystal oscillator |

---

## 2. Hand-Solder / Manually Sourced Parts (NOT in JLCPCB BOM)

These parts are excluded from SMT assembly. Order separately and solder by hand after boards arrive.

| Ref | Description | Package | Source | Part # / Link | Qty | Notes |
|:----|:------------|:--------|:-------|:--------------|:----|:------|
| ANT1 | Johanson 2450AT18D0100E | 0402 Chip Antenna | Mouser / DigiKey | 609-2450AT18D0100E | 1 | RF antenna, hand-solder on F.Cu |
| U2 | Ai-Thinker Ra-02 | LoRa Module | AliExpress / Ai-Thinker | Ra-02 (SX1278, 433MHz) | 1 | B.Cu castellation solder, apply after PCBA |

---

## 3. Order Summary

| Category | Unique Parts | Total Components | Assembly |
|:---------|:-------------|:-----------------|:---------|
| SMT (JLCPCB) | 40 line items | 66 components | Automatic |
| Hand-Solder | 2 items | 2 components | Manual post-assembly |
| **Total** | **42 unique** | **68 components** | |

---

## 4. JLCPCB Order Checklist

- [ ] Upload `1_GERBERS_RAMS_PCB.zip` to JLCPCB quote page
- [ ] Board specs: 2-layer, FR-4, 42x32mm, 1.6mm thick, HASL finish
- [ ] Enable SMT Assembly: Top Side, Economic PCBA
- [ ] Upload `2_BOM_RAMS_PCB.csv` as BOM file
- [ ] Upload `3_CPL_RAMS_PCB.csv` as CPL file
- [ ] Verify all 40 SMT parts match automatically (100% LCSC coverage)
- [ ] Confirm ANT1 and U2 are NOT in BOM (hand-solder items)
- [ ] Review 3D/2D placement preview for correct orientations
- [ ] Order hand-solder parts separately from Mouser/DigiKey/AliExpress

---

## 5. Cost Estimation Notes

- Many passives (0.1uF, 1uF, 10uF, 1k, 10k, 100k, 5.1k, AO3401A) are **JLCPCB Basic Parts** with no extended-part feeder fee.
- Extended parts incur a small per-unique-part setup fee (typically $3 each).
- The FS8205A (`C908265`) in SOT-23-6 is in-stock (16k+ units) and cheaper than TSSOP-8 alternatives.
- The SK6805-EC20 (`C2890036`) is Economic PCBA compatible; no Standard PCBA upgrade required.

---

## 6. DIY Reflow Option (Bare PCB + Stencil via JLCPCB, Parts via Shopee PH)

For maximum cost efficiency (~$15 total on JLCPCB vs ~$104 PCBA):
1. **Order Bare PCB + Frameless Stainless Stencil (Top Side)** from JLCPCB.
2. **Order Parts from Shopee PH**:
   - `U1`: ESP32-S3FH4R2 (QFN-56, 7x7mm)
   - `U2`: Ai-Thinker Ra-02 433MHz (SX1278)
   - `U3`: LTH7R / TP4054 (SOT-23-5)
   - `U4`: DW01A (SOT-23-6)
   - `Q3`: FS8205A (**TSSOP-8**, 8-pin package)
   - `U5`: AP2112K-3.3 (SOT-23-5, 600mA LDO)
   - `Q1`: AO3401A (SOT-23 P-FET)
   - `Q2`: BC817-25 (SOT-23 NPN)
   - `D1`: USBLC6-2SC6 (SOT-23-6 ESD)
   - `D2`: SS14W (**SOD-123FL / SOD-123**, not standard bulky SMA)
   - `D3`: 1N4148W (SOD-123)
   - `ANT1`: 2450AT18B100E / 2450AT18D0100E (3216 / 1206 SMD ceramic antenna)
   - `FB1`: 0402 Ferrite Bead (MGGB1005M800HT-LF 200mA, 80 Ohm @ 100MHz)
   - `Y1`: 40MHz 3225 4-pin SMD crystal
   - `BZ1`: SMD-9650-3327 (9.6x6.5mm piezo buzzer)
   - `LED1`: SK6805-EC20 (2.0x2.0mm RGB LED)
   - Passives: 0402 Resistor & Capacitor sample kits, 0603 10uF (5x), 0805 47uF (2x)
3. **Reflow Profile on Mechanic IX5 Ultra with Relife RL-403 (Sn63Pb37, 183°C)**:
   - **Preheat / Soak**: 140°C - 150°C for 60-90 seconds.
   - **Reflow**: 205°C - 210°C for 30-45 seconds (until solder liquefies and self-centers).
   - **Ra-02 (U2) Hand Solder**: Solder U2's 16 castellated pads on the bottom layer with a standard iron after the top side cools down.

