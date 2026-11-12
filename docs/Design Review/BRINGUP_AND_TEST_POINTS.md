# Bring-up and test-point procedure: RAMS_JLC_S3 J2

Use this in order. Never skip a step because a later rail looks correct. Record
the measured value, the instrument and the date next to each line; a PASS with
no number is not a result.

Test points on the board (all 1.0 mm pads):

| TP | Net | What it proves |
|---|---|---|
| TP1 | GND | Instrument reference. Clip the meter here for every other measurement. |
| TP2 | +3V3 | Regulator output and total system load headroom |
| TP3 | B_PLUS | Cell voltage at the protection boundary, and charge termination |
| TP4 | UART_TX | Boot log output, firmware alive |
| TP5 | UART_RX | Download path into the module |
| TP6 | MCU_EN | Reset RC and the CHIP_PU timing |
| TP7 | BOOT_BTN | Strapping level at boot, GPIO0 |
| TP8 | SYS_IN | Power-path output, either USB or cell |

Note: TP6 and TP7 sit behind R8 and R34 respectively, so a probe there reads
the actual node the chip sees, not the raw switch contact.

## T0 Unpowered continuity

Cell and USB disconnected, slider OFF. Meter in resistance mode.

| From | To | Expected | Fail means |
|---|---|---|---|
| TP1 | TP2 | more than 1 kOhm | Solder bridge on the 3.3 V rail |
| TP1 | TP8 | more than 100 kOhm | Short in the power path |
| TP3 | TP8 | open one way, about 0.6 V drop the other (diode test) | Q1 body diode reversed |
| TP3 | TP1 | above 20 kOhm | Divider short or Q4 failure |
| TP8 | TP2 | open | LDO input shorted to output |

## T1 USB only, no cell, slider ON

Apply 5 V through a current-limited supply set to 200 mA.

| TP | Expected | Reasoning |
|---|---|---|
| TP8 | 4.5 - 4.7 V | 5 V minus the SS14 forward drop |
| TP2 | 3.28 - 3.32 V | AP2112 regulation |
| TP6 | rises to above 3.0 V within 20 ms | 10 k with 1 uF, tau = 10 ms |
| TP7 | 3.2 - 3.3 V | R34 pull-up, button not pressed |
| TP3 | rising toward 4.2 V | charger output into the cell node |

Supply current with the cell absent should be under 80 mA and falling. A
standing current near the 200 mA limit means a rail is shorted: stop.

## T2 Reset and boot entry

- Press SW2 (reset): TP6 falls below 0.25 x 3.3 V, releases, and returns
  through the RC. A stuck low means C33 is shorted or the button is jammed.
- Hold SW3 (boot), tap SW2, release SW3: the module must appear as a USB serial
  device. TP7 reads 0 V while SW3 is held. This is the recovery path if
  firmware is bad.

## T3 Cell only

Disconnect USB. Insert the cell, slider ON.

| TP | Expected | Reasoning |
|---|---|---|
| TP3 | 3.6 - 4.2 V | cell, measured at the protected node |
| TP8 | within 30 mV of TP3 | Q1 on with no USB |
| TP2 | 3.28 - 3.32 V while TP3 is above 3.6 V | regulator still in regulation |
| TP2 | falls with TP3 below about 3.5 V | expected dropout; this is the real empty point |

If TP8 reads 0 V with a charged cell, the protection pair is latched off:
check DW01A pin 6 on the cell negative and the FS8205A gate nets before
replacing anything.

## T4 Battery sense calibration

With a known cell voltage at TP3, read the firmware's reported voltage.

Equation to check: `V_reported = V_ADC * 4.0`, where `V_ADC` = TP-sense voltage.
Expected sense voltage at the ADC pin = `V_bat * 10 k / (30 k + 10 k)`.

- Compare reported against a meter at TP3. Agreement within 30 mV is a pass.
- A reading at almost exactly half is the `RAMS_JLC_S3_J2` build flag missing
  (finding S7), not a hardware fault.
- A reading that is 4x or wandering indicates the divider or Q4.

## T5 Rails under load

Enable the radio transmit path, the buzzer and the pixel together and watch TP2
on a scope, not a meter.

- Sag below 3.0 V, or oscillation, means the 3.3 V bulk capacitance or the LDO
  thermal path is inadequate (see `CALCULATION_AUDIT.md` C3).
- Measure the LDO package temperature after two minutes at 4.2 V cell voltage.
  Above 85 C, reduce sustained load.

## T6 UART

115200 8N1 on TP4 (TX) with TP1 as ground, TP5 optional for commands.

- Boot banner within 1 s of reset is a pass.
- Garbage at a stable rate means a baud or crystal problem, not a wiring fault.
- Nothing at all: check TP6 first, then TP4 continuity to the module pad.

## T7 Firmware identity check

Before trusting any measurement, confirm the build is for this board.

- Battery reading near half of the meter value: `RAMS_JLC_S3_J2` not defined.
- Serial line prints `ADC mV` in the init message: J2 calibrated path active.
- Serial line prints `ADC raw`: SuperMini path active, wrong for this board.

## T8 Sleep current

Series ammeter between the cell and J2, firmware in deep sleep, slider ON,
USB removed.

- Expected about 175 uA; under 250 uA is a pass.
- 5 mA or more means a peripheral is not being disabled, or a pull-up is fighting
  a driven low.
- About 1 mA extra with the pixel rail on means Q5 is not fully off.

## Safety limits for every step

- Never exceed 4.25 V at TP3; the DW01A over-charge threshold is 4.30 V and it
  is the last line of defence, not a charging method.
- Never leave the cell connected while soldering or reworking.
- Do not probe the RF port with a DC meter; use a proper 50 ohm load or antenna.
- Do not transmit LoRa without an antenna connected.
