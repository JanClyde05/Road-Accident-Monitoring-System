# Calculation audit: RAMS_JLC_S3 J2

Every number below is recomputed from the values on the board and checked
against a target taken from a datasheet or standard. Values are nominal unless
stated. Re-run this list whenever a resistor, capacitor, cell or module changes.

Notation: `V_bat` cell voltage, `I` current, `P` dissipation, `R` resistance,
`C_L` crystal load capacitance, `C_stray` PCB stray capacitance (4 pF assumed).

## C1 Battery sense divider

Equation: `V_sense = V_bat * R16 / (R15 + R16)` and `I_div = V_bat / (R15 + R16)`

Inputs: R15 = 30 k, R16 = 10 k, V_bat = 3.00 - 4.20 V.

- `V_sense` = 0.250 * V_bat -> **0.750 V at 3.00 V**, **1.050 V at 4.20 V**
- `I_div` = 4.20 / 40 k = **105 uA** (continuous, Q4 gate is tied to 3V3)
- ADC with 2.5 dB attenuation (J2 path) spans 0 - 1.25 V: headroom at full
  charge = (1.25 - 1.05) / 1.25 = **16 %**
- Resolution: 1 LSB = 1.25 V / 4096 = 0.305 mV at the pin = **1.22 mV at the cell**

Target: `V_sense <= 1.25 V` at the highest cell voltage, and at least 15 %
headroom. **PASS.** Drain target for a wearable: under 20 uA.
**FAIL by 5x** -> see finding S8 (300k/100k gives 10.5 uA at the same ratio).

## C2 Charge current

Equation: `I_chg = 1000 * V_PROG / R_PROG`, with `V_PROG = 1.0 V` for the
LTC4054 (datasheet sets the constant-current level directly).

Inputs: R3 = 10 k (1 %).

- `I_chg` = 1000 * 1.0 / 10 000 = **100 mA** (99 - 101 mA over resistor tolerance)
- Charge time, 500 mAh cell, 3.7 -> 4.2 V: `t = 0.5 * 500 / 100` = **2.5 h**
  in constant current, plus roughly 1 h of CV taper -> **about 3.5 h**

Target: `I_chg <= 0.5 C` of the actual cell. **PASS for a 200 mAh cell or
larger.** Confirm the cell label before the first full charge.

## C3 Regulator dissipation and current budget

Equations: `P = (V_bat - 3.3) * I` and `T_j = T_amb + P * theta_JA`

Inputs: AP2112K-3.3, SOT-23-5, `theta_JA` about 250 C/W with 1 inch squared of
copper, `T_amb` 40 C, `T_j` limit 85 C (derated from 125 C).

- Allowable rise: 85 - 40 = **45 C** -> `P_max` = 45 / 250 = **0.18 W**
- At 4.2 V in: `I_max` = 0.18 / 0.9 = **200 mA sustained**
- At 150 mA: P = 0.135 W, rise 34 C, `T_j` = **74 C**
- At 250 mA: P = 0.225 W, rise 56 C, `T_j` = **96 C** -> not allowed

Target: sustained load at or under 150 mA, with peaks under 300 mA for less
than 100 ms absorbed by C7 (10 uF) and C10 (10 uF). ESP32-S3 transmit bursts
plus a 100 mA LoRa transmit exceed the sustained limit if they overlap.
**CONDITIONAL PASS**: the firmware must not run Wi-Fi and LoRa transmit
continuously together.

## C4 Usable cell window

Equation: `V_in,min = 3.3 + V_dropout(I)`

Inputs: AP2112 dropout about 0.25 V at 300 mA, 0.11 V at 100 mA.

- `V_in,min` = **3.55 V** at 300 mA, 3.41 V at 100 mA
- Usable window 3.55 - 4.20 V is roughly **70 % of a LiPo discharge curve**
- Firmware treated 3.00 V as empty, which is unreachable at this load

Target: empty threshold set to the regulator's real dropout floor, not the
cell's protection floor. **FIXED 2026-11-11** -> finding S6. `BATTERY_EMPTY_VOLTAGE`
is 3.55 V, so `pct = (V - 3.55) / (4.20 - 3.55) * 100`; 3.60 V reads 7 %,
3.88 V reads 50 %, and 0 % is reached as the rail is about to sag. An explicit
shutdown at 3.5 V in the main loop is still outstanding.

## C5 Crystal load capacitance

Equation (Espressif): `C_L = C1*C4/(C1 + C4) + C_stray`

Inputs: C24 = C25 = 12 pF, `C_stray` = 4 pF, crystal ABM8 `C_L` = 10 pF.

- `C_L` = 12*12/24 + 4 = 6 + 4 = **10 pF**

Target: `C_L` equals the crystal's rated load capacitance within 1 pF, and
final frequency within **+/-10 ppm**. **PASS on paper.** Requires measurement:
serial element is 22 ohm instead of the reference 24 nH (finding S3), and
crystal amplitude must exceed 500 mV.

## C6 RF matching

Espressif recommended ranges for a chip design that follows their layout:
shunt C at the pin 1.2 - 1.8 pF, series L 2.0 - 3.0 nH, shunt C 1.8 - 1.2 pF.
Board values: C18 1.5 pF, L2 2.4 nH, C19 1.5 pF -> **inside all three ranges**.
The following C32 1.2 pF / L4 2.7 nH / L5 3.3 nH form the antenna matching
network, which is board and enclosure specific.

Targets: `S11 <= -10 dB` and `S21 >= -1.5 dB` across 2.400 - 2.4835 GHz, with
the antenna in its final enclosure. Configurations are only a starting point;
**cannot be verified without a vector network analyser.**

## C7 Power path drops

- USB path: `V_SYS = 5.0 - V_f(SS14)` = 5.0 - 0.45 = **4.55 V** at 300 mA
- Battery path when USB absent: Q1 on, `V_drop = I * R_ds(on)`; AO3401A about
  60 mOhm at `V_gs` = -4.5 V, 90 mOhm at -3.3 V -> **18 mV at 200 mA**
- Protection pair: 2 x 25 mOhm = 50 mOhm -> **10 mV at 200 mA**
- Reverse blocking: with USB present `V_SYS` (4.55 V) exceeds `V_bat`, so the
  Q1 body diode is reverse biased and USB cannot charge the cell directly. Confirmed.

Target: total series drop under 100 mV. **PASS.**

## C8 Buzzer driver

Equations: `I_B = (V_GPIO - V_BE) / R12` and forced beta `= I_C / I_B`

Inputs: R12 = 330 ohm, `V_BE` 0.7 V, BC817-25 `h_FE` 160 - 400, buzzer 30 mA.

- `I_B` = (3.3 - 0.7) / 330 = **7.9 mA** (GPIO1 limit 40 mA, OK)
- Forced beta = 30 / 7.9 = **3.8**, far below `h_FE` -> hard saturation,
  `V_CE(sat)` under 0.3 V

Target: `V_CE(sat) < 0.3 V` and `I_B < 10 mA`. **PASS.** Flyback D3 has its
cathode on +3V3 and anode on the collector node, which is the correct polarity.

## C9 WS2812B supply and logic level

- Supply range 3.7 - 5.3 V; `V_IH` = 0.7 * `V_DD`
- At `V_DD` = 3.7 V, `V_IH` = **2.59 V**; ESP32-S3 `V_OH` is about 3.0 V at 3.3 V
  -> direct drive is already legal
- At `V_DD` = 5.0 V, `V_IH` = 3.5 V -> translation is required, which is why U6 exists
- Raw cell falls below 3.7 V for the lower part of the curve (finding S13)

Target: pixel supply at or above 3.7 V for the whole usable window.
**FAIL for a raw-cell rail**, acceptable because LED1 is DNP.

## C10 USB Type-C sink resistors

`R1 = R2 = 5.1 k` on CC1 and CC2. USB Type-C specification requires
`Rd = 5.1 k +/- 10 %` on each CC line for a sink. **PASS** (1 % parts).

## C11 Protection trip point

`I_trip = V_CS / R_ds(on,total) = 150 mV / 50 mOhm = 3.0 A`

For a 500 mAh cell this is 6C. Target: trip above the largest legitimate
inrush but within the cell's short-duration rating. **REVIEW** (finding S9).

## C12 Sleep current estimate

`I_sleep = I_div + I_LDO(q) + I_DW01 + I_MCU(deep sleep)`

105 uA + 55 uA + 3 uA + 10 uA = **about 173 uA**, i.e. 4.2 mAh per day, about
0.8 % of a 500 mAh cell per day. Target under 250 uA. **PASS**, improved to
about 80 uA by finding S8.
