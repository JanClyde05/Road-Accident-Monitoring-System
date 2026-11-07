# Active Visual Previews -- RAMS Wearable PCB Rev C

Updated 2026-10-30. Native KiCad 10 raytraced renders, vector plots, and vector PDF schematics.
Target: DOST-ASTI EPDC 2-Layer FR4 (48 x 38 mm outline, r = 1.5 mm corner fillets).

## Deliverables & Artifact Index

| File | Type | Description |
|---|---|---|
| [RAMS_RevC_Schematic.pdf](RAMS_RevC_Schematic.pdf) | Vector PDF | Master schematic sheet (A3 canvas, 9 functional blocks, 0 ERC errors, 0 ERC warnings) |
| [active_schematic.svg](active_schematic.svg) | Vector SVG | High-resolution scalable vector schematic with EPDC engineering notes |
| [active_schematic.png](active_schematic.png) | High-Res PNG | Crisp rasterized schematic preview (150 DPI Inkscape render) |
| [active_pcb_3d_top.png](active_pcb_3d_top.png) | 3D Raytrace | Raytraced 3D perspective of board top (1600 × 1100, high quality) |
| [active_pcb_3d_bottom.png](active_pcb_3d_bottom.png) | 3D Raytrace | Raytraced 3D perspective of board bottom (Ai-Thinker Ra-01 LoRa module & GND plane) |
| [active_pcb_top.svg](active_pcb_top.svg) | Vector SVG | Top copper (F.Cu), silkscreen, mask, and Edge.Cuts vector plot |
| [active_pcb_bottom.svg](active_pcb_bottom.svg) | Vector SVG | Bottom copper (B.Cu), silkscreen, mask, and Edge.Cuts vector plot |

## Verification Status

- **ERC (Electrical Rules Check)**: 0 errors, 0 warnings (100% on 50-mil snap grid, clean net connections, all power rails flagged).
- **DRC (Design Rules Check)**: 0 clearance errors, 0 shorting items, 0 dangling vias, 0 starved thermals, 0 keepout violations, 0 unconnected items.
- **DOST-ASTI EPDC Compliance**: 0.30mm trace width, 0.40mm drill, 0.95mm via pad, 0.30mm copper-to-edge clearance, 2-layer FR4 stackup.
