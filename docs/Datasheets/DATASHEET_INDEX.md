# Datasheet index

Local copies of the primary sources used to review the RAMS_JLC_S3 J2 board.
This folder holds datasheets only. Downloaded 2026-11-10 from vendor sites;
each file is the manufacturer's own PDF, unmodified.

| File | Part | Used for | Source |
|---|---|---|---|
| `ESP32-S3_datasheet.pdf` | ESP32-S3 series | Pin functions, strapping, electrical limits, GPIO count | espressif.com |
| `ESP32-S3_hardware_design_guidelines.pdf` | ESP32-S3 | Schematic checklist, VDD_SPI rule, crystal, RF, layout stackup | docs.espressif.com |
| `AP2112_ldo.pdf` | AP2112K-3.3 | Dropout, thermal resistance, current limit | diodes.com |
| `DW01A_protection.pdf` | DW01A | Pin map, over-current threshold, application values | cxem.net mirror of Fortune datasheet |
| `FS8205A_lcsc.pdf` | FS8205A (SOT-23-6) | Dual FET pin map and `R_ds(on)` | LCSC |
| `SN74LVC1T45_translator.pdf` | SN74LVC1T45 | Pin functions (`A`, `B`, `DIR`), `I_off` behaviour | ti.com |
| `USBLC6-2_esd.pdf` | USBLC6-2SC6 | Not downloaded, see note below | st.com |
| `WS2812B_led.pdf` | WS2812B | Supply range, `V_IH`, timing | adafruit.com mirror |
| `ABM8_crystal.pdf` | ABM8 40 MHz | Load capacitance, ESR, tolerance | abracon.com |
| `2450AT18B100E_antenna.pdf` | Johanson B100 | Antenna keep-out, feed geometry, bandwidth | johansontechnology.com |
| `AO3401A_pmos.pdf` | AO3401A | `V_gs` threshold, `R_ds(on)`, body diode direction | aosmd.com |
| `DMN2056U_nmos.pdf` | DMN2056U | `R_ds(on)` at 1.5 V, body diode | diodes.com |
| `BC817_bjt.pdf` | BC817-25 | Pin map, `h_FE`, `V_CE(sat)` | onsemi.com |
| `1N4148W_diode.pdf` | 1N4148W | Forward drop, reverse recovery | vishay.com |
| `SS14_diode.pdf` | SS14 | Forward drop at load, reverse blocking | onsemi.com |
| `SN74LVC1T45_alt.pdf` | SN74LVC1T45 | Duplicate of the TI sheet, kept as fallback | ti.com |
| `Ra-02_module.pdf` | Ai-Thinker Ra-02 | Pin order, supply, current during transmit | docs.ai-thinker.com |

## Not obtained

- `USBLC6-2` from st.com returned an error on three attempts (the vendor blocks
  direct fetches). The pin map used in the review (1/6 = one channel, 3/4 = the
  other, 5 = VBUS, 2 = GND) comes from the KiCad library symbol and the
  ST product page; obtain the PDF manually before relying on a clamping voltage
  figure.
- `LTC4054` from analog.com also blocked. The 100 mA charge current in
  `CALCULATION_AUDIT.md` C2 uses the published `I = 1000 * V_PROG / R_PROG`
  relation with `V_PROG` = 1.0 V; confirm against the PDF before the first
  full charge.
- `MSK12C02` slide switch and `TS-1088` tact switch: mechanical only, no
  electrical claim made.

## Rules for this folder

1. Datasheets only. No generated reports, no exports.
2. Record the vendor and the part exactly; never rename a file to hide a
   different variant.
3. If a value in `docs/Design Review/` is challenged, this folder is the
   authority, not a web summary.
