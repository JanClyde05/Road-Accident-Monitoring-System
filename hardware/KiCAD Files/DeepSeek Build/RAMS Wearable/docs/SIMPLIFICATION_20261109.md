# Corrected implementation brief — 2026-11-09

> **Later clarification on the same date:** the owner confirmed a buzzer that emits a tone on DC3V/5V through an NPN, and requested the owned `9650 Active 3V` SMD stock. The passive-buzzer statements below record the earlier uncertainty and are superseded by this clarification. J2 preserves the existing on/off firmware cadence and uses that active buzzer. The revised schematic now uses AP2112, standard resetRC, and one DMN2056U-7 with30k/10k battery sensing. The ordered2020LED listing still saysDC5V; its package size does not certify3.3V operation.

## Owner requirement and correction

The owner has a working prototype comprising an ESP32-S3 Supermini, Ra-02 LoRa module, passive buzzer, battery-voltage divider and 3.7 V LiPo connected to the Supermini BAT+/BAT- pads. Its onboard supply powers the system at nominal 3.3 V. The purpose of this PCB is to integrate those functions with a bare S3 and optimize size/cost, not add a more elaborate power architecture.

The prior implementation selected a TPS63020 buck-boost and 3.45 V rail, with an inductor, precision feedback network and associated changes. Keeping a fixed rail deeper into cell discharge was an engineering preference, not an owner requirement. Selecting a particular RGB LED around that rail compounded the complexity. The design should have checked the simpler owned linear regulator first. **That selection is withdrawn.** Do not carry its parts list or ERC result into the new revision as accepted evidence.

## Revised decisions

| Question | Decision and evidence status |
|---|---|
| Converter required? | No demonstrated requirement for buck-boost operation. Remove it from the intended architecture. |
| Supply approach | Nominal 3.3 V LDO; evaluate owned AP2112K-3.3TRG1 first. Its exact suitability depends on battery dropout, simultaneous load and USB-powered dissipation. A successful prototype establishes feasibility of this general approach, not the identity/rating of an unseen board's regulator. |
| Reuse | Prefer owned regulators, transistors, diodes, passives and mechanicals when pinout, rating and geometry fit. Do not require premium replacement parts merely to obtain a named BOM. Resolve actual missing specifications without claiming generic parts are verified. |
| MCU | Bare ESP32-S3FH4R2 with its necessary crystal, RF, decoupling and boot/USB support. These support parts replace circuitry already present on the Supermini. |
| LoRa | Existing Ra-02 and existing GPIO/radio/protocol contract. Bottom hand solder after top reflow. |
| Buzzer | Owner specifies passive. Prior PUI active-buzzer selection is withdrawn. Actual transducer identity/size remains unknown. Current repository code uses DC on/off rather than audio-frequency drive; reconcile the prototype code and use PWM/tone as needed without changing alert cadence. |
| Battery sensing | Simple divider is the starting point. Evaluate its supply and off-state behavior together with actual power switching; do not automatically preserve the prior supervisor/load-switch circuit. |
| Charging/protection/USB | Reproduce the functions actually required by the battery-powered, USB-programmable prototype. Check exact power/charging topology and cell protection; do not infer charger identity from the unsupported TP4056 code comment. |
| Indicators/controls | Do not let an optional indicator dictate supply architecture. Reconcile existing used features before selecting a replacement or deleting a required control. |
| Layout/manufacturing | At most 42 x 32 mm, top reflow and bottom Ra-02 hand solder. Layer count is subject to revised RF/return-path and cost review. No DOST implementation. |

## Known tradeoff to review

A linear regulator loses regulation when its input approaches the requested output; it does not boost a nearly discharged cell. For the AP2112, the manufacturer's 3.3 V table gives dropout up to 200 mV at 300 mA and 400 mV at 600 mA under its specified test conditions. These are regulator-input values, not a guaranteed battery cutoff for this complete circuit. USB-fed heat is approximately `(VIN - VOUT) * IOUT`; assess the actual load and PCB thermal path. Do not assert a 600 mA label proves either thermal suitability or a need for a switcher.

Source: [Diodes AP2112 datasheet, DS39724 Rev.2-2](https://www.diodes.com/datasheet/download/AP2112.pdf), 3.3 V electrical-characteristics table and application/thermal guidance. Exact received Supermini revision and passive-buzzer identity have been requested. The project's InnovateX draft paper, `ResQTrack_-A-Smartphone-Paired-Wearable-Accident-Detection-and-LoRa-Alert-System-for-Vulnerable-Road-Users-1.pdf`, page12 Figure1, contains a Supermini front/back product illustration with B+/B- pads and cites [Shopee product 1021339444/27970387023](https://shopee.ph/product/1021339444/27970387023). This identifies a listing, not the received revision or regulator/charger IC. No actual assembled-prototype photograph was found.

## Preserved work and invalidated claims

The original Antigravity projects remain untouched. Earlier new-project native sources are preserved in `verification/superseded_buckboost_20261109/` with SHA256 hashes. The current root CAD still represents the superseded architecture until the simplified revision is captured; it is not a release package. Earlier BOM, assembly instructions, electrical review and schematic reports are historical evidence for that candidate only. No purchase, fabrication submission, physical assembly or successful hardware operation is claimed.

Valid reusable work includes exact S3 package/pin verification, the original-board defect audit, firmware GPIO contract, project-local library work, and detection of underside via-in-pad mistakes. Each reused item still requires checks against the revised final circuit/layout. Do not preserve unnecessary circuits simply because effort was already spent implementing them.
