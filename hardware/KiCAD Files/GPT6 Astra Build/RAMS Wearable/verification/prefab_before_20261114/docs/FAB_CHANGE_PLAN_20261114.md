# J2 prototype fabrication change plan — 2026-11-14

Owner request: make the JLCPCB design fabrication ready. Retain 42 × 32 mm, existing circuit, top heatbed assembly and hand-soldered buzzer/bottom Ra-02. No order or external design submission is authorized by this work.

Input PCB SHA256: `d59c7348a7ca82d890a9c0347848d4778a9ddeb140f87ee5ff83a3dc22fd5aa8`. Preserve this board, project, libraries, reports and docs in `verification/prefab_before_20261114/`; previous engineering-review ZIPs remain immutable.

Planned, not yet accepted:

1. Enlarge/reposition all references to a documented printable JLC process, keeping labels clear of masks and component bodies. Use local labels/short leaders when necessary, retaining all 90 references and the board envelope. Raise project text limits to the selected process. Check native DRC and actual glyph gaps; inspect rendered artwork.
2. Replace U1's full exposed-pad mask opening with 16 chamfered openings, retaining the 5.7 mm copper pad and nine 0.20 mm ground vias. Top mask covers the via holes; bottom holes remain open. Match the paste windows to the mask. This is a solder-wicking reduction measure, not filled/capped vias or a proven assembly yield. Verify native/library parity, mask webs, hole coverage, paste coverage and exported Gerbers.
3. Evaluate RF/USB geometry using the official JLC calculator with the selected JLC04161H-3313 cross-section, mask and copper model. Change route widths only if supported by the result; preserve endpoints, return-plane continuity and clearance. Record model limitations separately from fabrication acceptance.
4. Freeze documented compatible component variants and practical stock-acceptance checks. Do not certify generic purchased stock from a similar product name. Physical assembly checks follow fabrication; exact documented replacement parts can be procured.
5. Run ERC, DRC with schematic parity, geometry/plane/power-path audits, source-difference checks and visual review. Export a dedicated bare-board ZIP and separate top stencil ZIPs, validate contents against final sources, and document exact JLC settings/production-file checks. Update README, manufacturing review, learning/assembly notes and MEMORY_MAP.

Acceptance: zero unconnected/parity/DRC/ERC findings with no ignored categories; unchanged circuit/netlist/component locations/outline; only explicitly logged copper-width and manufacturing-artwork changes; source-bound final reports; complete unambiguous order files. A prototype fabrication release is not a claim of measured electrical, RF, charging or reflow performance.
