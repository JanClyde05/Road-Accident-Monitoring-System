# PCB validation matrix

Adapt this matrix to the user's requested scope. Mark each item `passed`, `failed`, `open`, or `not applicable`; attach the exact report, source hash, tool/version, configuration, and date. A passed CAD gate only supports the narrow property it checks.

| Gate | Evidence to inspect | Acceptance basis | Does not prove |
|---|---|---|---|
| Source identity | Active schematic, PCB, project, spec, local libraries, generators, baseline hashes | Matches current owner-approved source map and intended revision | That the selected requirements are technically correct |
| Requirements and parts | Owner constraints, current datasheets/errata, standards, exact MPN/package, BOM | Every critical value has a source or is explicitly an assumption/open item | Availability, authenticity, or assembled behavior |
| Schematic/ERC | Native schematic, pin numbers, labels, power tree, no-connects, ERC settings/report | No unresolved active errors; exclusions/ignored classes disclosed; symbols and footprints agree | Electrical operation, hidden drawing ambiguity, or board routing quality |
| Netlist/parity | Schematic netlist compared with PCB pad nets, pin/net table, spec, firmware/config where relevant | Every required endpoint and reserved/unused pin matches the documented contract | Correctness of an unsupported requirement or firmware behavior on hardware |
| Mechanical/placement | Exact outline, board edge, courtyards, holes, connector/cable access, keepouts, antenna, sensor orientation, test access | All clearances trace to the actual component, enclosure, fixture, or user constraint; open tolerances listed | Fit with an unspecified enclosure, assembly yield, or field mounting |
| Power and thermal | Current budget, regulator limits, capacitor MPN/effective value, copper/vias, calculation assumptions | Margins checked at relevant worst-case inputs or explicitly left open pending inputs/measurement | Actual board temperature, transient response, source capability, or lifetime |
| High-speed/RF/analog | Layer stackup, impedance calculation/source, topology, return paths, stubs, transitions, keepouts | Constraint supported by exact stackup and applicable interface/module guidance | Signal integrity, EMC/ESD, RF range, or compliance without suitable measurement |
| DRC/connectivity | Exact EDA version, project rule file, full DRC output, unconnected list, active/ignored/excluded rules | Zero unresolved active errors under the recorded final configuration; all waived categories justified | Anything outside the encoded rules or disabled checks |
| Independent checks | Geometry/net/spec scripts, equations, expected pad endpoints, comparator input hashes | High-risk checks independently reproduce the claimed property | That the checker is defect-free or that physical behavior matches geometry |
| Visual review | Schematic pages, top/bottom, copper/planes, silk, 3D preview, scale/resolution | Critical labels, parts, edges, keepouts, holes, and access visually inspected on final source | Electrical correctness, exact 3D package fit, or manufacturing acceptance |
| DFM/assembly | Selected fabricator capabilities, stackup, tolerances, BOM/MPNs, stencil/assembly outputs | Supplier-specific files and rules are reviewed for the selected process | Prototype operation or qualification |
| Physical bring-up | As-built identity, instruments, calibration, method, environmental conditions, raw results | Tests match approved acceptance criteria; artifacts and provenance retained | Untested operating conditions, field performance, or research conclusions beyond scope |

## Final evidence note

Record the final source hashes next to the reports and previews. If a source changes after a report, label the report stale for that source and rerun the affected gate. Retain the original failed report and add a linked correction/rerun record instead of overwriting history.
