# J2 parts and firmware contract

Revision: **J2 LDO engineering**, 2026-11-09. Source: `circuit_spec.json`.

Source SHA256: `bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c`

This is an engineering candidate, not a fabrication release or a physical test record. Previous versions of this document, the BOM and assembly guide are preserved in `verification/superseded_buckboost_20261109/docs/`. Original Antigravity projects are unchanged.

The circuit integrates the bare ESP32-S3FH4R2, owned Ra-02, owned active buzzer, battery measurement and USB/battery functions. It uses the owned **AP2112K-3.3TRG1 3.3 V LDO**. The buck-boost converter, power inductor, dedicated ADC load switch and reset supervisor are absent. Maximum outline is 42 x 32 mm. Top components are reflowed; the buzzer and bottom Ra-02 are hand-soldered afterward. DOST remains deferred.

## Procurement and reuse

[BOM_PROCUREMENT.csv](BOM_PROCUREMENT.csv) enumerates **90 footprint positions: 82 component positions and 8 copper test pads**. R30 and LED1 are left out for first power-on, so 80 components are initially fitted. They are fitted for normal use after their separate qualification checks; DNP here is a commissioning stage, not deletion of charging or RGB status. The CSV distinguishes initial and qualified normal-use quantities. Recorded purchase packs are not a count of remaining usable stock. Prices and availability are not inferred.

Reuse the owned AP2112, MCU, Ra-02, antenna, protection parts, charger, transistors, diodes and matching passives after checking identity, pinout and ratings. Reuse the **9650 Active 3V**, **MSK-12C02** and **two-pin 3x4x2 mm buttons** using [OWNED_BUZZER_AND_MECHANICALS.md](OWNED_BUZZER_AND_MECHANICALS.md). No mandatory PUI or C&K purchase remains.

The new active-part purchases are **DMN2056U-7**, SOT23, for ADC isolation and **SN74LVC1T45DBVR**, SOT23-6, for LED data-level translation and power-off isolation. Q5 uses another owned AO3401/AO3401A; C34/C35 reuse owned 100 nF capacitors after rating checks. No DC converter is added. Missing 0402 values and RF values appear in the CSV. Existing 2.0/2.4 nH inductors need RF/current characteristics; L1 requires at least 500 mA capability. RF values and 12 pF crystal capacitors remain tuning starting points.

Compare the owned USB socket with the GCT USB4105-GF-A footprint and the battery socket with JST SM02B-SRSS-TB. J2 pin 1 is B_PLUS; pin 2 is B_MINUS. The owned 40 MHz/3225 crystal can be reused if load capacitance, ESR, tolerance and pads match. Named fallback ABM8-40.000MHZ-10-1-U-T has 10 pF load capacitance and at most 35 Ohm ESR. See [GCT drawing](https://gct.co/files/drawings/usb4105.pdf) and [Abracon datasheet](https://abracon.com/Resonators/abm8.pdf).

**LED commissioning:** the owner ordered **WS2812B 2020 DC5V, 100 pieces**. LED1 now uses switched raw battery/USB power, `LED_PWR`, from Q5; it is not powered by +3V3. The `LED_WS2812B-2020_PLCC4_2.0x2.0mm` reference footprint is pin 1 DO unused, 2 GND, 3 DI, 4 VDD. The [owner's listing](https://shopee.ph/product/1604156012/41523984853) establishes the ordered family, not exact manufacturer/revision. Keep LED1 absent for initial power checks, then fit a verified sample after checking package, polarity, current and accepted voltage range. Battery voltage at the LED is the loaded cell voltage less path losses; USB voltage is VBUS less SS14/Q5 losses. Neither is a fixed 5 V supply. Set the usable battery threshold from the actual LED and MCU requirements; the MCU's provisional 3.6 V cell threshold alone does not prove LED operation there. The Worldsemi V1.3 reference lists 3.7–5.3 V, while other revisions differ. See [LED_RAW_SUPPLY_REVIEW.md](LED_RAW_SUPPLY_REVIEW.md). No converter or replacement LED purchase is required by this record.

## Power and measurement

| Function | Current contract |
|---|---|
| AP2112 U5 | 1 VIN=SYS_IN, 2 GND, 3 EN=SYS_EN, 4 NC, 5 VOUT=+3V3. C7/C10 are 10 uF input/output capacitors; check effective capacitance. |
| MSK12C02 SW1 | Pin 2 common=GND, pin 1 ON=LED_GATE, pin 3 OFF=SYS_EN. R7 pulls SYS_EN up to SYS_IN; R41 pulls LED_GATE up to SYS_IN. The 50 mA contacts carry control current only. Shell pads are grounded. |
| Load sharing | Q1: 1 gate=VBUS, 2 source=SYS_IN, 3 drain=B_PLUS. SS14 anode=VBUS, cathode=SYS_IN. |
| LTC4054 U3 | 1 CHRG unused, 2 GND, 3 BAT, 4 VCC, 5 PROG. LTH7 is the documented marking. R3=10k sets nominal 100 mA; R30 remains DNP pending cell/harness checks. |
| Protection | DW01A plus six-pin FS8205A; preserve B_MINUS/GND separation and exact maker pin mapping. |
| ADC Q4 | DMN2056U: 1 gate=+3V3, 2 source=VBAT_SENSE, 3 drain=VBAT_DIV. R15=30k from battery to drain, R16=10k ADC to GND, C29=1nF. |
| Buzzer | Positive=+3V3; negative=BC817 collector. R12=330 Ohm base resistor; R14 base pull-down. Flyback diode cathode=+3V3. |
| Raw LED switch Q5 | AO3401A: 1 gate=LED_GATE, 2 source=SYS_IN, 3 drain=LED_PWR. ON grounds the gate; OFF releases it to R41. LED_PWR decays through its load after off; it is not hard-grounded. |
| LED translator U6 | SN74LVC1T45DBVR: 1 VCCA=+3V3, 2 GND, 3 A=GPIO48/NEO_DATA, 4 B=NEO_SHIFT through R13=33 Ohm to DIN, 5 DIR=+3V3, 6 VCCB=LED_PWR. |
| Translator bypass/control | C34=100nF at VCCA, C35=100nF at VCCB; C28 remains the LED bypass. R42 pulls NEO_DATA down and R43 pulls NEO_DIN down, both 100k. |

Sources: [AP2112](https://www.diodes.com/datasheet/download/AP2112.pdf), [LTC4054](https://www.analog.com/media/en/technical-documentation/data-sheets/405442xf.pdf), [DMN2056U](https://www.diodes.com/datasheet/download/DMN2056U.pdf). See [power review](SIMPLIFIED_POWER_REVIEW.md) and [ADC review](SIMPLIFIED_ADC_POWER_SWITCH.md). Earlier passive-buzzer wording is superseded by the owner's active-stock confirmation.

[TI SN74LVC1T45 SCES515N](https://www.ti.com/lit/ds/symlink/sn74lvc1t45.pdf) supports 1.65–5.5 V on each supply, A-to-B translation with DIR high, either supply sequencing order and power-off isolation. Its Ioff feature addresses data-pin back-powering when a supply is off; it does not regulate or boost LED power. Verify real rail/DIN sequencing and leakage on the assembled board. The review's illustrative 36.6 mA LED current is not a guaranteed limit for unidentified stock; measure full-white current and add it to battery/USB current, not to the LDO output load.

The divider gives 4.2/4 = 1.05 V and 105 uA nominal, with about +/-1.5% resistor-ratio error from independent 1% tolerances. Q4's gate follows the MCU rail; its body diode blocks battery-to-ADC feed when off. The 1 nF capacitor gives 7.5 us on-state time constant and 10 us discharge through 10k. Actual transitions still need measurement.

Use one 500 mAh or 1000 mAh, 3.7 V LiPo specified for 4.2 V charging. At 100 mA the nominal rates are 0.2C/0.1C; actual cell ratings control. Initially stop/recharge at **3.6 V loaded cell voltage**, verifying the MCU rail stays above 3.0 V during combined loads, with a 3.1 V target margin. The initial USB average-load target is at most 250 mA pending thermal measurements. The regulator's 600 mA label does not establish continuous enclosed USB thermal capability.

## Firmware

| Signal | GPIO | S3 package pad |
|---|---:|---:|
| BOOT/cancel | 0 | 5 |
| Active buzzer | 1 | 6 |
| Battery ADC | 2 | 7 |
| LoRa DIO0/reset/NSS | 8/9/10 | 13/14/15 |
| LoRa MOSI/SCK/MISO | 11/12/13 | 16/17/18 |
| USB D-/D+ | 19/20 | 25/26 |
| RGB DIN, qualification pending | 48 | 36 |

Current `battery.h/.cpp` contain the opt-in **RAMS_JLC_S3_J2** profile: multiplier 4.0, calibrated `analogReadMilliVolts`, 2.5 dB attenuation and 16 samples spaced 100 us apart. Define that macro for J2; the SuperMini default remains ratio 2.0. Verify build identity and compare reported voltage with a DMM. The current **3.55 V percentage-zero endpoint is a provisional display setting**, not automatic shutdown or a guaranteed regulator operating floor. The actual minimum depends on simultaneous load, path losses and the qualified LED; retain the initial 3.6 V loaded-cell recharge/stop target until measurements establish the operating range.

The same J2 define now selects a dedicated RMT sender for the single WS2812B-2020: at 10 MHz, target zero is 300 ns HIGH / 1000 ns LOW, one is 700 ns HIGH / 600 ns LOW, and reset is 300 us LOW. Both bit periods are 1.3 us. It retains the Adafruit brightness-scaled GRB buffer and existing status animation; the default SuperMini still calls the original Adafruit sender. Initialization holds the line low and each J2 frame includes reset. Host tests cover the actual sender's bit order, durations, reset and failure handling. Both final Arduino profiles compile successfully with the timing change; all source hashes match reports/firmware_j2/build_summary.json. The actual-source RGB host tests pass for both profiles. Targets are not measured waveforms: scope DIN after U6 during board bring-up.

GPIO1 HIGH/LOW matches the active buzzer. Preserve alert cadence, 433 MHz, SF9, 125 kHz, coding 4/5, 17 dBm, sync 0x34 and packet layout. Phone GPS/IMU arrives over BLE; no onboard GPS/MPU6050 is added. Initial bring-up builds use **4 MB flash with PSRAM disabled**; current firmware does not require PSRAM. FH4R2 contains 2 MB quad PSRAM, which can be enabled and tested separately after core bring-up. GPIO0 held low at reset enters download mode. This documentation refresh made no firmware edits.
