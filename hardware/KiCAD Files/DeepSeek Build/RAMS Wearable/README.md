# RAMS wearable — JLCPCB implementation in revision

**2026-11-09 owner correction: simplify around the working S3 Supermini prototype.**

The current native schematic and board are **J2, a 3.3 V AP2112 LDO design**, with a separate switched raw battery/USB supply for the RGB LED. The earlier TPS63020 buck-boost / 3.45 V candidate is superseded and archived. Routing is in progress; the latest 90-footprint circuit still needs final ERC/DRC and connectivity checks bound to its final hashes. **This is not a manufacturing release.**

The owner wants the functions of the working ESP32-S3 Supermini, Ra-02, active buzzer, battery divider and single 3.7 V LiPo integrated onto one customized bare-chip PCB. The buzzer clarification is resolved: a DC supply produces a tone, and the owned stock is `9650 Active 3V`. Minimize cost and additional purchases. Preserve the original 42 x 32 mm envelope, top-side heatbed assembly and bottom-side hand-soldered LoRa. The unknown-reflow-rated buzzer is hand-soldered after reflow using accessible lands. DOST remains deferred.

See [the corrected design brief](docs/SIMPLIFICATION_20261109.md). The superseded native sources and generator are retained with hashes in `verification/superseded_buckboost_20261109/`. Original Antigravity Rev A/B/C files remain untouched.

J2 uses owned AP2112K-3.3, LTC4054/LTH7 charger, protection and NPN buzzer driver. The ADC uses one DMN2056U-7 MOSFET with a 30k/10k divider: build with `RAMS_JLC_S3_J2` for calibrated millivolt reads and ratio 4; the default SuperMini configuration retains ratio 2. Reset uses a conventional 10k/1uF RC. See [parts and firmware](docs/PARTS_AND_FIRMWARE.md).

The ordered WS2812B-2020 listing says DC5V and does not identify its exact revision. **Q5, another owned AO3401, switches raw SYS_IN power to LED_PWR** for battery and USB operation. SW1 grounds Q5's gate in ON and LDO enable in OFF; R7 and R41 are pull-ups, so the switch carries only control current. **U6 SN74LVC1T45DBVR translates GPIO48 data to the LED supply and provides power-off isolation**. C34 and C35 independently bypass its two supplies; C28 bypasses LED1. This is a logic translator, not a power converter. See [raw LED supply review](docs/LED_RAW_SUPPLY_REVIEW.md).

LED1 is left unpopulated for initial power checks, then fitted for normal RGB operation after stock geometry, polarity, minimum voltage and current are qualified. Its reference pinout is 1 DO unused, 2 GND, 3 DI, 4 LED_PWR. A nominal 3.7 V cell does not stay at 3.7 V: determine the final low-battery threshold from the accepted LED range as well as the MCU rail. No guarantee of full-discharge LED operation is made.

The [BOM](docs/BOM_PROCUREMENT.csv) contains **90 footprint positions: 82 components and 8 copper test pads**. First power-on uses 80 components, leaving R30 and LED1 absent; normal use fits both after their separate checks. Reuse the owned AP2112, buzzer, switches and suitable passives. Follow [assembly and bring-up](docs/ASSEMBLY_AND_BRINGUP.md) for top heatbed reflow, then buzzer and bottom Ra-02 hand soldering.

Current next steps: close routing and rerun ERC/DRC/parity, inspect all layers and assembly views, bind reports to final hashes, then prepare the engineering handoff. No fabricated boards or physical measurements exist for this project. R30 enables nominal 100 mA charging after the selected 500/1000 mAh cell and harness checks; capacity alone does not establish the permitted charge current.
