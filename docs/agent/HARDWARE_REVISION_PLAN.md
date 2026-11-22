# RAMS Wearable Hardware Revision Plan

**Purpose.** This file is the complete, executable hardware instruction set for
the wearable: why the battery gauge on the FCS prototype reads wrong, how to
rework that prototype today with no new parts, and how to build the compact
single-sided laser-etched revision (Rev L1) that replaces it.

**Authority.** `AGENTS.md` wins over this file. `EXECUTION_PLAN.md` wins on
software order. If this file and the KiCad files disagree, the KiCad files are
correct and this file needs an edit. Measurements marked **PENDING** must not be
guessed; stop and measure.

**Scope.** Wearable only. The receiver, phone, and station are covered by
`EXECUTION_PLAN.md`.

**Zero emoji.** `DESIGN_RULES.md` applies to this file.

---

## 0. How to use this file

1. Read section 1 (status) and section 2 (the defect). Do not skip section 2.
2. If the bench prototype must work today, do section 5. It needs no new parts.
3. If the task is the new board, do section 14 (measurements) first. M1 and M2
   gate the layout; M3 and M4 gate the order. Everything after that is blocked
   until those measurements are written down.
4. Draw the schematic (section 9), then the layout (section 7), then run the
   design gate (section 13, HW-01 through HW-07).
5. Only then plot artwork (section 12) and assemble (section 11).
6. Record results in `docs/agent/verification-log.jsonl` and append INC-019 and
   L-17 as described in section 16.

---

## 1. Status board

| Item | Work | State | Gate |
|---|---|---|---|
| H0 | Battery defect diagnosed and evidenced | **DONE** | section 2 |
| H1 | Corrected divider designed | **DONE** | section 3 |
| H2 | Firmware board profile | NOT STARTED | section 4 |
| H3 | Prototype rework, no new parts | NOT STARTED, needs bench | section 5 |
| H4 | Measurements M1 through M6 | **BLOCKED** | section 14 |
| H5 | Rev L1 schematic | BLOCKED on H4 | HW-01, HW-03 |
| H6 | Rev L1 layout | BLOCKED on H5 | HW-02, HW-04..HW-07 |
| H7 | Artwork, etch, first copper | BLOCKED on H6 | HW-08 |
| H8 | Assembly and bring-up | BLOCKED on H7 | HW-09..HW-11 |
| H9 | Radio and range | BLOCKED on H8 | HW-12, then `EXECUTION_PLAN.md` C.13 |

State values: `DONE`, `IN PROGRESS`, `NOT STARTED`, `DEFERRED`, `BLOCKED`.

---

## 2. The defect: the prototype senses the regulator, not the cell

The FCS prototype at `D:\KiCad things\FCS\DMS - PCB` does not measure the
battery. It measures a divider across the 3.3 V rail. The evidence is in the
netlist, not in a comment.

### 2.1 Net evidence

| Item | File and line | What it says |
|---|---|---|
| `BATT` net declared | `DMS - PCB.kicad_pcb:448` | net exists, name suggests a cell |
| `+3.3V` net declared | `DMS - PCB.kicad_pcb:580` | regulator output |
| `U1` 5V pad | `DMS - PCB.kicad_pcb:602` | `unconnected-(U1-5V-Pad18)` |
| `U1` footprint | `DMS - PCB.kicad_pcb:90` | SuperMini, 18 THT pads |
| `U1` pad 4 | same footprint | `BATT` |
| `U1` pad 16 | same footprint | `+3.3V` |
| `U1` pad 17 | same footprint | `GND` |
| `U1` pad 18 | same footprint | unconnected (5V input) |
| `R2` footprint | `DMS - PCB.kicad_pcb:871` | pad 1 `BATT`, pad 2 `GND` |
| `R1` footprint | `DMS - PCB.kicad_pcb:1240` | pad 1 `+3.3V` (line 1404), pad 2 `BATT` (line 1414) |
| `R1` value | `DMS - PCB.kicad_pcb` property | 100k |
| `R2` value | `DMS - PCB.kicad_pcb` property | 100k |

So the `BATT` net is the midpoint of `+3.3V -- R1 -- BATT -- R2 -- GND`.
It is not connected to a cell at all. There is no battery connector on the
prototype and no `VBAT` net.

### 2.2 Why the firmware then reads 0 percent

`firmware/wearable_withApp/battery.h:4` documents "100k/100k voltage divider on
GPIO2", and `battery.h:9-11` draws it as `VBAT -> 100k -> node -> 100k -> GND`.
The board does not match that drawing; the top of the divider is `+3.3V`.

With the default profile:

- node voltage = 3.30 V / 2 = 1.650 V
- `battery.cpp:52` raw conversion: `2048 / 4095 * 3.3` = 1.650 V
- `battery.cpp:54` ratio 2.0: 1.650 * 2 = 3.300 V
- `battery.cpp:61-67` maps 3.300 V to 0 percent (empty is 3.55 V)

The gauge therefore reports a flat 3.30 V and 0 percent whether the cell is full
or empty. It also loads the 3.3 V rail with 16.5 uA forever, which is harmless
but pointless.

### 2.3 What is already correct, and must not be "fixed"

- `BATTERY_ADC_PIN 2` (`battery.h:33`) matches `U1` pad 4, which is GPIO2,
  ADC1 channel 1. Keep GPIO2. Changing it would force a firmware pin change and
  a new layout for no gain.
- The buzzer chain is correct: `U1` pad 3 (GPIO1) -> R3 330R -> Q1 BC547 base,
  collector -> BZ1 low side, BZ1 high side -> +3.3 V, emitter -> GND. Firmware
  `BUZZER_PIN 1` matches. Do not touch it.
- The LoRa wiring is correct: `U1` pad 10 = DIO0, 11 = RST, 12 = NSS,
  13 = MOSI, 14 = SCK, 15 = MISO, matching `config.h:12-17`.
- The 5 V pad is unconnected by design; the cell feeds the module's own BAT
  pads. Do not add a 5 V connection.

---

## 3. Corrected battery sensor

### 3.1 Topology

```
VBAT --[ R1 330k 1% ]--+--[ R2 100k 1% ]-- GND
                       |
                    C3 100nF
                       |
                      GND
                       |
                   U1 GPIO2 (pad 4)
```

- R1 from the cell positive to the sense node.
- R2 from the sense node to ground.
- C3 from the sense node to ground, physically next to U1 pad 4.
- No switch, no transistor, no gating. The 5 s sample interval makes the
  9.8 uA draw irrelevant, and an always-connected divider cannot fail open.

### 3.2 Values and math

| Quantity | Value | Note |
|---|---|---|
| R1 | 330k, 1 percent | value exists in the J2 BOM as `R14` |
| R2 | 100k, 1 percent | value exists in the J2 BOM as `R6`, `R7`, `R13` |
| Ratio | (330 + 100) / 100 = 4.30 | |
| 4.20 V cell | 0.9767 V at the node | 78 percent of the 1.25 V ADC range |
| 3.55 V cell | 0.8256 V at the node | 0 percent endpoint stays as-is |
| 3.00 V cell | 0.6977 V at the node | protection cutoff, only for reference |
| Current at 4.20 V | 9.77 uA | below the prototype's 16.5 uA |
| Source impedance | 330k parallel 100k = 76.7k | |
| C3 time constant | 76.7k * 100nF = 7.7 ms | 38 ms to settle; samples are 5 s apart |

Why 330k and not 300k: 300k/100k gives ratio 4.0 and 1.05 V at 4.20 V, which is
84 percent of the 1.25 V range and leaves less headroom for tolerance and ADC
offset. 330k is also already a stocked value. The 1.25 V ceiling is the
`ADC_2_5db` range used by the calibrated path.

Why not 1M/330k: higher impedance and no stock advantage. With R2 fixed at
100k, 330k is the smallest stocked value that keeps the node below 1.0 V at a
4.20 V cell, which leaves 0.25 V of headroom below the 1.25 V ADC ceiling.

Tolerance stack: two 1 percent resistors plus about 2 percent ADC gives about
plus or minus 0.08 V at 4.20 V. That is fine for a fuel gauge and is not used
for any protection decision. The firmware never disconnects the cell.

### 3.3 Package choice

The J2 BOM has the right values in 0402. Rev L1 is hand-placed and hot-plate
reflowed, so use 0805:

| Ref | Value | Package | Source |
|---|---|---|---|
| R1 | 330k 1 percent | 0805 | buy; J2 value is 0402 `C25778` |
| R2 | 100k 1 percent | 0805 | buy; J2 value is 0402 `C25741` |
| R3 | 330R 1 percent | 0805 | buy; J2 value is 0402 `C105875` |
| C1 | 47uF 10V | 0805 | in BOM as `C8`, `C10`, `C76636` |
| C2 | 100nF | 0805 | in BOM as 0402 `C1525` |
| C3 | 100nF | 0805 | same |

Do not place 0402 on 0805 lands. The joints are unreliable and impossible to
inspect on an etched board.

---

## 4. Firmware board profile

### 4.1 Current state

`battery.cpp` branches on `RAMS_JLC_S3_J2` at lines 35, 49, 75, and 93. That flag
is never defined by any build file in the repository, which is the already-known
defect S7 in `docs/Design Review/SCHEMATIC_REVIEW_2026-11-10.md`. Adding a third
board must not repeat that mistake: the new flag has to be wired into a flash
script and into the verify gate in the same change.

The J2 path uses `analogReadMilliVolts` plus `ADC_2_5db` plus ratio 4.0. The new
board needs the same calibrated path with ratio 4.3. The prototype default path
stays ratio 2.0 with raw counts and `ADC_11db`.

### 4.2 Replace the board selection in `battery.h`

Replace the block at `battery.h:33-40` with:

```c
#define BATTERY_ADC_PIN          2       // GPIO2 - divider midpoint

// Board profiles. Exactly one applies.
//   default          FCS prototype and any bare SuperMini: 100k/100k, ratio 2.0
//   RAMS_FCS_LASER   Rev L1 laser board: 330k/100k, ratio 4.3
//   RAMS_JLC_S3_J2   JLC J2 board: 30k/10k, ratio 4.0
#if defined(RAMS_JLC_S3_J2)
#define BATTERY_PROFILE_NAME     "j2"
#define BATTERY_DIVIDER_RATIO    4.0f
#define BATTERY_USE_CAL_MV       1
#elif defined(RAMS_FCS_LASER)
#define BATTERY_PROFILE_NAME     "laser"
#define BATTERY_DIVIDER_RATIO    4.3f
#define BATTERY_USE_CAL_MV       1
#else
#define BATTERY_PROFILE_NAME     "default"
#define BATTERY_DIVIDER_RATIO    2.0f
#define BATTERY_USE_CAL_MV       0
#define BATTERY_VREF             3.3f
#define BATTERY_ADC_MAX          4095.0f
#endif
```

`BATTERY_USE_CAL_MV` is a plain 0/1 macro, so it is safe in a header that does
not include `Arduino.h`. Do not put `ADC_2_5db` in this header.

Also update the file comment at `battery.h:4-6` to name all three profiles. The
comment currently says the J2 path uses "3V3-gated NMOS isolation and 1nF
filter". The NMOS exists only as a comment in `battery.h`; the firmware has no
gate pin and no timing for it. Leave that sentence out of the new comment so the
comment stops claiming a circuit that the code does not drive.

### 4.3 Replace the four `#ifdef` sites in `battery.cpp`

Line 35:

```c
#if BATTERY_USE_CAL_MV
    sum += analogReadMilliVolts(BATTERY_ADC_PIN);
#else
    sum += analogRead(BATTERY_ADC_PIN);
#endif
```

Line 49:

```c
#if BATTERY_USE_CAL_MV
  float adcVoltage = adcValue / 1000.0f;
#else
  float adcVoltage = (adcValue / BATTERY_ADC_MAX) * BATTERY_VREF;
#endif
```

Lines 75-83, replace the whole attenuation block with:

```c
#if BATTERY_USE_CAL_MV
  // Core 3.3.5 calibrates with the global setting and needs an attached pin.
  // GPIO2 is the only ADC channel used by this firmware.
  analogSetAttenuation(ADC_2_5db);
  analogRead(BATTERY_ADC_PIN);      // Attach before setting per-pin attenuation
  analogSetPinAttenuation(BATTERY_ADC_PIN, ADC_2_5db); // S3 range: 0-1.25V
#else
  analogSetAttenuation(ADC_11db);   // Full 0-3.3V range
#endif
```

Line 93:

```c
#if BATTERY_USE_CAL_MV
  Serial.printf("[BATTERY] Init: %.2fV -> %d%% (ADC mV: %.0f)\n",
#else
  Serial.printf("[BATTERY] Init: %.2fV -> %d%% (ADC raw: %.0f)\n",
#endif
```

Keep the `->` in the format string ASCII. `battery.cpp` currently uses a
Unicode arrow at line 94; replace it in the same edit.

### 4.4 Build flag wiring

A profile that is never defined is dead code with a bug inside. Do all three:

1. Create `firmware/wearable_withApp/flash_wearable.bat`, modelled on
   `firmware/receiver_withDesktop/flash_receiver.bat`, with a profile argument:

   ```bat
   set "PORT=%~1"
   if "%PORT%"=="" set "PORT=COM11"
   set "PROFILE=%~2"
   if "%PROFILE%"=="" set "PROFILE=laser"
   if /i "%PROFILE%"=="laser" set "FLAGS=-DRAMS_FCS_LASER"
   if /i "%PROFILE%"=="j2"    set "FLAGS=-DRAMS_JLC_S3_J2"
   if /i "%PROFILE%"=="proto" set "FLAGS="
   "%CLI%" compile --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc ^
       --build-property "compiler.cpp.extra_flags=%FLAGS%" "%~dp0."
   "%CLI%" upload -p %PORT% --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc "%~dp0."
   ```

2. Add a `wearable-laser` target to `scripts/verify/verify_all.ps1` that runs
   the same `--build-property` and fails on a non-zero exit. Keep the existing
   `wearable` target unchanged as the default-profile compile.

3. Record the exact flag in the build identity line that the firmware prints at
   boot. If no identity line exists, add one to `setup()`:

   ```c
   Serial.printf("[BUILD] profile=%s ratio=%.1f cal_mv=%d\n",
                 BATTERY_PROFILE_NAME, BATTERY_DIVIDER_RATIO, BATTERY_USE_CAL_MV);
   ```

   with `BATTERY_PROFILE_NAME` defined beside the profile block.

### 4.5 What not to change

- Do not touch the `RAMS_JLC_S3_J2` behaviour. It must compile to the same code.
- Do not define `RAMS_FCS_LASER` and `RAMS_JLC_S3_J2` together. Add a compile
  error if both are defined.
- Do not use `RAMS_FCS_LASER` in `neopixel.cpp`. That board has the stock
  SuperMini LED; the custom RMT path is J2-only.
- Do not change `BATTERY_EMPTY_VOLTAGE` or `BATTERY_FULL_VOLTAGE` in this
  change. 3.55 V and 4.20 V stay.

---

## 5. Immediate prototype rework (no new parts)

This makes the existing FCS board read the cell today. It uses R1, R2, and a
100 nF cap that is already in the parts bin.

### 5.1 Steps

1. Power off. Disconnect the cell and USB.
2. Find R1 (100k, near U1 pad 4). Confirm with a meter that R1 pin 1 is
   `+3.3V` and pin 2 is the `BATT` node.
3. Desolder or lift **only R1 pin 1** from the `+3.3V` side. Leave pin 2
   connected to the node.
4. Solder a short 30 AWG wire from the lifted R1 pin 1 to the cell positive
   node. Use the module `BAT+` pad or the cell positive wire joint, whichever is
   accessible. Do not cut the cell wire. Route the wire away from the antenna.
5. Solder a 100 nF ceramic from the `BATT` node to `GND`, as close to U1 pad 4
   as possible. A 10 nF cap is acceptable if 100 nF is not on hand. Do not skip
   the cap; the 100k/100k node is high impedance.
6. Inspect for solder bridges. With the cell still disconnected, measure:
   - R1 pin 1 to R1 pin 2: about 100k
   - R1 pin 2 to GND: about 100k
   - U1 pad 4 to GND: about 100k
7. Connect the cell. Measure the cell voltage at the pack and the node at U1
   pad 4. The node must be half the pack voltage.
8. Open serial at 115200. Confirm `[BATTERY] Init:` reads within 0.10 V of the
   meter. A full cell should read 4.05 to 4.20 V, not 3.30 V.
9. If it still reads 3.30 V, the tap is still on `+3.3V`. Recheck step 3.

### 5.2 Expected result

| Cell | Node | Reported |
|---|---|---|
| 4.20 V | 2.100 V | 4.20 V, 100 percent |
| 3.90 V | 1.950 V | 3.90 V, 54 percent |
| 3.70 V | 1.850 V | 3.70 V, 23 percent |
| 3.55 V | 1.775 V | 3.55 V, 0 percent |

The default profile uses raw `analogRead` with 11 dB attenuation, so expect up
to about 0.10 V of error. That is acceptable for the prototype. Rev L1 uses the
calibrated millivolt path.

### 5.3 Do not

- Do not lift R2. That would leave the node floating.
- Do not power the board from USB with the cell disconnected and expect a
  meaningful reading. With no cell, the node sits at 0 V and the gauge reads 0.
- Do not bridge `BOOST` on the module to "improve charging". `BOOST` raises the
  charge current from 100 mA to 300 mA and is only for cells above 500 mAh.

---

## 6. Rev L1 architecture

Rev L1 is a compact single-sided board for the same electrical function:
SuperMini, Ra-02 carrier, active buzzer, battery sense, cell connector.

### 6.1 Binding architecture rules

| Rule | Reason |
|---|---|
| One copper face, `F.Cu` only | The laser process is single-layer. No vias, no B.Cu. |
| SuperMini body on F, all its pads reflowed on F | Castellated SMD module. |
| LoRa carrier body on B, its 16 pins soldered on F | A THT carrier's joints land on the face opposite its body, so every joint is on the copper face. |
| All SMD parts on F | Single reflow, single hot-plate cycle. |
| LoRa rotated 90 degrees from the prototype | Its pin rows must run parallel to the SuperMini rows, not across them. |
| 0805 passives, SOT-23 transistor, SMD buzzer | Hand placeable, inspectable, reflowable. |
| No ground pour | Large copper areas etch unevenly and undercut. Use explicit 1.5 mm power traces. |
| JST-PH 2.0 mm cell connector | JST-SH 1.0 mm is too fine for hand work. |
| Standard `power:+3V3`, not the FCS custom `power:+3.3V` | The custom symbol is embedded in the FCS schematic and is not in a library. |
| Net names `VBAT` and `BATT_SENSE` | The defect was a net called `BATT` that was not the cell. Name the cell and the node differently so it cannot recur. |

### 6.2 Block diagram

```
        +-----------+      SPI + control      +-------------+
  cell -| J1 JST-PH |------------------------>| U2 Ra-02    |
        | 2 pin     |      +3V3, GND           | carrier     |
        +-----+-----+                          | body on B   |
              |                                +-------------+
              | VBAT                                 ^
              |                                      |
        +-----+---------------------+          +-----+-----+
        | R1 330k -> BATT_SENSE     |          | +3V3 from |
        | R2 100k -> GND            |          | U1 pad 16 |
        | C3 100nF                  |          +-----------+
        +-----+---------------------+
              |
        +-----+---------------------+     +----------------+
        | U1 ESP32-S3 SuperMini     |---->| R3 330R -> Q1  |
        | body on F, pads on F      |     | BC817 -> BZ1   |
        +---------------------------+     +----------------+
```

### 6.3 Bill of materials

| Ref | Part | Package | Notes |
|---|---|---|---|
| U1 | ESP32-S3 SuperMini | 2x9 castellated, 2.54 pitch | 18 pins plus BAT+ and BAT- |
| U2 | Ra-02 carrier | 2x8 THT, 2.54 pitch | body on B, pins soldered on F |
| R1 | 330k 1 percent | 0805 | battery divider top |
| R2 | 100k 1 percent | 0805 | battery divider bottom |
| R3 | 330R 1 percent | 0805 | buzzer base resistor |
| C1 | 47uF 10V | 0805 | LoRa TX sag buffer |
| C2 | 100nF | 0805 | LoRa VDD decoupling |
| C3 | 100nF | 0805 | battery sense filter |
| Q1 | BC817-25 | SOT-23 | NPN buzzer low-side switch |
| BZ1 | SMD-9650-3327 | 9.6 x 9.6 mm | active buzzer |
| J1 | JST-PH B2B-PH-K | 1x02, 2.00 mm | cell connector |
| TP1..TP4 | test pads | 1.5 mm | VBAT, +3V3, GND, BATT_SENSE |

Eleven components plus four test pads. No switch, no LED, no extra sensor.

Every value in this BOM is already in the J2 order package or is the same value
in a larger package. The two modules are the parts the user already owns. No new
supplier and no new part family is introduced.

### 6.4 Pin budget

U1 pads used: 3, 4, 10, 11, 12, 13, 14, 15, 16, 17, plus BAT+ and BAT-.
Unused: 1 TX, 2 RX, 5 to 9 (GPIO3 to GPIO7), 18 (5V).

That is deliberate. TX and RX stay unconnected because the module's USB-C
handles programming. If a serial console is needed after assembly, probe the
module's own pads, not the carrier.

### 6.5 Power budget

| Load | Peak | Note |
|---|---|---|
| LoRa TX | about 120 mA at 3.3 V | short bursts, 246.8 ms at SF9 |
| SuperMini | about 80 mA with BLE | |
| Buzzer | about 30 mA | active, 3 V |
| Divider | 9.8 uA | continuous |

C1 47uF covers the LoRa burst. The SuperMini regulator is rated well above the
sum. No bulk electrolytic is needed.

---

## 7. Floor plan

### 7.1 Provisional outline

Rectangle 52.0 x 32.0 mm, corner radius 2.0 mm. This is 23 percent smaller than
the 50 x 43 prototype. The outline is provisional: recompute after M1 through
M4. The constraints below are binding; the coordinates are not.

```
y=32 +----------------------------------------------+
     | S3 ANTENNA KEEPOUT |  BZ1 9.6  | J1 7.4 | R/C |
y=24 |  (no copper)       +-----------+--------+-----+
     |   +-----------+    |                          |
     |   | U1 S3     |    |   U2 LoRa carrier        |
     |   | 18 x 23.5 |    |   23 x 18.2              |
     |   | body F    |    |   body B, pins on F      |
y=2  |   +-----------+    |                          |
     |   USB              |   LORA ANTENNA KEEPOUT   |
y=0  +----------------------------------------------+
    x=0                                          x=52
```

### 7.2 Zones

| Zone | Provisional rectangle | Contents | Binding rule |
|---|---|---|---|
| A | x 0..20, y 0..23.5 | U1 body and pads | Antenna end at the top edge; no copper in the antenna block and 5 mm beyond the edge |
| B | x 20..25, y 0..24 | escape channel | No components; traces only |
| C | x 26..49, y 2..20.2 | U2 body on B | No copper under the body except the 16 pad escapes |
| D | x 26..36, y 22..31.6 | BZ1 | 1 mm clear of the U2 pad field |
| E | x 44..51, y 24..30 | J1 | Pin 1 square pad, plus mark on silk |
| F | x 36..43, y 22..31.6 | R1, R2, C3, R3, Q1, C1, C2 | Keep C1 and C2 within 5 mm of U2 VDD |

### 7.3 Antenna rules

- The SuperMini antenna block must face free space. The module's antenna end must
  sit at the board edge or overhang it; the carrier must not extend past the
  antenna block. No copper may sit under the antenna block. Treat the block plus
  2 mm inboard as a copper-free rectangle.
- Keep 5 mm of clear air beyond each antenna, off the board edge.
- The LoRa antenna faces the opposite edge from the SuperMini antenna. If the
  floor plan cannot achieve opposite edges, keep at least 10 mm between the two
  antenna elements and point the LoRa element away from the board.
- No battery, no ground pour, and no wide power trace under either antenna.
- Do not run the VBAT wire across an antenna keepout.

### 7.4 Mechanical rules

- The SuperMini USB-C must face a board edge with at least 8 mm of clear air in
  front of it. A cable overmold must not press on the board.
- The buzzer sound port must not be covered by the cell or the enclosure.
- The cell connector must be reachable without desoldering the LoRa carrier.
- Add two 3.2 mm mounting holes only if the enclosure is already chosen. Do not
  invent a hole pattern now.

### 7.5 Routing notes

These are the mistakes that will cost a board:

1. **Pin numbers are not GPIO numbers.** U1 pad 12 is GPIO10, pad 14 is GPIO12,
   pad 15 is GPIO13. The symbol pin names carry the GPIO labels; the pin numbers
   are physical pad indices. Read the name, not the number.
2. **GPIO1 and GPIO2 are at the antenna end.** Pad 3 (GPIO1, buzzer) and pad 4
   (GPIO2, sense) are the third and fourth pins from the antenna end of the left
   row. Escape them around the left edge and the bottom of the module. Do not
   try to cross between the two pin rows; the pad gap is 0.94 mm and a 1.0 mm
   trace with 0.5 mm clearance cannot pass.
3. **Keep the SPI runs short and parallel.** NSS, SCK, MOSI, MISO leave pads 12,
   14, 13, 15 and land on U2 pins 15, 12, 14, 13. Route them as a group, 1.0 mm
   wide, 0.5 mm apart, and do not cross them with the buzzer trace.
4. **The sense trace is high impedance.** Keep the BATT_SENSE run under 25 mm,
   away from the SPI group and the buzzer trace, and put C3 at the U1 end.
5. **VBAT carries the charge current.** 1.5 mm from J1 to the U1 BAT+ pad and
   to R1. Do not daisy-chain it through the divider.
6. **No trace under the LoRa antenna end** of the carrier, even on F.Cu.

---

## 8. Netlist

Thirteen nets. Any extra net is a defect.

| Net | Connection 1 | Connection 2 | Connection 3 |
|---|---|---|---|
| `VBAT` | J1 pin 1 | U1 BAT+ (pin 19) | R1 pin 1 |
| `GND` | J1 pin 2 | U1 BAT- (pin 20), U1 pad 17 | R2 pin 2, C1 pin 2, C2 pin 2, C3 pin 2, Q1 pin 2, BZ1 pin 2, U2 pins 1, 2, 9, 16 |
| `+3V3` | U1 pad 16 | U2 pin 3 | C1 pin 1, C2 pin 1, BZ1 pin 1 |
| `BATT_SENSE` | U1 pad 4 (GPIO2) | R1 pin 2 | R2 pin 1, C3 pin 1 |
| `LORA_NSS` | U1 pad 12 (GPIO10) | U2 pin 15 | |
| `LORA_SCK` | U1 pad 14 (GPIO12) | U2 pin 12 | |
| `LORA_MOSI` | U1 pad 13 (GPIO11) | U2 pin 14 | |
| `LORA_MISO` | U1 pad 15 (GPIO13) | U2 pin 13 | |
| `LORA_RST` | U1 pad 11 (GPIO9) | U2 pin 4 | |
| `LORA_DIO0` | U1 pad 10 (GPIO8) | U2 pin 5 | |
| `BUZZ_CTRL` | U1 pad 3 (GPIO1) | R3 pin 1 | |
| `Q1_B` | R3 pin 2 | Q1 pin 1 (base) | |
| `BUZZ_N` | Q1 pin 3 (collector) | BZ1 pin 2 (minus) | |

U2 pins 6, 7, 8, 10, 11 (DIO1 to DIO5) are unconnected. U1 pads 1, 2, 5, 6, 7,
8, 9, 18 are unconnected.

Test pads: TP1 on `VBAT`, TP2 on `+3V3`, TP3 on `GND`, TP4 on `BATT_SENSE`.

### 8.1 Net-name rules

- `VBAT` is only the cell positive. It must never connect to `+3V3`.
- `BATT_SENSE` is only the divider midpoint. It must never be called `BATT`.
- A net named `BATT` is forbidden on new boards. The old name is the defect.

---

## 9. Symbol and footprint library

### 9.1 Symbols

| Function | Symbol | Source | Action |
|---|---|---|---|
| U1 | `ESP32_S3_SUPERMINI` | FCS `DMS - PCB.kicad_sch` embedded `lib_symbols` | copy, add pin 19 `BAT+` and pin 20 `BAT-` |
| U2 | `Ai-Thinker-Ra-02` | same | copy unchanged, 16 pins |
| R1, R2, R3 | `Device:R` | `D:\KiCad things\share\kicad\symbols\Device.kicad_sym` | use |
| C1, C2, C3 | `Device:C` | same | use |
| Q1 | `Transistor_BJT:BC817` | `D:\KiCad things\share\kicad\symbols\Transistor_BJT.kicad_sym` | use, pin 1 B, 2 E, 3 C |
| BZ1 | `Device:Buzzer` | `Device.kicad_sym` | use |
| J1 | `Connector_Generic:Conn_01x02` | `Connector_Generic.kicad_sym` | use |
| Power | `power:+3V3`, `power:GND`, `power:+BATT` | `power.kicad_sym` | use, do not use the FCS custom `power:+3.3V` |

`BC817` extends `Q_NPN_BEC`, so pin 1 is base, pin 2 is emitter, pin 3 is
collector. The default footprint is `Package_TO_SOT_SMD:SOT-23`.

The FCS `ESP32_S3_SUPERMINI` pin names, in order, are: `TX`, `RX`, `GPIO1`,
`GPIO2`, `GPIO3`, `GPIO4`, `GPIO5`, `GPIO6`, `GPI07` (typo preserved in the
source), `GPIO8`, `GPIO9`, `GPIO10`, `GPIO11`, `GPIO12`, `GPIO13`, `3V3`, `GND`,
`5V`. Fix `GPI07` to `GPIO7` in the copy. Add `BAT+` as pin 19 and `BAT-` as
pin 20.

The FCS Ra-02 pin names, in order, are: `GND`, `GND`, `VDD`, `~{RESET}`, `DIO0`,
`DIO1`, `DIO2`, `DIO3`, `GND`, `DIO4`, `DIO5`, `SCK`, `MISO`, `MOSI`, `~{NSS}`,
`GND`.

### 9.2 Footprints

| Ref | Footprint | Source | Action |
|---|---|---|---|
| U1 | `RAMS_ESP32S3_SuperMini` | new | build per section 10.1 |
| U2 | `RAMS_Ra02_Carrier` | new | build per section 10.2 |
| R, C | `R_0805_2012Metric`, `C_0805_2012Metric` | standard library | use |
| Q1 | `Package_TO_SOT_SMD:SOT-23` | standard library | use |
| BZ1 | `Buzzer_SMD_9650_3327` | `hardware/KiCAD Files/Antigravity Build/RAMS - PCB/lib/rams.pretty/` | copy |
| J1 | `Connector_JST:JST_PH_B2B-PH-K_1x02_P2.00mm_Vertical` | standard library | use |

The buzzer footprint has 2.5 x 2.5 mm pads at x = plus or minus 3.25 mm and a
5.3 mm courtyard. It is confirmed present and reusable.

---

## 10. Footprint definitions

All dimensions in millimetres. Origin at the module centre unless stated.

### 10.1 `RAMS_ESP32S3_SuperMini`

- Body: 18.0 wide (x) by 23.5 tall (y).
- Pads: 2 rows of 9, pitch 2.54, row spacing 15.24, span 20.32.
- Pad: 3.0 (across the row) by 1.6 (along the row), rectangular, `F.Cu`,
  `F.Paste`, `F.Mask`.
- Row centre offset: 7.62 from the module centreline, then shifted 0.3 mm
  outboard. Pad spans 6.42 to 9.42 from the centreline.
- Gap between adjacent pads along a row: 2.54 minus 1.6 = 0.94.
- Pin 1 is the antenna-end outer pin on the left row. Mark pin 1 on `F.SilkS`
  with a dot and on `F.Fab` with the pin name.
- BAT pads: 2 pads under the body at the antenna end, plus and minus, size and
  spacing **PENDING M2**. Do not draw them from the reference image.
- `BOOST` keepout: a 2.0 mm square between the BAT pads, no `F.Cu`, no
  `F.Paste`, no `F.Mask` opening. Add silk text `BOOST OPEN 100mA` beside the
  module.
- Courtyard: body plus 0.5 mm, except 1.0 mm at the antenna end.

The FCS footprint uses hand-typed coordinates with a 19.86 mm span and a
2.48 to 2.50 pitch. Do not copy it. Snap to exact 2.54 and 20.32. The extra
0.46 mm of span is absorbed by the 3.0 mm pad width.

### 10.2 `RAMS_Ra02_Carrier`

- Body: **PENDING M1**. The FCS footprint says 20 x 27 with rows 25.4 apart; the
  user's carrier measures 23 x 18.2 and cannot have 25.4 mm rows. Measure the
  actual carrier.
- Pads: 2 rows of 8, pitch **PENDING M1**, row spacing **PENDING M1**.
- Pad: 1.6 mm diameter, 0.8 mm drill, `thru_hole` with layers `F.Cu` and
  `F.Mask` only. Do not place the pad on `B.Cu`; Rev L1 has no `B.Cu`, and the
  joint is made on the copper face. The barrel is not relied on for continuity.
- Pin 1 square pad, silk dot, `F.Fab` pin names.
- Courtyard: body plus 0.5 mm.
- Body outline on `B.SilkS` only, because the body sits on the back.
- The 16 pads are the only copper under the body.

The symbol is carrier-independent: 16 pins with the names in section 9.1. Only
the footprint changes when the carrier changes.

### 10.3 Passive footprints

Use the standard library. Do not create custom 0805 footprints. If a part needs
a wider land for hand soldering, change the paste aperture, not the copper.

### 10.4 Keepout summary

| Keepout | Layer | Size |
|---|---|---|
| S3 antenna | `F.Cu`, `F.Paste` | antenna block plus 2 mm inboard, full module width |
| S3 BOOST jumper | `F.Cu`, `F.Paste`, `F.Mask` | 2.0 x 2.0 mm between the BAT pads |
| LoRa antenna | `F.Cu` | carrier antenna end plus 5 mm, full carrier width |
| Board edge air | none | 5 mm beyond each antenna end |

---

## 11. Assembly

Single reflow on the copper face, then hand-solder the LoRa carrier.

### 11.1 Order

1. Clean the bare board with IPA. Flux the pads.
2. Apply paste to U1, R1, R2, R3, C1, C2, C3, Q1, BZ1, J1. Use a stencil if
   available; otherwise a 0.4 mm syringe tip.
3. Place U1 first and align the castellations to the pads. The module self-aligns
   during reflow if it is within 0.3 mm.
4. Place Q1, R3, R1, R2, C3, then C1 and C2 next to U2 VDD, then BZ1, then J1.
5. Hot plate: 100 C for 60 s, 150 C for 60 s, ramp to 235 C, hold 30 s, remove
   and cool on a ceramic tile. Do not disturb until the solder is solid.
6. Inspect every joint under magnification. Touch up with a 0.5 mm iron tip and
   flux. Remove bridges with solder braid.
7. Insert U2 from the B side. Tack one corner pin on F, check that the body is
   square and seated, then solder the remaining 15 pins. 0.8 mm drill, 1.6 mm
   pad.
8. Clean flux with IPA and a soft brush. Dry.
9. Do not install the cell yet. Run the checks in section 13.

### 11.2 Hot-plate notes

- The buzzer is the largest thermal mass. Place it last and give the board 30 s
  more preheat if the joints look grainy.
- The SuperMini's plastic parts are on the top face, away from the plate, so the
  module survives a 235 C plate for 30 s. Do not exceed 245 C.
- Never reflow the LoRa carrier. It is THT and has a crystal and a shield can.

---

## 12. Laser artwork workflow

This is the user's DAJA 6 process, written so an agent can follow it exactly.

### 12.1 Material and mask

1. Cut 1.6 mm single-sided copper clad to the board size plus 4 mm on each side.
2. Sand with 800 grit, then 1200 grit, in two directions at 90 degrees, until
   the copper is uniform and scratch-free. Wipe with IPA. Do not touch the
   copper with bare fingers after this.
3. Spray matte black, two thin coats 15 minutes apart. Dry at least 30 minutes.
   Gloss reflects the laser and gives uneven removal. Do not use gloss.

### 12.2 Plot from KiCad

1. Plot `F.Cu`, `Edge.Cuts`, `F.SilkS`, and the drill file. If a B.Cu layer is
   ever used, plot `B.Cu` too. Rev L1 has no B.Cu.
2. Format: SVG, 1:1, black on white, no page border.
3. Do not mirror `F.Cu`.
4. Include the calibration comb (section 12.5) in a corner outside the board
   outline. Cut it off after etching.

Layer intent, so the artwork is not inverted:

- `F.Cu` is the copper pattern. The laser removes paint from the **gaps** via
  the FlatCAM isolation path, then the etchant removes the exposed copper.
  Never engrave the traces themselves and then etch.
- `F.SilkS` is a marking pass only. Engrave it at low power so it marks the
  paint without exposing copper. If silk exposes copper, the etchant eats the
  copper under the text.
- `Edge.Cuts` is cut or scored after etching, not etched.

### 12.3 FlatCAM

1. Import each SVG. Set units to mm and the origin to the board's lower-left.
2. Isolation routing for `F.Cu`: the path must clear the full 0.5 mm gap. Use a
   0.5 mm tool in one pass, or a 0.2 mm tool with 3 passes at 0.15 mm stepover.
   One 0.2 mm pass leaves paint in the gap and the etchant cannot reach the
   copper.
3. Drill: 0.8 mm tool for U2. No other drills unless mounting holes are added.
4. Export SVG. Keep the layer names.

### 12.4 Inkscape

1. Open the SVG. Delete the yellow origin marks and any FlatCAM labels. The
   yellow marks are not artwork and will engrave as copper.
2. Verify the board measures the outline in section 7.1 (52.0 by 32.0 mm
   provisional, or the measured replacement). Use the rectangle tool or the XML
   editor; do not trust the zoom level.
3. Mirror horizontally **only** if the artwork is `B.Cu`. For a single-sided
   `F.Cu` board, mirroring flips the layout and ruins the board.
4. Crop the document to the artwork plus 2 mm.
5. Export PNG at 300 dpi, 1-bit black and white, no anti-aliasing.

### 12.5 Calibration comb

Every artwork run includes a comb outside the board outline:

- Traces: 1.2, 1.0, 0.8, 0.6 mm wide, 10 mm long.
- Gaps: 0.4, 0.5, 0.6, 0.8 mm between 5 mm pads.
- Pads: 0.6, 0.8, 1.0 mm squares.

Measure the etched comb with calipers. If a 1.0 mm trace etches to less than
0.85 mm, the laser is over-burning. Increase the drawn width by the difference
on the next run, or reduce power. If a 0.4 mm gap closes, raise the minimum
clearance to 0.6 mm. Record the result in the verification log; do not guess.

### 12.6 Engrave and etch

1. Import the PNG into the Engraver app. Set the physical size to the exact
   board size. Focus on the coated surface.
2. Test on a scrap piece with a 3 x 3 power/speed matrix. Pick the setting that
   removes paint cleanly without cutting into the copper.
3. Engrave. Clean debris with a soft brush and IPA.
4. Etch in ferric chloride at about 40 C with agitation. Check every 2 minutes.
   Stop when the copper between traces is gone and no copper specks remain.
5. Rinse in water, then rinse with IPA, then dry.
6. Strip paint only from the pads with acetone on a cotton swab. Do not flood
   the board and do not strip the traces; the paint on the traces is the
   aesthetic and the oxidation barrier.
7. Tin the pads with a thin solder film and flux. Keep the tinning flat for
   reflow.
8. Inspect under magnification before assembly.

### 12.7 Etch defects to reject

- Any trace narrower than 0.7 mm where 1.0 mm was drawn.
- Any gap that did not clear.
- Any undercut at a pad edge.
- Any copper speck bridging two nets.

Reject and re-etch. Do not "fix" a bridge by scraping; the copper thickness is
already variable.

---

## 13. Verification gate

Run in order. Record each as PASS, FAIL, or `SKIP (hardware)` with a reason.

### 13.1 Design gate, before plotting

| ID | Check | Pass condition |
|---|---|---|
| HW-01 | ERC | 0 errors, 0 warnings that are not understood |
| HW-02 | DRC | 0 errors, 0 unconnected, 0 vias, 0 `B.Cu` items |
| HW-03 | Netlist parity | exactly the 13 nets in section 8, no extras |
| HW-04 | Trace rules | minimum width 1.0 mm, minimum clearance 0.5 mm |
| HW-05 | 1:1 paper print | the real U1 and U2 sit on the print with every pad visible within 0.3 mm |
| HW-06 | Divider math | 4.20 V -> 0.977 V and 3.55 V -> 0.826 V, both plus or minus 1 percent |
| HW-07 | Keepouts | S3 antenna, LoRa antenna, and BOOST rectangles are empty on `F.Cu` and `F.Paste` |

### 13.2 Copper gate, before power

| ID | Check | Pass condition |
|---|---|---|
| HW-08 | Etch geometry | no trace below 0.7 mm, no bridge, no open |
| HW-09 | Continuity | `VBAT` to `GND` above 1 MOhm; `+3V3` to `GND` no stable low reading (the 47uF cap charges, so the meter climbs); `BATT_SENSE` to `GND` 100k plus or minus 2 percent; `BATT_SENSE` to `VBAT` 330k plus or minus 2 percent |
| HW-10 | Power | 4.00 V on `VBAT` from a 50 mA limited supply gives `+3V3` = 3.3 plus or minus 0.1 V and idle current below 30 mA |

### 13.3 Firmware and radio gate

| ID | Check | Pass condition |
|---|---|---|
| HW-11 | Battery reading | `[BATTERY] Init:` within 0.10 V of the meter at 3.60, 3.80, 4.00, and 4.20 V; percent rises monotonically |
| HW-12 | Radio | LoRa TX peak current about 120 mA; RSSI at 1 m better than minus 40 dBm; then run the field sweep in `EXECUTION_PLAN.md` C.13 |

### 13.4 Record

Append every run to `docs/agent/verification-log.jsonl` through the harness.
Never report a hardware check as passed without a measurement.

---

## 14. Open measurements (blocking)

Do not draw footprints until these are written into this file as facts.

| ID | Measurement | Why it blocks |
|---|---|---|
| M1 | Ra-02 carrier: header row spacing, pin pitch, carrier outline, antenna/IPEX position, pin 1 corner | U2 footprint and floor plan orientation |
| M2 | SuperMini: BAT+ and BAT- pad size, spacing, distance from the antenna-end edge, `BOOST` jumper location and extent | BAT pads and `BOOST` keepout |
| M3 | 0805 stock: confirm 330k and 100k at 1 percent, or order them | divider BOM |
| M4 | Cell: connector type, capacity in mAh, maximum charge current | J1 choice and `BOOST` decision |
| M5 | Buzzer: confirm the plus pad is pin 1 on the part you own | BZ1 orientation |
| M6 | Enclosure: mounting hole pattern, if any | outline and holes |

Use calipers, not a photo. Record the measurement and the instrument in this
file. A photo with no scale is not a measurement.

Ask the user for M1 through M6 in one message, naming each measurement point.
Do not ask for a photo and do not infer a dimension from the reference images.

---

## 15. Do not

- Do not connect the sense divider to `+3V3` on any new board.
- Do not name the divider midpoint `BATT`.
- Do not use the 20-pin SuperMini variant. The reference image's second view
  (GPIO14 to GPIO48, no GPIO8 to GPIO13) cannot drive the LoRa SPI.
- Do not copy the FCS U1 footprint coordinates. Snap to 2.54 and 20.32.
- Do not copy the FCS U2 row spacing. Measure the carrier.
- Do not bridge `BOOST`.
- Do not put copper under either antenna.
- Do not mirror a single-sided `F.Cu` PNG.
- Do not strip paint from the traces.
- Do not etch with U1 or U2 installed.
- Do not reflow U2 on the hot plate.
- Do not define `RAMS_FCS_LASER` without wiring it into a flash script and the
  verify gate.
- Do not change the J2 profile while adding the laser profile.
- Do not delete the FCS prototype files. They are the evidence for INC-019.

---

## 16. Records to append

### 16.1 Incident ledger

Add after INC-018:

| ID | Title | System | Severity | Status | Check |
|---|---|---|---|---|---|
| INC-019 | FCS prototype battery sense divider is tied to `+3.3V`, not the cell, so the gauge reads a constant 3.30 V and 0 percent; `U1` 5V pad is also unconnected and there is no battery connector | wearable hardware | high | open until H3 is reworked | HW-06, HW-09, HW-11 |

### 16.2 Lessons

Add after L-16:

**L-17 - A divider is only a sensor if one end is the cell.** Read the net, not
the comment. The prototype's `battery.h` comment drew `VBAT` at the top of the
divider and the netlist had `+3.3V` there. A comment that disagrees with the
netlist is a defect, not documentation.

### 16.3 Memory map

Append a paragraph to `MEMORY_MAP.md` naming: the defect, the corrected divider,
the profile macro, the Rev L1 architecture, and the fact that the layout is
blocked on M1 through M4.

---

## 17. Commit sequence

| # | Commit subject | Contents |
|---|---|---|
| 1 | `docs(agent): add wearable hardware revision plan` | this file, README link, status board |
| 2 | `fix(wearable): select the ADC profile by board macro` | `battery.h`, `battery.cpp` |
| 3 | `feat(wearable): add the Rev L1 board profile` | `RAMS_FCS_LASER`, `flash_wearable.bat`, `verify_all.ps1` |
| 4 | `feat(hardware): add the Rev L1 schematic and footprints` | KiCad project, after M1 and M2 |
| 5 | `docs(hardware): record Rev L1 measurements and etch results` | this file, verification log |

Run the gate before each commit:

```powershell
python scripts/verify/check_invariants.py
powershell scripts/verify/verify_all.ps1 -Build all
```

Commit 1 changes documentation only; the gate result must be identical to the
baseline. Commits 2 and 3 must keep the default and J2 builds byte-identical in
behaviour and add a passing laser-profile compile.

---

## 18. Handoff

- The prototype rework is a bench task. It is the only hardware item that can
  finish before the competition.
- Rev L1 cannot be drawn until M1 and M2 are measured. Everything else in this
  file is ready.
- The software stages in `EXECUTION_PLAN.md` are independent of this file and
  do not wait for the board.
- If the competition date forces a choice, rework the prototype and ship it.
  Rev L1 is the cleaner board, not a prerequisite for the field measurement.
