# J2 assembly and first-article bring-up

Revision: **J2 LDO engineering**, 2026-11-09. Source: `circuit_spec.json`.

Source SHA256: `bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c`

This guide describes work still to perform, not a fabrication release or physical test record. Previous versions are preserved in `verification/superseded_buckboost_20261109/docs/`. Use [parts/firmware contract](PARTS_AND_FIRMWARE.md), [BOM](BOM_PROCUREMENT.csv), [owned mechanicals](OWNED_BUZZER_AND_MECHANICALS.md) and final source-bound CAD reports together. Earlier buck-boost reports do not validate J2. The ordered 2020 LED now uses Q5-switched raw battery/USB power and U6 data translation; actual stock voltage/current/geometry still require qualification. No power converter is present.

## Preparation and soldering

1. Match the final schematic, PCB, BOM, stencil and reports. Count usable stock. Compare the actual connectors, switches, buttons, buzzer and Ra-02 with a 1:1 print or caliper measurements. Verify protection MOSFET pins. Leave **R30 CHG_LINK and LED1 unpopulated for first power-on**. Fit them for normal use after their respective cell and LED checks; neither function has been permanently omitted. There are 90 footprint positions, including 8 copper test pads: 80 fitted components initially, 82 after both holds close.
2. Confirm the 500 mAh or 1000 mAh cell's exact model, 4.2 V charge specification, permitted currents/temperatures and protection. Meter the harness: J2 pin 1 B_PLUS, pin 2 B_MINUS. Neither wire colour nor housing fit proves polarity. Disconnect all power during soldering.
3. The owner confirmed top heatbed reflow, then bottom Ra-02 iron soldering. Historical ordering instructions name **Mechanic IX5 Ultra and Relife RL-403 Sn63Pb37**; the current inventory does not confirm the actual paste. Read its alloy, expiry/storage and profile. Measure board/component temperature. The old 205–210 C recipe and heatbed display alone do not qualify this process.
4. Review the S3 QFN exposed-pad stencil/via treatment and USB fine-pitch paste. AP2112 SOT23-5 has no converter-style exposed pad. Keep R30, LED1 and BZ1 out of top paste placement; the buzzer footprint intentionally has no F.Paste. Reflow remaining top parts with Ra-02 absent. Cool undisturbed and inspect joints, polarity and bridges. S3 perimeter wetting alone does not prove its hidden-pad joint.
5. Clean only as allowed by fitted parts. Keep solvent/flux out of switches and acoustic openings. Hand-solder the owned 9650 after reflow: pad 1 positive, pad 2 negative/NPN collector. Check body fit, height and polarity.
6. Support top components in a holder and hand-solder bottom Ra-02 castellations. Inspect every power, ground, SPI and control joint. Do not place its populated bottom against the heatbed.

## Unpowered checks

Record board serial, photos, substitutions and source hashes. Inspect VBUS, SYS_IN, +3V3, VDD_SPI and battery input for bridges; distinguish capacitor charging and semiconductor paths from hard shorts. Check:

- AP2112 pins 1 VIN, 2 GND, 3 EN, 4 NC, 5 VOUT. SW1 common pin 2 is GND; ON pin 1 grounds LED_GATE and OFF pin 3 grounds SYS_EN. R7 is now a pull-up from SYS_IN to SYS_EN; R41 pulls LED_GATE up. The slide carries control current, not MCU/LED load current.
- Q1 gate=VBUS, source=SYS_IN, drain=B_PLUS; SS14 cathode=SYS_IN.
- B_MINUS remains separate from GND except through protection Q3. Q3 drains 2/5 join. No solder, harness or instrument bypass is present.
- Q4 gate=+3V3, source=VBAT_SENSE, drain=upper resistor. R15=30k, R16=10k, C29=1nF.
- VDD_SPI is internally supplied and locally bypassed, not shorted to +3V3. Check BOOT/GPIO45/GPIO46 straps.
- BC817 pins 1 base, 2 emitter/GND, 3 collector; R12=330 Ohm; flyback cathode=+3V3.
- Q5 pins 1 gate=LED_GATE, 2 source=SYS_IN, 3 drain=LED_PWR. LED1 pin 4 and C28 use LED_PWR, not +3V3. LED1 pins 1/2/3 are DO unused/GND/DI.
- U6 SN74LVC1T45: pins 1 VCCA and 5 DIR=+3V3, 2 GND, 3 A=NEO_DATA, 4 B=NEO_SHIFT, 6 VCCB=LED_PWR. C34/C35 are dedicated 100 nF bypass capacitors on the two supplies. R42/R43 pull input/DIN low; R13 remains 33 Ohm between translator and LED.
- TP1 GND, TP2 +3V3, TP3 B_PLUS, TP4 UART_TX, TP5 UART_RX, TP6 MCU_EN, TP7 BOOT, TP8 SYS_IN. External UART uses 3.3 V logic and must not drive an unpowered MCU.

## Powered stages

1. **USB, no battery, R30 absent:** hold RESET low and apply 5 V through a current-limited supply. Turn on SW1; measure SYS_IN, +3V3 at MCU/Ra-02 and MCU_EN. Begin with a diagnostic limit, then allow legitimate startup demand after short checks. Repeated resets from an insufficient limit are not proof of a circuit fault. Stop on unexpected voltage, current or heat.
2. **Rail and temperature:** keep the S3 operating rail within 3.0–3.6 V; target at least 3.1 V under initial battery tests. Exercise idle, BLE, LoRa TX, buzzer and overlapping loads. Measure LDO average current and steady temperature in the intended enclosure. Begin at no more than 250 mA average through the LDO pending thermal results; a 600 mA rating does not establish continuous USB thermal capability. The raw-powered LED adds to total battery/USB current, not LDO output current. Verify the total USB budget including the charger separately.
3. **Boot/programming:** release RESET and inspect UART output. Hold BOOT, press/release RESET, then release BOOT for download. Use **4 MB flash, PSRAM disabled and RAMS_JLC_S3_J2 enabled** for initial bring-up; save build identity. The chip's 2 MB quad PSRAM is a separate optional validation profile, not required by current firmware. Test USB-C in both orientations. Ordinary flashing requires no eFuse changes. Any future eFuse burn needs Espressif's measured CPU-rail conditions, including no more than 3.3 V.
4. **Battery simulator:** use floating/isolated instrumentation so B_MINUS is not shorted to GND. Scope ground connects to GND/TP1; use differential measurement across the protection boundary. Test 4.2 V down to the provisional **3.6 V loaded MCU stop**, USB/battery handover and SW1 off/on. After fitting LED1, use the higher threshold needed to keep its measured VDD in the accepted LED range; a nominal 3.7 V cell does not stay at 3.7 V. Record sag, current and heat. The firmware's 3.0 V percentage endpoint does not implement shutdown.
5. **ADC transitions:** capture GPIO2 and its MCU rail together during battery insertion with SW1 off, switch transitions, USB insertion/removal and reset. Require `-0.3 V <= GPIO2 <= VDD_domain + 0.3 V`. Check low off-state voltage, enabled ADC approximately VBAT/4 and filter settling. Compare reported voltage with a DMM over the operating range. Hot leakage/transients need actual measurement; no GPIO injection allowance is assumed.
6. **Charging/protection:** after checking cell/harness ratings, power down and fit R30. R3=10k gives nominal 100 mA; LTC4054's 93–107 mA specification excludes extra resistor error. Measure current, charge voltage, termination and heat with the system off/on. Qualify protection using a simulator, not abuse of a real pouch cell. Charging can remain available with SW1 off; this is not galvanic battery disconnection.
7. **LED qualification, then normal fitting:** verify a received sample's package/polarity and reliable reset/colours across the intended raw battery/USB voltage range before installing LED1. Record its minimum accepted voltage and full-white/startup current. With LED1 still absent, verify Q5 switching, U6 supply/DIN levels and no unintended back-powering during either rail sequence. Then power down, fit the qualified LED and capture LED_PWR, DIN and +3V3 through startup, shutdown and USB handover. LED_PWR may decay slowly when unloaded; it is not a hard-grounded rail. Drive GPIO48 low initially and send a valid reset/frame after supplies stabilize. U6 provides translation and Ioff isolation, not regulated LED power.

   Scope DIN after U6 using the J2 RMT profile: target zero is 300/1000 ns HIGH/LOW, one is 700/600 ns, followed by 300 us LOW reset. Confirm actual pulse widths, levels and edge quality against the accepted LED revision. A software timing test or a successful compile does not measure the post-translator waveform.
8. **Functions:** attach a proper 433 MHz antenna before transmission; the onboard 2.4 GHz antenna serves a different radio. Check packets at 433 MHz, SF9, 125 kHz, coding 4/5, 17 dBm and sync 0x34, BLE phone GPS/IMU updates, buzzer/current, RGB status, alert cadence and cancellation. Check crystal startup/frequency and RF match/range with final battery, enclosure and body placement. Provide insulation, strain relief and antenna clearance.

## Evidence for a working board

Save rail/current/thermal results, ADC captures/calibration, charge/protection results, USB orientation checks, firmware identity, alert timing and radio function/range results. Record equipment, conditions and fitted parts. CAD checks or one received packet do not establish all these outcomes. No physical working, charging or RF-performance claim is made here.
