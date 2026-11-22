# Hardware exhibit sources

## Fabricated SuperMini carrier

The 50 × 43 mm outline, two through-hole module footprints, three axial resistors, BC547 transistor, buzzer, pads, copper and silkscreen come from the FCS wearable named in the [hardware revision plan](../../../../agent/HARDWARE_REVISION_PLAN.md#2-the-defect-the-prototype-senses-the-regulator-not-the-cell). The KiCad source SHA-256 is `134f3c8346e89b3e01a01a3e8ad55c7eac009f7a1897b2681538b46f6563f649`.

The two module model paths in the FCS file referred to unavailable STEP files. The exhibit reconstructs the SuperMini USB connector, buttons, chip and antenna, and the blue Ra-02 breakout with shield and antenna connector. Their front faces use the component images from figures 1 and 4 in the project’s [research manuscript](../../../Draft/ResQTrack_-A-Smartphone-Paired-Wearable-Accident-Detection-and-LoRa-Alert-System-for-Vulnerable-Road-Users-1.pdf). Page 19 confirms their placement and orientation on the board. The manuscript credits the [SuperMini product listing](https://shopee.ph/product/1021339444/27970387023) and [Ra-02 product listing](https://ph.shp.ee/CMumebV1). Component heights, header standoffs and solder-mask finish are illustrative. The poster is rendered from the exhibit model.

## RAMS Wearable · custom SMD board

The 42 × 32 mm, four-layer layout comes from the [wearable KiCad project](../../../../../hardware/KiCAD%20Files/GPT6%20Astra%20Build/RAMS%20Wearable/README.md). The source board SHA-256 is `cf926980e8fdaecfb1abeb252f0ca73cc0cfbd4e5cad11143fd9a3e0ee21964a`. Its [prototype handoff](../../../../../hardware/KiCAD%20Files/GPT6%20Astra%20Build/RAMS%20Wearable/manufacturing/JLC_PROTOTYPE_20261115/READ_ME_FIRST.md) documents the order package and assembly stages. The exhibit depicts the normal 82-component population, including LED1 and R30. The first-power configuration fits 80 components. The poster uses the source-bound normal-population isometric preview.

KiCad supplies the primary geometric source. The exhibit batches the native meshes by material and maps the source copper plots under the solder mask. The project’s [3D model register](../../../../../hardware/KiCAD%20Files/GPT6%20Astra%20Build/RAMS%20Wearable/docs/3D_MODEL_SOURCES.md) identifies the library origins, component envelopes and approximations used in the design. The accessible geometry represents a CAD assembly. Physical first-article verification remains open.
