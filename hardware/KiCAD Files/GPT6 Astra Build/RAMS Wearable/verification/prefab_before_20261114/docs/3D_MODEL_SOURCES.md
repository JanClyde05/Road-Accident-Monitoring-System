# 3D model sources and limits

Model audit, 2026-11-13. These attachments improve the KiCad 3D view; they do not change component positions, pads, nets, copper, or the schematic. The authoritative attachment transforms and SHA-256 hashes are in `lib/3d/model_manifest.json`. Models are project-local, with `${KIPRJMOD}/lib/3d/…` paths. Ordinary passives and standard packages retain their installed KiCad models.

## What is represented

| Reference | Asset | Match and qualification |
|---|---|---|
| U2 | `Ra-02_local.step` | Reuses the owner's `D:/KiCad things/3D Models/LoRa_Module_RA-02_AiThinker.step` unchanged. Correct module appearance and 16×17 mm body. The model is 3.03 mm tall; the manufacturer nominal height is 3.2 mm. Allow real connector, cable and solder clearance. |
| SW1 | `MSK12C02_ProtoFlow.wrl` | Free public model named MSK12C02, downloaded from ProtoFlow/FastEDA. Its original placement needed correction; source footprint was saved for comparison only. Model body height is approximately 1.5 mm, and it does not identify the owner's switch batch. |
| LED1 | `WS2812B-2020_ProtoFlow.wrl` | Free public model for the 2.0×2.0×0.84 mm WS2812B-2020 package. Source pad order matches the target footprint. Appearance does not establish supply limits or identify the electrical revision of the ordered stock. |
| ANT1 | `Johanson_2450AT18x100.step` | KiCad's Johanson AT18 family model. Reuses the installed KiCad asset; package appearance does not validate antenna tuning or radiation efficiency. |
| Y1 | `Crystal_ABM8G_package.step` | **Package approximation:** installed KiCad ABM8G model, measured approximately 3.2×2.5×0.64 mm. The circuit specifies ABM8. The official ABM8 STEP download was located but returned HTTP 403. Do not infer exact ABM8 height or frequency marking from this substitute. |
| U1 | `ESP32S3_QFN56_package.step` | **Package approximation:** installed KiCad 7×7×0.92 mm, 56-pad QFN, 0.4 mm pitch. Its exposed pad is 5.6 mm, versus the exact chip's 5.7 mm. The actual verified footprint remains unchanged; model markings and height are generic. |
| BZ1 | `Buzzer_9650_envelope.wrl` | **Illustrative envelope:** original 9.6×9.6×5.0 mm square body with opposing contacts. Exact free CAD for the unidentified owned 9650 stock was not located. Contacts, opening and plus marking are illustrative. Measure the stock height and verify polarity/fit as already required by `OWNED_BUZZER_AND_MECHANICALS.md`. |

Eight PCB test pads intentionally have no component models. A solder land is not a physical part. The downloaded 1.5 mm SK6805-EC15 LED and complete YD-ESP32-S3 development-board models in the owner's folder were rejected because they are different packages.

## Download and license record

- [MSK12C02 part page](https://www.protoflow.ai/library/parts/C431540), [direct WRL](https://www.protoflow.ai/library/parts/C431540/files/SW-SMD_3P-L6.6-W2.7-LS7.8-P1.50.wrl), [source footprint](https://www.protoflow.ai/library/parts/C431540/files/SW-TH_MSK12C02.kicad_mod).
- [WS2812B-2020 part page](https://www.protoflow.ai/library/parts/C965555), [direct WRL](https://www.protoflow.ai/library/parts/C965555/files/LED-SMD_4P-L2.0-W2.0-H0.8-TL_WS2812B-2020.wrl), [source footprint](https://www.protoflow.ai/library/parts/C965555/files/LED-SMD_4P-L2.0-W2.0-TL_WS2812B-2020.kicad_mod).
- [Johanson model upstream](https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/master/RF_Antenna.3dshapes/Johanson_2450AT18x100.step), [ABM8G model upstream](https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/master/Crystal.3dshapes/Crystal_SMD_Abracon_ABM8G-4Pin_3.2x2.5mm.step), [generic QFN model upstream](https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/master/Package_DFN_QFN.3dshapes/QFN-56-1EP_7x7mm_P0.4mm_EP5.6x5.6mm.step). These three files were copied from the installed KiCad 10.0.6 library, rather than downloaded again.
- [Official Abracon ABM8 STEP ZIP](https://abracon.com/Support/STEP/Resonators/ABM8.STEP.zip): located but not downloaded; the server returned HTTP 403. No manufacturer-exact ABM8 model is claimed.
- [Ai-Thinker documentation](https://docs.ai-thinker.com/en/Ra-02/index.html) and [manufacturer front/back dimensions and pinout](https://aithinker-static.oss-cn-shenzhen.aliyuncs.com/docs/Public%20Document%20Center/LoRa/lora/Specification/Ra-02_V1.1%E8%A7%84%E6%A0%BC%E4%B9%A6-20260629.pdf), pages 9–10, establish the Ra-02 model orientation. A copy and rendered pages are under `verification/model_audit/`.
- [Buzzer geometry reference](https://en.jlg-sound.com/productshow-46057459.html); also see the saved manufacturer drawings and stock-fit caveats in `OWNED_BUZZER_AND_MECHANICALS.md`.

KiCad's library license is saved as `lib/3d/LICENSE_KiCad.md`: CC-BY-SA 4.0 with a design-use exception. Original file headers are retained. The older QFN file itself carries a GPL-3.0-or-later notice with a design-use exception; retain that header as well. The two ProtoFlow assets were freely downloadable without an account, but an asset-specific redistribution license was not stated in their files or download pages. The local Ra-02 STEP has an Autodesk export timestamp of 2020-08-19; its archive contains only STEP/F3D and supplies no original author, download URL, or license. No open-license grant is inferred for those files. The original buzzer envelope is CC0-1.0.

## Placement and verification

All scales remain 1. KiCad VRML uses 2.54 mm per model unit; STEP uses its declared millimetres. Transform values below are applied **before** footprint rotation and automatic bottom-side flipping:

| Reference | Offset X,Y,Z (mm) | Rotation X,Y,Z (degrees) | Reason |
|---|---|---|---|
| U2 | -8, +8.5, 0 | 0, 0, 180 | Local STEP is corner-origin: raw bounds X=-16…0, Y=0…17, Z=0…3.03 mm. This centers it and places U.FL by pad 1 in the unflipped top-side convention. |
| SW1 | 0, -1, 0 | 0, 0, 180 | Aligns the body and asymmetric terminals; actuator faces the footprint's positive Y side. The source footprint's zero offset did not align this model. |
| All other replacements | 0, 0, 0 | 0, 0, 0 | Centered library convention. |

`scripts/apply_models.py` checks component identity and asset hashes before attaching models. Its command-line mode requires a new output filename and protects the input; the integrating editor can call `apply_models(board)` directly. Private native KiCad renders and geometry checks live in `verification/model_audit/`. Those inspection boards are not manufacturing sources. Render the final active PCB again after integration, so the delivered views match the final silkscreen.

WRL models work in KiCad's 3D viewer and native image renderer. They are not STEP solids and must not be assumed present in a mechanical STEP export. These views establish model visibility, nominal placement and orientation, not enclosure qualification or solderability.

Coverage inspection resolves models for all 82 physical component footprints; eight test pads intentionally have none. `verification/model_audit/model_coverage.json` records the inspection snapshot. The normal active-board render follows the first-power DNP population: LED1 and the independent R30 charger-enable link are intentionally absent. The separate `previews/final/top_3d_normal.png` view shows the proposed normal population by clearing **only LED1 and R30's DNP flags in a private derived board**. Its matching isometric view uses the same derived board. These previews do not change the active board, BOM, assembly population or the required LED qualification.

The original buzzer envelope's top decorations initially lay on or below the body surface and disappeared in the native render. Their centers were raised 0.002 mm above the nominal 5 mm body surface to prevent coincident faces. The prior asset is retained as `verification/model_audit/buzzer_envelope_before_visibility.wrl`; the manifest hashes were updated. This is a cosmetic rendering correction, not a changed buzzer height specification.

## Lessons retained

1. A footprint can carry a model path that does not exist. The installed MSK12C02, WS2812B-2020 and Ra-01 model references were broken; a syntactically valid path is insufficient.
2. A downloaded model may have a corner origin or incorrect source transform. Ra-02 required a center shift and 180-degree rotation; MSK12C02 required both rotation and an offset. Check geometry against pads and pin 1 before attaching.
3. A visually similar package does not identify a part or voltage rating. Keep package approximations, stock uncertainty and exact electrical footprints separate in the record.
4. A library asset should not silently replace a verified footprint. Only the model attachments are used; downloaded source footprints remain comparison records.
