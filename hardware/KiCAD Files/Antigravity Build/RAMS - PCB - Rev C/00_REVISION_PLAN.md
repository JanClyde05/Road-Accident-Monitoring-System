# RAMS PCB Rev C -- Complete Revision Plan

Status: PLANNING (not started in CAD)
Created: 2026-10-30, Asia/Manila
Supersedes: Rev A (ordered JLCPCB boards) and Rev B (incomplete draft corrections)

---

## 0. Why Rev C exists

The ordered Rev A boards have five confirmed critical defects (documented in [PCB_REVIEW_2026-10-30.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB/PCB_REVIEW_2026-10-30.md)):

1. **VDDA supply floating** -- ESP32-S3 pads 55/56 have no connection to any power source
2. **Five disconnected ground regions** -- decoupling capacitors C8, C11, C12-C15, C16, C23 have no ground return
3. **Q3 footprint/pinout wrong in every way** -- board has TSSOP-8 footprint, purchased part is SOT-23-6 FS8205A; even an 8-pin variant has a different pinout from the board wiring
4. **ANT1 footprint mismatch** -- board uses a 2-pad footprint for a part that requires different terminal assignments
5. **LED GPIO mismatch** -- board routes DIN to GPIO46, firmware expects GPIO48

Rev B attempted incremental repairs but was never completed. The user now wants a clean redesign (schematic + PCB) constrained to DOST-ASTI EPDC manufacturing limits, using the already-purchased Shopee parts.

---

## 1. Manufacturing constraints: DOST-ASTI EPDC

Source: [Annex A Manufacturing Specs_EPDC-MAN-PM-001_rev 2.pdf](file:///D:/Antigravity/Projects/SHM-Capstone/Documents/For%20PCB%20Ordering%20-%20DOST/Annex%20A%20Manufacturing%20Specs_EPDC-MAN-PM-001_rev%202.pdf)

| Parameter | EPDC limit | Rev A value | Rev C target |
|---|---|---|---|
| Layer count | 1 or 2 only | 2 | **2** |
| Material | FR4 only | FR4 | FR4 |
| Board thickness | 1.6 mm only | 1.6 mm | 1.6 mm |
| Copper weight | 35 um (1 oz) | 1 oz | 1 oz |
| Max board dimension | 190 x 250 mm | 42 x 32 mm | 42 x 32 mm (or adjusted, within limit) |
| **Min track width** | **0.30 mm (12 mil)** | 0.10-0.20 mm | **>= 0.30 mm everywhere** |
| **Min spacing** | **0.254 mm (10 mil)** | 0.15 mm | **>= 0.254 mm everywhere** |
| **Min hole diameter** | **0.40 mm (15 mil)** | 0.30 mm | **>= 0.40 mm** |
| **Min annular ring** | **0.254 mm (10 mil)** | 0.15 mm | **>= 0.254 mm** |
| Min slotted hole | 1.0 mm | 0.60 mm (USB shell) | **>= 1.0 mm or avoid slots** |
| Copper-to-edge | 0.30 mm | 0.30 mm | >= 0.30 mm |
| Silkscreen line width | 0.15 mm min | varies | >= 0.15 mm |
| Drill sizes | 0.4 to 2.0 mm, rounded to nearest 0.1 mm | 0.30 mm vias | Use 0.4 mm drill minimum |
| Pad finish | Bare copper or immersion tin | HASL (JLCPCB) | Immersion tin (preferred) |
| Gerber format | RS-274X | RS-274X | RS-274X |
| Assembly | Consignment; polyimide stencil; 0201 min chip; **no grid-array (BGA/QFN)** | QFN-56 (U1) | **Use ESP32-S3-WROOM-1 module (castellated pads, not bare QFN)** |
| Through-hole plating | Conductive polymer paste, not recommended for high current | standard | Acceptable for signal vias; route power on copper pours |

### Critical EPDC-driven design rules for Rev C

```
Min track width:     0.30 mm
Min clearance:       0.254 mm
Min via diameter:    0.40 mm drill + 2 x 0.254 mm ring = 0.908 mm pad minimum
                     Use 0.40 mm drill, 0.95 mm pad (0.275 mm ring)
Min via drill:       0.40 mm
Edge clearance:      0.30 mm
Silkscreen width:    0.15 mm
```

### Via specification for Rev C

Using the EPDC drill list, the smallest usable via is:
- Drill: 0.40 mm
- Pad: 0.95 mm (gives 0.275 mm annular ring, above 0.254 mm minimum)
- This is larger than Rev A's 0.60/0.30 vias, so routing density will decrease

### Assembly note

EPDC states **no grid-array packages**. The ESP32-S3FH4R2 bare QFN-56 (0.4 mm pitch) from Rev A is not acceptable for EPDC assembly. However, the RAMS design already uses the **ESP32-S3-WROOM-1 module** in the schematic spec (the QFN was an error in the original board). The WROOM-1 module uses **castellated edge pads at 1.27 mm pitch**, which EPDC can handle with polyimide stencil.

**Correction: Re-examine the Rev A schematic.** The component placement doc says `ESP32-S3FH4R2` in QFN-56, but the RAMS schematic spec says WROOM-1 module. The firmware uses GPIO mappings compatible with the S3-WROOM-1 (not bare chip). Rev C will use the **ESP32-S3-WROOM-1-N4** module (matching the SuperMini board the user prototyped with), which has castellated pads suitable for EPDC stencil assembly.

---

## 2. Purchased parts inventory (Shopee)

These parts are already bought. The design must accommodate them exactly.

| Ref | Part | Package | Confirmed details |
|---|---|---|---|
| U1 | ESP32-S3 SuperMini (WROOM-1 based) | Module with castellated pads | Prototype board; will use the WROOM-1 module pinout |
| U2 | Ai-Thinker Ra-02 (SX1278 433 MHz) | Through-hole/castellated module | 16-pin, has its own 433 MHz antenna connector |
| ANT1 | **2450AT18B100E** | **3216 (3.2 x 1.6 mm) SMD, 2-terminal** | Johanson ceramic 2.4 GHz BLE antenna. **B100 variant = 2 terminals (feed + NC)**. NOT the D0100 (4-terminal) |
| Q3 | **FS8205A / 8205A** | **SOT-23-6** | Dual N-channel MOSFET for battery protection. FuxinSemi C908265 pinout |
| U4 | DW01A | SOT-23-6 | Single-cell Li-ion protection IC |
| U3 | LTH7R or TP4054 | SOT-23-5 | LiPo charger IC |
| U5 | AP2112K-3.3 | SOT-23-5 | 600 mA LDO 3.3 V regulator |
| LED1 | WS2812B | 5050 (5.0 x 5.0 mm) or similar | RGB addressable LED; verify 3.3 V operation (V6 revision) |
| J1 | USB-C 16-pin | TYPE-C-31-M-12 (C165948) | HRO USB-C receptacle |
| D1 | USBLC6-2SC6 | SOT-23-6 | USB ESD protection |
| Q1 | AO3401A | SOT-23 | P-channel MOSFET for power path |
| Q2 | BC817-25 | SOT-23 | NPN transistor, buzzer driver |
| D2 | SS14 | SOD-123 | Schottky diode |
| D3 | 1N4148W | SOD-123 | Signal diode, buzzer clamp |
| BZ1 | SMD-9650-3327 | 9.6 x 6.5 mm | Active 3.3 V piezo buzzer |
| Y1 | 40 MHz crystal | 3225 SMD | Crystal oscillator |
| SW1 | MSK12C02 | SPDT slide switch | Power switch |
| SW2, SW3 | KMR2 tact switches | 2.8 x 3.5 mm | Reset and Boot buttons |
| J2 | SM02B-SRSS-TB | JST-SH 1.0 mm 2-pin | Battery connector |
| Passives | 0402 and 0603 caps/resistors | Various | As per BOM |

---

## 3. Schematic corrections for Rev C

### 3.1 Q3 (FS8205A SOT-23-6) -- Complete rewire

The Rev A Q3 circuit is wrong in three ways: wrong footprint (TSSOP-8 vs SOT-23-6), wrong pinout mapping, and wrong net connections.

**Correct FuxinSemi FS8205A SOT-23-6 pinout (C908265, verified 2026-10-30):**

```
       +-------+
  S1 [1|       |6] G1
  D1 [2| SOT   |5] D2    (D1 and D2 are internally
  S2 [3| 23-6  |4] G2     tied = common drain)
       +-------+
```

| Pin | Function | Net connection |
|---|---|---|
| 1 | S1 (Source of FET1, discharge) | B_MINUS (battery negative terminal) |
| 2 | D1 (Drain, common with D2) | Internal common drain -- no external connection needed |
| 3 | S2 (Source of FET2, charge) | GND (system ground) |
| 4 | G2 (Gate of FET2, charge control) | DW_OC (DW01A pin 3, over-charge gate) |
| 5 | D2 (Drain, common with D1) | Internal common drain -- no external connection needed |
| 6 | G1 (Gate of FET1, discharge control) | DW_OD (DW01A pin 1, over-discharge gate) |

**Circuit topology (standard DW01A + FS8205A):**

```
Battery (-) --- B_MINUS --- S1 (pin 1) --[FET1]--> D12 (pins 2,5) <--[FET2]-- S2 (pin 3) --- GND
                                |                                       |
                           G1 (pin 6)                             G2 (pin 4)
                                |                                       |
                           DW01A OD (pin 1)                       DW01A OC (pin 3)
```

FET1 (discharge) is controlled by DW01A OD. FET2 (charge) is controlled by DW01A OC.
DW01A CS (pin 2) connects through ~1k resistor to the S1/B_MINUS node for current sensing.

**DW01A SOT-23-6 correct pinout:**

| Pin | Function | Net connection |
|---|---|---|
| 1 | OD (over-discharge output) | Q3 Gate 1 (pin 5) |
| 2 | CS (current sense) | Junction between Q3 S1 and B_MINUS, through 1k resistor |
| 3 | OC (over-charge output) | Q3 Gate 2 (pin 2) |
| 4 | TD (time delay) | **NC (not connected)** -- Rev A incorrectly connected this |
| 5 | VCC | B_PLUS through 330 ohm, with 0.1 uF to VSS |
| 6 | VSS (GND) | B_MINUS |

### 3.2 VDDA supply -- Connect to 3.3 V

ESP32-S3 VDDA (pins 55, 56) must be connected to +3V3 rail with local decoupling (10 nF + 1 uF).

### 3.3 ANT1 (2450AT18B100E) -- Correct footprint

The **B100** variant is a **2-terminal** part:
- **Pin 1: Feed** (RF input from matching network)
- **Pin 2: NC** (not connected, or ground -- check datasheet)

The B100 datasheet from Johanson shows:
- Terminal 1 = antenna feed
- Terminal 2 = NC (do not connect to ground)

This is different from the D0100 (4-terminal: 1 feed + 3 grounds).

**Rev C must use the correct 2-terminal 3216 footprint matching the B100 datasheet land pattern.**

### 3.4 LED1 GPIO -- Route to GPIO48

LED1 DIN must route to GPIO48 (matching firmware `config.h` NEOPIXEL_PIN=48), not GPIO46 as in Rev A.

### 3.5 Ground continuity

All ground connections must be continuous. On a 2-layer board without inner ground planes, ground return paths require careful planning:
- Use B.Cu as a near-complete ground pour
- Strategic ground vias near every bypass capacitor
- No isolated ground islands

### 3.6 ESP32-S3 power tree (complete)

```
+3V3 ----+---- VDD3P3 (pins 2,3) via L1 2nH, with 10uF + 1uF + 2x 0.1uF
          +---- VDD3P3_CPU (pin 46) with 0.1uF
          +---- VDD3P3_RTC (pin 20) with 0.1uF  
          +---- VDD_SPI (pin 29) with 1uF + 0.1uF
          +---- VDDA (pins 55,56) with 10nF + 1uF    <-- WAS MISSING IN REV A
          +---- LoRa VDD via ferrite bead FB1
          +---- LED1 VDD
          +---- BZ1 positive
          +---- Pull-ups (R7, R8, etc.)
```

---

## 4. PCB layout strategy (learning from GPT6 Astra)

### 4.1 GPT6 Astra's design methodology (observed from SHM-Capstone)

From studying GPT6 Astra's SHM Node R2 design:

1. **Circuit spec first** -- A `circuit_spec.json` defines every component, pin, net, and value before touching KiCad
2. **Separate placement from routing** -- Dedicated placement step with DRC validation before any routing
3. **Locked critical routes** -- Power and USB traces are manually placed and locked before autorouting
4. **USB differential pairs** -- Careful paired routing with impedance consideration
5. **Independent verification** -- Scripts that check schematic-to-PCB parity, net assignments, and footprint correctness
6. **Checkpoint discipline** -- SHA-256 hashes of source files, dated reports, preserved failure records
7. **Evidence-based decisions** -- Every choice references a manufacturer datasheet with page number
8. **Ground plane integrity** -- Continuous reference planes under critical signals
9. **Antenna exclusion zones** -- Explicit keepout areas on all copper layers under antenna radiating elements
10. **Test points** -- Accessible test pads for bring-up and debugging

### 4.2 Rev C layout plan

**Board dimensions:** 42 x 32 mm (same as Rev A, proven to fit all components). May need to grow to ~45 x 35 mm due to EPDC's larger minimum via/trace rules.

**Layer assignment (2-layer):**
- **F.Cu (Top):** All components except U2, signal traces, power traces, partial ground fill
- **B.Cu (Bottom):** U2 (Ra-02 LoRa module), ground copper pour (primary return plane), ground stitching vias

**Functional zone plan:**

```
+------------------------------------------------------------------------+
| ZONE 1: RF/Antenna       ZONE 2: Crystal        ZONE 3: Buzzer         |
| ANT1 (top-left corner)   Y1 + load caps         BZ1, Q2, D3            |
| Matching network          Near MCU XTAL pins     R12, R13               |
| RF keepout below                                                        |
|                                                                         |
| ZONE 4: Controls          ZONE 5: MCU (CENTER)   ZONE 6: Power Path    |
| SW2 (Reset)               ESP32-S3-WROOM-1       Q1 (P-FET), D2        |
| SW3 (Boot)                Module                  U3 (Charger), R3      |
| LED1 (WS2812B)            Decoupling caps         C4                    |
|                                                                         |
| ZONE 7: LDO Power         ZONE 8: USB-C + ESD    ZONE 9: Batt Protect  |
| U5 (AP2112K)              J1 (USB-C connector)   U4 (DW01A)            |
| R7, C7-C10                D1 (USBLC6), R1, R2    Q3 (FS8205A SOT-23-6) |
|                            C1, C2, C3             R4, R5, C5, C6        |
|                                                   J2 (Battery JST)      |
| ZONE 10: LoRa Filter      SW1 (Power switch,                           |
| FB1, C26, C27              right edge)                                  |
+------------------------------------------------------------------------+
  B.Cu: U2 (Ra-02) centered under MCU area + GND pour
```

### 4.3 Critical routing constraints for EPDC

| Net class | Width | Clearance | Via pad | Via drill | Assigned nets |
|---|---|---|---|---|---|
| Default | 0.30 mm | 0.254 mm | 0.95 mm | 0.40 mm | GPIO, SPI, I2C, status signals |
| Power | 0.50 mm | 0.30 mm | 0.95 mm | 0.40 mm | VBUS, +3V3, VBAT, B_PLUS, B_MINUS, LDO_IN |
| RF | 0.30 mm | 0.30 mm | N/A | N/A | RF_LNA, ANT_FEED (no vias in RF path) |

### 4.4 Antenna placement (2450AT18B100E)

- Place at board corner (top-left) with the antenna body extending to the board edge
- No copper on F.Cu or B.Cu under the antenna body and extending 2 mm beyond
- Feed trace from matching network on F.Cu with continuous B.Cu ground reference underneath
- Ground plane edge should terminate cleanly at the antenna transition

### 4.5 USB routing

On a 2-layer board without controlled impedance from EPDC, USB 2.0 full-speed (12 Mbps) routing is more forgiving than high-speed:
- Keep D+/D- traces parallel, equal length, 0.30 mm width
- Maintain >= 0.50 mm separation from other signals
- Short total length (under 50 mm)
- Place USBLC6-2SC6 within 5 mm of J1
- 22 ohm series resistors near ESP32 module

---

## 5. Schematic block diagram (Rev C)

```
                    USB-C (J1)
                       |
              +--------+--------+
              |                 |
         VBUS (5V)         D+/D- (USB data)
              |                 |
         D1 (ESD)          USBLC6-2SC6
              |                 |
         C1,C2,C3          22R series (near MCU)
              |                 |
         U3 (LTH7R)       ESP32-S3-WROOM-1 (U1)
         Charger                |
              |            GPIO mapping:
         B_PLUS            - SPI to Ra-02 (U2)
              |            - GPIO48 to LED1
         J2 (Battery)     - GPIO1 to Q2 buzzer
              |            - GPIO2 to ADC divider
         B_MINUS           - GPIO0 boot button
              |            - EN reset circuit
         U4 (DW01A)       - XTAL 40 MHz (Y1)
              |            - 2.4 GHz antenna chain
         Q3 (FS8205A)
         SOT-23-6
              |
            GND

  Power path:
  VBUS --D2--> LDO_IN <--Q1-- B_PLUS
                |
           SW1 (to EN)
                |
         U5 (AP2112K-3.3)
                |
              +3V3
```

---

## 6. Verification gates (before ordering)

Adopting GPT6 Astra's checkpoint discipline:

### Gate 1: Schematic correctness
- [ ] Every component has correct symbol, footprint assignment, and pin-to-net mapping
- [ ] Q3 FS8205A SOT-23-6 pinout matches FuxinSemi C908265 datasheet
- [ ] DW01A pin 4 (TD) is NC
- [ ] ANT1 uses correct 2-terminal B100 footprint
- [ ] VDDA connected to +3V3 with decoupling
- [ ] LED1 DIN on GPIO48
- [ ] All ESP32 power pins connected per Espressif hardware design guidelines
- [ ] LoRa SPI pins match firmware config.h (NSS=10, MOSI=11, SCK=12, MISO=13, RST=9, DIO0=8)
- [ ] Battery protection circuit topology correct (DW01A drives FS8205A gates)
- [ ] ERC: zero errors, zero warnings (except known library mismatches)

### Gate 2: PCB design rules (EPDC compliance)
- [ ] All tracks >= 0.30 mm
- [ ] All clearances >= 0.254 mm
- [ ] All via drills >= 0.40 mm
- [ ] All annular rings >= 0.254 mm
- [ ] No slotted holes < 1.0 mm (USB-C connector may need pad geometry adjustment)
- [ ] Copper-to-edge >= 0.30 mm
- [ ] Silkscreen lines >= 0.15 mm
- [ ] Only drill sizes from EPDC list (0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.5, 1.6, 1.8, 2.0 mm)
- [ ] 2-layer only (F.Cu + B.Cu)

### Gate 3: PCB connectivity
- [ ] DRC: zero violations
- [ ] Zero unconnected items
- [ ] Schematic-PCB parity: zero mismatches
- [ ] Ground continuity: all GND pads connected through copper to a single ground network (no islands)

### Gate 4: Physical review
- [ ] All purchased footprints match actual Shopee part dimensions
- [ ] USB-C connector mechanical fit (pad spacing, shell tabs)
- [ ] Ra-02 module footprint matches actual module (print test recommended)
- [ ] Battery JST connector pin 1 = B_PLUS (verify polarity)
- [ ] Power switch accessible from board edge
- [ ] Reset/Boot buttons accessible

### Gate 5: Firmware compatibility
- [ ] GPIO pin mapping matches `wearable_withApp/config.h` exactly
- [ ] LoRa SPI pins match (NSS=10, MOSI=11, SCK=12, MISO=13, RST=9, DIO0=8)
- [ ] NEOPIXEL_PIN=48
- [ ] BUZZER_PIN=1
- [ ] BUTTON_PIN=0
- [ ] USB native GPIO19/20

### Gate 6: Manufacturing package
- [ ] Gerber files exported as RS-274X
- [ ] Drill files in Excellon format with drill sizes matching EPDC list
- [ ] BOM with all components listed
- [ ] Assembly drawing showing component placement and polarity marks
- [ ] Board outline on Edge.Cuts layer

---

## 7. USB-C connector slot concern

The HRO TYPE-C-31-M-12 has shell mounting tabs with oval/slotted holes. EPDC minimum slot is 1.0 mm. The connector's shell holes have ~0.60 mm minor dimension, which violates EPDC's 1.0 mm minimum.

**Options:**
1. Use only the SMD pads and omit the through-hole shell tabs (reduced mechanical strength)
2. Find a USB-C connector with >= 1.0 mm shell holes
3. Modify the footprint to use round 1.0 mm holes for the shell tabs (check if the connector still fits)
4. Ask EPDC if they can accommodate the specific slot geometry

**Recommended:** Option 3 first -- check if the shell tab can accept a 1.0 mm round hole instead of the 0.6 mm slot. If the tab is narrower than 1.0 mm, use option 1 (SMD-only shell mounting).

---

## 8. Board sizing assessment

With EPDC's larger minimum geometries (0.30 mm tracks, 0.95 mm via pads vs. Rev A's 0.20 mm tracks and 0.60 mm via pads), the board may need to grow.

Rough area analysis:
- ESP32-S3-WROOM-1 module: 18 x 25.5 mm (largest component)
- Ra-02 module: 17 x 16 mm (on back)
- Buzzer: 9.6 x 6.5 mm
- USB-C: 8.9 x 7.3 mm
- With larger routing channels: estimate 45 x 35 mm minimum

**Target: 45 x 35 mm** (if 42 x 32 mm proves too tight with EPDC rules). Decision at routing stage.

---

## 9. Execution sequence

### Phase 1: Circuit definition (this document + circuit_spec)
1. Finalize corrected component list with exact pin mappings
2. Create `circuit_spec.json` (following GPT6 Astra pattern)
3. Verify every pin mapping against manufacturer datasheets
4. Document all datasheet sources with page numbers

### Phase 2: Schematic creation
1. Create KiCad project in this Rev C directory
2. Build schematic block by block:
   - USB-C + ESD + charger
   - Battery protection (corrected Q3/U4)
   - Power path (Q1, D2, SW1, U5)
   - ESP32 core (WROOM-1 module with all power/reset/boot/crystal)
   - 2.4 GHz antenna matching
   - LoRa SPI connection
   - Peripherals (LED, buzzer, ADC divider)
3. Run ERC, fix all errors
4. Export netlist, verify against circuit_spec

### Phase 3: PCB layout
1. Set board outline (start at 42 x 32 mm, expand if needed)
2. Configure EPDC-compliant design rules
3. Place components by functional zone
4. Route critical paths manually: power, USB, RF
5. Autoroute remaining signals with Freerouting
6. Add ground stitching vias
7. Fill ground pours on both layers
8. Run DRC with EPDC rules

### Phase 4: Verification
1. Run all Gate 1-6 checks
2. Generate manufacturing outputs (Gerber, drill, BOM)
3. Visual review of all copper layers
4. Cross-check against firmware pin map
5. Document any deviations or open items

---

## 10. Reference documents

| Document | Location | Purpose |
|---|---|---|
| Rev A PCB Review | [PCB_REVIEW_2026-10-30.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB/PCB_REVIEW_2026-10-30.md) | All identified defects |
| Rev A Component Placement | [COMPONENT_PLACEMENT_INSTRUCTIONS.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB/COMPONENT_PLACEMENT_INSTRUCTIONS.md) | Zone layout reference |
| RAMS Schematic Spec | [Net-level Schematic Spec](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/RAMS%20MD%20Files/RAMS%20Wearable%20and%20Receiver%20%E2%80%94%20Net-level%20Schematic%20Spec%20v0.1.md) | Original circuit intent |
| Firmware config | [config.h](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/wearable_withApp/config.h) | Pin mapping ground truth |
| DOST EPDC specs | [Annex A](file:///D:/Antigravity/Projects/SHM-Capstone/Documents/For%20PCB%20Ordering%20-%20DOST/Annex%20A%20Manufacturing%20Specs_EPDC-MAN-PM-001_rev%202.pdf) | Manufacturing limits |
| GPT6 Astra SHM design | [GPT Build - PCB](file:///D:/Antigravity/Projects/SHM-Capstone/PCB%20Files/GPT%20Build%20-%20PCB/) | Design methodology reference |
| GPT6 Astra DOST review | [DOST_EPDC_MANUFACTURING_COMPATIBILITY](file:///D:/Antigravity/Projects/SHM-Capstone/PCB%20Files/GPT%20Build%20-%20PCB/docs/DOST_EPDC_MANUFACTURING_COMPATIBILITY_20261030.md) | Manufacturing compatibility analysis |
| GPT6 Astra electrical decisions | [ELECTRICAL_DECISIONS.md](file:///D:/Antigravity/Projects/SHM-Capstone/PCB%20Files/GPT%20Build%20-%20PCB/docs/ELECTRICAL_DECISIONS.md) | Design decision template |
| Rev B corrections | [corrected_components.json](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20B/review/corrected_components.json) | Partial corrections attempted |

---

## 11. Open questions for user

1. **WS2812B version:** Is the purchased WS2812B the V6 revision (which officially supports 3.3 V)? If not, it may need a level shifter or 5 V supply with a separate regulator. Can you check the markings?

2. **Board size flexibility:** Is 42 x 32 mm a hard requirement, or can it grow to ~45 x 35 mm to accommodate EPDC's larger routing rules?

3. **USB-C shell holes:** The current USB-C connector has shell holes smaller than EPDC's 1.0 mm slot minimum. Should we use SMD-only shell mounting, or do you have an alternative connector?

4. **EPDC confirmation:** Have you confirmed with EPDC that they accept the WROOM-1 module's castellated pads for assembly? This is not a grid-array but has fine-pitch castellation.

5. **Solder mask color preference:** EPDC offers green, black, blue, red, orange, white, yellow, pink, purple (subject to availability). Which color?
