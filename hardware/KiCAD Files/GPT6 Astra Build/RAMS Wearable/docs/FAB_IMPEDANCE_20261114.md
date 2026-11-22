# JLC first-article impedance review

Calculated 2026-11-14; native changes independently checked 2026-11-15 with KiCad 10.0.6. **Use 0.15 mm RF tracks and retain USB 0.15 mm width / 0.15 mm pair gap on JLC04161H-3313.** This closes the missing nominal cross-section calculation. It does not certify the antenna match, USB compliance, or the manufactured impedance. No PCB files were uploaded and no order was placed.

## Inputs and reproducible evidence

The selected [JLC stackup](https://jlcpcb.com/impedance) is four-layer, nominal 1.6 mm, 1 oz outer / 0.5 oz inner copper, NP-155F. The calculator identifies it as `JLC04161H-3313`, finished thickness 1.56 mm ±10%. Its outer signal-to-adjacent-ground dielectric is **0.09940 mm, Er 4.1**. Stack copper/dielectric dimensions are 0.035 / 0.0994 / 0.0152 / 1.265 / 0.0152 / 0.0994 / 0.035 mm. Core Er differs between the current calculator metadata (4.42) and static page/CAD (4.6); neither core value enters these outer-layer models with an adjacent solid reference plane.

Calculations used the actual public [JLC calculator](https://jlcpcb.com/pcb-impedance-calculator/) service, including its live process metadata and returned valid-result flags. `scripts/check_fab_impedance_20261114.mjs` reproduces the requests using Node's built-in fetch and WebSocket; only generic cross-section dimensions are sent. Raw metadata, requests and responses are retained in `reports/fab_impedance_20261114/jlc_calculator_results.json` and `jlc_calculator_sensitivity.json`. These are supplier calculator outputs, not an independently validated electromagnetic model.

The live outer-1-oz configuration uses finished trace thickness **1.6 mil (0.04064 mm)**, mask Er 3.8, mask C1/C3 **1.0 mil**, C2 **0.6 mil**, and trapezoidal upper width `W2 = W1 − 0.5 mil` (rounded to 0.01 mil by the frontend). Width input W1 is the trace base width. Conversion is `mil = mm / 0.0254`. The [published guide](https://jlcpcb.com/help/article/user-guide-to-the-jlcpcb-impedance-calculator) instead gives C1/C3 1.2 mil and width reduction 0.7 mil. Both cases were calculated below; the discrepancy is visible rather than silently selecting one. CAD's nominal copper/mask thicknesses do not replace the calculator's process inputs.

## Nominal results and sensitivity

All values below are ohms. Coplanar models include a lower ground plane; USB values are differential. Ground gap means the same-layer edge-to-ground distance, not the pair's edge gap.

| Cross-section | Live calculator | Published-guide mask/trapezoid |
|---|---:|---:|
| Previous RF: W 0.18, ground gap 0.15 mm | 44.511 | 44.488 |
| Selected RF: W 0.15, ground gap 0.15 mm | **48.521** | **48.502** |
| Selected RF: W 0.15, no coplanar ground | **51.072** | — |
| USB: W 0.15, pair gap 0.15, ground gap 0.15 mm | **86.289** | **86.223** |
| USB: same pair, no coplanar ground | **87.771** | — |

RF target is 50 Ω; the project's requested fabrication tolerance is ±10% (45–55 Ω). USB target is 90 Ω ±10% (81–99 Ω), following [Espressif's layout guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/pcb-layout-design.html#usb). The old 0.18 mm RF case falls slightly below 45 Ω with close side ground; narrowing brings the nominal model toward 50 Ω. Intermediate RF widths and USB ground gaps are also preserved in the raw report.

Illustrative one-variable sensitivities for the selected coplanar cases, keeping other live inputs fixed:

| Change | RF 0.15 / 0.15 mm | USB 0.15 / 0.15 / 0.15 mm |
|---|---:|---:|
| Outer dielectric H × 0.9 | 46.111 | 82.914 |
| Outer dielectric H × 1.1 | 50.672 | 89.166 |
| Prepreg Er 3.9 | 49.433 | 87.788 |
| Prepreg Er 4.3 | 47.660 | 84.866 |

These perturbations are **not** published individual-layer tolerances, a combined worst-case analysis, or a manufacturing guarantee. Total-board ±10% thickness does not establish the prepreg's tolerance. Manufacturing control and coupon acceptance remain necessary for a guaranteed impedance.

## Actual board geometry and exact change scope

`scripts/audit_impedance_geometry_20261114.py` reads native tracks and cached filled planes without saving CAD. `geometry.json` preserves the original inspection; `geometry_after_rf.json` binds the follow-up to PCB SHA256 `564bf6a82f7a4458bca9a5f078e8487dbf9b1f133d96f1584eb9aed279dfc248`. A UUID-based comparison found **exactly 34 critical-track changes, width only**; coordinates, net identities and lengths were unchanged. All 41 RF segments are now 0.15 mm on F.Cu, with no RF vias.

| Net | Segments | Total drawn length | Change |
|---|---:|---:|---|
| RF_LNA | 7 | 3.6314 mm | Already 0.15 mm; retained |
| RF_MATCH | 16 | 3.4792 mm | 0.18 → 0.15 mm |
| ANT_TUNE | 12 | 2.6206 mm | 0.18 → 0.15 mm |
| ANT_FEED | 6 | 3.4777 mm | 0.18 → 0.15 mm; keepout portion excluded from controlled-line claim |

RF non-pad samples outside the antenna keepout have In1.Cu GND beneath them. Side ground is not a uniform 0.15 mm corridor: after narrowing, cached-fill samples show approximately 0.155–0.630 mm where close ground exists, or no side ground within 1 mm. Thus coplanar and non-coplanar calculations describe representative limits, not a solved impedance for each bend, pad, matching branch or plane edge. Refill and final source-bound checks must follow the width edit.

The main USB parallel span is x **107.7243–116.1000 mm**, y **118.4500 / 118.7500 mm**: width 0.15 mm, centre spacing 0.30 mm, edge gap 0.15 mm, paired length 8.3757 mm. Its In1 reference is continuous. Ground-fill sampling at x108–116 mm found lower outside gap 0.155 mm; upper gap 0.155–0.165 mm where present, with 23/81 upper samples lacking ground within 1 mm. The model comparison supports retaining this pair geometry. `USB_DP`, `USB_DN`, and their `_CONN` / `_ESD` sections include connector forks, protection/series pads and four signal vias. Connector fanout has local antipad interruptions; those discontinuities are not covered by a uniform 90 Ω result. Length matching alone is not impedance evidence.

## Antenna exclusion and first-article tuning

The antenna clearance is the all-layer corner rectangle **x100–106.5, y100–106.5 mm**. ANT_FEED runs from L5 pad2 **(107.100,104.815)** through (107.100,104.800), (106.500,104.200), (105.750,104.200), (105.700,104.150), (105.250,104.150), to ANT1 feed pad **(104.300,103.200)**. Approximately **2.6142 mm** of its centreline lies inside that clearance without an adjacent ground plane. This section is antenna/matching geometry; **neither 48.5 Ω nor 51.1 Ω applies there**. Do not pour ground into the antenna keepout merely to satisfy the line model.

The chip-side C18/L2/C19 network is 1.5 pF / 2.4 nH / 1.5 pF. Its 0402 layout is not a verbatim copy of Espressif's preferred compact 0201 zigzag, and its shunt branches contribute parasitics. The optional 0201 harmonic stub is not required for 0402 and larger packages according to [Espressif](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/pcb-layout-design.html#rf).

The antenna-side 1.2 pF / 2.7 nH / 3.3 nH network follows the starting values in [Johanson 2450AT18B0100001E, legacy B100, revision 5.0](https://www.johansontechnology.com/docs/3829/Antenna-2450AT18B0100001E-Rev5.0_uMmswfC.pdf). That reference uses a different evaluation-board ground and feed placement. This 42 × 32 mm board and its longer feed into the corner clearance cannot inherit the reference's measured matching or efficiency. Keep the matching components accessible; measure and tune the assembled board with its intended battery/enclosure, then verify BLE/Wi-Fi operation and range. The width correction does not close this physical gate.

## Ordering and release condition

For a controlled-impedance order, request **JLC04161H-3313 / NP-155F, 1 oz outer / 0.5 oz inner, 50 Ω single-ended and 90 Ω differential, ±10%, with the supplier's representative test coupon and reported acceptance**. Identify F.Cu over In1 GND (and the short bottom USB sections over In2 GND); supply the actual widths/gaps and this antenna exclusion. Ask JLC to confirm its final process model, stackup and any proposed compensation before accepting production artwork. Do not permit silent stackup substitution or changes to the antenna/matching geometry.

The numerical geometry decision is ready for a **first-article fabrication package**, subject to final refill/DRC/parity and package verification owned by the release checklist. Supplier manufacturing acceptance and assembled-board RF/USB tests remain distinct. This report neither authorizes an order nor declares a physically proven design.
