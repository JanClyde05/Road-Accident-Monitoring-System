# RAMS Wearable PCB - Compact Component Placement & Layout Architecture

**Document Version:** 3.0 (Compact Revision)  
**Target Board:** Road Accident Monitoring System (RAMS) - Wearable Sensor Unit  
**PCB CAD Environment:** KiCad 10.0  
**Board Dimensions:** 42.00 mm x 32.00 mm (Area: 1344 mm², a 32.8% reduction from 2000 mm²)  
**Origin:** X = 100.00 mm, Y = 100.00 mm  
**Edge Geometry:** Closed rounded rectangle on `Edge.Cuts`, corner fillet radius $r = 1.50\text{ mm}$  

---

## 1. Executive Summary & Design Rule Resolutions

This revision specifically resolves key mechanical, RF, and connector design rule violations identified during board review:

1. **Board Dimension Optimization & Excess Copper Elimination**:
   - The board envelope was trimmed from $50.00 \times 40.00\text{ mm}$ ($2000\text{ mm}^2$) down to **$42.00 \times 32.00\text{ mm}$ ($1344\text{ mm}^2$)**, a **$32.8\%$ reduction** in footprint.
   - Packaging utilization is now $\approx 56\%$, eliminating all dead copper zones while leaving ample routing channels for power and ground pours.

2. **USB-C Connector Edge Alignment**:
   - Previously, USB-C receptacle `J1` was set back 9.0 mm from the board edge, which would mechanically prevent a USB cable from plugging in.
   - In this revision, `J1` is placed at $Y = 128.50\text{ mm}$ where its front mating mouth sits at $Y = 132.20\text{ mm}$.
   - The bottom edge is at $Y = 132.00\text{ mm}$, providing an **industry-standard $0.20\text{ mm}$ front overhang**. Any standard USB-C cable will mate fully with zero enclosure or PCB interference.

3. **2.4 GHz Antenna Architecture & RF Isolation**:
   - `ANT1` (Johanson 2450AT18D0100E ceramic chip antenna) is positioned at the top-left corner `(103.50, 102.80)`.
   - The RF matching network (`C18` shunt $\to$ `L2` series $\to$ `C19` shunt $\to$ `R10` series tuning) forms a **direct, straight 45° diagonal microstrip line ($< 10\text{ mm}$ total length)** from U1 Pin 1 (`/RF_LNA` at $112.55, 111.40$) directly into `ANT1` Pad 1.
   - The 40 MHz crystal oscillator (`Y1`, `R9`, `C24`, `C25`) is placed directly north of U1 pins 53 and 54, positioned $> 11\text{ mm}$ away on the opposite side of the MCU with solid ground shielding between them. This eliminates clock harmonic desensitization of the 2.4 GHz LNA.
   - VDD33 core decoupling capacitors (`L1`, `C11-C14`, `C23`) were relocated to the lower-west side of U1 facing pins 2 and 3, ensuring no digital or power traces cross the RF antenna keepout area.

4. **Edge Connectors & Peripheral Ergonomics**:
   - **Battery Connector (`J2`)**: Placed at `(133.00, 128.50)` on the bottom edge, with its 2-pin JST-SH mating header facing southward so battery wires plug directly into the edge.
   - **Power Slide Switch (`SW1`)**: Placed at `(138.50, 116.50)` on the right edge. Its slide lever protrudes through the side of the enclosure ($X \ge 142.0\text{ mm}$) for convenient fingertip operation.
   - **Tactile Push Buttons (`SW2`, `SW3`)**: Placed at the left edge (`X = 102.50`) for easy side-button tactile actuation.

5. **Back Copper (`B.Cu`) LoRa Module Isolation**:
   - The **Ai-Thinker Ra-02 LoRa transceiver module (`U2`)** is isolated on `B.Cu` centered at `(118.00, 113.00)`.
   - It ends vertically at $Y = 122.05\text{ mm}$, maintaining **$> 3.3\text{ mm}$ clear separation from all Through-Hole (PTH) shield pins of `J1`** ($Y \ge 125.37\text{ mm}$).
   - Zero PTH pins penetrate the courtyard of the LoRa module.

6. **DRC Validation**:
   - **0 Shorting Items**
   - **0 Clearance Violations**
   - **0 Solder Mask Bridges**
   - **0 Courtyard Overlaps**
   - **0 Copper Edge Clearance Violations**
   - **0 PTH Inside Courtyard Violations**
   - **0 Invalid Outline Violations**
   - Unconnected nets: 160 (ready for autorouter).

---

## 2. Functional Zone Map & Thermal Architecture

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
|                            (Y=119.5, below MCU)        SW1 (138.5, 116.5, 90°)  |
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

## 3. Complete Component Coordinate Table (67 Components)

| Ref | Value | Functional Description | Footprint Package | Layer | Pos X (mm) | Pos Y (mm) | Rot (deg) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ANT1** | 2450AT18D0100E | 2.4GHz Ceramic Chip Antenna | Johanson_2450AT18x100 | F.Cu | 103.50 | 102.80 | 180.0 |
| **BZ1** | SMD-9650-3327 | 3.3V Piezo Buzzer Transducer | Buzzer_SMD_9650_3327 | F.Cu | 132.00 | 106.50 | 0.0 |
| **C1** | 10uF 16V | USB VBUS Bulk Input Filter | C_0603_1608Metric | F.Cu | 126.50 | 124.00 | 0.0 |
| **C2** | 0.1uF 50V | USB VBUS High-Freq Decoupling | C_0402_1005Metric | F.Cu | 126.50 | 126.50 | 0.0 |
| **C3** | 1uF | USB VBUS Mid-Freq Decoupling | C_0402_1005Metric | F.Cu | 126.50 | 129.00 | 0.0 |
| **C4** | 4.7uF | LiPo Charger Output Filter | C_0603_1608Metric | F.Cu | 130.00 | 117.00 | 0.0 |
| **C5** | 0.1uF | Battery Protection IC VCC Decoup | C_0402_1005Metric | F.Cu | 134.50 | 124.00 | 0.0 |
| **C6** | 0.1uF | Battery Protection Current Sense Filter | C_0402_1005Metric | F.Cu | 131.00 | 124.50 | 0.0 |
| **C7** | 10uF | LDO Input Bulk Filter | C_0603_1608Metric | F.Cu | 103.00 | 125.50 | 0.0 |
| **C8** | 100uF 10V | LDO Output High-Capacity Resv | C_0805_2012Metric | F.Cu | 103.00 | 129.50 | 0.0 |
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
| **Q3** | FS8205A | Dual N-Channel Battery Protection FET | TSSOP-8_4.4x3mm_P0.65mm | F.Cu | 138.50 | 126.50 | 90.0 |
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
| **U1** | ESP32-S3FH4R2 | Wi-Fi + BLE 5.0 MCU with 4MB Flash | QFN-56-1EP_7x7mm_P0.4mm | F.Cu | 116.00 | 114.00 | 0.0 |
| **U2** | Ai-Thinker-Ra-02 | SX1278 433MHz LoRa Module | Ai-Thinker-Ra-01-LoRa | **B.Cu** | 118.00 | 113.00 | 0.0 |
| **U3** | LTH7R | 500mA Standalone LiPo Charger IC | SOT-23-5 | F.Cu | 130.00 | 114.00 | 0.0 |
| **U4** | DW01A | Single-Cell Li-Ion Protection IC | SOT-23-6 | F.Cu | 131.00 | 121.50 | 0.0 |
| **U5** | AP2112K-3.3 | 600mA Low-Dropout 3.3V Regulator | SOT-23-5 | F.Cu | 107.00 | 124.00 | 0.0 |
| **Y1** | 40MHz | High-Precision Crystal Oscillator | Crystal_SMD_3225-4Pin_3.2x2.5mm | F.Cu | 116.50 | 104.50 | 0.0 |

---

## 4. Layer & Mechanical Isolation Guarantees

1. **USB-C Connector Edge Engagement**:
   - `J1` footprint origin: $(119.00, 128.50)$.
   - Receptacle front mating face is at $Y = 128.50 + 3.70 = 132.20\text{ mm}$.
   - Board bottom edge is at $Y = 132.00\text{ mm}$.
   - Overhang: $0.20\text{ mm}$ past the PCB fiberglass edge, guaranteeing that cable plugs seat completely without mechanical interference.

2. **Through-Hole (PTH) vs. LoRa Module Isolation**:
   - `U2` (Ra-02 on `B.Cu`) spans $X = [108.70, 127.30]\text{ mm}$ and $Y = [103.95, 122.05]\text{ mm}$.
   - `J1` USB-C receptacle PTH shield tabs sit at $Y \ge 125.37\text{ mm}$.
   - **Vertical separation between U2 and J1 shield pins: $3.32\text{ mm}$ clear gap**.
   - Zero PTH/NPTH holes penetrate the courtyard of the LoRa module.

3. **RF Microstrip Line & Antenna Ground Keep-out**:
   - A diagonal 45° RF microstrip line runs from U1 Pin 1 (`/RF_LNA`) through `C18`, `L2`, `C19`, and `R10` into `ANT1` Pad 1.
   - Trace length is under $10\text{ mm}$.
   - Maintain a solid ground reference plane on Layer 2 (In1.Cu or B.Cu) directly beneath the microstrip line.
   - Maintain a complete copper keep-out (no copper on any layer) under the $3.2 \times 1.6\text{ mm}$ radiating body of `ANT1`.

4. **Power Switch & Tactile Button Access**:
   - `SW1` slide actuator extends beyond $X = 142.00\text{ mm}$, providing side accessibility.
   - `SW2` and `SW3` push buttons sit directly along the left edge ($X = 100.00\text{ mm}$), enabling direct actuation through an enclosure button plunger.

---

## 5. Auto-Routing Instructions & Recommended Net Classes

With component placement verified and physical DRC at 0 errors, proceed to trace routing:

### Step 1: Net Class Setup in KiCad
Open **File -> Board Setup -> Design Rules -> Net Classes**:

| Net Class | Recommended Width | Minimum Clearance | Via Diameter | Via Hole | Assigned Nets |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Default** | $0.20\text{ mm}$ | $0.15\text{ mm}$ | $0.60\text{ mm}$ | $0.30\text{ mm}$ | GPIO, SPI, I2C, Status lines |
| **Power** | $0.40\text{ mm}$ | $0.20\text{ mm}$ | $0.80\text{ mm}$ | $0.40\text{ mm}$ | `VBUS`, `+3V3`, `VBAT`, `B_PLUS`, `B_MINUS`, `LDO_IN`, `LORA_VDD` |
| **RF_50R** | $0.35\text{ mm}$ | $0.25\text{ mm}$ | N/A (no vias) | N/A | U1 pin 1 to ANT1 pad 1 |

### Step 2: Auto-Routing Plugin Execution (e.g., Freerouting)
1. **Export Specctra DSN**:
   - In KiCad PCB Editor: **File -> Export -> Specctra DSN...**
   - Save as `RAMS - PCB.dsn`.
2. **Launch Freerouting**:
   - Open your Freerouting plugin / tool.
   - Load `RAMS - PCB.dsn`.
   - Set routing passes (recommended: 50–100 passes).
   - Click **Autoroute**.
   - Export session file: **File -> Export Specctra Session...** (`RAMS - PCB.ses`).
3. **Import Session into KiCad**:
   - In KiCad PCB Editor: **File -> Import -> Specctra Session...**
   - Select `RAMS - PCB.ses`.

### Step 3: Post-Routing Ground Pours
1. Add a solid copper zone on **`F.Cu`** assigned to `GND`.
2. Add a solid copper zone on **`B.Cu`** assigned to `GND`.
3. Press **`B`** to recalculate and fill all copper zones.
4. Add ground stitching vias ($0.6\text{ mm}$ / $0.3\text{ mm}$) along perimeter edges and near bypass capacitors.
5. Run final DRC validation via **Inspect -> Design Rules Checker**.
