# DOST-ASTI EPDC fabrication constraints and feasibility gate

Planning record, 2026-10-30. **No CAD changes, supplier acceptance, quotation, order or manufacturing release are represented by this document.**

## 1. Decision that must precede layout

The original bare ESP32-S3 QFN footprint and the original USB-C footprint do **not** satisfy the supplied EPDC minimum copper spacing. Increasing track widths, replacing vias or changing the MCU alone cannot correct all these conflicts. The implementing AI must close the architecture and connector feasibility gate before routing a board for EPDC.

Keep two separate questions:

1. **Can EPDC fabricate the copper, holes and mask of this exact board?** Evaluate the final geometry against Annex A and any written project-specific exceptions.
2. **Can the selected assembler mount these exact components?** The user currently intends to solder the bare board. An optional EPDC assembly quote is a separate service, not assumed authorization or a fabrication capability waiver.

The earlier Rev C claim that EPDC forbids QFN is contradicted by the supplied Citizen's Charter: page 32 explicitly lists **QFP/QFN assembly**. Annex A excludes grid-array types; that wording is not a blanket exclusion of QFN. Neither statement approves the particular ESP32-S3 land pattern, paste openings or exposed-pad process.

## 2. Source hierarchy and provenance

The actual supplied documents are the source for this chapter, not copied notes from another repository.

| ID | Source in `docs/For PCB Ordering - DOST/` | Relevant location | Scope |
|---|---|---|---|
| DOST-A | `Annex A Manufacturing Specs_EPDC-MAN-PM-001_rev 2.pdf` | PDF page 1, printed page 3 of 3; EPDC-MAN-PM-001 Rev 02, 28 September 2026 | Detailed fabrication and assembly limits |
| DOST-C | `DOST-ASTI-Citizens-Charter 2026.pdf` | PDF/printed pages 31-32 | Published fabrication, assembly and stencil fee categories; not a project quote |
| DOST-B | `EPDC BROCHURE 2026.pdf` | Manufacturing Services section, PDF page 2 | Broad capability summary; does not override detailed geometry limits |
| DOST-F | `PCB-Manufacturing-and-Assembly-Inquiry-Form.pdf` | PDF page 1; EPDC-SM-FM-002 Rev 2, 13 June 2025 | Required inquiry fields and file-format directions; supplied copy is populated and signed |

DOST-A was read as text and visually inspected. DOST-C page 32 was visually inspected. DOST-F was visually inspected because text extraction omitted its populated entries. It has **zero canonical AcroForm fields and zero Widget annotations** in the supplied copy; absence of form fields does not mean it is blank. Do not reuse its personal details, board dimensions, quantities, checkboxes or signature. A generated preview and extracted copy of that form were removed from this handoff; the original remains untouched.

The form's direction to send files is vendor process information, **not** an instruction from the owner to send anything. No email, signature, submission or order is authorized by this plan.

SHA-256 identities:

```text
DOST-A  828cd4c70df16a1f69586ff0ddfffc977cefb5bb4eda86f3cbd4906106a3c2cc
DOST-C  586e6ac7133fc6511fe35a3901dfc22911673c8494fb3b8b6b21d4defc2ec26f
DOST-B  92346fc2cef505b95cebe8fab9a9ea3317a9cc8a210ff81b7bfc2e7eedd95c5d4
DOST-F  80b85e11acbad77c1638163941951276571120f4e59ddb2ed46920f9ae876cd9
```

Supporting evidence: `evidence/dost/annex-a-page-1.png`, `evidence/dost/charter-page-32.png`, extracted source text, and `evidence/dost/rev-a-critical-pad-geometry.json`. The geometry JSON records KiCad version, board hash, references, actual pad coordinates, pad sizes and drill sizes. It is a targeted measurement, not full-board DRC.

## 3. Fabrication limits to encode and verify

All supplier limits below come from DOST-A, PDF page 1, PCB Fabrication items 1-20. Millimetre values are used as printed; parenthetical mil values in the source are rounded equivalents, not competing more permissive limits.

| Parameter | Supplied EPDC specification | Planning consequence / acceptance evidence |
|---|---|---|
| Maximum design dimensions | 190 x 250 mm | Check board and any supplier panel; do not infer minimum board or panel dimensions |
| Material | FR4 only; client may provide own PCB | Client-supplied material does not automatically waive process limits |
| Board thickness | 1.6 mm only | Obtain tolerance; check connector/enclosure fit and RF calculations |
| Copper | 35 micrometres / 1 oz | Obtain tolerance and stackup details; nominal copper is not a controlled-impedance guarantee |
| Layers | 1 or 2 | Plan two layers; do not design inner planes for this process |
| Pattern width | 0.30 mm minimum | All routed necks, thermal spokes and narrow copper features need review; clarify how the limit applies to component lands |
| Pattern space | 0.254 mm minimum for 35 micrometre copper | Check pad-to-pad, pad-to-track, track-to-track and zone clearances, not only net-class settings |
| Minimum hole diameter | 0.40 mm | Original 0.30 mm vias fail; use only accepted tools and check finished-hole semantics |
| Minimum slot | 1.0 mm | Treat as a minimum slot width pending confirmation of their definition, slot plating and tool capability |
| Annular ring | 0.254 mm minimum | Apply to vias and plated component/connector holes; recompute after drill rounding |
| Through-hole connection process | Chemical-free organic conductive polymer paste; not recommended for high-current applications | Do not assume electroplated copper barrels, conventional current ratings, via filling, RF performance or thermal performance |
| Board edge to copper | 0.30 mm | Inspect tracks, pads, pours and copper graphics at routed boundaries; ask about internal cutouts |
| Silkscreen line width | 0.15 mm minimum | Use at least this stroke; source gives no minimum font height or silk-to-mask clearance |
| Solder mask colours | Green, black, blue, red, orange, white, yellow, pink, purple, subject to availability | Colour is not yet a confirmed order condition; mask tolerances/dams are not supplied |
| Silkscreen colours | Black or white, subject to availability | Do not import choices from the populated sample form |
| Surface finish | Bare copper or immersion tin | Do not request ENIG/HASL as if listed; confirm selected finish and storage/assembly requirements |
| Isolation | Basic isolation; rubout adds cost | Clarify residual copper removal and its interaction with ground-plane/RF geometry; do not let CAM remove intended GND |
| Design format | Gerber RS-274X | Export matching drill data and layer map; exact drill-format details require confirmation |
| Lead time | Determined from client design | Published hours elsewhere are not a guaranteed delivery promise |

**Listed drills, exactly:** 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.5, 1.6, 1.8 and 2.0 mm. The document describes conversion to millimetres and rounding to the nearest 0.1 mm, but this does not establish availability of every tenth-millimetre tool: 1.1, 1.3, 1.7 and 1.9 mm are not listed. Holes above 2.0 mm, precision non-plated holes and routing alternatives remain supplier questions.

### Nominal via calculation

For a circular pad and drill, nominal annular ring is `(pad diameter - drill diameter) / 2`.

```text
Minimum nominal pad = 0.400 + 2(0.254) = 0.908 mm
Candidate pad/drill = 0.950 / 0.400 mm
Candidate nominal ring = (0.950 - 0.400) / 2 = 0.275 mm
```

The 0.95 mm pad is an engineering starting choice, **not an EPDC-prescribed diameter or a tolerance guarantee**. Ask whether the ring minimum is nominal design geometry or a minimum after registration/drill tolerances. The margin above 0.254 is only 0.021 mm per side; enlarge where tolerances demand it. An original 0.60/0.30 mm via has a 0.15 mm ring and fails both hole and ring limits.

Do not invent a 0.254 mm hole-to-hole limit from the copper-spacing rule. Drill-to-drill, drill-to-edge, slot-to-copper, registration, milling radius and hole tolerance are distinct unspecified requirements.

## 4. Measured conflicts and traps in the existing design

Measurements below use the unchanged Rev A PCB at `hardware/KiCAD Files/Antigravity Build/RAMS - PCB/RAMS - PCB.kicad_pcb`, SHA-256 `cccc6209cfafdab1f8c6d15217eb72f07c533188559bad071022571ead0909b4`. Pad geometry was read with KiCad pcbnew 10.0.6. These measurements describe that file, not unmeasured Shopee parts.

| Feature | Measured geometry / calculation | Result under supplied default limits | Required resolution |
|---|---|---|---|
| U1 QFN-56, 0.4 mm pitch | Adjacent pads are 0.20 mm wide along pitch; gap = 0.40 - 0.20 = **0.20 mm** | Below 0.254 mm copper space; pads also have 0.20 mm narrow dimension whose treatment under pattern-width rule needs clarification | Written acceptance of exact land pattern/process, or an architecture/fabricator change |
| J1 USB-C fine-pitch contacts | Adjacent 0.30 mm wide pads at 0.50 mm pitch: gap **0.20 mm** | Below 0.254 mm space | Resolve connector/breakout or supplier exception before routing |
| J1 larger adjacent power/ground pads | 0.60 mm wide at 0.80 mm pitch: gap **0.20 mm** | Also below 0.254 mm space | Checking only the central signal row misses this conflict |
| J1 front shell slots | Drill 0.60 x 1.70 mm, copper pad 1.00 x 2.10 mm | Slot width below 1.0; nominal ring is 0.20 mm on corresponding dimensions, below 0.254 | Exact tab drawing and accepted mechanically sound land pattern |
| J1 rear shell slots | Drill 0.60 x 1.20 mm, copper pad 1.00 x 1.60 mm | Same failures | Same gate |
| J1 locating holes | 0.65 mm round NPTH in existing footprint | 0.65 is not a listed tool and rounding/tolerance can change fit | Match real peg diameter and approved finished hole; do not silently round |
| C13 0402 capacitor example | Pad centres 0.96 mm apart, pad length 0.56 mm along separation: gap **0.40 mm** | This local pad gap exceeds 0.254 | Still check trace escapes, neighbouring copper and actual component land pattern |
| R1 0402 resistor example | Centres 1.02 mm apart, pad length 0.54 mm: gap **0.48 mm** | This local pad gap exceeds 0.254 | Do not discard all 0402 inventory just because the MCU footprint fails |

For QFN, simply shrinking pads until a calculator reports enough clearance is not a solution. `0.400 - 0.254 = 0.146 mm` is the maximum equal pad width that would leave that gap; it is **not** an approved ESP32 land pattern. It creates an assembly/land-pattern conflict and may violate the pattern-width rule. Similarly, necking below 0.30 mm to escape the QFN is not permitted by the default rule set.

For USB, substituting 1.0 mm circular shell holes is not automatically valid. The existing slot length is not the actual metal-tab dimension. Obtain the connector drawing and measure the purchased part, calculate the required enclosing hole with tolerance, check annular ring and adjacent copper, and perform a 1:1 fit test. Do not omit structural tabs or enlarge holes by guesswork merely to clear DRC. Replacing shell holes also leaves the contact-spacing failure unresolved.

A larger board helps routing congestion, but cannot change fixed pad pitch. A WROOM module would change the MCU footprint and RF architecture, but would not by itself fix J1, power, assembly or enclosure issues. A module mounted on normal PCB lands is different from requesting that EPDC fabricate castellations in the carrier's board edge; ask the correct question.

## 5. Architecture branches for a parts-first design

The implementing AI must prepare a short comparison using the actual owned inventory and enclosure requirements. It must not silently buy a WROOM module or assume a SuperMini dev board is one.

| Branch | Part-reuse implication | Evidence needed before selection |
|---|---|---|
| Exact bare-chip design, EPDC accepts finer geometry in writing | Can preserve the purchased bare IC and antenna | Acceptance must name exact pitch, pad gaps, width, vias, USB pattern, mask and assembly process; do not infer from a general capability email |
| EPDC carrier for an already-owned complete dev board/module | Can avoid new MCU purchase if suitable hardware is actually owned; some bare-chip RF/crystal parts become unused | Exact board model, dimensions, pin availability, native USB, power/backfeed behaviour, antenna clearance, memory variant, mounting and enclosure fit |
| EPDC carrier plus a fine-pitch daughterboard fabricated elsewhere | May reuse bare IC, but adds board/interconnects and RF/power complexity | Separate DFM and test gates for each board, stackup/RF design and owner acceptance of extra cost/volume |
| New suitable module on EPDC board | New purchase, possibly different firmware/memory and unused RF inventory | Approved exact SKU, land-pattern compatibility and antenna architecture; do not attach the discrete ceramic antenna to an integrated-antenna module by assumption |
| Corrected main board at another fabricator | May preserve the most purchased parts | Owner decision changes the requested EPDC constraint; compare actual costs and supplier rules without claiming EPDC compliance |

For every branch, resolve USB separately: a compatible owned connector, an accepted exact fine-pitch exception, an external USB breakout with measured pinout/mechanical fit, or a justified replacement connector. A power-only connector is not an equivalent replacement if native USB programming/data is required.

## 6. Assembly, RF, ground and thermal implications

DOST-A assembly limits: consignment parts; polyimide stencil with maximum component area 210 x 250 mm; 0201 minimum chip package; surface-mount types except grid arrays; radial/axial through-hole components; IPC-A-610 as an acceptance reference; lead-free solder/flux. DOST-C page 32 lists QFP/QFN separately in its fee table. These are capability categories, not proof of successful assembly of a particular exposed-pad or fine-pitch design.

For self-assembly, the bare QFN exposed pad still needs a practical solder-paste/reflow/rework method and inspection access. Do not substitute hand soldering of perimeter pins for a verified ground/thermal-pad joint. For any outsourced assembly, confirm exact QFN, bottom-pad stencil, paste type, inspection, rework, consignment packaging, spare quantities and testing scope. The 0201 capability concerns assembly; it does not override PCB pattern limits.

The polymer-paste through-hole process requires explicit scrutiny for battery current paths, regulator return, LoRa/MCU current pulses, USB shield returns, RF ground transitions and exposed-pad thermal vias. Neither a 0.95 mm via diameter nor a count of 20 ground vias proves current capacity, low resistance, RF return quality or thermal performance. Prefer short continuous same-layer high-current paths where possible, while retaining a continuous return/reference strategy. Quantify current, resistance and voltage-drop budgets; obtain process data or verify representative coupons. Do not invent a safe current rating.

The annex gives nominal board/copper thickness but no dielectric constant, dielectric thickness tolerance, impedance tolerance or controlled-impedance service. Calling a net class `RF_50R` does not establish 50 ohms. A 0.30 mm trace is only a width; obtain stackup/process details and calculate the chosen microstrip or coplanar geometry. Verify the ground-plane shape after isolation/rubout and keepouts, and plan RF tuning/measurement. USB differential impedance likewise needs geometry and stackup; a short full-speed USB route is not exempt from electrical verification.

No via plugging, filling, capping, tenting reliability or via-in-pad capability is specified. Do not place paste-process holes inside an exposed-pad stencil aperture without confirmation of solder-wicking/voiding and assembly implications. The dense thermal-via pattern from a commercial electroplated board may be unsuitable here.

## 7. Supplier clarification packet to prepare, not send automatically

Provide annotated land-pattern drawings and a small dimensioned feasibility coupon with these questions before detailed routing:

1. Can the exact 0.4 mm-pitch QFN lands with 0.20 mm copper gaps be fabricated? If not, can an accepted alternative meet the component manufacturer's land-pattern requirements? Does 0.30 mm pattern width include pads, thermal spokes and necks?
2. Can the exact USB-C lands with 0.20 mm gaps and the proposed mechanically validated shell-hole geometry be fabricated? What slot widths/lengths, plated-slot process and NPTH tools/tolerances are supported?
3. Are minimum annular rings nominal or finished? Supply drill/registration tolerances and drill-to-drill/edge/slot clearances. Confirm the exact tool list and handling of 0.65 mm locating holes.
4. Supply polymer through-hole resistance/current/temperature and thermal information. Are via-in-pad, tenting, solder filling or mechanical reinforcement supported? What continuity testing is performed?
5. Supply solder-mask expansion, minimum dam/web, alignment tolerance, silk-to-mask clearance, paste/stencil thickness and aperture limits. Can the actual narrow lands receive reliable mask and paste?
6. Supply exact 1.6 mm stackup tolerances, dielectric properties or a controlled-impedance option if any; confirm ground-plane/rubout processing and RF limitations.
7. For optional assembly only: confirm the exact selected QFN or module, exposed-pad process, consignment requirements, inspection and rework scope; do not confuse an existing module's castellations with fabrication of carrier-edge castellations.
8. Confirm finished outline/cutout tolerance, minimum board/panel dimensions, fiducials/tooling rails, accepted drill files and layer naming; obtain project-specific DFM review, quotation and schedule.

Record responses with date, sender/authority, exact drawing revision/hash and scope. If EPDC rejects a dependent feature, revise the architecture or supplier choice; never lower KiCad rules and label that an accepted exception without evidence.

## 8. DFM acceptance checklist for the future implementing AI

- Bind the final schematic, board, local libraries, project rules and exported files to one source manifest and SHA-256 set.
- Use the chosen supplier rules in both global constraints and applicable net classes; verify custom rules cannot relax them unnoticed.
- Check actual pad gaps and widths independently, including pads in the same footprint and footprints with local clearance overrides. DRC settings alone are insufficient.
- Audit all track widths, copper necks, zone thermal widths, vias, PTH/NPTH holes, slots, annular rings and board-edge distances. Refill zones and repeat after changes.
- Audit drill files after conversion/rounding, and prove connector/peg fits from actual drawings and measurements.
- Confirm zero shorts and unconnected required nets, schematic/PCB parity, physical ground continuity, and the separation of B_MINUS from system GND except through its intended protection path.
- Inspect Gerbers and drill alignment in a viewer independent of the source layout; inspect copper, mask, paste, silk, board edge, keepouts and residual copper removal. Preserve failed checks.
- Check regulator/current paths and ground/via voltage drop under simultaneous radio and LED loads; plan bench evidence for process limits absent from the documents.
- Obtain supplier DFM acceptance tied to the exported geometry. A clean ERC/DRC or a module substitution does not close this gate.
- Keep assembly and physical bring-up acceptance separate from bare-board DFM acceptance.

## 9. Cost and administrative boundaries

DOST-C page 31 lists area-based fabrication fees and working-hour columns; page 32 lists extra silk/DFM services, assembly and stencil categories. For example, its QFP/QFN line is PHP 100 per component and its smallest stencil tier lists PHP 900 for one side and PHP 1,800 for two. These are **supplied-document entries, not a current quotation**, a guaranteed total, or proof of discount eligibility. Rubout, colour, minimum charges, extra services, tax, delivery, material, quantity, revisions and design acceptance can alter cost and schedule. Ask for a complete project quote after the architecture is feasible.

The next AI must prepare an unpopulated field checklist or obtain an official blank inquiry form. It must not clone another person's signed sample, treat the sample's selected black mask/white silk as the owner's preference, send an email, sign terms or order boards from this planning instruction.

## 10. What is verified and what remains open

**Verified:** exact supplied-document limits above; QFP/QFN category in the Charter; populated sample-form status; targeted original-footprint dimensions and the resulting default spacing/slot/ring conflicts.

**Not yet verified:** a manufacturable architecture using the owner's final selected parts, supplier exceptions, full-board DFM, production stackup/tolerances, exact purchased connector fit, assembly feasibility, quote, RF impedance/performance, process current/thermal limits, and assembled-board operation. The Rev C README itself lists schematic wiring, placement, routing and DRC as remaining work; its claim of EPDC compliance must not be promoted to release evidence.
