# Simplified 3.3 V power review

Date: 2026-11-09, Asia/Manila. Owner clarification after this review: the buzzer is the owned9650 Active3V DC-tone type; earlier passive-buzzer wording below is historical and superseded. ADC selection is now specified in SIMPLIFIED_ADC_POWER_SWITCH.md. **Current owner direction supersedes the TPS63020/3.45 V proposal:** integrate the working S3 Supermini + Ra-02 + passive buzzer + battery divider + single-cell LiPo into a bare ESP32-S3 PCB. Reuse suitable owned parts. This is a circuit recommendation, not a claim that the revised CAD or assembled board already passes.

## Recommendation

Use the owned **Diodes AP2112K-3.3TRG1** as the single 3.3 V regulator. Its 600 mA capability is credible for this BLE/LoRa workload with local bypassing and appropriate thermal/load limits. Remove the buck-boost converter, its power inductor and feedback divider. Do not retain a 3.45 V rail merely to support an optional addressable LED. No new regulator purchase is justified by the evidence presently available.

Retain the straightforward USB/battery selection, single-cell charger, and cell protection appropriate to the actual battery. These functions are independent of whether the main regulator is an LDO. Do not add a supervisor or dedicated battery-sense IC simply because its behavior has not yet been measured. Standard MCU reset RC and the ESP32 brownout facility are the starting point, with normal power-up/down checks.

The stock ledger explicitly lists ten AP2112K-3.3TRG1 devices, LTC4054 chargers, AO3401 devices, SS14 diodes, DW01A and six-pin FS8205A protection devices. Identity/package checks remain necessary when soldering these exact parts; they do not require replacing all stock with newly purchased parts.

## Minimum circuit contract

- AP2112 SOT25/SOT-23-5: **1 VIN, 2 GND, 3 EN, 4 NC, 5 VOUT**. VIN comes from the selected protected USB/battery system supply. VOUT feeds the common +3V3 rail. EN is positively defined on/off by the selected switch arrangement. Leave pin4 unconnected.
- Put 10 uF X5R/X7R input and output capacitors beside the LDO, using available suitable stock. The manufacturer's application uses 1 uF each; 10 uF is the practical starting choice for this radio board, not a newly required converter capacitor bank. Retain the S3's domain decoupling and Ra-02 local 100 nF plus bulk capacitance. An owned 47 uF part can serve the radio/load bulk position after checking its voltage rating and effective capacitance.
- Keep the existing AO3401/SS14 load-sharing topology if USB operation during charging is required. Q1 source=SYS_IN, drain=B_PLUS, gate=VBUS with gate pulldown; SS14 anode=VBUS, cathode=SYS_IN. This orientation prevents USB from charging the cell through the MOSFET body diode. LTC4054 separately charges the cell.
- Preserve the verified six-pin DW01A/FS8205A connections where the battery is unprotected. A protected purchased cell can change what protection is redundant, but its capacity label alone does not establish that. Do not bridge B_MINUS to system GND outside the protection path.
- Keep the battery divider's actual ratio consistent with firmware. Resolve off-state supply from the selected main-switch topology: a divider permanently tied to the cell while +3V3 is disabled must not be declared GPIO-voltage compliant. This is a specific wiring check, not a requirement to restore TPS22919/TLV803E.

Pinout, capacitor minimum, 600 mA capability, 2.5-6 V input range and dropout below are from [Diodes AP2112 DS39724 Rev.2-2, pages1-3 and8](https://www.diodes.com/datasheet/download/AP2112.pdf). The same manufacturer document was saved from its SparkFun mirror as `evidence/sources/diodes_ap2112_sparkfun_mirror.pdf`; SHA256 and failed direct-download attempts are in `simplified_power_source_manifest.json`.

## Current budget for this workload

| Load | Evidence or provisional allowance |
|---|---|
| S3 Bluetooth LE TX | 176 mA at0 dBm, 193 mA at9 dBm, 335 mA at21 dBm; datasheet test peaks at3.3 V/25 C |
| S3 Bluetooth LE RX | 93 mA in the stated peripheral-disabled/idle-CPU test |
| Ra-02 | Current manufacturer product page states105 mA maximum operating current; legacy V1.1 gives93 mA typical TX at433 MHz |
| Passive buzzer and driver | **20 mA provisional budget only**; actual prototype part/current not identified here |
| Divider/control | Small relative to radio current; account for their actual resistor choices |

The [Espressif S3 datasheet v2.2, pages66-67](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf) supplies the BLE figures; [Ai-Thinker Ra-02 product documentation](https://docs.ai-thinker.com/en/Ra-02/index.html) supplies the module bound. These do not establish an assembled-system maximum. For example, 193+105+20 is318 mA; the high-BLE-power example335+105+20 is460 mA. Embedded memory activity, current transients and actual buzzer load still need margin/measurement. Average current is usually lower because these peaks need not persist, but firmware duty cycle must establish it.

Espressif recommends a source capable of at least500 mA for the S3; this is a supply-sizing recommendation, not a statement that BLE continuously draws500 mA. AP2112 meets that capability at its stated electrical/thermal conditions. The simplified board is not a promise of unrestricted600 mA continuous service from USB, arbitrary Wi-Fi/LoRa simultaneity, or extra loads.

Owner correction controls the buzzer selection: use the actual passive prototype transducer, not the newly chosen PUI active buzzer. The purchase ledger calls one pack `9650 Active 3V`, whereas the owner now specifies passive. Also, current `firmware/wearable_withApp/buzzer.cpp` drives GPIO1 HIGH/LOW, without an audible-frequency PWM/tone. A passive magnetic/piezo transducer needs its suitable waveform; retain the existing low-side transistor drive if appropriate and resolve that firmware behavior separately. Do not claim the current DC alert code proves passive buzzer operation.

## Battery operation and dropout

For AP2112-3.3, the published dropout limits are **200 mV at300 mA** and **400 mV at600 mA** (typical125/250 mV). Approximate full-regulation input thresholds, including the upper1.5% output setting, are therefore3.35+0.20=**3.55 V** at300 mA and3.35+0.40=**3.75 V** at600 mA. Add actual harness/MOSFET/cell sag before translating those to battery terminal voltage. These sums describe headroom; they are not a guaranteed system waveform.

Below the needed headroom, the rail follows the declining battery through the LDO's dropout. That behavior is normal for a LiPo-powered LDO and is acceptable while all devices remain within their supply requirements. The S3's specified operating minimum is3.0 V. Use **3.6 V loaded cell voltage as the initial recharge/stop threshold**, then characterize the actual board before extending runtime below it. At that threshold, verify the rail remains above3.0 V during combined alerts/transmissions; target at least3.1 V for measurement margin. This intentionally does not promise operation down to the cell protector's cutoff or the firmware's3.0 V percentage endpoint.

The existing firmware's battery percentage endpoint is not an automatic shutdown policy. If a low-battery stop is required, implement it explicitly using a calibrated measurement. Preserve the hardware cell protector as the final cell-fault safeguard. A500 mAh versus1000 mAh cell mainly changes runtime and sag; it does not change these regulator limits.

## USB heating and operating limits

Use `P_LDO=(VIN-3.3)*I_average`, with regulator quiescent power negligible for these examples. The datasheet's SOT25 junction-to-ambient value is184 C/W; actual copper/enclosure changes it. These are estimates, not measured temperatures:

| Regulator input | Average current | Dissipation | Estimated rise using184 C/W |
|---|---:|---:|---:|
| 4.2 V battery | 0.20 A | 0.18 W | 33 C |
| 5.0 V upper USB-side example | 0.20 A | 0.34 W | 63 C |
| 5.0 V | 0.25 A | 0.425 W | 78 C |
| 5.0 V | 0.30 A | 0.51 W | 94 C |
| 5.0 V | 0.50 A | 0.85 W | 156 C |

The USB Schottky usually reduces LDO input and dissipation, but using5.0 V makes this table conservative relative to a nominal5 V source minus its diode drop. It does not bound every USB source tolerance. At40 C local ambient,250 mA estimates118 C junction. Start with **average USB load at or below250 mA**, use copper around the LDO ground/power connections, and verify temperature in the actual enclosure. Brief radio peaks are different from sustained load. Do not use thermal shutdown as a normal operating mode. A125 C junction engineering target is a project margin, not a newly inferred datasheet absolute rating.

The charger draws its current from USB and dissipates its own heat; its100 mA setting is not an extra100 mA through the AP2112. It still contributes to USB input current and nearby temperature. Retain a conservative charge setting for the500/1000 mAh cells, verify cell polarity/rating, and check charging with the system both off and operating. No integrated charger redesign is needed merely because the LDO is being simplified.

## Closure checks

On the first revised board, measure the3V3 rail during boot, BLE connection/traffic, LoRa TX, passive buzzer alert and their overlap from4.2 V down to the provisional3.6 V loaded cell threshold. Repeat from USB, record average/peak current and steady temperature, and test USB/battery handover. Confirm reset/boot behavior, divider off-state voltage, and charging termination. These observations decide the final operating envelope; a clean CAD report or the prototype's success alone cannot measure the new bare-chip layout.

No CAD, circuit generator, root-owned script or firmware file was changed by this review. The earlier3.45 V electrical review is retained as historical evidence and must not be used as the simplified assembly authority.
