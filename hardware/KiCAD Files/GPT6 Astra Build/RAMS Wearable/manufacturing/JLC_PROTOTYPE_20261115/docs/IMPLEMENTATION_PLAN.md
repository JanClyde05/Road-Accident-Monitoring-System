# JLCPCB bare-chip wearable implementation

> **Scope updated 2026-11-09:** `SIMPLIFICATION_20261109.md` controls subsequent work. The owner rejected the added buck-boost complexity; use the working Supermini + Ra-02 + passive buzzer + divider as the functional/cost baseline and evaluate the owned 3.3 V LDO first. Existing native CAD and BOM remain a superseded candidate until revised and revalidated.

Started 2026-11-08, Asia/Manila. The owner's current instruction authorizes a new PCB here using the bare ESP32-S3 architecture and JLCPCB. It supersedes the parent package's historical planning-only/DOST scope. DOST implementation is deferred.

## Boundary and source identity

Reference: `hardware/KiCAD Files/Antigravity Build/RAMS - PCB/RAMS - PCB.kicad_pcb` and its 2026-10-30 defect review. Preserve all earlier designs and the ordered ZIP. Current firmware is the phone-assisted BLE-to-LoRa wearable. No onboard GNSS or IMU is required.

Only this implementation directory, the persistent memory/navigation records, and any demonstrably necessary hardware-dependent firmware corrections may change. No purchases, supplier contacts, uploads, or orders are included.

## Design sequence

1. Freeze reference/inventory/firmware hashes; reconcile exact components against manufacturer drawings.
2. Capture one new circuit specification: corrected FH4R2 supplies/exposed pad, protected battery ground, USB, clock/RF, LoRa, RGB/buzzer/buttons and battery ADC. Select named replacement parts when anonymous stock cannot establish fit or rating.
3. Generate native readable functional schematic sheets and local libraries. Independently compare critical pin mappings and run ERC.
4. Implement a four-layer layout with a dedicated internal ground plane, selected JLCPCB stackup, deliberate critical routes, and antenna exclusions. Board dimensions remain an engineering target pending enclosure information.
5. Run native DRC, schematic parity, independent connectivity/pin/geometry checks and visual inspection. Preserve failed reports and bind passing reports to final hashes.
6. Reconcile BOM to owned stock, document assembly/bring-up and open physical gates. Engineering manufacturing exports follow CAD/assembly-design closure; supplier acceptance and physical testing remain separate.

## Acceptance and limits

Native KiCad 10 files must open; every required pad must be routed; no unexplained ERC/DRC errors, waived copper violations, floating grounds or schematic/board mismatches. High-risk footprints, polarity, power states, RF/clock and USB paths require checks beyond ERC/DRC. A working assembled board cannot be claimed before actual measurements.

Primary source entry points: [Espressif schematic checklist](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html), [layout checklist](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/pcb-layout-design.html), [JLCPCB capabilities](https://jlcpcb.com/capabilities/Capabilities), [JLCPCB stackups](https://jlcpcb.com/impedance). Detailed decisions and final geometry are recorded in this directory's engineering records.
