# Rev C BOM vs Purchased Shopee Parts Cross-Reference

Generated: 2026-10-30

## Exact matches (purchased part = spec part)

| Ref | Spec part | Shopee order | Status |
|---|---|---|---|
| Q3 | FS8205A SOT-23-6 | Order 11: 20pcs FS8205A SOT23-6 | MATCH |
| U4 | DW01A SOT-23-6 | Order 11: 20pcs DW01A SOT23-6 | MATCH |
| U3 | LTH7R (LTC4054 compatible) SOT-23-5 | Order 6: 10pcs LTC4054 LTH7 SOT-23 | MATCH |
| U5 | AP2112K-3.3 SOT-23-5 | Order 17: 10pcs AP2112K-3.3TRG1 SOT-23-5 | MATCH |
| Q1 | AO3401A SOT-23 (P-FET) | Order 12: 50pcs AO3401 SOT23 | MATCH |
| Q2 | BC817-25 SOT-23 (NPN) | Order 15: 20pcs BC817-25 SOT23 | MATCH |
| D1 | USBLC6-2SC6 SOT-23-6 | Order 5: 20pcs USBLC6-2SC6 SOT-23-6 | MATCH |
| D2 | SS14 SOD-123 (Schottky) | Order 15: 20pcs SS14 SMA DO-214AC | CHECK PKG |
| D3 | 1N4148W SOD-123 | Order 2: 50pcs 1N4148W T4 SOD-123 | MATCH |
| ANT1 | 2450AT18B100E 3216 | Order 9: 5pcs 2450AT18B100E 3216 | MATCH |
| LED1 | WS2812B 5050 SMD | Order 16: 100pcs WS2812B 5050 SMD | MATCH |
| BZ1 | 9650 Active 3V buzzer | Order 15: 5pcs 9650 Active 3V | MATCH |
| U2 | Ra-02 SX1278 433MHz | Order 21: Ra-02 modules | MATCH |
| Y1 | 40MHz 3225 crystal | Order 13: 10pcs 40MHz 3225 | MATCH |
| SW1 | MSK-12C02 slide switch | Order 14: 10pcs MSK-12C02 | MATCH |
| J2 | JST SH1.0 2P horizontal | Order 18: 50pcs SH1.0 horizontal 2P | MATCH |
| FB1 | 0402 ferrite bead | Order 3: 100pcs 0402 ferrite bead | MATCH |
| R8 | 10k pull-up (EN) | Order 25: 0805 resistor kit has 10k | USE 0402 |
| R9 | 22R series | Order 15: 0R and 33R available | USE 33R |

## Passive components from purchased stock

### 0402 Resistors (from Orders 4, 15)
| Value needed | Qty in spec | Purchased? | Note |
|---|---|---|---|
| 0R | 1 (R10 antenna jumper) | YES (Order 15: 100pcs 0R 0402) | MATCH |
| 33R | 1 (R11 LoRa SCK) | YES (Order 15: 100pcs 33R 0402) | MATCH |
| 330R | 1 (R4 DW01A VCC) | NO | NEED TO BUY or use 0805 kit |
| 1k | 2 (R5 CS sense, R12 buzzer base) | NO | NEED TO BUY or use 0805 kit |
| 4.02k or 4.3k 1% | 1 (R3 charger PROG) | YES (Order 4: 100pcs 4.3K 0402) | USE 4.3k (gives ~233mA charge) |
| 5.1k | 2 (R1, R2 USB CC) | NO | NEED TO BUY or use 0805 kit |
| 10k | 1 (R8 EN pull-up) | PARTIAL (0805 kit) | NEED 0402 |
| 22R | 1 (R9 crystal series) | NO exact; have 33R | USE 33R (acceptable substitute) |
| 100k | 3 (R6 Q1 gate, R7 LDO EN, R13 buzzer) | PARTIAL (0805 kit) | NEED 0402 |
| 180k | 1 (R15 ADC divider low) | YES (Order 15: 200pcs 180K 0402) | MATCH |
| 330k | 1 (R14 ADC divider high) | YES (Order 4: 100pcs 330K 0402) | MATCH |

### 0402 Capacitors (from Order 10)
| Value needed | Qty in spec | Purchased? | Note |
|---|---|---|---|
| 2.4pF | 1 (C19 RF match) | YES (Order 10: 100pcs 2.4pF 0402) | MATCH |
| 12pF | 2 (C24, C25 crystal) | YES (Order 10: 100pcs 12pF 0402) | MATCH |
| 10nF | 1 (C21 VDDA HF bypass) | YES (Order 10: 100pcs 10nF 0402) | MATCH |
| 100nF | ~12 (various bypass) | YES (Order 10: 100pcs 100nF 0402) | MATCH |
| 1uF | ~5 (various decoupling) | YES (Order 10: 100pcs 1uF 0402) | MATCH |

### 0603 Capacitors (from Order 15)
| Value needed | Qty in spec | Purchased? | Note |
|---|---|---|---|
| 4.7uF | 1 (C4 charger output) | YES (Order 15: 10pcs 4.7uF 0603 X5R) | MATCH |
| 10uF | ~4 (C1, C7, C9, C11, C26) | YES (Order 15: 10pcs 10uF 0603 X5R) | MAY NEED MORE |

### 0805 Capacitors (from Order 15)
| Value needed | Qty in spec | Purchased? | Note |
|---|---|---|---|
| 47uF | 1 (C8 LDO output) | YES (Order 15: 10pcs 47uF 0805 X5R) | MATCH |

### Inductors (from Order 5)
| Value needed | Qty in spec | Purchased? | Note |
|---|---|---|---|
| 2.4nH 0402 | 1 (L2 RF match) | YES (Order 5: 100pcs 2.4nH 0402) | MATCH |
| 2.0nH 0402 | 1 (L1 VDD3P3_A, DNP for WROOM) | YES (Order 5: 100pcs 2.0nH 0402) | MATCH (DNP) |

## Package concern: D2 SS14

Order 15 lists SS14 in **SMA DO-214AC** package. The spec calls for SOD-123 (much smaller).
- DO-214AC (SMA) pads are 4.3 x 2.6mm -- significantly larger than SOD-123 (2.7 x 1.6mm)
- **Decision needed:** Use the larger SMA footprint for D2, or buy SS14 in SOD-123?
- The SMA package will work electrically but takes more board space on a 42x32mm board
- **Recommendation:** Switch D2 footprint to DO-214AC (SMA) to use purchased parts

## Parts NOT in purchased inventory (need to buy or substitute)

| Ref | Value | Package | Substitute available? |
|---|---|---|---|
| R4 | 330R | 0402 | 0805 kit has values -- check if 330R included |
| R5, R12 | 1k | 0402 | 0805 kit may have 1k |
| R1, R2 | 5.1k | 0402 | 0805 kit may have 5.1k |
| R6, R7, R13 | 100k | 0402 | 0805 kit may have 100k |
| R8 | 10k | 0402 | 0805 kit has 10k |
| C18 | 2.7pF | 0402 | NOT purchased -- have 2.4pF (close enough for RF tuning, use it) |
| R9 | 22R | 0402 | Have 33R (acceptable for crystal damping) |

### 0805 resistor kit (Order 25) values check
Order 25 includes "0805 33values x 20pcs" kit. Standard E24 series for 0805 kits typically includes:
1R, 10R, 22R, 33R, 47R, 100R, 220R, 330R, 470R, 1K, 2.2K, 3.3K, 4.7K, 10K, 22K, 33K, 47K, 100K, 220K, 330K, 470K, 1M (and variations)

If the kit includes 330R, 1K, 5.1K, 10K, and 100K in 0805, these could be used instead of 0402.
**Trade-off:** 0805 is larger than 0402 but still fits EPDC assembly. May increase board size slightly.

## Additional purchased parts (useful for RAMS)

| Part | Order | Potential RAMS use |
|---|---|---|
| ESP32-S3FH4R2 bare chips (5pcs) | Order 1 | NOT for Rev C (EPDC can't assemble QFN). Reserve for future JLCPCB order |
| MPU-6050 QFN24 (5pcs) | Order 19 | NOT for wearable Rev C (no IMU on wearable). For receiver or future IMU board |
| RT9013-33GB SOT23-5 (20pcs) | Order 20 | Alternative to AP2112K (500mA vs 600mA). Could substitute U5 |
| AMS1117-3.3 (10pcs) | Order 25 | NOT for Rev C (SOT-223, too large and high dropout) |
| U.FL IPEX connectors (10pcs) | Order 24 | NOT needed on PCB; Ra-02 has built-in U.FL |
| 16P USB-C vertical (5pcs) | Order 22 | Alternative connector orientation if horizontal doesn't fit |
| 3x4x2mm tact switches | Orders 8, 23 | Tact switches for Reset/Boot (verify footprint vs KMR2) |
| 1206 SMD capacitor kit | Order 25 | NOT for Rev C (1206 too large for this board density) |

## Tact switch clarification needed

Orders 8 and 23 list **3x4x2mm** tact switches. The spec calls for **KMR2** (2.8 x 3.5 mm).
- 3x4mm and KMR2 are different footprints
- **Check:** Do the purchased 3x4mm switches match a KMR2 compatible footprint?
- If not, create a custom 3x4mm tact switch footprint

## Summary

| Category | In stock | Need to buy | Can substitute |
|---|---|---|---|
| ICs (U1-U5, D1) | 6/6 | 0 | RT9013 available as U5 alt |
| Transistors (Q1-Q3) | 3/3 | 0 | - |
| Diodes (D2, D3) | 2/2 | 0 | D2 in SMA pkg (larger) |
| Passives (R) | 7/15 | 5 values in 0402 | 0805 kit covers most |
| Passives (C) | 7/8 | C18 2.7pF | Use 2.4pF |
| Passives (L, FB) | 2/2 | 0 | - |
| Connectors | 3/3 | 0 | Have both horizontal and vertical USB-C |
| Switches | 2/2 | 0 | Check footprint compatibility |
| Antenna | 1/1 | 0 | - |
| LED | 1/1 | 0 | - |
| Buzzer | 1/1 | 0 | - |
| Crystal | 1/1 | 0 | - |
| Module (LoRa) | 1/1 | 0 | - |

**Result: ~90% of parts are in stock. Missing 5 resistor values in 0402 -- most can be covered by the 0805 kit if we allow mixed 0402/0805 passives.**
