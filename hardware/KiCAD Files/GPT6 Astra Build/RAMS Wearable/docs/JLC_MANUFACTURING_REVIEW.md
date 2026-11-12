# J2 JLCPCB manufacturing review

Reviewed 2026-11-12 (Asia/Manila). Scope: **42 × 32 mm, four-layer J2 AP2112 board**, bare-board fabrication and owner's top heatbed assembly, followed by buzzer and bottom Ra-02 hand soldering. No files were submitted, quotation obtained, or order placed. DOST is outside scope.

This review is a supplier-rule comparison, **not a manufacturing release**. Final connectivity, copper fills, geometry and export identity must come from the final source-bound validation report. The first read-only dimensional inspection used KiCad 10.0.6 and board snapshot SHA256 `be37fb41878c18c9e9a94378314ce31a3467091686915a6a40507fe779ffeef7`. The subsequent QFN correction was independently checked against board SHA256 `92a93a97135f37c880bc354b1857d5ebfd20f2f813561131891aba75d3b14915`, as recorded below. These snapshots establish the inspected dimensions, not the identity of later exports.

## Fabrication configuration and comparison

Use FR-4, four layers, nominal 1.6 mm, 1 oz outer / 0.5 oz inner copper, routed outline, green mask, white legend. **ENIG is the project preference** for a flat fine-pitch assembly surface, not a claim that JLC requires ENIG for this rectangular QFN. Avoid automatic stackup substitution. Bare-board manufacture does not require buying JLC assembly or adding its assembly-panel tooling to this hand-assembled board.

The following supplier limits were checked against [JLCPCB rigid PCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities). Dimensions are millimetres.

| Check | Published limit or recommendation | Inspected board / assessment |
|---|---|---|
| Multilayer 1 oz trace/space | 0.09 / 0.09 | Minimum routed width 0.15; configured clearance 0.15; final DRC required |
| Preferred via drill / economy diameter | 0.20 / at least 0.45 | Actual combinations 0.45/0.20, 0.50/0.20 and 0.60/0.30, diameter/drill |
| Non-plated holes | At least 0.50 | USB pegs 0.65; switch pegs 0.85 |
| Plated slots | Table 0.35 multilayer; description 0.50 | USB slots 0.60 × 1.40 or 1.70; satisfy both widths and length ≥ twice width |
| Multilayer PTH annulus | 0.20 recommended; 0.15 absolute | USB shell slot annuli 0.20 in both axes |
| Pad hole-to-hole / via hole-to-hole | 0.45 / 0.20 | Pad-pair minimum 0.8049; pad-to-via minimum 0.4629; final via audit required |
| PTH hole-to-track / inner copper | 0.28 / 0.30 | Minimum foreign track/via copper from drilled component holes 0.5170; shell holes are GND and inner zones are GND |
| Routed copper-to-edge | At least 0.20 | Project rule 0.25; final DRC required |
| SMD pad / pad gap | 0.25 × 0.25 / 0.15 | U1 corrected to 0.80 × 0.25; all 56 perimeter lands checked; other numbered SMD lands meet minimum dimensions |
| Green-mask bridge | At least 0.10 | U1 native geometry has 0.15 web; final Gerber inspection still required |
| Legend stroke / height / pad gap | 0.15 / 1.0 / 0.15 | Strict native rules configured; final DRC required |

Hole gaps above use KiCad effective hole/copper shapes, including rotated slots, with collision-distance binary search resolution 0.0001 mm. Same-net copper attached to plated ground holes is excluded from foreign-copper comparisons. These measurements do not model drill registration or finished-hole tolerances. The actual purchased USB and switch locating pegs still need mechanical fit checks.

## QFN land-width correction

The inspected U1 perimeter lands were **0.80 × 0.20 mm at 0.40 mm pitch**. Their width conflicts with the generic JLC minimum. An [exact-size question on JLC's Q&A](https://jlcpcb.com/help/answers/detail/1025-Are-0.35mm-pin-pitch-QFNs-supported) was found, but the accessible page has no answer; it is not an exception or supplier acceptance.

Implemented correction: increase only the narrow copper dimension to **0.25 mm**, retaining centres, 0.80 mm length, pin numbering and 5.70 mm exposed pad. The resulting adjacent copper gap is `0.40 − 0.25 = 0.15 mm`. The [Espressif S3 v2.2 datasheet](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf), Figure 7-2, gives FH4R2 lead widths 0.15/0.20/0.25 mm (minimum/nominal/maximum). Thus the revised width covers the maximum nominally centred lead and meets JLC's published minimum.

This is a documented project DFM adaptation, not a verbatim manufacturer footprint. The datasheet-linked [Espressif ASC land pattern](https://www.espressif.com/sites/default/files/chips-dxf/ESP32-S3_Footprint.asc) has width/pitch ratio `330000/600000` and length/pitch ratio `975000/600000`, corresponding to 0.22 mm width and 0.65 mm length at the specified 0.40 mm pitch. Its pad-centre offset is 3.425 mm; this project already used 3.45 mm and longer outer lands. No pin-centre or exposed-pad movement is needed to correct the width.

Paste volume is controlled: a local −0.025 mm paste margin on each perimeter land gives **0.75 × 0.20 mm apertures**, rather than enlarging paste with the copper. Independent read-only checks found all 56 perimeter pad sizes and relative centres equal between the native board and local library, with −0.025 mm paste margins and zero paste ratios in both. The exposed pad remains 5.70 × 5.70 mm. Effective solder-mask expansion is zero; native shape collision-distance measurement gives a minimum perimeter web of 0.149999 mm (numerical search tolerance), corresponding to nominal **0.15 mm**, above 0.10 mm. The project's mask-minimum-width setting is zero, so this explicit geometry measurement is needed in addition to DRC.

The local footprint SHA256 is `969f865a894baee6ac61f2aa1d45c6207cdc879fe7c0f9f86fa31fb95156a94a`. `verification/baseline/qfn_usb_refill_drc.json` reports **zero violations, zero unconnected items and zero schematic parity findings**, with no ignored checks, after refill/save. The dimensional correction is **verified in native CAD**; final exported mask/paste inspection and binding to the release snapshot remain separate checks.

## Stackup and impedance

The CAD stackup target matches [JLC04161H-3313](https://jlcpcb.com/impedance): outer copper 0.035 mm, each outer dielectric 0.09940 mm, inner copper 0.0152 mm, core dielectric 1.265 mm; prepreg Er 4.1, core Er 4.6. Keep In1 as the continuous ground reference. These are published stackup values, not a quotation or fabrication commitment.

The published calculator mask model is 0.03048 mm above substrate and 0.01524 mm above copper, Er 3.8. CAD's generic mask thickness is not a substitute for that field-solver model. The 0.18 mm RF trace / 0.15 mm side gap and 0.15 mm USB width / 0.15 mm pair gap remain **geometry targets**, not certified 50 Ω / 90 Ω impedances. Close this gate with the selected stackup's field-solver calculation or supplier review of the final cross-section and geometry; retain actual conditions. Length matching and zero DRC do not close it.

## Stencil and assembly

Propose **0.10 mm stainless stencil**, consistent with [JLC's 0.4 mm pitch guidance](https://jlcpcb.com/blog/how-to-choose-a-solder-paste-stencil). For the proposed 0.75 × 0.20 mm rectangular aperture, area ratio is `LW/[2t(L+W)] = 0.789` at 0.10 mm thickness. This is a geometric calculation, not a paste-release measurement. Small passives, the connector and the actual paste still need an acceptable print/reflow trial.

U1's 16 exposed-pad windows, each 1.12 mm square, provide `16 × 1.12² / 5.70² = 61.8%` nominal coverage. Nine 0.20 mm thermal drills remain inside the exposed copper. Avoiding paste directly over the holes reduces direct deposition but does not prove no solder wicking. Tenting flags do not make these holes filled/capped inside an open exposed-pad mask. Confirm the chosen via treatment and inspect the hidden joint/process; do not silently add paid via-in-pad fabrication or claim the joint is verified.

Preserve the deliberate paste artwork and staged exclusions. [JLC's stencil capabilities](https://jlcpcb.com/capabilities/pcb-stencil-manufacturing) state that production apertures are normally optimized unless exact paste-layer reproduction is requested. A future order remark should require the reviewed F.Paste apertures 1:1, retaining the exposed-pad windows and excluding first-power R30/LED1 and hand-soldered BZ1. The top stencil must not include the bottom Ra-02. Review the actual stencil production preview before accepting it.

## Remaining release and physical gates

- Record the QFN correction and final native ERC/DRC/parity, filled-plane, mask/paste and visual checks against the exported source hashes.
- Resolve RF/USB impedance using the actual ordered stackup and finish; supplier DFM acceptance and current price/lead time remain unknown until an authorized quotation. No timing or cost is promised here.
- Match received USB connector, switches, 9650 buzzer, FS8205A protection MOSFET and WS2812B-2020 geometry/polarity to their qualified footprints. The generic LED listing does not establish a revision or full-discharge battery operation.
- Verify the actual solder paste alloy/profile and measured heatbed board temperature. Hand-solder buzzer after top reflow, then bottom Ra-02; do not heatbed the populated bottom.
- Follow [assembly and bring-up](ASSEMBLY_AND_BRINGUP.md) for the selected cell/harness, charging/protection, rail droop and AP2112 temperature, ADC transients, USB orientations, LED timing/voltage, oscillator and RF tests. These are physical gates; none has been represented as passed by this review.

Manufacturing files may be prepared as an engineering review package while these gates remain visible. Do not label that package fabrication-ready or an electrically proven board.
