# DeepSeek Build: continuation of the GPT6 Astra J2 wearable

Created 2026-11-09, Asia/Manila, by copying `hardware/KiCAD Files/GPT6 Astra Build/`
verbatim (406 files, 90 MB). The copied board was byte-identical at handoff:
`RAMS_JLC_S3.kicad_pcb` SHA-256 `9762ad5d6735e42f4d8d7c94301f07d4d491a7fc3de2252453c5a0ffa1b7f063`.

Nothing in `GPT6 Astra Build/` was modified. All new work is here.

## 1. State inherited from GPT6 Astra

J2 LDO engineering candidate: bare ESP32-S3FH4R2, owned Ra-02, owned 9650 active
buzzer, AP2112 3.3 V LDO, LTC4054/LTH7 charger, DW01A + FS8205A protection,
Q5-switched raw LED rail with SN74LVC1T45 level translation, 42.05 x 32.05 mm,
four layers (In1 = dedicated GND).

Native facts measured on the copied file (KiCad 10.0.6):

| Item | Value |
|---|---|
| Footprints | 90 (82 components + 8 copper test pads; 80 fitted at first power-on) |
| Routed segments / vias / zones / nets | 854 / 159 / 8 / 97 |
| Outline | 42.05 x 32.05 mm |
| Schematic ERC | 0 violations across 4 sheets |
| PCB DRC | 0 violations, 0 schematic-parity issues |
| Unrouted connections | **5** |

## 2. Independent checks performed here

1. **Pin/net audit against `circuit_spec.json`** (not KiCad parity, which only
   compares names/fields): all 90 footprints' pad numbers and nets match the
   specification. 54 raw findings are benign: KiCad auto-nets
   `unconnected-(...)` for deliberately unused pins, one unnamed mechanical pad
   per connector/QFN, and nine `PWR_FLAG` symbols that do not exist on a PCB.
2. **Protection-boundary audit:** `B_MINUS` pads are exactly Q3.1, C5.2, U4.6,
   J2.2. `GND` has 69 pads and is a separate net; no copper, zone or test pad
   joins them outside the FS8205A path.
3. **Parity cleanup:** the single inherited parity warning (C35 footprint
   `Description` empty versus the schematic string) was fixed in the footprint
   field. Final parity count is 0.

Evidence: `RAMS Wearable/verification/deepseek_final/erc.json` and `drc.json`
(0 violations, 0 parity, 5 unconnected).

## 3. Flaw found: the QFN left fanout was never routable

The five open nets are U1 pad 7 `VBAT_SENSE`, pad 4 `MCU_EN`, pad 5 `BOOT_BTN`,
pad 17 `LORA_SCK` and pad 6 `BUZZER_CTRL`. All five fail for one geometric
reason, not for lack of effort by the previous router:

- U1 left-column pads are 0.8 x 0.2 mm at 0.4 mm pitch, so every signal must
  escape horizontally. A 0.15 mm track on 0.15 mm clearance needs a 0.45 mm
  corridor; the band between the pad tips (x = 111.15 mm) and the nearest
  obstruction is only 1.15 mm wide.
- **C12 (109.8, 111.0) and C13 (109.8, 112.1)** were placed with their VDD_RF
  pads at x = 110.28, i.e. 0.6 mm in front of pads 5, 6 and 7. Their 0.25 mm
  VDD_RF trunk runs at x = 110.0-110.3 from y = 110.4 to 112.1 and closes the
  band completely. The measured F.Cu occupancy map shows the pads 4-7 island
  surrounded by other-net copper on every side.
- Vias cannot rescue the pads: a JLC-capable through via is 0.5 mm diameter on
  a 0.2 mm pad, so via-in-pad is physically impossible.
- Even after clearing the trunk, the via band is crossed by a B.Cu `+3V3` track
  from (111.65, 109.5) to (108.95, 112.2) and by the dangling In2 diagonals of
  `MCU_EN` and `BOOT_BTN`. Both lie on the line x + y = 221.15/221.24, exactly
  where four staggered vias must sit.

Reproduced with `scripts/congestion_map.py` and `scripts/route_remaining.py`;
both are in this folder.

## 4. Fix attempt and why it was rejected

`scripts/free_qfn_escape.py` relocates C12/C13 onto the existing x = 108.7
VDD_RF trunk (pad 1 on the trunk, pad 2 picked up by the F.Cu GND zone) and
deletes 33 conflicting or dangling items, refusing the edit unless native DRC
returns zero violations.

Result: **reverted**. DRC found 12 violations: one clearance of 0.10 mm against
the 0.15 mm rule, two courtyard overlaps, and dangling tracks/vias left by the
blunt deletion set. The board is unchanged, and both the rejection and the
reverted copy are retained as `verification/qfn_escape.json`,
`verification/qfn_escape_drc.json` and `verification/qfn_escape_backup.kicad_pcb`.

This is recorded as a failed attempt, not as a fix.

## 5. Remaining routing work (in dependency order)

1. Move C12 and C13 beside the x = 108.7 VDD_RF trunk and delete the x = 110.0-110.3
   trunk plus its stubs, keeping pad 3's own VDD_RF stub connected.
2. Relocate the B.Cu `+3V3` track off the x + y ~ 221.15 line, and remove the
   dangling In2 `MCU_EN`/`BOOT_BTN` diagonals (they are dead ends today).
3. Fan out pads 4-7 with two via columns: x ~ 110.55 for y 110.6 and 111.4,
   x ~ 109.9 for y 111.0 and 111.8 (diagonal spacing 0.76 mm against a 0.65 mm
   requirement), then continue on In2.
4. Route `BUZZER_CTRL` and `VBAT_SENSE` on In2, screened by In1 GND, to R12 and
   the Q4/R16/C29 node respectively.
5. Re-run `scripts/route_remaining.py`; it re-DRCs every candidate and keeps
   only clean ones. Accept only when DRC reports 0 violations **and** 0
   unconnected items at the final hashes.

Reference reading: Espressif ESP32-S3 PCB layout guidance (fine-pitch escape,
via placement, decoupler placement at the pin) and JLCPCB 4-layer capability
rules already used by this project.

## 6. Build artifacts (engineering only)

`RAMS Wearable/manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/` contains a complete
earned-from-source export set: 16 Gerber/Excellon files including all four
copper layers, both masks, both paste layers, both silkscreens, Edge.Cuts, PTH
and NPTH drills, drill maps and the `.gbrjob`; plus schematic PDF, board PDF,
CPL CSV (80 placed rows, DNP excluded) and the BOM CSV. See the README in that
folder.

**These files are not a fabrication release.** Five required nets are still
unrouted, so any board built from them would be electrically incomplete.

## 7. Boundary

No purchase, supplier contact, upload or order was made. No firmware file was
changed in this continuation. Original Antigravity Rev A/B/C and GEMINI Build
folders remain untouched.
