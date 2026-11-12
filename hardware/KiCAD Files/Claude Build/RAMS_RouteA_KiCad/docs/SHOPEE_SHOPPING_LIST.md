# RAMS Route A: what to buy on Shopee

Everything not listed here is already in your parts inventory (ESP32-S3FH4R2, 40 MHz crystal, 2450AT18B100E antenna,
USB-C, USBLC6, SS14, 1N4148W, LTH7/LTC4054, DW01A, FS8205A, AO3401, BC817-25, AP2112K, slide switch, tact switches,
JST-SH socket, 9650 buzzer, Ra-02, the 0402/0603 resistor and capacitor values listed in the BOM, 2.0 nH inductor).
Your new WS2812B 2020 LED covers the LED.

## Must buy

| # | Item | Qty | Why |
|---|---|---:|---|
| 1 | **0402 C0G/NP0 capacitor, 1.5 pF** (also grab 1.2 pF and 1.8 pF) | 10 each | C20 and C21 in the 2.4 GHz matching network. Espressif's range is 1.2 to 1.8 pF; your 2.4 pF is outside it. A small 0402 C0G "0.5 pF to 10 pF" assortment is the cheapest way to get all three. |

## Buy only if you don't already have it

| # | Item | Qty | Why |
|---|---|---:|---|
| 2 | **1S Li-ion / LiPo 3.7 V battery with JST-SH 1.0 mm 2-pin plug**, 500 mAh or more | 1 | Board charges at about 233 mA (4.3 kOhm PROG). **Check polarity:** board pin 1 = B+ (marked on the silkscreen). Many cheap packs use the opposite order; if so, re-pin the plug or ask me to flip the connector. |
| 3 | **Solder paste** (low-temp Sn42/Bi58 or Sn63/Pb37, syringe) and **flux** | 1 | Hot-plate reflow of the top side. |
| 4 | **SMT stencil, top side only** | 1 | Order it with the PCB on JLCPCB (do not order a bottom stencil). Needed for the 0.4 mm-pitch QFN. |

## Check your 0805 resistor kit first, then buy only what is missing

These are the 0805 values the board needs. Your 33-value kit probably has them, but I cannot see the exact list.

| Value (0805, 1%) | Qty used | Where |
|---|---:|---|
| 5.1 k | 2 | USB-C CC1/CC2 pulldowns (R1, R2) |
| 10 k | 2 | EN and BOOT pull-ups (R9, R10) |
| 100 k | 2 | Q1 gate pulldown, buzzer base pulldown (R6, R13) |
| 1 k | 2 | DW01A sense, buzzer base (R8, R12) |
| 330 R | 1 | DW01A supply filter (R7) |

If any value is missing, an assortment pack of 0805 resistors is cheaper than single values.

## Optional

| Item | Qty | When you need it |
|---|---:|---|
| 0402 inductor 24 nH | 2 | Espressif's suggested series part on the crystal (L1 slot, currently 0R). Only if Wi-Fi/BLE is flaky. |
| 433 MHz antenna with U.FL | 1 | Only if your Ra-02 turns out to have no onboard spring antenna. This board has no U.FL jack for it, so tell me first. |

## Check on arrival

- **WS2812B 2020:** check the listing or datasheet for **V6 / 3.3-5.3 V**. Older WS2812B-2020 parts are rated 3.7 V minimum and may look dim on 3.3 V.
- **FS8205A (SOT-23-6):** pinouts differ between vendors. Do the multimeter test in `VERIFY_AND_BRINGUP.md` before you solder it.
