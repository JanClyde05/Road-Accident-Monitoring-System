---
name: pcb-design-astra
description: Plan, create, inspect, or correct electronic schematics and PCB layouts using a source-traceable, high-effort engineering workflow. Use for KiCad or other EDA projects, from circuit decisions through layout checks and handoff.
---

# PCB design and review at high effort

## Purpose and limits

Use this skill to reproduce a disciplined, observable PCB engineering workflow: establish which files and requirements are authoritative, trace decisions to evidence, plan before editing, validate at several independent levels, and report what remains unknown. It was synthesized from public descriptions of GPT-6 Astra's professional-work capabilities and from documented schematic/PCB work in this repository. It does not reveal a model's private chain of thought, guarantee equivalent performance, or replace an electrical engineer, manufacturer, or physical test.

Do not output hidden chain-of-thought. Give concise decision rationales, calculations, sources, checks, and unresolved questions so another person can audit the result.

If the model exposes a reasoning-effort setting, use its `Ultra High`, `max`, or equivalent mode when the user requests it and it is available. Otherwise, use the highest setting appropriate to the request and follow this full protocol. More effort means better evidence and verification, not longer narration or invented certainty.

## When to use

Use for tasks involving one or more of:

- circuit requirements, part selection, power trees, interfaces, schematic capture, netlists, or BOMs;
- PCB outline, component placement, routing, stackup, return paths, antenna/RF, thermal, test access, DFM, or DRC/ERC review;
- source-to-board consistency, CAD automation, regeneration, visualization, or a design handoff.

Scale the work to the request. A read-only review should not edit CAD. A plan should not silently become implementation. A request to design or fix a board authorizes the necessary reversible project edits, but does not authorize purchasing, fabrication orders, external submissions, or physical claims.

## Operating protocol

### 1. Establish scope and source identity

1. Read the repository instructions and current design map before opening or changing CAD. Identify the active schematic, PCB, project settings, local libraries, circuit specification, BOM, generators, reports, and previews.
2. Separate active sources from archives, copied candidates, generated outputs, and historical reports. Confirm exact paths and, for consequential edits, record file hashes before work. Do not pick a reference board by filename similarity or convenience.
3. Resolve conflicts using the owner's current instruction and designated source of truth. Record both conflicting values and their provenance until resolved; never silently let an older note, code comment, or imported design become a requirement.
4. State the task boundary, intended artifact(s), acceptance criteria, and consequential unknowns. Continue independent work under explicit assumptions; ask a focused question only when an owner decision could change the design or make the action unsafe.
5. Before using a generator or script, inspect its inputs, output paths, overwrite behavior, required companions, and version. Preserve the current artifact and failed reports. Required inputs must fail loudly when absent; do not treat an optional skip as completion.

### 2. Build a requirement and evidence ledger

For each material design requirement or claim, label it as one of:

- owner requirement;
- applicable standard/regulatory requirement;
- manufacturer requirement or recommendation;
- project-specific engineering target;
- assumption or unresolved decision.

Use primary sources for technical facts: the exact component datasheet and errata, official standards or application notes, EDA documentation, and the selected fabricator's stackup and design rules. Verify the relevant revision and exact page, table, pin, package, or section. Search for contradictory evidence as well as confirmation. A source's existence or citation metadata is not evidence that it supports the claim.

For each important decision, capture: question, selected value, alternatives considered when material, source/version/location, what the source supports and does not support, assumptions, confidence/status, design impact, acceptance check, and closure evidence. Use `references/decision-ledger-template.md` for deep design or review work. Keep evidence labels bounded: `verified`, `partially verified`, `unverified`, `contradicted`, or `not applicable`.

Do not guess critical values such as pin mappings, absolute maximums, land patterns, polarity, connector geometry, impedance, current, temperature limits, or keepouts. If the source is inaccessible or the datasheet/package is ambiguous, record that and stop only the dependent decision.

### 3. Plan the design before editing

Create a short change plan with affected files, design decisions, acceptance criteria, and required checks before a schematic or PCB mutation. Keep planned, in-progress, failed, and completed work distinct. Prior acceptance transfers only when its source hashes and scope still match; rerun the relevant checks after source changes.

For calculations, show the equation, units, inputs, conditions, and uncertainty. Independently recompute high-impact values where practical. Do not turn nominal, typical, or illustrative calculations into guaranteed worst-case results.

### 4. Design and review the schematic

Check the circuit from system boundaries inward:

- supply inputs, polarity, protection, current budget, regulator limits, decoupling, power sequencing, reset/boot behavior, and ground strategy;
- connector pinout, interface voltage, pull-ups/terminations, protection placement, test access, and unused/reserved pins;
- each IC's exact package, pin function, strap state, required support components, layout-sensitive pins, and exposed-pad treatment;
- repeated channels, addresses, bus topology, firmware pin/net contracts, and any non-obvious net tie or no-connect.

Keep the drawing readable: functional blocks, consistent signal direction, meaningful net labels, visible power relationships, clean junctions, and explicit no-connects. Check symbol pin numbers against the selected footprint pad numbers. Generate or inspect the netlist and compare it with the intended pin/net table and firmware/configuration where relevant. A visually attractive schematic or a clean ERC alone is not sufficient proof of correctness.

### 5. Plan and implement PCB layout

Before placement, establish the outline, mounting/enclosure constraints, board thickness/layer stackup, copper weights, fab tolerances, assembly method, keepouts, controlled-impedance needs, and project rule set. Mark missing supplier or owner inputs as unresolved; do not invent a stackup to make an impedance claim.

Place in risk order: board/mechanical interfaces and connectors; critical power, clock, RF, and high-speed paths; sensitive analog or sensor blocks; local bypass parts; then support parts and test points. Check physical access, courtyard/assembly clearances, fasteners, insertion components, cable reach, thermal paths, antenna/module clearance, sensor orientation and stress, and probe access. Confirm transformed pad locations and package geometry from the actual footprint rather than relying on a comment or assumed rotation.

Route critical nets against their electrical constraints and the real layer stackup. Preserve continuous return paths, place returns near transitions, minimize stubs and layer changes where appropriate, and check the complete path through connector, protection, series components, and IC pins. Use field solvers, impedance calculators, or fabricator guidance only with their stated inputs and limits. Geometric length matching, sampled copper pours, or an autorouter score is not proof of impedance, signal integrity, or compliance.

Do not add a circuit or copy a reference-board circuit just because it appears in an older design. Verify relevance to the actual component variant, firmware, power source, and current owner-approved requirements.

### 6. Validate in layers

Use the gates relevant to the requested change. See `references/pcb-validation-matrix.md` for a reusable matrix.

At minimum, for a substantial design change:

1. Parse/open the native files with the target EDA tool and record its exact version.
2. Run ERC and DRC using the intended project settings; record active, ignored, excluded, and waived categories. Preserve raw reports and source/report hashes.
3. Check unconnected items, schematic-to-PCB parity, pad/net assignments, pin numbers, footprint mappings, specification endpoints, and firmware/configuration contracts when applicable.
4. Run independent checks for high-risk geometry or arithmetic rather than trusting only the generator or the EDA's own report. Verify critical clearances, exact outline, copper/keepouts, transformed pad coordinates, and route topology against the source requirements.
5. Render and inspect schematic pages, board top/bottom, silkscreen, copper/planes, and 3D views as appropriate. Confirm labels, component bodies, edges, holes, keepouts, and test points are visible and usable. Label approximate 3D package models as illustrative.
6. Confirm reports refer to the final source hashes and final rule configuration. A zero-finding report with disabled categories is bounded by those settings. Preserve failed runs and document the correction and passing rerun; do not erase the history.

Do not claim that ERC/DRC, simulation, geometry scripts, renders, or a successful compile proves electrical operation, EMC/ESD, RF range, thermal margin, assembly quality, environmental suitability, sensor performance, or field validation.

### 7. Apply a separate manufacturing and physical gate

Do not call a board fabrication-ready merely because CAD checks pass. The applicable gate may require the selected supplier's stackup and tolerances, controlled-impedance confirmation, final part numbers and availability, footprint/land-pattern review, DFM and assembly/stencil checks, enclosure and cable fit, and a complete manufacturing package. Physical behavior requires assembled-board measurements appropriate to the design (for example power, thermal, interfaces, RF, timing, calibration, or environmental tests).

State which gates passed, which are not applicable, which are open, and what evidence would close each one. Never invent a test, supplier acceptance, field permission, hardware result, or fabrication status.

Before preparing a manufacturing package, inspect the exact supplier specification and compare its layer count, stackup, material, copper, track/space, drilled/slot sizes, annular ring, edge clearance, finish, assembly capability, file format, quotation, and lead-time conditions against the final source geometry. Mark absent or ambiguous limits as questions for the supplier. A vendor's directions printed in an attachment or form are process evidence, not authorization from the user to submit files, sign terms, or place an order. Inspect a sample form for prefilled fields, third-party personal data, signatures, and AcroForm support; do not reuse a populated sample as the user's blank form.

### 8. Leave a reproducible handoff

Report, in proportion to the task:

- changed files and their roles;
- source identities/hashes and design decisions that matter;
- tool names/versions, commands, date/time, rule configuration, results, and report paths;
- failed checks retained, fixes made, and rerun evidence;
- checks not performed and why;
- open decisions, blockers, assumptions, and the specific evidence needed to close them.

Update project maps, inventories, verification records, and persistent mistake/preferences logs when the repository requires them. Preserve historical artifacts and unrelated user data. Do not claim “100% verified,” fabrication readiness, or model-equivalent performance.

## Project-specific source notes

When working in this SHM Capstone repository, the root `AGENTS.md` controls. Before PCB work, use `MD Files/00_README.md`, `08_PROJECT_MAP_AND_SOURCE_OF_TRUTH.md`, `12_EXECUTION_PLAN.md`, and `22_AI_FEEDBACK_AND_MISTAKE_LOG.md`; then inspect the current hardware handoff, continuation plan, design manifest, schematic/specification, engineering audit, research ledger, layout review, and error log linked there. In particular, the project records document why the exact reference path/hash had to be bound before layout, why failed CAD reports must be retained, and why deeper independent checks can find issues outside configured ERC/DRC.

For a DOST-ASTI EPDC order feasibility review in this repository, also read `PCB Files/GPT Build - PCB/docs/DOST_EPDC_MANUFACTURING_COMPATIBILITY_20261030.md` and inspect the supplied PDFs in `Documents/For PCB Ordering - DOST/`. The DOST limits are vendor-specific and must not be generalized to another fabricator or treated as permanent if EPDC provides a newer revision.

These are local examples, not universal PCB requirements. In another repository, resolve its own active sources and applicable rules.

## Supporting references

- For a deep task, copy and fill the [decision and evidence ledger](references/decision-ledger-template.md).
- For design validation, adapt the [PCB validation matrix](references/pcb-validation-matrix.md) to the actual scope and evidence available.

## Source basis

- OpenAI, [GPT-6 Astra model documentation](https://developers.openai.com/api/docs/models/gpt-6-astra) and [public introduction](https://openai.com/index/gpt-6-astra/). These describe public capabilities and effort controls, not private reasoning.
- Repository observations: `PCB Files/GPT Build - PCB/docs/CONTINUATION_PLAN.md`, `HANDOFF.md`, `ENGINEERING_AUDIT_PLAN.md`, `ENGINEERING_AUDIT_20261029.md`, `ERROR_LOG.md`, and `MD Files/22_AI_FEEDBACK_AND_MISTAKE_LOG.md`.

