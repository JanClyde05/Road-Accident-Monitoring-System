# PCB and schematic rules used by senior engineers, applied to this board

Compiled 2026-11-10 from Espressif's ESP32-S3 Hardware Design Guidelines (the
PDF is in `docs/Datasheets/`) plus general four-layer practice. Each rule states
what this board does today, so the list doubles as a checklist for the next spin.

## 1. Stackup and planes

- Four layers, in this order: signals and parts on top; a **continuous ground
  plane with no routing** on layer 2; power plus moderate signal on layer 3,
  kept solid under the radio and the crystal; signals on the bottom.
- Do not split the ground plane under the RF trace, the crystal, or the USB pair.
  A return path that has to detour is an antenna.
- This board: F.Cu signals, In1 dedicated GND with tracks disallowed by the
  project rules, In2 signal and power, B.Cu signal. **Conforms.**

## 2. Crystal

- No vias on the clock traces; the series element goes close to the chip.
- Load capacitors sit either side of the crystal, with their ground pads next to
  the crystal ground pads.
- No high-speed digital routing under the crystal; keep power vias away from the
  clock lines; guard the clock with ground.
- This board: Y1 with C24/C25 either side, R9 series near U1. **Conforms**,
  except R9 is 22 ohm rather than the reference 24 nH (finding S3).

## 3. Radio

- 50 ohm controlled impedance, referenced to the layer below the chip.
- Matching network close to the pin, parts placed in a zig-zag so the two shunt
  capacitors do not face the same way and couple.
- At 0402 and larger, the harmonic-suppression stub on the first shunt capacitor
  is not required; it matters at 0201.
- Antenna keep-out: no copper on any layer, no parts, no vias; the ceramic
  antenna on this board needs the documented 6.5 mm corner region clear, and
  the feed should sit at the board edge.
- This board: C18/L2/C19 close to pin 1, then C32/L4/L5 to ANT1 at the corner.
  **Conforms on paper.** Verify the keep-out on every layer after any copper
  pour change; a zone on In2 or B.Cu inside the corner is a silent failure.

## 4. USB

- Route D+ and D- as a pair, 90 ohm differential, no stubs, minimal vias.
- ESD protection at the connector with a short ground return.
- Series resistors 22 - 33 ohm close to the chip, not the connector.
- CC resistors 5.1 k on each line for a sink.
- This board: USBLC6 at the connector, R38/R39 22 ohm, 5.1 k CC parts.
  **Conforms.**

## 5. Power and decoupling

- Bulk 10 uF at the regulator output plus 100 nF at each supply pin, and the
  100 nF must be the closer of the two.
- The radio supply pin gets 10 uF plus 1 uF plus 100 nF, with the smallest
  closest, and an LC or ferrite in the feed to keep harmonics off the rail.
- Trace the return current: a decoupling capacitor whose ground via is far from
  the pin does nothing useful.
- This board: C10 10 uF, C22 1 uF, C21 10 nF, C15/C16 100 nF around U1, plus
  L1 2 nH and C11/C12/C13 on VDD_RF. **Conforms**, and this is exactly the group
  whose placement sealed the QFN escape corridor (see the continuation status).

## 6. Fine-pitch escape (the lesson this board teaches)

- For 0.4 mm pitch, 0.2 mm pad height, you need a 0.45 mm corridor per signal at
  0.15 mm track and 0.15 mm clearance. Count the corridor **before** placing
  decouplers in front of the pin row.
- Fan out with staggered via columns rather than trying to reach the far side on
  one layer; keep the diagonal pitch at or above 0.65 mm for a 0.5/0.25 mm via.
- Never put a via in a 0.2 mm pad; it will not fit and it wicks solder.

## 7. Thermal and current

- Estimate regulator dissipation before choosing the package:
  `P = (Vin - Vout) * I`, and check `T_j = T_amb + P * theta_JA` against a
  derated limit. A 600 mA part in SOT-23 is often a 200 mA part in practice.
- Watch the FET and protection path drops at the real load, not at the marketing
  current.

## 8. Schematic discipline

- Every IC pin is checked against the datasheet pin table, by function, not by
  name. A swapped `B`/`DIR` on a translator would be invisible to ERC because
  both are valid connections to valid nets.
- A net name is documentation, not a contract. `NEO_SHIFT` looked like a data
  line and was in fact wired to a direction pin.
- Power-input pins are checked for a real source; a pin with only capacitors is
  a question, not an answer. Here VDD_SPI is legitimately internally fed, but
  that had to be established from the datasheet, not assumed.

## 9. What the ESP32-S3 SuperMini teaches (and its traps)

The SuperMini is a cheap reference people copy. The parts worth copying:

- 3.3 V LDO with 10 uF in and out, USB-C with 5.1 k CC resistors, 10 k on
  CHIP_PU with 1 uF, 10 k pull-up on GPIO0, and the RGB LED on **GPIO48**.
- `U0TXD`/`U0RXD` on GPIO43/44 for the boot log.

The traps seen repeatedly in this class of board:

- Assuming the module and the bare chip are the same platform. They are not:
  memory, GPIO availability and support circuitry differ (the project's F02/F28).
- Copying a divider ratio from the dev board (100k/100k) onto a board built with
  30k/10k, and then not re-checking the firmware (finding S7 here).
- Leaving the antenna keep-out full of pour because "the zone is excluded" while
  a track still runs through it.
- Driving a 5 V pixel from a 3.3 V GPIO, or from a cell that sags below the
  pixel's minimum supply.

## 10. Sources

- ESP32-S3 Hardware Design Guidelines, schematic checklist and PCB layout
  chapters (`docs/Datasheets/ESP32-S3_hardware_design_guidelines.pdf`).
- ESP32-S3 datasheet (`docs/Datasheets/ESP32-S3_datasheet.pdf`).
- Per-part datasheets in `docs/Datasheets/`; index and licences in
  `docs/Datasheets/DATASHEET_INDEX.md`.
