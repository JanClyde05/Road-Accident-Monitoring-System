# Owned buzzer and mechanical parts

Engineering record, 2026-11-09. This record follows the owner's clarification: use the owned **9650 Active 3V SMD buzzer**, MSK-12C02 slide switch and generic two-terminal 3x4x2 mm buttons. It supersedes the earlier mandatory PUI/C&K replacement suggestions for these functions. No firmware or board circuit was changed by this audit.

## Stock evidence and firmware contract

`docs/Parts List I Currently Have/product_list_expense_breakdown.md` records the buzzer under Order 15, slide switch under Order 14, and small tactile buttons under Orders 8 and 23. These listings do not identify the actual manufacturer. Family drawings below establish useful geometry and electrical references, not a certificate identifying the owner's batch.

The owner confirms the buzzer emits a continuous tone from DC through an NPN transistor. This agrees with `firmware/wearable_withApp/buzzer.cpp`: GPIO1 switches HIGH/LOW for audible patterns. Preserve that active-buzzer interface; no PWM conversion is needed. Use the existing low-side NPN driver, base resistor and base pull-down. A diode across an electromagnetic load has its cathode at the positive supply and anode at the transistor collector. Connect buzzer pad 1 to its positive supply, pad 2 to the collector; verify the actual marked polarity during assembly.

## Reusable project-local footprints

| Owned item | Local footprint identifier | Verified basis and scope |
|---|---|---|
| 9650 Active 3V SMD buzzer | `RAMS_JLC:Buzzer_9650_SMD_Stock_HandSolder` | New engineering lands covering the two published nominal SMD terminal geometries below. Conditional physical stock fit; not a universal manufacturer land pattern. |
| MSK-12C02 | `RAMS_JLC:SW_SPDT_Shouhan_MSK12C02` | Unmodified copy from installed KiCad 10.0.6, checked against Shouhan drawing. |
| Two-pin 3x4x2 mm tactile | `RAMS_JLC:SW_SPST_TS-1088-xR020` | Unmodified copy from installed KiCad 10.0.6, matching XUNPU's TS-1088-AR02016 drawing. Suitable when the owned switch matches this common no-peg form. |

Files are in `lib/RAMS_JLC.pretty/`. Original installed switch library is `C:/Program Files/KiCad/10.0/share/kicad/footprints/Button_Switch_SMD.pretty/`. These two copied KiCad footprints retain their original descriptions, UUIDs and model references. Stock compatibility does not require buying either named manufacturer.

## Buzzer geometry: why the old footprint needs care

The exact historical reference `Antigravity Build/RAMS - PCB/lib/rams.pretty/Buzzer_SMD_9650_3327.kicad_mod` labels a 9.6x9.6 mm part but draws a circular body and circular courtyard. Its two 2.5 mm square pads are 6.5 mm apart. This does overlap the nominal terminals of the S&S variant below; the pitch alone is therefore not evidence of incompatibility. Its body/courtyard is inaccurate for the square packages and it offers little accessible solder land beyond their edges.

Manufacturer evidence shows that the label **9650 does not specify a unique terminal geometry**:

| Primary drawing | Body and contacts | Electrical reference |
|---|---|---|
| Jialigao SMT-9650-3327 | 9.6 ±0.3 mm square, 5.0 ±0.3 mm high; two opposing edge contacts, 1.5 ±0.1 mm wide; drawing shows 1.7 mm inward contact length | Rated 3.3 VDC, operating 2–5 VDC; <=30 mA and >=80 dB at 10 cm at rated conditions; 2.7 kHz |
| Jianghai Wuyin / S&S SMD-9650-3327, manufacturer PDF page 2 | 9.0 mm square, 5.5 mm high; two contacts 2 mm wide by 3 mm long, inner gap 3.4 mm, outer span 9.4 mm; nominal center pitch 6.4 mm | Rated 3.3 VDC, operating 2–5 VDC; <=30 mA and >=80 dB at 10 cm; 2.7 kHz |

Sources: [Jialigao manufacturer page](https://en.jlg-sound.com/productshow-46057459.html), [Jialigao dimension drawing](https://p25.qiyeku.cn/pic/2025/1/22/jialigao/product/product_info/image/2025_03_04/20250304094903754.png), [Jianghai Wuyin manufacturer PDF distributed by LCSC](https://datasheet.lcsc.com/datasheet/pdf/8a67125568be7bd18b7193976db880d1.pdf). The LCSC product table calls the S&S body 9.6 mm, while its manufacturer drawing says 9.0 mm: use the drawing for that variant. Neither manufacturer's current limit is a verified limit for an unidentified stock batch.

The new footprint is an explicit engineering accommodation: nominal square 9.6 mm body envelope; copper pads 4.2x2.6 mm centered at x = -3.8 and +3.8 mm. Each pad spans |x| = 1.7–5.9 mm and y = ±1.3 mm. This covers both drawn nominal terminal areas and exposes a soldering toe. It does not assert every device sold as 9650 will fit. Courtyard is 12.3x10.4 mm, allowing 0.25 mm beyond the copper and the largest documented body outline. Pin 1 is the left positive pad. Match the physical plus marking; rotate the actual buzzer as necessary to put plus on pad 1.

**Assembly choice:** the new buzzer footprint has no `F.Paste` apertures. Hand-solder this owned part after the other top-side components are reflowed. This avoids prescribing a stencil deposit or heat profile for unidentified stock. Check that its underside has only the expected two electrical contacts and that neither touches the opposite land. No 3D model is supplied because the stock height and shape are not yet measured. Measure the sample height for enclosure clearance.

An additional [Fengming manufacturer drawing](https://atta.szlcsc.com/upload/public/pdf/source/20191217/C409830_8EC3C70066086F723D62F9967ED58A07.pdf), page 2, documents another 9.6 mm square SMD geometry with 1.5 mm wide opposing contacts. It is saved as **geometry-only evidence**: its YS-SBZ9650DYB05 is a 5 V part and is not a replacement or electrical specification for the owned 3 V part.

## MSK-12C02 slide switch

[Shouhan manufacturer PDF](https://datasheet.lcsc.com/datasheet/pdf/5162155576bfd231c35aa9a893d25c8c.pdf), drawing page 1, matches the installed footprint. Body width including mounting tabs is 8.0 ±0.2 mm; depth 2.8 ±0.1 mm; body height 1.4 ±0.1 mm. Two locating pegs use 0.85 mm holes at 3.0 mm pitch. The handle travels 1.6 mm. The three electrical pads are 0.6x1.3 mm and deliberately asymmetric: in the local footprint they are at (-2.25,-1.95), (+0.75,-1.95), (+2.25,-1.95) mm for pins 1, 2, 3. Pin 2 is common. Four mechanical shell pads are named `SH`, rather than electrical throws; the manufacturer's circuit grounds the shell.

**Use this switch for enable/gate control:** the drawing rates it only **12 VDC, 50 mA**. It must not carry the whole ESP32 plus LoRa supply current. Confirm continuity between common and each throw and the matching peg positions on one owned sample. The local footprint is not the old design's C&K PCM12 footprint.

## Two-terminal 3x4x2 mm buttons

[XUNPU manufacturer drawing, revision A](https://datasheet.lcsc.com/datasheet/pdf/0475ac02febf455ca9ddcfb380b0df0d.pdf) specifies a 3.9x3.0 mm body, 2.0 mm height for suffix 020, 5.0 mm overall terminal span and normally-open two-terminal contacts. The PCB pattern is 5.5 mm overall with a 3.4 mm inner gap and 2.0 mm pad height. The installed footprint exactly implements 1.05x2.0 mm pads at x = ±2.225 mm. Suffix R means no locating peg; the alternate C form has pegs. The drawing rates the contacts 50 mA at 12 VDC, adequate for GPIO/reset inputs.

The inventory only says two-pin 3x4x2 mm, so compare a sample with these dimensions and check whether it has underside pegs. This is the common reusable stock geometry, not an instruction to purchase XUNPU. A four-terminal tactile or a two-pin switch with different terminal span is not automatically interchangeable.

## Acceptance and evidence

Before ordering, lay each owned mechanical part over a 1:1 print or compare caliper measurements with these footprints. The buzzer must have two opposing contacts covered by the lands, square body within the courtyard, and readable polarity. For the switches, compare terminal positions and pegs; check continuity. These checks close the stock-to-footprint uncertainty without changing to premium replacement parts.

At bring-up, measure buzzer current and verify reliable sound at the actual regulated rail, including the low-battery operating point, using the NPN driver. A momentary test at 5 V does not establish a continuous 5 V rating for the owned 3 V stock. Fit and sound have not been physically tested by this audit.

Downloaded primary drawings, rendered geometry pages and `owned_mechanicals_source_manifest.json` are under `evidence/sources/`. CAD parse/pad inspection results are under `evidence/owned_mechanicals_footprint_check.json`. These are library checks, not assembled-board validation.
