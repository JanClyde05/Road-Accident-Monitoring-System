# RAMS Wearable PCB - Compact Component Placement & Layout Architecture

**Document Version:** 4.0 (Routed-Ready Revision)  
**Target Board:** Road Accident Monitoring System (RAMS) - Wearable Sensor Unit  
**PCB CAD Environment:** KiCad 10.0  
**Board Dimensions:** 42.00 mm x 32.00 mm (Area: 1344 mm^2)  
**Layer Count:** 2 (F.Cu + B.Cu)  
**Origin:** X = 100.00 mm, Y = 100.00 mm  
**Edge Geometry:** Closed rounded rectangle on `Edge.Cuts`, corner fillet radius r = 1.50 mm  

---

## 1. Executive Summary & DRC Validation

This revision represents the final, DRC-validated placement with GND copper zones pre-configured for autorouting.

### DRC Status (Pre-Route)
| Category | Count | Status |
|:---|:---|:---|
| **Shorting Items** | 0 | CLEAN |
| **Clearance Violations** | 0 | CLEAN |
| **Solder Mask Bridges** | 0 | CLEAN |
| **Courtyard Overlaps** | 0 | CLEAN |
| **Copper Edge Clearance** | 0 | CLEAN |
| **PTH Inside Courtyard** | 0 | CLEAN |
| **Unconnected Items** | 103 | Expected (awaiting routing) |
| Silk Over Copper | 48 | Cosmetic |
| Silk Overlap | 38 | Cosmetic |
| Silk Edge Clearance | 6 | Cosmetic |
| Starved Thermal | 3 | Minor zone fill |

### Pre-Configured Board Features
1. **GND Copper Zone on F.Cu** -- Solid pour with thermal relief (0.25mm gap, 0.30mm spoke)
2. **GND Copper Zone on B.Cu** -- Solid pour (serves as ground reference plane under LoRa module)
3. **Antenna Keepout on B.Cu** -- No copper zone fill or vias under ANT1 radiating area
4. **Edge.Cuts** -- Rounded rectangle, 1.5mm corner fillet

---

## 2. Design Rule Resolutions

1. **Board Dimension Optimization & Excess Copper Elimination**:
   - Board: 42.00 x 32.00 mm (1344 mm^2), 32.8% reduction from initial 50x40mm
   - Packaging utilization ~56%, with routing channels preserved

2. **USB-C Connector Edge Alignment**:
   - `J1` at (119.00, 128.50) with 0.20mm front overhang past PCB edge
   - Full cable mating clearance guaranteed

3. **2.4 GHz Antenna Architecture & RF Isolation**:
   - `ANT1` at top-left corner (103.50, 102.80)
   - 45-degree diagonal microstrip feed < 10mm from U1 Pin 1
   - Crystal oscillator (Y1) placed >11mm away on opposite side of MCU
   - B.Cu antenna keepout prevents ground plane under radiating element

4. **Back Copper LoRa Module Isolation**:
   - `U2` (Ra-02) on B.Cu at (118.00, 113.00)
   - 3.32mm clear vertical separation from J1 PTH shield pins
   - Zero PTH pins penetrate LoRa courtyard

---

## 3. Functional Zone Map

```
+--------------------------------------------------------------------------------+
| (100.0, 100.0)                                                    (142.0, 100.0)
|  [ZONE 1: 2.4GHz RF]      [ZONE 2: 40MHz Clock]        [ZONE 3: Buzzer & Driver]|
|  ANT1 (103.5, 102.8)      Y1 (116.5, 104.5)            BZ1 (132.0, 106.5)       |
|  R10, C19, L2, C18        R9, C24, C25                 D3, Q2, R12, R13         |
|  (45-deg direct feed)     (Direct North of U1)                                  |
|                                                                                 |
|  [ZONE 5: West Controls]   [ZONE 4: MCU Core]          [ZONE 7 & 8: Power Path] |
|  SW2 (Reset, 108.0)        U1 (ESP32-S3FH4R2)          Q1 (P-FET), D2 (SS14)    |
|  SW3 (Boot, 115.0)         Center: (116.0, 114.0)      U3 (LTH7R Charger), R3   |
|  LED1 (SK6805 RGB)                                     C4 (BAT Cap), R6         |
|  L1, C11-C14, C23, R8      [ZONE 10: SPI Decoup]                                |
|  R14, R15, C29 (ADC)       C15, C16, R11, C28          [ZONE 9: Power Switch]   |
|                            (Y=119.5, below MCU)        SW1 (138.5, 116.5, 90deg)|
|                                                        (Actuator past X=142.0)  |
|  [ZONE 11: 3.3V LDO Power]                                                      |
|  U5 (AP2112K-3.3)          [ZONE 13: USB-C & ESD]      [ZONE 14: LiPo Protect]  |
|  R7, C7, C8, C9, C10       J1 (TYPE-C-31-M-12)         U4 (DW01A), R4, R5, C5,C6|
|  (South-West Corner)       D1 (USBLC6-2SC6 ESD)        Q3 (FS8205A Dual N-FET)  |
|                            R1, R2, C1, C2, C3          J2 (Battery JST-SH)      |
|  [ZONE 12: LoRa Filter]    (Front lip at Y=132.2)      (Front header at Y=132.0)|
|  FB1, C26, C27             (Flush with Bottom Edge!)   (Flush with Bottom Edge!)|
| (100.0, 132.0)                                                    (142.0, 132.0)
+--------------------------------------------------------------------------------+
  BACK COPPER (B.Cu):
  [ZONE 15: LoRa Transceiver] U2 (Ai-Thinker Ra-02) centered at (118.00, 113.00)
```

---

## 4. Complete Component Coordinate Table (67 Components)

| Ref | Value | Functional Description | Package | Layer | X (mm) | Y (mm) | Rot |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **ANT1** | 2450AT18D0100E | 2.4GHz Ceramic Chip Antenna | Johanson_2450AT18x100 | F.Cu | 103.50 | 102.80 | 180.0 |
| **BZ1** | SMD-9650-3327 | 3.3V Piezo Buzzer Transducer | Buzzer_SMD_9650_3327 | F.Cu | 132.00 | 106.50 | 0.0 |
| **C1** | 10uF 16V | USB VBUS Bulk Input Filter | C_0603_1608Metric | F.Cu | 126.50 | 124.00 | 0.0 |
| **C2** | 0.1uF 50V | USB VBUS High-Freq Decoupling | C_0402_1005Metric | F.Cu | 126.50 | 126.50 | 0.0 |
| **C3** | 1uF | USB VBUS Mid-Freq Decoupling | C_0402_1005Metric | F.Cu | 126.50 | 129.00 | 0.0 |
| **C4** | 4.7uF | LiPo Charger Output Filter | C_0603_1608Metric | F.Cu | 130.00 | 117.00 | 0.0 |
| **C5** | 0.1uF | Battery Protection IC VCC Decoup | C_0402_1005Metric | F.Cu | 134.50 | 124.00 | 0.0 |
| **C6** | 0.1uF | Battery Protection Current Sense Filter | C_0402_1005Metric | F.Cu | 131.00 | 124.50 | 0.0 |
| **C7** | 10uF | LDO Input Bulk Filter | C_0603_1608Metric | F.Cu | 103.00 | 125.50 | 0.0 |
| **C8** | 100uF 10V | LDO Output High-Capacity Reservoir | C_0805_2012Metric | F.Cu | 103.00 | 129.50 | 0.0 |
| **C9** | 10uF | LDO Output Stability Ceramic | C_0603_1608Metric | F.Cu | 107.00 | 127.00 | 0.0 |
| **C10** | 47uF 10V | +3V3 Rail Transient Bypass | C_0805_2012Metric | F.Cu | 107.00 | 129.50 | 0.0 |
| **C11** | 10uF | MCU VDD33 Core Bulk Filter | C_0603_1608Metric | F.Cu | 107.00 | 112.50 | 90.0 |
| **C12** | 1uF | MCU VDD33 Core Decoupling | C_0402_1005Metric | F.Cu | 109.50 | 114.50 | 0.0 |
| **C13** | 0.1uF | MCU VDD33 Core High-Freq Bypass | C_0402_1005Metric | F.Cu | 109.50 | 116.50 | 0.0 |
| **C14** | 0.1uF | MCU VDD_SPI Flash Decoupling | C_0402_1005Metric | F.Cu | 109.50 | 118.50 | 0.0 |
| **C15** | 0.1uF | MCU VDDA Analog Supply Bypass | C_0402_1005Metric | F.Cu | 111.50 | 119.50 | 90.0 |
| **C16** | 0.1uF | MCU VDDA Analog Supply Bypass | C_0402_1005Metric | F.Cu | 113.50 | 119.50 | 90.0 |
| **C17** | 1uF | MCU VDD33 East Decoupling | C_0402_1005Metric | F.Cu | 121.50 | 116.50 | 0.0 |
| **C18** | 2.7pF | 2.4GHz RF Pi-Matching Shunt | C_0402_1005Metric | F.Cu | 111.60 | 109.60 | 45.0 |
| **C19** | 2.4pF | 2.4GHz RF Pi-Matching Shunt | C_0402_1005Metric | F.Cu | 108.20 | 106.20 | 45.0 |
| **C20** | 0.1uF | MCU VDD33 East High-Freq Bypass | C_0402_1005Metric | F.Cu | 121.50 | 118.50 | 0.0 |
| **C21** | 10nF | MCU VDD33 RF Analog High-Freq | C_0402_1005Metric | F.Cu | 121.50 | 112.50 | 0.0 |
| **C22** | 1uF | MCU VDD33 Mid-Freq Decoupling | C_0402_1005Metric | F.Cu | 121.50 | 114.50 | 0.0 |
| **C23** | 1uF | MCU VDD_SPI Low-Freq Bypass | C_0402_1005Metric | F.Cu | 109.50 | 120.50 | 0.0 |
| **C24** | 12pF | 40MHz Crystal XTAL_P Load Cap | C_0402_1005Metric | F.Cu | 112.50 | 104.50 | 0.0 |
| **C25** | 12pF | 40MHz Crystal XTAL_N Load Cap | C_0402_1005Metric | F.Cu | 120.50 | 104.50 | 0.0 |
| **C26** | 10uF | LoRa Module VDD Filter Cap | C_0603_1608Metric | F.Cu | 111.00 | 125.50 | 0.0 |
| **C27** | 0.1uF | LoRa Module VDD High-Freq Bypass | C_0402_1005Metric | F.Cu | 111.00 | 128.00 | 0.0 |
| **C28** | 0.1uF | MCU Analog Subsystem Filter | C_0402_1005Metric | F.Cu | 117.50 | 119.50 | 90.0 |
| **C29** | 0.1uF | Battery ADC Divider Filter | C_0402_1005Metric | F.Cu | 106.50 | 121.00 | 0.0 |
| **D1** | USBLC6-2SC6 | Low-Capacitance USB ESD Diode | SOT-23-6 | F.Cu | 120.50 | 120.80 | 0.0 |
| **D2** | SS14 | 1A 40V Schottky Power Path Diode | D_SOD-123 | F.Cu | 125.50 | 117.00 | 0.0 |
| **D3** | 1N4148W | Piezo Buzzer Flyback Diode | D_SOD-123 | F.Cu | 124.00 | 103.00 | 0.0 |
| **FB1** | FerriteBead | LoRa VDD Noise Suppression Bead | L_0402_1005Metric | F.Cu | 111.00 | 123.00 | 0.0 |
| **J1** | TYPE-C-31-M-12 | 16-Pin Reversible USB-C Receptacle | USB_C_TYPE_C_31_M_12 | F.Cu | 119.00 | 128.50 | 0.0 |
| **J2** | SM02B-SRSS-TB | 1.0mm Pitch 2-Pin Battery JST | JST_SH_SM02B-SRSS-TB_1x02 | F.Cu | 133.00 | 128.50 | 0.0 |
| **L1** | 2nH | MCU Internal LDO Filtering Inductor | L_0402_1005Metric | F.Cu | 109.50 | 112.50 | 0.0 |
| **L2** | 2.4nH | 2.4GHz RF Pi-Matching Series Inductor | L_0402_1005Metric | F.Cu | 109.90 | 107.90 | 45.0 |
| **LED1** | SK6805-EC15 | Addressable RGB NeoPixel LED | LED_SK6805_PLCC4_2.4x2.7mm | F.Cu | 102.50 | 120.50 | 0.0 |
| **Q1** | AO3401A | -30V P-Channel Ideal Diode MOSFET | SOT-23 | F.Cu | 125.50 | 113.50 | 0.0 |
| **Q2** | BC817-25 | 45V NPN Buzzer Driver Transistor | SOT-23 | F.Cu | 124.00 | 106.00 | 0.0 |
| **Q3** | FS8205A | Dual N-Channel Battery Protection FET | TSSOP-8 | F.Cu | 138.50 | 126.50 | 90.0 |
| **R1** | 5.1k | USB-C Configuration Channel CC1 | R_0402_1005Metric | F.Cu | 116.00 | 122.50 | 0.0 |
| **R2** | 5.1k | USB-C Configuration Channel CC2 | R_0402_1005Metric | F.Cu | 124.50 | 122.50 | 0.0 |
| **R3** | 4.02k 1% | TP4054 Charge Current Set (250mA) | R_0402_1005Metric | F.Cu | 134.00 | 114.00 | 0.0 |
| **R4** | 330R | DW01A Battery Protection VCC Res | R_0402_1005Metric | F.Cu | 134.50 | 120.00 | 0.0 |
| **R5** | 1k | DW01A Current Sense Filter Res | R_0402_1005Metric | F.Cu | 134.50 | 122.00 | 0.0 |
| **R6** | 100k | P-FET Gate Pull-Up Resistor | R_0402_1005Metric | F.Cu | 125.50 | 120.00 | 0.0 |
| **R7** | 100k | LDO Enable (EN) Pull-Up Resistor | R_0402_1005Metric | F.Cu | 103.00 | 123.00 | 0.0 |
| **R8** | 10k | MCU CHIP_PU (RESET) Pull-Up | R_0402_1005Metric | F.Cu | 107.00 | 114.50 | 0.0 |
| **R9** | 22R | 40MHz Crystal Series Damping | R_0402_1005Metric | F.Cu | 114.50 | 107.50 | 0.0 |
| **R10** | 0R | 2.4GHz RF Feed Tuning Jumper | R_0402_1005Metric | F.Cu | 106.50 | 104.50 | 45.0 |
| **R11** | 33R | LoRa SPI Clock Series Termination | R_0402_1005Metric | F.Cu | 115.50 | 119.50 | 0.0 |
| **R12** | 1k | Buzzer NPN Base Current Limiter | R_0402_1005Metric | F.Cu | 124.00 | 108.50 | 0.0 |
| **R13** | 100k | Buzzer NPN Base Bleeder Pull-Down | R_0402_1005Metric | F.Cu | 124.00 | 110.50 | 0.0 |
| **R14** | 330k 1% | Battery ADC Voltage Divider (High) | R_0402_1005Metric | F.Cu | 106.50 | 117.00 | 0.0 |
| **R15** | 180k 1% | Battery ADC Voltage Divider (Low) | R_0402_1005Metric | F.Cu | 106.50 | 119.00 | 0.0 |
| **SW1** | MSK12C02 | Main Power Slide Switch (SPDT) | SW_SPDT_PCM12 | F.Cu | 138.50 | 116.50 | 90.0 |
| **SW2** | RESET | Tactile Push Button (RESET) | SW_Push_1P1T_NO_CK_KMR2 | F.Cu | 102.50 | 108.00 | 90.0 |
| **SW3** | BOOT | Tactile Push Button (BOOT/GPIO0) | SW_Push_1P1T_NO_CK_KMR2 | F.Cu | 102.50 | 115.00 | 90.0 |
| **U1** | ESP32-S3FH4R2 | Wi-Fi + BLE 5.0 MCU with 4MB Flash | QFN-56-1EP_7x7mm | F.Cu | 116.00 | 114.00 | 0.0 |
| **U2** | Ai-Thinker-Ra-02 | SX1278 433MHz LoRa Module | Ai-Thinker-Ra-01-LoRa | **B.Cu** | 118.00 | 113.00 | 0.0 |
| **U3** | LTH7R | 500mA Standalone LiPo Charger IC | SOT-23-5 | F.Cu | 130.00 | 114.00 | 0.0 |
| **U4** | DW01A | Single-Cell Li-Ion Protection IC | SOT-23-6 | F.Cu | 131.00 | 121.50 | 0.0 |
| **U5** | AP2112K-3.3 | 600mA Low-Dropout 3.3V Regulator | SOT-23-5 | F.Cu | 107.00 | 124.00 | 0.0 |
| **Y1** | 40MHz | High-Precision Crystal Oscillator | Crystal_SMD_3225 | F.Cu | 116.50 | 104.50 | 0.0 |

---

## 5. Layer & Mechanical Isolation Guarantees

1. **USB-C Connector Edge Engagement**:
   - J1 front mating face at Y = 132.20 mm, board bottom edge at Y = 132.00 mm
   - 0.20mm overhang for full cable engagement

2. **Through-Hole vs. LoRa Module Isolation**:
   - U2 spans X=[108.70, 127.30], Y=[103.95, 122.05]
   - J1 shield pins at Y >= 125.37 mm
   - 3.32mm vertical gap, zero PTH penetration

3. **RF Microstrip Line & Antenna Ground Keep-out**:
   - 45-degree diagonal microstrip: U1 Pin 1 -> C18 -> L2 -> C19 -> R10 -> ANT1
   - Total trace length < 10mm
   - B.Cu antenna keepout zone prevents ground copper under ANT1 radiating body
   - Maintain solid B.Cu ground reference under the microstrip traces

4. **Power Switch & Button Access**:
   - SW1 actuator extends beyond X = 142.00 mm (right edge)
   - SW2 and SW3 at X = 100.00 mm (left edge) for side actuation

---

## 6. Routing Architecture

### Layer Stack
| Layer | Assignment | Usage |
|:---|:---|:---|
| **F.Cu** (Top) | Signal + Power + Components | All components except U2, signal traces, power traces |
| **B.Cu** (Bottom) | LoRa Module + GND Plane | U2 (Ra-02), GND copper pour, LoRa SPI vias |

### Pre-Configured Copper Zones
| Zone | Layer | Net | Configuration |
|:---|:---|:---|:---|
| GND Pour | F.Cu | /GND | Thermal relief: 0.25mm gap, 0.30mm spoke |
| GND Pour | B.Cu | /GND | Thermal relief: 0.25mm gap, 0.30mm spoke |
| Antenna Keepout | B.Cu | Rule Area | No zone fills, no vias under ANT1 |

### Net Classes (Configure in Board Setup)

| Net Class | Width | Clearance | Via Dia | Via Hole | Assigned Nets |
|:---|:---|:---|:---|:---|:---|
| **Default** | 0.20 mm | 0.15 mm | 0.60 mm | 0.30 mm | GPIO, SPI, I2C, Status |
| **Power** | 0.40 mm | 0.20 mm | 0.80 mm | 0.40 mm | VBUS, +3V3, VBAT, B_PLUS, B_MINUS, LDO_IN, LORA_VDD, VDD3P3_A, VDDA_PWR, VDD_SPI |
| **RF_50R** | 0.35 mm | 0.25 mm | N/A | N/A | RF_LNA, RF_MID, ANT_FEED |

### Cross-Layer Via Points (LoRa SPI Bus)
The following nets require F.Cu-to-B.Cu vias for LoRa communication:

| Net | F.Cu Pad (U1) | B.Cu Pad (U2) | Via Location |
|:---|:---|:---|:---|
| /LORA_DIO0 | U1.13 (112.5, 116.2) | U2.5 (110.0, 112.0) | Near U1 pin |
| /LORA_MISO | U1.18 (114.6, 117.5) | U2.13 (126.0, 114.0) | Near U1 pin |
| /LORA_MOSI | U1.16 (113.8, 117.5) | U2.14 (126.0, 116.0) | Near U1 pin |
| /LORA_NSS | U1.15 (113.4, 117.5) | U2.15 (126.0, 118.0) | Near U1 pin |
| /LORA_RST | U1.14 (112.5, 116.6) | U2.4 (110.0, 114.0) | Near U1 pin |
| /LORA_SCK_DEV | R11.2 (116.0, 119.5) | U2.12 (126.0, 112.0) | Near R11 |
| /LORA_VDD | FB1.2 (111.5, 123.0) | U2.3 (110.0, 116.0) | Near FB1 |
| /GND | Multiple pads | U2.1,2,9,16 | Zone pour handles this |

---

## 7. Auto-Routing Instructions

### Step 1: Configure Net Classes
Open **File -> Board Setup -> Design Rules -> Net Classes** and create the net classes from Section 6.

### Step 2: Auto-Routing Plugin Execution (Freerouting)
1. **Export Specctra DSN**:
   - In KiCad PCB Editor: **File -> Export -> Specctra DSN...**
   - Save as `RAMS - PCB.dsn`
2. **Launch Freerouting**:
   - Open your Freerouting plugin or standalone tool
   - Load `RAMS - PCB.dsn`
   - Set routing passes: 50-100 passes recommended
   - Click **Autoroute**
   - Export session: **File -> Export Specctra Session...** (`RAMS - PCB.ses`)
3. **Import Session into KiCad**:
   - In KiCad PCB Editor: **File -> Import -> Specctra Session...**
   - Select `RAMS - PCB.ses`

### Step 3: Post-Routing Ground Plane
1. Press **B** to recalculate and fill all copper zones
2. Add ground stitching vias (0.6mm / 0.3mm) along perimeter and near bypass caps
3. Run final DRC: **Inspect -> Design Rules Checker**

### Step 4: RF Trace Verification
After routing, verify:
- RF microstrip traces (RF_LNA -> ANT_FEED) maintain 0.35mm width
- Solid B.Cu ground reference exists beneath RF traces
- No copper under ANT1 radiating body on B.Cu

---

## 8. Design Rule Summary

| Parameter | Value |
|:---|:---|
| Min trace width | 0.15 mm |
| Min clearance | 0.15 mm |
| Min via diameter | 0.60 mm |
| Min via drill | 0.30 mm |
| Board thickness | 1.6 mm (standard FR4) |
| Copper weight | 1 oz (35 um) |
| Min annular ring | 0.15 mm |
| Solder mask clearance | 0.05 mm |
| Edge clearance | 0.30 mm |
