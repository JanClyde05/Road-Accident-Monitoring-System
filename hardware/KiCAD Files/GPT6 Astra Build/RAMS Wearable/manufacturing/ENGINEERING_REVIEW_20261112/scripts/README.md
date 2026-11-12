# Working on the routed J2 board

The project-root `RAMS_JLC_S3.kicad_pcb` is the authoritative routed layout. Edit it in KiCad, preserving the matching schematic, circuit specification, local libraries and project rules. Back up those sources before consequential changes. Any CAD change invalidates the relevant final reports and exports until checks are rerun against the new file hashes.

`build_board.py`, `settle_placement.py`, `route_critical.py` and `make_spec.py` are initial construction tools, not a final-board regeneration pipeline. They now refuse to overwrite an existing PCB or regenerate their inputs beside routed copper. There is deliberately no bypass flag. In particular:

- `critical_routes.json` records an earlier routing stage. Subsequent native routing, supply fanout corrections, USB reference protection and copper-width changes are not reconstructed by replaying it.
- `placement_overrides.json` records later placements, but does not reconstruct their tracks, via geometry, zones, silkscreen or all footprint refinements. The placement script also contains earlier anchors.
- `ground_vias.json` and the one-time `refine_*`, `relocate_*`, `clear_*`, `open_*`, `reserve_*` and `finish_*` scripts are development records or scoped repair tools. They must not be replayed as a build sequence.
- `make_spec.py` defines circuit inputs; running it can replace a deliberately edited `circuit_spec.json`. Coordinate any circuit change with the schematic, BOM, firmware contract and board.

For reconstruction experiments, copy the complete project into a separate directory and preserve the original copy. Review the scripts and inputs first. Only in that experimental copy, rename the PCB out of the expected filename before initial generation; initial placement/critical routing requires an unrouted board. Historical inputs still need correction and full validation. Do not replace the final board with such a candidate merely because generation succeeds.

Read-only checks include `audit_layout.py INPUT_PCB OUTPUT_DIRECTORY` and `audit_power_paths.py OUTPUT_JSON`; these write reports, not CAD. Inspect each script's inputs before running it. After intended CAD edits, run KiCad ERC, DRC and schematic parity, refill zones, inspect copper/return paths and rendered views, and bind the reports and exports to final source hashes. `project_settings.py` changes project settings and is not a read-only check. Avoid concurrent CAD writers, including KiCad CLI operations that save/refill the board.

Manufacturing and physical qualification remain separate from clean CAD checks. See the project README and assembly/bring-up instructions for their current status.

`build_verified_library.py` also refuses to regenerate beside an existing PCB, protecting the refined local land patterns. `render_review.py` produces native layer/3D previews without modifying CAD. `export_review.py` requires the final source/report manifest and zero native findings; it creates a new engineering review package and refuses to replace an existing package. It is not an ordering tool.

Guard verification (2026-11-12): all four edited Python files compile. Fourteen isolated guard checks cover missing/existing PCB files, segment/arc copper, empty track lists and via-only boards. They passed without executing a generator or modifying CAD.
