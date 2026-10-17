# RAMS PCB Handoff Brief (for ChatGPT 6-Astra or any engineering AI)

Version 0.1, written by Claude for JC (Jan Clyde Talosig). Confidence tags: \[Certain\] = from a datasheet or source file, \[Likely\] = strong inference, \[Guessing\] = placeholder, \[VERIFY\] = you must check a datasheet before using. Companion document: 'RAMS Wearable and Receiver - Net-level Schematic Spec v0.1' (call it SPEC). SPEC is the source of truth for nets and values. Attach it with this brief.

## 0. Your role and ground rules

You are the lead PCB engineer for two boards: a wearable and a receiver. Rules:

1. Do not invent part numbers, LCSC numbers, dimensions or pinouts. If a value is not verified below, fetch the datasheet and say where you got it.
2. Never claim ERC, DRC, simulation or a stock check passed unless you ran it. Attach the report.
3. Section 3 decisions are locked. Change one only through a written decision record (ADR) with the reason, the risk, and JC's approval.
4. Section 4 lists known flaws and weak points. Evaluate every one, decide, and record the decision.
5. If you cannot run KiCad, deliver scripts plus text artifacts (netlist, placement table, BOM) and list exactly what you could not verify.
6. Ask JC for the missing inputs in section 11 before starting layout. Do not guess mechanical constraints.
7. JC prefers short, direct reports, confidence tags on conclusions, and surgical edits to existing files over rewrites.

## 1. Mission

Turn JC's module-based prototype (ESP32-S3 SuperMini + Ra-02 on a carrier) into two custom SMD PCBs that work on the first spin:

- Wearable: ESP32-S3FH4R2, Ra-02 LoRa module, LTH7R LiPo charger, USB-C (charging and programming), RGB LED on GPIO48, active buzzer, BOOT and RESET buttons, battery voltage sensing, 2.4 GHz ceramic chip antenna, slide power switch. Target 30 x 25 mm.
- Receiver: ESP32-S3FH4R2 + Ra-02, USB-C power and native USB serial to a desktop app, BOOT and RESET, RGB LED, optional 2.4 GHz antenna. No battery.

Fab target: JLCPCB 4-layer with SMT assembly (Ra-02 is hand-soldered by JC). DOST Manila is a possible alternative but is probably 2-layer only \[Guessing\], so the QFN design assumes JLCPCB.

## 2. Material to attach

- SPEC (nets, values, GPIO map, receiver differences).
- Prototype KiCad files from the GitHub repo https://github.com/JanClyde05/Road-Accident-Monitoring-System: DMS - PCB (wearable prototype) and DMS Receiver. Use them for pin connections only. Do not copy their footprints.
- Reference design: https://github.com/hxelec/s3p (KiCad schematic and PCB). Use it as a reference, not a copy. JC wants the RF matching tuned for the custom layout.
- Datasheets listed in section 7.

## 3. Locked decisions

- Board: 4-layer, JLC04161H-3313 stackup, 30 x 25 mm target (may grow about 2 mm if justified in an ADR), components on both sides allowed.
- MCU: ESP32-S3FH4R2 (flash and PSRAM in package, no external flash).
- LoRa: Ra-02 module, hand-soldered, KiCad symbol RF\_Module:Ai-Thinker-Ra-02 with footprint RF\_Module:Ai-Thinker-Ra-01-LoRa, confirmed by a 1:1 print test.
- Charger: LTH7R, I\_BAT = 1000 / R\_PROG(kohm), R\_PROG = 4.02 kohm for about 250 mA. Battery 500 mAh class, but a 10,000 mAh cell must also work.
- Battery protection: DW01A + FS8205A always fitted, in the negative lead.
- Power path: P-FET plus Schottky between USB and battery, then AP2112K-3.3 LDO. Slide switch (MSK12C02) on the LDO EN pin only.
- Battery connector: JST-SH 1.0 mm 2-pin SMD (SM02B-SRSS-TB) with a pre-crimped pigtail.
- Buzzer: active 3.3 V SMD, NPN driver. LED: SK6805-EC15 on GPIO48.
- USB-C native USB (GPIO19 D-, GPIO20 D+), USBLC6-2 ESD, 5.1 kohm CC resistors.
- Antenna: Johanson 2450AT18D0100E with the S3P matching values as a starting point (see SPEC section 4), 0402 RF parts for hand tuning. JC has no VNA, so tuning is by RSSI comparison against a SuperMini.
- GPIO map (same as prototype firmware): GPIO0 BOOT, 1 buzzer, 2 battery sense, 8 DIO0, 9 RST, 10 NSS, 11 MOSI, 12 SCK, 13 MISO, 19/20 USB, 48 LED. No sensor headers, no UART0 pads.
- Receiver is USB-powered. Serial uses native USB, no UART bridge chip.

## 4. Known flaws and optimization mandate

Evaluate each. Record keep, change or reject in docs/decisions.

| ID | Issue | What to decide |
| --- | --- | --- |
| F1 | The battery pigtail is hand-wired, so reversed polarity is possible. DW01A gives no reverse protection. | Add reverse-polarity protection (series P-FET or Schottky) or rely on silkscreen and keying. Weigh area and voltage drop against risk. |
| F2 | AP2112K dropout is 250 mV max at 600 mA, so the 3.3 V rail collapses near 3.55 V on the cell, while the protection chip cuts off near 2.4-2.5 V \[VERIFY DW01A\]. About 10-15% of capacity is unusable \[Likely\]. | Keep, or choose a lower-dropout LDO or a buck-boost. The Ra-02 runs from 2.5 V. |
| F3 | LoRa transmit (93-105 mA) on a sagging cell may brown out the MCU. | Size bulk capacitance and consider a brown-out supervisor footprint (Espressif suggests \~3.0 V supervisor with slow-rising supplies). |
| F4 | Single LDO shares the MCU, LoRa transmit bursts, LED and buzzer. Noise may reach the ADC and RF. The S3P used two LDOs. | Add filtering, split the rail, or accept. Space is tight. |
| F5 | The battery divider reads the cell node. While charging it reads the charger voltage. | Document in firmware notes. Hardware change optional. |
| F6 | GPIO0 (BOOT) is also the alarm-cancel input and a strapping pin. S3P has no external pull-up. | Decide on the optional 10 kohm pull-up. Document that holding BOOT at reset enters download mode. |
| F7 | LTH7R dissipates about 0.33 W at 250 mA from 5 V into a 3.7 V cell (SOT-23-5). | Thermal copper, vias, and whether to drop to 200 mA. |
| F8 | 30 x 25 mm leaves little ground plane for a chip antenna, so S3P matching values may not apply. | Quantify the keep-out and ground area. Grow the board if justified. |
| F9 | 0201 parts are hard to rework. | Keep RF tuning parts 0402. Decide others by area. |
| F10 | Crystal: S3P uses a 2016 part, the BOM uses JGHC 3225. | Choose by stock and area. Keep 12 pF caps if CL = 10 pF. XTAL\_P series element: 22 ohm resistor (S3P) or 24 nH (Espressif). |
| F11 | Prototype hygiene: fp-lib-table uses absolute D:/ paths, 3D models use absolute paths, project names have spaces, the receiver schematic is empty, the buzzer was DNP. | Fix in the new project structure (section 8). |
| F12 | Ra-02 is not a JLC library part. | Exclude from CPL and mark hand-solder. Verify the Ra-02 footprint with a 1:1 print and keep the iron access around castellations. |
| F13 | Stock risk: LTH7R, DW01A, FS8205A, P-FET, Johanson antenna, crystal. | Run a JLC part check before freezing the BOM. Record the substitutes. |

## 5. Design rules

### 5.1 Stackup (JLC04161H-3313) \[Certain, JLC impedance page and a 3313 KiCad template\]

F.Cu 0.035 mm, prepreg 3313 0.0994 mm (er 4.1), In1.Cu 0.0152 mm, core 1.265 mm, In2.Cu 0.0152 mm, prepreg 3313 0.0994 mm, B.Cu 0.035 mm. Total about 1.58 mm. In1 = unbroken ground under all RF and USB routing. In2 = power pours with ground stitching.

### 5.2 JLC limits \[Certain unless marked\]

- Minimum track/space for 4-6 layer 1 oz: 0.09 mm. Design at 0.127 mm or more for yield.
- Multilayer via: minimum hole 0.2 mm, minimum via diameter 0.45 mm (limit 0.4 mm). Default via 0.6/0.3 mm. Use 0.45/0.2 only where space forces it.
- Via to track 0.254 mm, via to via (same net) 0.254 mm, pad to track 0.2 mm, PTH to track 0.33 mm.
- Solder mask opening 0.05 mm, solder mask bridge needs 0.2 mm copper spacing (green mask), pad to silkscreen 0.15 mm.
- Minimum IC pin spacing 0.4 mm (the ESP32-S3 QFN56 pitch is 0.4 mm).
- Set copper-to-edge clearance to 0.3 mm or more \[Likely\].

### 5.3 Trace widths (3313 stackup)

| Net class | Width | Notes |
| --- | --- | --- |
| RF 50 ohm (antenna feed to LNA\_IN) | about 0.18 mm on F.Cu over In1 | S3P uses 0.183 mm \[Certain\]. Confirm with the JLC impedance calculator \[VERIFY\]. |
| USB D+/D- (90 ohm differential) | compute for this stack | Use JLC's calculator \[VERIFY\]. Keep under about 15 mm, match lengths within about 0.5 mm, no stubs \[Likely\]. |
| Power: VBUS, B\_PLUS, LDO\_IN, 3V3 | 0.5 mm minimum (0.6 mm for 1 A) | Charge path 250-500 mA. |
| Ra-02 VDD | 0.4 mm | Place its capacitors at the pad. |
| SPI, buzzer, LED, ADC, buttons | 0.2 mm | SCK may carry a series resistor near the MCU. |
| Clearance default | 0.15 mm | 0.2 mm around VBUS. |

### 5.4 RF and placement rules

- Antenna at a board edge with a 4 x 6 mm keep-out cleared of copper and vias on all four layers (measured from the S3P PCB file).
- Order from the antenna: three pads (shunt, 0 ohm series, shunt), then shunt, 2.4 nH series, shunt at the LNA\_IN pin. Keep the RF trace short, no vias, ground stitching vias along both sides.
- Crystal at least 1.5 mm from the keep-out \[Likely, from the S3P coordinates\]. Keep noisy traces out from under it.
- Ra-02 with its U.FL edge toward a board edge, far from the 2.4 GHz antenna. Feed the Ra-02 from the 3.3 V rail only (its supply limit is 3.7 V).
- Decoupling capacitors within 1-2 mm of their pins, on the same side, with a short via to ground. The 0.1 uF goes closest.
- ESP32-S3 exposed pad: ground vias into In1, count and size per the Espressif datasheet \[VERIFY\].
- USB ESD part within about 3 mm of the USB-C connector. P-FET and Schottky near the USB and battery entry.
- Battery divider close to GPIO2, with its 0.1 uF at the pin.
- LTH7R on a small copper area with thermal vias, away from the MCU and crystal.
- Buzzer on the bottom side if the top is crowded. Slide switch, battery connector and USB-C at board edges.
- Silkscreen: + mark on J2, pin 1 marks, polarity, BOOT and RESET labels, version and date.

## 6. Dimensions

| Part | Package | Size | Status |
| --- | --- | --- | --- |
| Ra-02 module | SMD-16 castellated | 17.0 x 16.0 x 3.2 +/- 0.1 mm | Spec PDF \[Certain\]. KiCad footprint: pads 2.0 x 1.5 mm, rows at x = +/-8 mm, 2.0 mm pitch, y from -7 to +7 \[Certain, from the KiCad Ra-01 footprint file\]. Check with a 1:1 print. |
| ESP32-S3FH4R2 | QFN56 | 7 x 7 mm, 0.4 mm pitch | Exposed pad size and land pattern \[VERIFY, Espressif datasheet\] |
| USB-C TYPE-C-31-M-12 | 16-pin | 8.94 x 7.3 mm | Listing \[Certain\]. Height and shell tabs \[VERIFY\]. |
| Buzzer SMD-9650-3327 | SMD | 9.6 x 9.6 mm | Listing \[Certain\]. Height \[VERIFY\]. |
| SK6805-EC15 | 1.5 mm square | 1.5 x 1.5 mm | \[Certain\] |
| Johanson 2450AT18D0100E | chip antenna | about 3.2 x 1.6 mm | Family size \[Likely\]. Land pattern \[VERIFY, Johanson datasheet\]. |
| Crystal JGHC (C426988) | 3225 | 3.2 x 2.5 mm | \[Likely\]. ESR and load \[VERIFY\]. |
| MSK12C02 slide switch | SMD | about 8 x 2.8 mm | Listing \[Certain\]. Height and actuator \[VERIFY\]. |
| JST SM02B-SRSS-TB | SH 1.0 mm | outline \[VERIFY, JST datasheet\] | 1 A, 50 V rating \[Certain\]. |
| LTH7R, AP2112K | SOT-23-5 | 2.9 x 1.6 mm body, 0.95 mm pitch (JEDEC) | \[Certain, generic\] |
| USBLC6-2SC6 | SOT-23-6 | about 2.9 x 1.6 mm | Option: USBLC6-2P6 (SOT-666, about 1.6 x 1.6 mm) \[Likely\] |
| DW01A, FS8205A, P-FET, NPN, Schottkys | SOT-23-6, TSSOP-8, SOT-23, SOD-123 | per datasheet | \[VERIFY\] |
| Passives | 0201 0.6 x 0.3, 0402 1.0 x 0.5, 0603 1.6 x 0.8 mm |  | \[Certain\] |
| Board |  | 30 x 25 mm | Locked. Mounting holes and enclosure: unknown (section 11). |

## 7. Datasheets and sources

Verified links (open and read them; do not rely on this table for values):

| Item | Link |
| --- | --- |
| ESP32-S3 schematic checklist (Espressif) | https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html |
| ESP32-S3FH4R2 (JLC part C3013940) | https://jlcpcb.com/partdetail/ESP32-S3FH4R2/C3013940 |
| ESP32-S3 datasheet, PCB layout guide | on espressif.com and the same hardware-design-guidelines site \[VERIFY URLs\] |
| LTH7R (C841234) | https://www.lcsc.com/product-detail/battery-management\_shenzhen-fuman-elec-lth7r\_C841234.html and https://www.alldatasheet.com/html-pdf/1144649/FUMAN/LTH7R/530/3/LTH7R.html |
| AP2112K-3.3 (C51118) | https://www.lcsc.com/product-detail/C51118.html |
| USB-C TYPE-C-31-M-12 (C165948) | https://www.lcsc.com/datasheet/lcsc\_datasheet\_2410010003\_Korean-Hroparts-Elec-TYPE-C-31-M-12\_C165948.pdf |
| USBLC6-2SC6 (C7519) | https://jlcpcb.com/partdetail/C7519 |
| Crystal JGHC (C426988) | https://datasheet.lcsc.com/lcsc/2304140030\_JGHC-S3240000101040\_C426988.pdf |
| SK6805-EC15 (C2890035) | https://www.adafruit.com/products/4492 and LCSC C2890035 |
| Active buzzer SMD-9650-3327 (C42420997) | https://jlcpcb.com/partdetail/SS-/C42420997 |
| MSK12C02 (C431540) | https://lcsc.com/product-detail/C431540.html |
| JST SM02B-SRSS-TB (C160402) | https://www.lcsc.com/product-detail/C160402.html |
| Ra-02 (Ai-Thinker docs, footprint downloads) | https://docs.ai-thinker.com/en/Ra-02/ |
| Ra-02 product spec PDF | https://xonstorage.z8.web.core.windows.net/pdf/aithinker\_ra02\_apr22\_xonlink.pdf |
| KiCad Ra-01 footprint (used for Ra-02) | https://github.com/KiCad/kicad-footprints/blob/master/RF\_Module.pretty/Ai-Thinker-Ra-01-LoRa.kicad\_mod |
| 2.4 GHz antenna, Yageo ANT3216LL00R2400A (alternative) | https://cdn.components.ru/media/PDF/5119823.pdf |
| Johanson 2450AT18D0100E datasheet | download from johansontechnology.com \[VERIFY, not retrieved\] |
| S3P reference design | https://github.com/hxelec/s3p |
| JLC impedance stackups | https://jlcpcb.com/impedance |
| JLC capabilities | https://jlcpcb.com/capabilities/Capabilities |
| KiCad 4-layer JLC 3313 template (rules, netclasses) | https://github.com/thadius83/kicad-jlcpcb |
| Prototype repo | https://github.com/JanClyde05/Road-Accident-Monitoring-System |

Not yet found: LCSC numbers for the Johanson antenna, DW01A, FS8205A, the P-FET, the NPN and the Schottkys. Find them in the JLC parts library and record stock and price.

## 8. Folder and file architecture

```
rams-smd-pcb/
  README.md                  project overview, status, how to build
  CHANGELOG.md               dated changes
  .gitignore                 KiCad backups, *-backups/, fp-info-cache, gerbers/ if regenerated
  docs/
    00_brief.md              this brief
    01_research.md           research notes and sources
    02_spec_wearable.md      SPEC, wearable
    02_spec_receiver.md      SPEC, receiver differences
    03_bom_notes.md          BOM rationale, alternates, stock log
    04_decisions/            ADR-001-*.md, one per decision
    05_layout_plan.md        stackup, netclasses, placement zones, coordinates
    06_test_plan.md          bring-up, RF RSSI tuning, charge test
  datasheets/
    esp32-s3/ ltH7r/ ap2112k/ ra-02/ usb-c/ antenna/ ...   one folder per part
  hardware/
    wearable/
      rams_wearable.kicad_pro, .kicad_sch, .kicad_pcb, .kicad_dru
    receiver/
      rams_receiver.kicad_pro, .kicad_sch, .kicad_pcb, .kicad_dru
  lib/
    rams.kicad_sym           project symbols
    rams.pretty/             project footprints
    3d/                      STEP models
    sym-lib-table, fp-lib-table   use ${KIPRJMOD}/../../lib paths, never D:/ paths
  fab/
    wearable/ jlcpcb/        gerbers, drill, bom.csv, cpl.csv, rev tag
    receiver/ jlcpcb/
  firmware/
    pin_map.h                GPIO map copied from SPEC section 7
  scripts/
    gen_*.py                 schematic/PCB generators (if used)
    run_erc_drc.sh           kicad-cli ERC and DRC with report output
    check_bom_stock.py       LCSC/JLC stock check
  tests/
    reports/                 ERC, DRC, DFM results with dates
    rf_tuning/               RSSI logs, antenna variants
```

Naming: snake\_case, no spaces, one project per board, version in the title block and in git tags (v0.1, v0.2). Libraries are project-relative. Every part in the BOM carries MPN, LCSC number, footprint and a Mounting field (JLC or HAND). Commit schematic and board changes together with a CHANGELOG entry.

## 9. Workflow and deliverables

| Phase | Deliverable | Done when |
| --- | --- | --- |
| 1. Review | Flaw decisions F1-F13 as ADRs, corrected SPEC | JC approves the ADRs |
| 2. Libraries | Symbols and footprints, 1:1 print of the Ra-02 footprint | Print test passes |
| 3. Schematic | wearable and receiver .kicad\_sch | ERC report with zero errors; every warning explained |
| 4. Layout plan | stackup, netclasses, placement coordinates, keep-outs | JC approves the plan before routing |
| 5. PCB | .kicad\_pcb routed per section 5 | DRC with zero errors; length report for USB and RF |
| 6. Fab pack | Gerbers, drill, BOM, CPL | JLC DFM upload shows no blocking issue; stock confirmed |
| 7. Bring-up | test plan results | Charge, USB flash, LoRa link, RSSI tuning logged |

Generating KiCad files: prefer the KiCad Python API or kicad-cli with scripts saved in scripts/. If you cannot execute them, hand over the scripts and tell JC what to run.

## 10. Verification checklist

- Net connections match SPEC (diff the generated netlist against SPEC tables).
- Symbol pin numbers and footprints match datasheets (LTH7R, AP2112K, DW01A, FS8205A, USBLC6, QFN56, USB-C).
- Power path orientation: P-FET source on LDO\_IN, drain on B\_PLUS, gate on VBUS with 100 kohm to ground. Simulate or hand-check that USB cannot back-feed the battery.
- 3V3 never touches the cell directly. Ra-02 is fed from 3.3 V only.
- Charge current 249 mA (R\_PROG 4.02 kohm). Confirm the datasheet formula again.
- ADC divider 330 k / 180 k gives 1.48 V at 4.2 V.
- RF: keep-out, trace width, stitching, matching order.
- DRC with the JLC limits from 5.2. Mask bridges on the QFN checked.
- BOM stock and substitutes logged. Hand-soldered parts excluded from CPL.

## 11. Missing inputs to request from JC

1. Enclosure or mounting constraints: wrist or clip, board outline shape, mounting holes, height limit, USB-C and button placement.
2. Firmware confirmation of the pin map and LoRa frequency (433 MHz assumed) and the LoRa antenna type on the U.FL connector.
3. How many units to build and whether JLC assembly is one-sided or two-sided.
4. Battery physical size and connector wiring (bare wires; JST-SH pigtail is planned).
5. Whether BOOT as alarm-cancel needs a debounce or hold-time behavior in firmware.
6. Confirmation of an unprotected-cell assumption: the DW01A pair is fitted regardless.

## 12. Copy-paste prompt

'You are the lead PCB engineer for the RAMS wearable and receiver boards. Read the attached RAMS PCB Handoff Brief and SPEC. Follow section 0 rules. First reply with: (1) your decision on each flaw F1-F13 with a short reason and confidence tag, (2) a list of any facts in the brief you could not verify, (3) the questions you need answered from section 11. Do not start layout until JC approves. Then deliver phases 2-6 in order, creating the folder structure in section 8, and report ERC and DRC results only from real runs.'
