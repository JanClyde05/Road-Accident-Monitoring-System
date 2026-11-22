# Simplified battery ADC and power switch

Date: 2026-11-09, Asia/Manila. Current owner clarification: **reuse the owned9650 Active3V DC-tone buzzer**. Its GPIO1 HIGH/LOW driver matches the requested behavior; the earlier passive-buzzer interpretation is superseded. No converter, reset-supervisor IC or dedicated analog-switch IC is required by this review. This document is an implementation recommendation, not a physical-test record.

## Selected minimum circuit

Keep the AP2112 main-enable slide switch. Add **one Diodes DMN2056U-7 N-channel MOSFET**, SOT23, to the battery-divider branch:

```text
B_PLUS ── 30k ── D (pin3) DMN2056U
                         S (pin2) ── GPIO2 / VBAT_SENSE
                         G (pin1) ── +3V3
                                      |
VBAT_SENSE ── 10k ── protected GND     |  (gate connects directly to +3V3)
VBAT_SENSE ── 1nF ── protected GND
```

Use1% resistors as an inexpensive default, or0.1% where already available. No resistor feeds the gate from battery positive. The gate must follow the actual MCU3V3 rail, not AP2112 VIN or the mechanical switch's high-level input. Source and drain orientation is consequential: the intrinsic diode points from **ADC/source toward the resistor/drain**, blocking cell-to-ADC conduction when off. Use the existing/native DMN2056U or correctly numbered generic N-channel symbol and SOT23 footprint, with1=G,2=S,3=D. Do not substitute the owned P-channel AO3401 or an unqualified2N7002.

The slide can select AP2112 EN between SYS_IN and GND. Its off position disables the LDO and the AP2112 output discharge pulls the system rail/gate low. Charging can remain available with the system off. This is system off, not a claim of zero battery current or galvanic disconnection of the charger/protector. The original load-sharing/protection topology remains independent of the ADC branch.

This branch measures the **actual B_PLUS battery node referred to protected GND**, including while USB supplies the system. It does not accidentally measure SYS_IN/USB voltage. When the cell protector is open, that reference no longer represents a normal connected cell; do not interpret a protection-fault reading as a calibrated battery voltage.

## Why this part and ratio

The primary [Diodes DMN2056U datasheet DS38480 Rev.2-2, July2021](https://www.diodes.com/datasheet/download/DMN2056U.pdf), page3, specifies85mOhm maximum at VGS=1.5V under its stated test conditions. The product-page parameter field says1.8V; the reviewed datasheet table explicitly says1.5V. This design supplies more than1.8V gate overdrive in normal operation, so it does not rely on choosing between those two values.

With30k over10k, `VADC=VBAT/4`; at4.2V it is1.05V and branch current105uA. With independent1% resistor tolerance, the maximum fraction is `10.1/(29.7+10.1)=0.253769`, giving1.06583V. Even at the S3 operating floor3.0V, `VGS >= 3.0-1.06583 = 1.93417V`. At4.3V cell voltage the same calculation gives1.90879V. This is ample for the selected low-voltage MOSFET and avoids the small gate margin of a2:1 divider.

Using85mOhm at105uA gives less than9uV switch drop, negligible relative to resistor/ADC errors. The manufacturer's low-resistance measurement is at25C and high pulsed current, so this is a sizing estimate, not a precision transfer characterization at every temperature. The divider source resistance is approximately30k||10k=7.5kOhm. A1nF local capacitor gives7.5us nominal settling while on; use a conservative100us or longer settling interval after configuration and averaging/calibrated millivolt acquisition.

The same datasheet specifies drain leakage1uA maximum and gate leakage100nA maximum at25C under its respective test conditions. Conservatively applying their sum through10k gives about11mV off-state ADC voltage at those conditions. It does **not** publish a maximum hot-leakage value. Check off-state ADC voltage at the actual enclosure's intended temperature; absence of that one limit is not a reason to add an expensive switch/supervisor. Do not describe the25C figure as a guaranteed whole-temperature result.

## Startup and shutdown

At startup, an enhancement NMOS powered only at its gate cannot conductively drive its source above that gate from the battery. It begins passing the divider voltage as the rail rises. In off state, the reverse-biased body diode blocks the battery feed and the lower resistor discharges the ADC. This avoids the PMOS scheme's inversion and its independently timed gate versus LDO enable.

The recommended1nF capacitor is deliberately small. When the NMOS turns off, its discharge time constant through10k is10us, compared with100us for10nF and1ms for100nF. The1nF also damps battery-insertion capacitance feedthrough better than leaving the ADC node without a capacitor. Actual FET/PCB/ADC capacitance adds to the nominal value. Do not populate the earlier10nF/100nF value by habit.

Example, **conditional** normal-collapse bound: with20uF effective3V3 capacitance and0.6A rail discharge, `|dV/dt|=I/C=30V/ms`. A10us ADC decay time corresponds to0.30V of rail movement; the conducting NMOS initially has positive gate-source headroom, which adds separation before cutoff. This supports the chosen small capacitor but is not proof for an instantaneous rail short, unknown capacitance or arbitrary hot-plug waveform. Drain/gate capacitive feedthrough also requires observation. No permissible internal GPIO injection current has been assumed.

First-article acceptance captures GPIO2 and its3V3 domain simultaneously during battery connection with the switch OFF, switch ON/OFF, USB connection/removal and normal reset. Verify `-0.3V <= GPIO2 <= VDD_domain+0.3V` throughout, off-state voltage remains low, and the ADC settles before sampling. Retain the ordinary local3V3 bulk capacitor already required for radio operation. If measurements show a problem, correct that specific waveform; do not preemptively restore the rejected power ICs.

## Firmware and alternatives

**The firmware multiplier must change from2.0 to4.0 for this hardware revision.** Use the real divider ratio if calibrated; independent1% resistor extremes permit about+/-1.5% divider gain error. The GPIO signal is roughly0.75-1.075V across the useful single-cell range, so select an appropriate S3 ADC attenuation/calibration range rather than assuming rawADC/4095 times3.3V. No firmware was modified by this review. Existing GPIO1 HIGH/LOW buzzer handling remains suitable for the now-confirmed active DC buzzer, subject to its current/voltage fit.

Rejected alternatives are recorded to prevent unnecessary reintroduction:

- A permanent2:1 divider remains powered when the MCU is off.
- A divider fed from switched SYS_IN measures the USB-derived input during USB operation, not the actual cell.
- The owned AO3401 PMOS plus a switch can isolate the divider, but requires inverted/sequenced control relative to LDO EN; the one-NMOS branch removes that control problem.
- BAT54 clamp plus bleeder is small, but its240mV/100uA forward limit is a25C pulsed specification and its reverse-leakage allowance affects a100k/100k divider. It is not a proven temperature-independent VDD+0.3 clamp. No clamp or bleeder is needed in the selected branch.

## Supermini and LTH7 reference

The owner's Google image redirect leads to the [UNIT Electronics S3 Supermini product](https://uelectronics.com/producto/esp32-s3-supermini-placa-de-desarrollo-usb-tipo-c/) and its AR3547 pinout image. The accessible product text did not establish an exact regulator/charger circuit for every received revision. It is appropriate as identification context, not authority to copy undocumented pin-level power wiring.

The primary [ADI LTC4054-4.2 datasheet405442xf, page2](https://www.analog.com/media/en/technical-documentation/data-sheets/405442xf.pdf) explicitly maps **LTC4054ES5-4.2 to top marking LTH7**; the X variant usesLTADY. Thus the user's typical LTH7 charger description is consistent with the already owned LTC4054. It does not independently authenticate a purchased die/manufacturer. The reviewed pin contract remains1CHRG,2GND,3BAT,4VCC,5PROG, and the ordinary100mA setting can be retained for the stated500/1000mAh cells pending their ordinary charge-rating check.

Direct local downloads of DMN2056U and ADI PDFs failed with403/timeout during this pass; the primary PDFs were read through the web tool and the failures are preserved in `../evidence/sources/simplified_adc_source_manifest.json`. No local PDF is claimed where that manifest saysnot_saved. No CAD, root-owned scripts or firmware were changed.
