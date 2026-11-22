# Switched battery/USB supply for the 2020 LED

Circuit review dated 2026-11-09; implemented in the current J2 schematic. **A single LiPo can power an LED whose actual voltage range includes the loaded cell voltage.** No boost converter is inherently required. The selected implementation recommendation uses an owned AO3401A to switch raw power to LED1, with one dual-supply signal translator. The slide switch carries only control current. CAD includes Q5, U6 and local C34/C35 supply bypasses; the actual LED stock remains to be identified or measured.

## Proposed connection

Change SW1 common pin 2 to GND, ON throw pin 1 to LED_GATE, and OFF throw pin 3 to SYS_EN. Change R7 to a 100k pull-up from SYS_IN to SYS_EN. Q5 AO3401A pins are **1 gate LED_GATE, 2 source SYS_IN, 3 drain LED_PWR**; add R41 100k from SYS_IN to LED_GATE. LED1 VDD and C28 connect to LED_PWR. MCU loads remain on regulated +3V3.

ON grounds the PMOS gate while R7 enables the LDO. OFF grounds LDO EN while R41 turns the PMOS off. During open-contact travel both pull-ups act; contact overlap can temporarily hold both controls low. Neither state connects the source rail directly to ground, and the translator allows either rail sequence. Battery operation supplies approximately the loaded cell voltage less power-path/MOSFET losses; USB supplies VBUS less SS14's forward drop. LED_PWR discharges through its load after switching off; do not describe it as a hard-grounded rail.

[AOS AO3401A Rev 3.1](https://www.aosmd.com/sites/default/files/res/data_sheets/AO3401A.pdf), pages 1–2, supports this load-switch use: ±12V gate rating and maximum 85mΩ on-resistance at −2.5V gate drive under the specified test conditions. Its body diode points from LED_PWR toward SYS_IN, blocking the intended source-to-load path while off. At the illustrative 36.6mA LED load, 85mΩ gives about 3.1mV drop; this is a sizing estimate. At 5.5V the selected switch contact carries approximately 55µA steady pull-up current. A microamp-scale MOSFET leakage specification does not establish zero residual LED rail voltage.

Use **TI SN74LVC1T45DBVR**, SOT23-6:

| Pin | Connection |
|---|---|
| 1 VCCA | +3V3; new local 100nF bypass to GND |
| 2 GND | Common protected GND |
| 3 A | GPIO48/NEO_DATA; 100k pulldown |
| 4 B | Existing R13 33R, then NEO_DIN |
| 5 DIR | Tie directly to +3V3 for A→B |
| 6 VCCB | LED_PWR; existing C28 100nF bypass, placed close |

Use R42 100k on A and R43 100k on NEO_DIN to keep data low while the translator is isolated. C34 is the added A-side bypass. If C28 cannot be close to both the translator supply and LED, give each its own bypass. **R7 must be a pull-up in this new switch topology**, not the earlier EN pulldown.

[TI SCES515N, June 2024](https://www.ti.com/lit/ds/symlink/sn74lvc1t45.pdf), pages 2, 4, 6, 13–17, specifies both supply ranges as 1.65–5.5V, DIR referenced to VCCA, and either supply sequencing order/ramp rate. Both ports become high impedance when either rail is grounded. Ioff is limited to ±2µA over −40 to +85°C under its stated power-off test conditions. Both data-port input circuits remain active, hence the defined low states. This establishes a suitable interface architecture; it is not proof of arbitrary board transients.

## Limits that remain

- **Voltage:** a listing or datasheet genuinely specifying 3.5–5.5V supports raw-cell use only while voltage at LED VDD remains at least 3.5V. Worldsemi V1.3 instead lists 3.7–5.3V; the listing does not establish that revision. Cell voltage nominally being 3.7V does not fix its discharged voltage at 3.7V. Record the actual accepted LED operating range and use it in the low-battery policy.
- **Current:** Shouhan MSK12C02 Rev A/0, section 2.4, rates the switch at 12V DC / 50mA. The recommendation deliberately uses Q5, so LED current does not cross that contact. Worldsemi V1.3 states 12mA operating current per channel and under 0.6mA quiescent current. Therefore 36.6mA is a reference current-budget estimate, **not a guaranteed LED maximum**. Confirm actual full-white current and start/switch transients for the total battery/USB budget. The initially considered direct LED feed through SW1 is superseded by Q5.
- **Data:** direct GPIO drive would leave uncertain high-level margin and could drive an LED whose supply has already been grounded during switch-off. R13 alone does not establish allowable injection. The translator addresses these specific issues without converting power. Its B-side high level follows the LED supply.

Acceptance checks: inspect the received package/polarity; measure all-colour and full-white current; verify colour/reset behaviour at minimum accepted battery voltage and USB maximum; capture LED VDD, DIN and +3V3 through startup, shutdown and USB handover. First set GPIO48 low and send a complete reset/frame after supply stabilization. No further power IC is proposed merely because these physical checks are still open.

Sources retained locally: `evidence/sources/worldsemi_ws2812b_2020_v1_3.pdf`, `Shouhan_MSK12C02_manufacturer_revA0.pdf`, `aos_ao3401a_rev3_1.pdf`, and `ti_sn74lvc1t45_sces515n.pdf` (SHA256 `e6fbd8400161399554fe905326e73236e74bb3af0b546ea1942deed14310536e`). The review itself was read-only; subsequent implementation adopted this circuit and added C35 next to U6 VCCB.
