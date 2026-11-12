# ENGINEERING DRAFT - NOT FOR FABRICATION

This export set was generated from `RAMS_JLC_S3.kicad_pcb` on 2026-11-09 in the
DeepSeek Build continuation folder.

**Do not send these files to a fabricator or assembler.**

The board is electrically incomplete: five required nets are still unrouted
(`VBAT_SENSE`, `MCU_EN`, `BOOT_BTN`, `LORA_SCK`, `BUZZER_CTRL`). Native DRC is
clean (0 violations, 0 schematic-parity issues) precisely because the missing
connections are reported separately as 5 unconnected items, not as DRC errors.

## Contents

| File | Purpose |
|---|---|
| `gerbers/RAMS_JLC_S3-*.gtl/.g1/.g2/.gbl` | F.Cu, In1.Cu (GND plane), In2.Cu, B.Cu |
| `gerbers/*.gts/.gbs` | Top and bottom solder mask |
| `gerbers/*.gtp/.gbp` | Top and bottom paste |
| `gerbers/*.gto/.gbo` | Top and bottom silkscreen |
| `gerbers/*.gm1` | Board outline (Edge.Cuts) |
| `gerbers/*-PTH.drl`, `*-NPTH.drl` | Plated and non-plated drills, Excellon mm |
| `gerbers/*-drl_map.pdf` | Drill maps |
| `gerbers/*.gbrjob` | Gerber job file |
| `RAMS_JLC_S3_engineering_gerbers.zip` | The 16 Gerber/drill entries above |
| `RAMS_JLC_S3_schematic.pdf` | Four-sheet schematic |
| `RAMS_JLC_S3_board.pdf` | Copper, silkscreen and outline |
| `RAMS_JLC_S3_cpl.csv` | Position file, 80 placed rows, DNP parts excluded |
| `BOM_PROCUREMENT.csv` | Procurement BOM with population states |

## Regenerate

From `RAMS Wearable/` with KiCad 10.0.6:

```bash
kicad-cli pcb export gerbers -o manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/gerbers \
  -l "F.Cu,In1.Cu,In2.Cu,B.Cu,F.Paste,B.Paste,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts" \
  --no-x2 --check-zones RAMS_JLC_S3.kicad_pcb
kicad-cli pcb export drill -o manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/gerbers \
  --format excellon --excellon-units mm --excellon-separate-th --generate-map RAMS_JLC_S3.kicad_pcb
```

Fabrication release requires the remaining routing, a fresh DRC with zero
unconnected items at the final hash, and the G8/G9 review in
`/GPT6 Astra Build/06_VERIFICATION_AND_HANDOFF.md`.
