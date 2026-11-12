# Rev C datasheet source ledger

Every pin assignment and circuit decision in circuit_spec.json must trace to a source listed here. Sources are verified against the actual component purchased from Shopee.

| ID | Component | Source document | Verified content | Access date |
|---|---|---|---|---|
| SRC-C01 | FS8205A (Q3) | FuxinSemi C908265 datasheet via LCSC | SOT-23-6 pinout: S1=1, D1=2, S2=3, G2=4, D2=5, G1=6. D1/D2 internally tied (common drain). Vds=20V, Id=6A, Rds(on)=25mohm@4.5V | 2026-10-30 |
| SRC-C02 | DW01A (U4) | DW01A datasheet (multiple manufacturers) | SOT-23-6 pinout: OD=1, CS=2, OC=3, TD/NC=4, VCC=5, VSS=6. OD controls discharge FET, OC controls charge FET | 2026-10-30 |
| SRC-C03 | 2450AT18B100E (ANT1) | Johanson Technology datasheet | 2-terminal: Pin1=Feed (50ohm), Pin2=NC (mechanical anchor, not ground). 3216 package. 2400-2500 MHz | 2026-10-30 |
| SRC-C04 | LTH7R (U3) | LCSC C841234 datasheet | SOT-23-5: CHRG=1, GND=2, BAT=3, VCC=4, PROG=5. Ibat=1000/Rprog(kohm). 4.2V preset | 2026-10-30 |
| SRC-C05 | ESP32-S3-WROOM-1 (U1) | Espressif module datasheet v1.8 | 41-pin module (including EPAD). Castellated pads at 1.27mm pitch. Pin assignments per Table 3-1. PSRAM uses GPIO35/36/37 | From SHM project SRC-02 |
| SRC-C06 | AP2112K-3.3 (U5) | Diodes Incorporated datasheet | SOT-23-5: VIN=1, GND=2, EN=3, NC=4, VOUT=5. 600mA max, 250mV dropout | From RAMS spec |
| SRC-C07 | USBLC6-2SC6 (D1) | STMicroelectronics datasheet rev 7 | SOT-23-6: I/O1=pins 1,6; GND=2; I/O2=pins 3,4; VBUS=5. Flow-through ESD | From SHM project SRC-07 |
| SRC-C08 | ESP32-S3 hardware design guidelines | Espressif docs | VDDA must be powered at 3.0-3.6V. All VDD rails need decoupling. Crystal load cap selection | From SHM project SRC-03/04 |
| SRC-C09 | AO3401A (Q1) | Alpha & Omega datasheet | SOT-23: G=1, S=2, D=3. P-channel -30V/-4A | From RAMS spec |
| SRC-C10 | BC817-25 (Q2) | Various manufacturers | SOT-23: B=1, C=2, E=3. NPN 45V/500mA | From RAMS spec |
| SRC-C11 | DOST-ASTI EPDC Annex A | EPDC-MAN-PM-001 Rev 02, 2026-09-28 | 1-2 layer, FR4, 1.6mm, 1oz Cu, 0.30mm min track, 0.254mm min space, 0.40mm min drill, 0.254mm min annular ring, no grid-array assembly | 2026-10-30 |
| SRC-C12 | Firmware config.h | wearable_withApp/config.h | LORA: NSS=10,SCK=12,MISO=13,MOSI=11,RST=9,DIO0=8. BUZZER=1. NEOPIXEL=48. BUTTON=0 | 2026-10-30 |
| SRC-C13 | WS2812B (LED1) | Worldsemi WS2812B datasheet | Standard: VDD=3.5-5.3V. V6 revision adds 3.3V operation. Pin order: VDD=1, DOUT=2, GND=3, DIN=4 | From RAMS Rev B README |

## Open verifications

- [ ] SRC-C01: Confirm purchased FS8205A matches FuxinSemi C908265 exactly (inspect markings)
- [ ] SRC-C04: Confirm purchased charger is LTH7R (not TP4054 or other variant)
- [ ] SRC-C05: Confirm purchased ESP32-S3 SuperMini module pinout matches WROOM-1 standard
- [ ] SRC-C13: Confirm purchased WS2812B revision (V6 for 3.3V operation)
- [ ] EPDC slot holes: Confirm whether 0.6mm USB-C shell slots can be fabricated
