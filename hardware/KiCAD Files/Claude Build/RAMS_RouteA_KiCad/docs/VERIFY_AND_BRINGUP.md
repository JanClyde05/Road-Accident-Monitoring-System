# Verify before ordering, then bring-up

The board is DRC-clean, but every footprint is a stock KiCad (or Rev A) footprint that has **not** been compared
with your actual Shopee parts. A wrong USB-C or switch footprint costs you a whole board run. Do this first.

## 1. The 1:1 paper test (30 minutes, catches most footprint errors)

In KiCad PCB Editor: File > Print, layers `F.Cu` + `F.Courtyard` + `F.Silkscreen`, scale **100%**, one page.
Lay each real part on the printout and look through the pads. Repeat for the bottom with `B.Cu` and the Ra-02.

| Part | Footprint used | What to check |
|---|---|---|
| J1 USB-C 16P | HRO TYPE-C-31-M-12 | Signal pad pitch, the four shell legs, and that the front lip sits at the board edge. Your listing says "spring-type horizontal"; if it is a different 16P body the legs will not match. |
| SW1 slide switch MSK12C02 | C&K PCM12 (as in Rev A) | Pad pitch and the two mounting posts. This one is unverified against MSK12C02. |
| SW2, SW3 tact 3x4x2 | C&K KMR2 (4 pads, 2 per side) | A true 2-pin switch has only 2 pads. Measure pad size and spacing. |
| J2 JST-SH socket | SM02B-SRSS-TB | Pad pitch 1.0 mm and the two side tabs. |
| BZ1 buzzer 9650 | Rev A geometry: 2.5 mm pads, 6.5 mm apart | Pad spacing and polarity mark. Also check it survives reflow, else hand-solder it last. |
| Y1 40 MHz 3225 | 3.2 x 2.5 mm, 4 pads | Which diagonal pair is the crystal (the board uses pads 1 and 3). |
| U1 ESP32-S3FH4R2 | QFN-56 7x7, EP 4x4 mm | Compare the exposed pad with Espressif's package drawing. |
| ANT1 2450AT18B100E | 3.2x1.6 mm, pads 1.0x1.6 at +/-1.6 mm | Derived from the datasheet dimensions. Pad 1 (feed) is the one facing the board. |
| U6 Ra-02 | Ai-Thinker Ra-01 land pattern (16 pads, 2 mm pitch, 16 mm apart) | Pad rows on your module. Pin 1 corner marking. |
| LED1 WS2812B-2020 | KiCad WS2812B-2020 | Pin 1 = DOUT (marked corner). |

## 2. FS8205A and DW01A: check pinout with a multimeter

SOT-23-6 FS8205A pinouts differ between vendors. The board assumes: pin 1 = S1, pins 2 and 5 = common drain,
pin 3 = S2, pin 4 = G2, pin 6 = G1.

1. Continuity mode: pins 2 and 5 must read about 0 ohm to each other (the shared drain).
2. Diode mode, red probe on a source and black on the drain: about 0.5 V on both sources (pins 1 and 3). Source to
   source: open both ways.
3. Gate pins (4 and 6): open to everything.

If your part disagrees, stop and send me the readings. Same for DW01A: the board assumes pin 1 OD, 2 CS, 3 OC, 4 TD (NC),
5 VCC, 6 VSS. A reversed battery plug can destroy the protection circuit, so confirm the plug polarity with a meter before the first connection.

## 3. Bring-up, in this order

Use a current-limited bench supply if you have one. If not, use USB from a laptop port first.

1. **Bare board:** no shorts between GND and each of VBUS, +3V3, B+ (multimeter).
2. **Power section only** (J1, R1, R2, D1, D2, C1, Q1, R6, U3, R5, C2, SW1, U5, C4-C6): plug USB. VBUS present,
   slide SW1 ON, +3V3 = 3.3 V (test pad). Nothing hot.
3. **Battery path** (J2, U4, Q3, R7, R8, C3, R14, R15, C7): connect a battery through a multimeter in current mode,
   USB unplugged. 3V3 should come up from the battery. Plug USB: battery should charge (about 230 mA).
4. **MCU** (U1, crystal, decoupling, R9, R10, C17, SW2, SW3, R3, R4): hold BOOT, plug USB, then
   `esptool chip_id`. If it enumerates, the RF side is the next check; if not, check EN and the crystal.
5. **LoRa:** hand-solder the Ra-02 on the back, then read the SX1278 version register (expect 0x12).
6. **Buzzer, LED, battery ADC.** The ADC pin should read about 1.48 V at 4.2 V battery.
7. **RF:** Wi-Fi scan and BLE advertise from the ESP32. Poor range: tune the matching network (C20, C21, L2, the
   0R series slot R16, and the DNP shunt slots C22, C23). A NanoVNA helps but is not required.

## 4. Hand-soldering the LoRa module on the back

Do the whole top side on the hot plate first. Then solder the Ra-02 with an iron only (flux, quick touches), never put
the board back on the hot plate with the module on, or the top parts will shift.
