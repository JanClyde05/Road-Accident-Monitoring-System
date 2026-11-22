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

## 6. Escape analysis, 2026-11-15 (measured, not inferred)

Board at this analysis: `0233ee63cf879ec5` - DRC 0 violations, 5 unconnected,
41 informational parity warnings, ERC 0.

### What actually blocks the left column

U1 left pads 3-8 are 0.80 x 0.20 mm at 0.40 mm pitch, so each signal must leave
horizontally west from the pad tip at x = 111.15. Measured obstacles:

- C12 `VDD_RF` pad 1 at (110.280, 111.000), spanning x 110.00-110.56.
- C13 `VDD_RF` pad 1 at (110.280, 112.100), spanning x 110.00-110.56.
- The `VDD_RF` trunk wall at x = 110.300 running y 111.000-112.100 (0.20 mm wide).
- Pad 3's old route steps through x 110.00-110.75 at y 110.20-111.55.

Together they put other-net copper 0.59 mm in front of pad 5 and 0.87 mm in front
of pads 4, 6 and 7 - less than the 0.45 mm corridor a 0.15 mm track on 0.127 mm
clearance needs once the pad's own half-height is counted.

### Why the caps cannot simply move left

The obvious fix is to shift C12/C13 onto the x = 108.70 trunk. Measured legal
space there:

- L1 occupies x 107.60-108.40, y 110.40-112.36 (courtyard).
- C11 occupies x 108.25-110.15, y 113.05-113.95 (courtyard).
- The trunk itself is x 108.575-108.825.

That leaves a 0.65 mm band at y 112.4-113.0 - enough for one 0402, not two, and
a 0402 with pad 2 on GND cannot sit closer than 0.127 mm to the VDD_RF trunk
either. No legal two-cap position exists at x < 109.6 without also moving L1 or
C11.

### The bottom-row escape is blocked too

`LORA_SCK` looked like the easy one: U1 pad 17 at (113.200, 115.450) to R11 pad 1
at (110.990, 117.000), about 2.6 mm. Five candidate paths were tested against
every F.Cu pad, track and via on other nets, sampling at 0.02 mm:

| Path | Worst copper-to-copper clearance | Verdict |
|---|---|---|
| A via y = 116.55 | -0.144 mm at (111.69, 116.55) | blocked |
| B straight down | -0.146 mm at (111.99, 117.00) | blocked |
| C diagonal | -0.303 mm at (112.77, 116.25) | blocked |
| D via y = 116.90 | -0.150 mm at (111.90, 116.90) | blocked |
| E dogleg via y = 116.20 | -0.275 mm at (111.40, 116.20) | blocked |

Negative numbers mean the path enters existing copper. The R11/crystal cluster
sits directly south of pad 17, so the bottom edge has no free 0.127 mm channel
either.

### Consequence

None of the five nets can be closed by routing alone. The fix is a placement
change, and there are exactly two that free real space:

1. **Move C12 and C13 to B.Cu** under the QFN with a via each to `VDD_RF` and
   GND. This frees x 109.3-111.1 on F.Cu for the staggered via columns, but it
   also requires relocating the B.Cu `+3V3` diagonal
   (111.650, 109.500) to (108.950, 112.200), which crosses the same band.
2. **Re-place the whole C11/C12/C13/L1 decoupling cluster** westward, opening a
   1.5 mm band in front of pads 4-7, then route the four left nets out to
   staggered vias at x 110.55 and 109.90.

Both are deliberate layout revisions that must be done with DRC as the gate,
and neither can be done by a router. Attempts made so far (`route_remaining.py`
A*, five hand-checked polylines, and the earlier `free_qfn_escape.py`) all fail
for this geometric reason, not for lack of search effort.

### Placement search result (2026-11-15, second pass)

Instead of guessing, the free-space search tested 400 candidate centres for a
single 0402 in the x 104.6-107.5, y 110.3-111.3 pocket, scoring each against
every other-net F.Cu pad, track and via plus every other footprint's courtyard.

- 81 positions are legal, all clustered at x 106.15-106.75, y 110.70-110.80,
  best clearance 0.322 mm.
- **No legal pair exists.** A two-cap arrangement needs either 0.9 mm of
  separation in x at the same y, or a stacked layout; the pocket is about
  0.6 x 0.2 mm of usable centre area, so only one 0402 fits.

That settles the question: C12 and C13 cannot both stay on F.Cu anywhere near
the QFN. The decoupling cluster must move to B.Cu (or the placement must be
widened by moving L1/C11), and either route forces the B.Cu `+3V3` diagonal
(111.650, 109.500) to (108.950, 112.200) to be re-routed first, because it
crosses the same band.

Recorded so the next pass does not repeat the search: the free pocket is
0.6 x 0.2 mm, one part only.

### Bottom-side relocation of C12 and C13 (2026-11-18)

The five unrouted nets were blocked by the VDD_RF decoupling pair, which stood at
x 110.00-110.56, 0.59 mm in front of QFN pads 5-7. A placement search over 400
candidate centres found only 81 legal spots, all inside a 0.6 x 0.2 mm pocket, so
no two 0402 parts fit anywhere on F.Cu near the QFN.

Change applied:

| Item | Value |
|---|---|
| C12 | B.Cu, centre (106.600, 110.280), pad 1 north |
| C13 | B.Cu, centre (107.800, 110.280), pad 1 north |
| VDD_RF rail on B.Cu | y = 109.800, 0.15 mm wide, joins both pad 1s |
| VDD_RF via | 0.50 pad / 0.20 drill at (108.650, 111.250), centred on the F.Cu trunk vertex |
| GND | pad 2 of each cap on the B.Cu pour after refill |
| Worst-case clearance | 0.304 mm against every other-net pad, track and via on all four layers |

Removing the old F.Cu stubs also opened the trunk between (110.100, 111.500) and
(110.300, 111.000); that link is restored at 0.25 mm.

Verified on the saved file: DRC 0 errors, 2 warnings, 5 unconnected (the same five),
parity 41, ERC 0. Zones refilled before the save. Board hash 2d8b29678ba32331; the
state before the move is in `RAMS_JLC_S3.kicad_pcb.bak.pre_bcu_caps` and the state
before the via re-centring is in `RAMS_JLC_S3.kicad_pcb.bak.pre_stitch`.

Residual trade-off: the pair now decouples through one 0.50 mm via roughly 4.5 mm
from the module supply pin instead of sitting 1.5 mm away on the top layer. That is
acceptable for 1 uF + 100 nF but it is a real change in the power-integrity path,
not a free win.

### Why the nets are still open: the router itself

`scripts/route_remaining.py` now reaches pads 4-7 (VBAT_SENSE, BOOT_BTN and
BUZZER_CTRL produce paths) but every path is rejected with four violations:
`track_dangling` twice and `track_not_centered_on_via` twice. The cause is in the
router, not the board: `search()` deletes pad cells from the goal set (`not
copper[q]`), so a route stops one 0.05 mm grid step short of every pad centre and
ends in mid-air. Fix is a snap-to-pad step on the first and last path node before
`apply_path()` writes tracks. Until that is done, no net will close.

The two remaining warnings are `track_dangling` on 0.02 mm VDD_RF stubs left where
C12 and C13 used to sit. They are dead copper: the net is fully connected (VDD_RF
never appears in the unconnected list) and DRC reports no error. Removing them was
tried and abandoned because the stubs are the junctions between the trunk and the
x = 110.300 wall stub, so every deletion just moved the open end to the next
segment. Clearing them properly means deleting the whole wall chain and re-checking
the trunk topology by hand, which is a layout decision rather than a cleanup.

### Current state: 2026-11-19 (escape corridor rebuilt)

Board hash `c23244a60551c816`. Native DRC: 0 violations, 0 warnings, 3
unconnected, schematic parity 41, ERC 0. Closed this pass: `VBAT_SENSE` (U1.7)
and `MCU_EN` (U1.4).

Two board fixes made the difference, and both are in the board rather than in the
report:

1. VDD_RF's pad-3 leg used to dive from (110.85, 110.2) to (110.3, 111.0),
   crossing the escape rows of pads 4 and 5. It now runs along pad 3's own row
   to (109.6, 110.2) and joins the trunk arm at (109.6, 110.35). Connectivity is
   unchanged and DRC accepts it. Script: `scripts/move_vdd_rf_pad3_leg.py`.
2. The x = 110.3 wall and the x = 110.0 stub were dead copper: the only DRC
   warnings on the board were their two dangling ends. Both are deleted and the
   trunk arm is trimmed to (109.6, 110.35), so the board is now warning-free.
   Script: `scripts/drop_dead_vdd_rf_spurs.py`.

Router repairs in `scripts/route_remaining.py`:

- `search()` no longer discards pad cells from the start/goal sets. Terminals are
  snapped to the exact copper point (`terminals()` / `anchor_of()`), which is what
  removed the `track_dangling` and `track_not_centered_on_via` rejections.
- Rejection compares against the pre-existing baseline violations instead of
  demanding a spotless report, and requires the route to reduce the unconnected
  count. The old gate rejected three good routes because of the two VDD_RF stubs.
- `ROUTE_ORDER`, `ROUTE_CLR` and `FUNNEL` are tunable; the QFN escape strip is
  penalised so a path crosses it instead of running along it.

Measured capacity of U1's left row. Pads are 0.20 mm tall on a 0.40 mm pitch, so
the gap between neighbouring pads is 0.20 mm. A 0.15 mm track needs
0.15 + 2 x 0.15 = 0.45 mm to pass, so nothing passes between pads at any width at
or above 0.10 mm. The only exits are past the pad tips, through a strip 0.85 mm
wide between the trunk and the tips, and a 0.50 mm via needs 0.40 mm from a pad
edge, so only one via column fits there. Two nets is the measured maximum: five
routing orders at 0.15 and at 0.127 clearance each accept exactly two of the four
left-row signals and exhaust the rest.

Still open (3):

| net | from | to |
|---|---|---|
| `BOOT_BTN` | U1.5 (111.55, 111.0) | In2 track, 9.90 mm |
| `BUZZER_CTRL` | U1.6 (111.55, 111.4) | R12.1 (131.19, 115.0) |
| `LORA_SCK` | R11.1 (110.99, 117.0) | U1.17 (113.2, 115.45) |

Finishing needs one decision: reassign two of these signals to free pins on the
other three sides of U1, or allow 0.10 mm track and 0.10 mm clearance inside this
2 mm area (JLCPCB 4-layer supports 0.09/0.09; the 0.127 floor recorded elsewhere
is the 2-layer figure). The manufacturing exports in
`manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/` are stale until routing is final.

## Current state: 2026-11-21 (0.10 mm escape rules installed and measured)

Board `RAMS_JLC_S3.kicad_pcb`, sha256 `cc208587e1a06865...`: DRC 0 errors,
0 warnings, 3 unconnected, schematic parity 41, ERC 0. Reports:
`RAMS Wearable/reports/final_state.json`, `final_erc.json`.

Accepted this pass (each one DRC-gated, each one reverted automatically when a
candidate reported a violation):

| change | script | effect |
|---|---|---|
| `QFN_ESC` rule area over U1's left escape strip, x 108.2-111.2 / y 109.0-113.2 | `scripts/add_qfn_escape_rule_area.py` | names the strip so the 0.10 mm rules apply only there |
| `.kicad_dru` rules "QFN escape width" (0.10 mm) and "QFN escape clearance" (0.10 mm) | edited in place | rest of the board keeps 0.15 mm track / 0.127 mm clearance |
| +3V3's B.Cu crossing moved out of the strip | `scripts/move_3v3_strip_crossing.py` | was a diagonal (111.65, 109.50) -> (108.95, 112.20) that bisected the only via-capable area; now y 109.50, x 109.20, y 112.00, x 108.95 at 0.15 mm |
| `ROUTE_W` env hook, named rule area no longer masked as a keepout | `scripts/route_remaining.py` | width is tunable; `QFN_ESC` stops being an obstacle |

Measured result: the 0.10 mm option does not finish the board. With
`ROUTE_CLR=0.10 ROUTE_W=0.10` and three different orders, all three remaining
nets still report `exhausted`. Track width was never the binding constraint.

| net | free pocket around its pad | what walls it |
|---|---|---|
| `BOOT_BTN` U1.5 | x 111.15-112.00, y 110.85-111.15 (0.85 x 0.30 mm) | MCU_EN F.Cu jog at x 110.90 (y 110.75-111.15), 0.25 mm from the pad tip |
| `BUZZER_CTRL` U1.6 | x 111.10-112.00, y 111.25-111.55 | the same jog plus MCU_EN's via at (110.75, 111.30) |
| `LORA_SCK` R11.1 <-> U1.17 | two pockets 0.25 mm apart | LORA_SCK_DEV's F.Cu stub (111.40, 116.25)-(112.00, 117.00) and its via at (111.40, 116.25) |

Two candidate repairs were written, gated and rejected by DRC, then reverted by
their own scripts:

- `scripts/lift_mcu_en_escape.py` moves MCU_EN's via to (110.75, 110.68), the
  band between VDD_RF's pad-3 leg and pad 5. Rejected: `shorting_items`
  MCU_EN / BOOT_BTN - the via lands 0.137 mm from BOOT_BTN's 9.90 mm In2
  diagonal, and every other site in that band is within 0.25 mm of either pad 5
  or the diagonal.
- `scripts/move_lora_sck_dev_escape.py` moves LORA_SCK_DEV's via to
  (112.10, 116.45) to merge the two LORA_SCK pockets. Rejected:
  `shorting_items` LORA_SCK_DEV / VBAT_SENSE at VBAT_SENSE's B.Cu run y 116.75,
  plus a dangling stub.

Consequence: the last three nets need a netlist decision, not a rule change.
Either move two of `BOOT_BTN`, `BUZZER_CTRL`, `LORA_SCK` to free U1 pins (pad 8
GPIO3, pad 9 GPIO4, pad 10 GPIO5, pad 19 GPIO14 are unconnected) with the
matching schematic and firmware pin-map edit, or accept the board with three
nets unrouted. The 0.10 mm rules stay in place but buy nothing until then.

`manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/` was built from `0233ee63cf879ec5`
and remains stale and not-for-fab.
