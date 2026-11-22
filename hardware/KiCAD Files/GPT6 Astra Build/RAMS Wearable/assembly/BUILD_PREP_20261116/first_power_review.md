# First-power review — RAMS J2, 2026-11-16

Read-only review of the frozen `manufacturing/JLC_PROTOTYPE_20261115` sources and guide. No CAD, firmware, frozen documents or physical hardware were changed. This is a proposed bench sequence, not a test result.

## Conclusions that affect the build instructions

1. First power is **USB-side 5 V, battery disconnected, R30 absent, LED1 absent**. These are three separate conditions. An absent R30 disables the intended charger input; it does not make an attached battery safe against every wrong connection.
2. **TP8 is SYS_IN, not VBUS. Do not inject 5 V at TP8 for the first test.** VBUS enters through J1 and D2 to SYS_IN. With VBUS low, injecting TP8 drives Q1's source high while its gate is low; Q1 can then feed B_PLUS directly. That would bypass the intended USB selection path and could overvoltage an attached cell. This conclusion follows from verified native pads: Q1 gate=VBUS, source=SYS_IN, drain=B_PLUS.
3. An initial SW1-OFF check followed by an SW1-ON/RESET-held check is valid. SW1 OFF grounds U5 EN; RESET grounds the S3's MCU_EN. Holding RESET does **not** turn off the LDO or hold every peripheral in reset; Ra-02 still receives its supply.
4. Correct the frozen guide's phrase “3.6 V loaded MCU stop” in later user-facing instructions: it means **3.6 V loaded cell voltage**. The MCU supply is nominal 3.3 V; its operating range is 3.0–3.6 V. The 3.55 V firmware percentage endpoint is neither a shutdown command nor a proven battery floor.
5. The verified build sends application `Serial` logs over native USB CDC. TP4/TP5 are useful for ROM UART logs/download and electrical diagnosis, but the current build does not duplicate all application logs onto them.

## Minimum setup and assembly state

- Use the **FIRST_POWER** top stencil. R30 and LED1 stay absent; BZ1 and bottom Ra-02 have no top-paste placement. Reflow top parts with bottom Ra-02 absent, then inspect before hand-soldering the buzzer and Ra-02. The planned complete first-power population is 80 components; eight test pads require no parts. A qualified normal board has 82 components after both holds close.
- Have a DMM, magnification, secure nonconductive board support and a current-limited 5 V source. A USB power meter displays current; it is not automatically an adjustable current limiter. Do not assume the computer port provides the low diagnostic limits below.
- Use a verified USB breakout/cable to feed **J1 VBUS and USB ground** from the current-limited source. Confirm the breakout polarity before connecting. TP1 is a suitable GND reference; R30 pad 1 and D2 pad 2 are VBUS but are small probing points, not preferred loose power clips.
- Disconnect battery, PC USB and UART adapter for the initial supply checks. Use one power source. Do not parallel a bench supply's 5 V output with a computer's USB VBUS. A later simultaneous bench/data connection needs a deliberately isolated VBUS/data arrangement, not a guessed cable modification.
- Fit a suitable 433 MHz antenna before running firmware that can transmit. The PCB's 2.4 GHz antenna is for ESP32 radio functions and does not replace the Ra-02 antenna.

Before applying power, inspect the QFN, USB, protection devices, LDO, diode polarities and supply nets for bridges. Meter resistance with power disconnected, allowing capacitors to charge; a continuity beep alone is not a universal short criterion. Verify J2 pin 1 B_PLUS and pin 2 B_MINUS from actual pads/harness, not wire colors.

**B_MINUS is not the bench-ground terminal.** All normal USB, UART and scope grounds connect to GND/TP1. Do not add a wire, solder bridge or earth path between B_MINUS and GND around Q3. A low resistance through a turned-on protection MOSFET can be normal; it does not prove an external bypass. Later cell/simulator tests require a floating source and appropriate differential measurement across the protection boundary. Never disconnect instrument protective earth to improvise isolation.

## Proposed short first-power sequence

The current limits below are **engineering starting points for diagnosis**, not manufacturer-specified board currents or guaranteed damage protection. Capacitor inrush can briefly hit a limit. A collapsed rail or sustained limiting after settling is a reason to switch off and investigate, not to keep increasing the limit until the board starts.

| Step | Setup and suggested current limit | What to establish before continuing |
|---|---|---|
| A — regulator OFF | Set source to 5.0 V, initially 20 mA; SW1 OFF; no battery, R30 or LED1; no data adapter | VBUS is 5 V; TP8 is slightly below VBUS through D2; TP2 settles near 0 V; nothing rapidly warms. Sustained current limiting in this state needs investigation. |
| B — regulator ON, S3 held in reset | Power down; set 50 mA diagnostic limit; hold RESET/SW2, then power with SW1 ON | TP2 reaches about 3.3 V; TP6 remains near 0 V; TP7 is about 3.3 V unless BOOT is pressed. Check +3V3 at U1 supply decoupling and Ra-02 supply without slipping across fine-pitch pins. LoRa is powered, so this is not an unloaded-LDO test. |
| C — ROM download mode | After A/B pass, power down; allow a supply capable of startup current (a 500 mA limit is a diagnostic starting choice). Hold BOOT, hold/release RESET, then release BOOT | TP6 rises; ROM download/USB enumeration is available. Confirm stable rail before programming. No application/radio behavior is proved by ROM enumeration. |
| D — application | Fit antenna; use the verified J2 build; start with a brief powered observation, then extend only while voltage/current/temperature remain acceptable | Native USB logs, startup beep, LoRa initialization and BLE advertisement. LED1 is intentionally absent, so no RGB indication is expected. Battery percentage with no battery is not a battery calibration result. |

If B's limit prevents the rail from reaching its value, first power down and inspect/current-measure the actual load. Do not infer a defective MCU solely from operation on a too-low current limit. After confirming there is no abnormal load, an adequate startup supply is required: Espressif's supply-sizing recommendation includes at least 500 mA capability. That capability is distinct from actual average consumption and the LDO's thermal budget. The S3 rail requirement comes from [Espressif datasheet v2.2, §5.2](https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf).

With SW1 OFF, AP2112's low EN disables the output and its internal discharge path pulls VOUT down; the output is not expected to remain powered from USB. EN below 0.4 V is its specified low state; above 1.5 V is high. These facts support A/B, but do not prescribe a whole-board idle-current acceptance value. [AP2112 DS39724 Rev. 2-2, electrical characteristics](https://www.diodes.com/datasheet/download/AP2112.pdf).

For C, hold BOOT while RESET is released, then release BOOT after reset has taken effect (a human-paced sequence is sufficient). GPIO0 low at reset selects ROM download; GPIO46 must also be low/floating. The board already has R36 pulling GPIO46 low. No eFuse change is part of first programming. [Espressif boot-mode guide](https://docs.espressif.com/projects/esptool/en/latest/esp32s3/advanced-topics/boot-mode-selection.html).

## Verified test points

Unless noted, voltages are measured **relative to TP1/GND**. “About 3.3 V” is a nominal bench expectation, not an assertion of measured tolerance. All coordinates are native KiCad millimetres, for cross-checking the assembly map.

| Point | Native net / position (x, y) | USB, SW1 OFF | SW1 ON, RESET held | Reset released / later use |
|---|---|---|---|---|
| TP1 | GND — 139.8, 109.0 | 0 V reference | 0 V reference | USB/UART/scope common ground |
| TP2 | +3V3 — 139.8, 111.2 | Settles near 0 V | About 3.3 V | About 3.3 V; should remain inside 3.0–3.6 V during operation |
| TP3 | B_PLUS — 139.8, 113.4 | No fixed required value with no battery and R30 absent | Same: do not use an undefined reading as a battery test | With a cell, measure cell voltage between TP3 and J2 B_MINUS; TP3-to-GND includes protection-path effects |
| TP4 | UART_TX — 121.4, 109.0 | No guaranteed logic level | Not an idle-voltage acceptance test while S3 is reset | S3 TX → adapter RX; 3.3 V logic, possible ROM output; DMM averages activity |
| TP5 | UART_RX — 122.9, 106.8 | No guaranteed logic level | Leave undriven | Adapter TX → S3 RX; use 3.3 V logic only, no adapter VCC lead |
| TP6 | MCU_EN — 124.4, 109.0 | Near 0 V after discharge | Near 0 V while RESET is pressed | Rises toward +3V3 after release; R8/C33 are 10 kΩ/1 µF, nominal 10 ms RC |
| TP7 | BOOT_BTN/GPIO0 — 126.7, 109.4 | Near 0 V with 3V3 off | About +3V3 when unpressed; near 0 V when BOOT pressed | Low during reset release for download; normally pulled high |
| TP8 | SYS_IN — 128.0, 126.1 | VBUS minus D2's load-dependent forward drop | VBUS minus diode drop | Measurement point for the selected raw system supply; **not a generic 5 V input** |

Additional checks without dedicated test pads: SYS_EN is U5 pin 3 (low OFF, pulled toward SYS_IN ON); LED_PWR is Q5 drain/LED1 pad 4 (ON approximately SYS_IN, OFF may decay slowly with LED1 absent). Do not mistake the raw LED rail for 3.3 V. VDD_SPI is a separate internally supplied memory rail; do not bridge it to +3V3.

## Stop criteria and interpretation

- Cut power for reversed polarity, smoke/odor, an unexpectedly or rapidly heating part, a sustained current-limit condition, or an unexpected powered rail with SW1 OFF. Do not repeatedly cycle power to see whether a short clears.
- During the regulated USB check, a TP2 value materially different from 3.3 V warrants investigation before firmware. Never continue functional testing with a measured S3 supply above 3.6 V or below 3.0 V. A DMM passing these values does not rule out fast dips/overshoot.
- For application tests, the existing project's **250 mA average LDO-load target** is provisional thermal guidance, not the bench supply's transient limit. The charger and raw LED are separate loads, and their later addition requires a total input-current/thermal check.
- The buzzer is active and firmware issues a power-on beep. A brief intended beep after application start differs from an unexplained continuously driven buzzer during the held-reset rail check.
- No light at LED1, no meaningful battery percentage without a cell, or no application messages on TP4 alone are not evidence of an assembly fault in this first-power configuration.

## Firmware identity and minimum checks

Use `firmware/wearable_withApp` with the **RAMS_JLC_S3_J2** preprocessor define. The reviewed compile helper uses:

```text
esp32:esp32:esp32s3:USBMode=hwcdc,CDCOnBoot=cdc,FlashSize=4M,PSRAM=disabled,PartitionScheme=default
compiler.cpp.extra_flags=-DRAMS_JLC_S3_J2
```

This selects the J2 divider ratio 4 and LED waveform path; the default SuperMini build uses a different divider ratio. Keep 4 MB flash and PSRAM disabled initially. Save the build log/hash and later record the flashed artifact. No flashing was performed by this review.

The current `Serial.begin(115200)` application output uses USB CDC under that FQBN. Test USB-C both orientations after basic power checks. If using a UART adapter for diagnosis, connect only GND, crossed TX/RX; ensure its I/O is actually 3.3 V, and do not let adapter TX drive an unpowered S3.

For a basic function check, record successful ROM identification/programming, stable application logs, startup beep, BLE advertisement/phone connection and a received LoRa packet. The application can send telemetry when a phone is connected and can send an alert/cancel packet; fit the 433 MHz antenna before running it. These checks do not establish RF range, battery protection or worst-case power behavior.

## What can be checked now versus later

| With DMM, current-limited supply, USB and receiver | Additional instruments / separate qualification |
|---|---|
| Power polarity, OFF/ON rail values, held-reset behavior, BOOT operation, ROM enumeration, firmware identity, buzzer/BLE/basic packet reception | Scope: +3V3 at MCU during boot/BLE/LoRa/buzzer overlap; GPIO2 versus its rail during switch/USB/cell transitions; raw LED supply and post-translator DIN timing |
| Input current trend and short first observations | Thermocouple/appropriate temperature measurement: steady regulator/charger temperature in intended enclosure and with actual duty cycle |
| Battery model/harness inspection while disconnected | Floating simulator/appropriate differential measurement: cell sweep, USB handover and protection tests; do not abuse a real pouch cell to test fault thresholds |
| Ordered LED sample identity and dimensions | Qualify exact LED pinout, accepted voltage range, full-white/startup current before fitting; test Q5/U6 sequencing |
| Basic packet reception | Crystal/RF assessment and realistic range/body/enclosure tests; an initial packet is not an RF matching measurement |

After USB bring-up, qualify the cell and harness before fitting R30. R30 enables the nominal 100 mA charger set by R3=10 kΩ; 500/1000 mAh capacity alone does not prove permissible charging conditions. Leave LED1 absent until its own checks pass. The 3.6 V initial stop/recharge threshold is **loaded cell voltage**, and the final threshold must also keep the received LED within its qualified supply range.

## Source-bound review record

The active and frozen PCB hashes matched during this review. The frozen and active assembly guide contents also matched. Native pads, not only text labels, were read for TP1–TP8, J1/J2, R30, Q1/Q3, U3/U5, SW1/SW2/SW3 and LED1; they agree with `circuit_spec.json`.

| Input | SHA-256 |
|---|---|
| Frozen native PCB | `cf926980e8fdaecfb1abeb252f0ca73cc0cfbd4e5cad11143fd9a3e0ee21964a` |
| Frozen ASSEMBLY_AND_BRINGUP.md | `17effb1f638e8a36b12302efd6ccf77a2bf531ad95acbb5aab381c7c40697d83` |
| Frozen circuit_spec.json | `bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c` |
| Reviewed wearable_withApp.ino | `ee0ead176d81b3699d314030de56e32762a7d62e1f04699648606393518d5eda` |
| Reviewed verify_firmware.py | `22e207b86a91ec2d51acd65f2611cada9d8b725692b75c8651eaade565035042` |

Physical measurements, temperature results, cell qualification and flashing remain unperformed. This note adds a reviewable procedure without altering the frozen fabrication release.
