# EPDC-compliant design rules for Rev C

These rules are derived from DOST-ASTI EPDC Annex A (EPDC-MAN-PM-001 Rev 02, 2026-09-28) and must be enforced in the KiCad Board Setup before any routing.

## KiCad Board Setup -> Design Rules -> Constraints

```
Minimum clearance:           0.254 mm    (EPDC: 0.254mm min pattern space for 35um copper)
Minimum track width:         0.300 mm    (EPDC: 0.30mm min pattern width)
Minimum annular ring:        0.254 mm    (EPDC: 0.254mm min annular ring)
Minimum via diameter:        0.908 mm    (calculated: 0.40mm drill + 2 x 0.254mm ring)
Minimum via drill:           0.400 mm    (EPDC: 0.40mm min hole diameter)
Copper to edge clearance:    0.300 mm    (EPDC: 0.30mm min outside route to copper)
Minimum hole to hole:        0.254 mm    (use same as clearance)
Silkscreen text size:        0.800 mm    (readable; line width >= 0.15mm per EPDC)
Silkscreen line width:       0.150 mm    (EPDC minimum)
```

## KiCad Board Setup -> Design Rules -> Net Classes

| Net Class | Track Width | Clearance | Via Diameter | Via Drill | Description |
|---|---|---|---|---|---|
| Default | 0.30 mm | 0.254 mm | 0.95 mm | 0.40 mm | GPIO, SPI, I2C, general signals |
| Power | 0.50 mm | 0.30 mm | 0.95 mm | 0.40 mm | VBUS, +3V3, VBAT, B_PLUS, B_MINUS, LDO_IN, LORA_VDD |
| RF_50R | 0.30 mm | 0.30 mm | N/A | N/A | RF_LNA, RF_MID, ANT_FEED -- no vias allowed |
| USB | 0.30 mm | 0.30 mm | 0.95 mm | 0.40 mm | USB_DP, USB_DN -- differential pair routing |

## Net class assignments

### Power class
- /VBUS
- /+3V3
- /LDO_IN
- /B_PLUS
- /B_MINUS
- /LORA_VDD
- /VDD3P3_A
- /VDD_SPI
- /VDDA_PWR
- /GND

### RF_50R class
- /RF_LNA
- /RF_MID
- /ANT_FEED

### USB class
- /USB_DP
- /USB_DN

### Default class
All remaining nets.

## EPDC drill sizes (available tools)

The following drill sizes are available. All hole diameters in the design must round to one of these:

| Drill (mm) | Typical use in this design |
|---|---|
| 0.4 | Signal and power vias |
| 0.5 | (spare) |
| 0.6 | (spare) |
| 0.7 | (spare) |
| 0.8 | Through-hole component leads, USB-C shell tabs (if round holes used) |
| 0.9 | (spare) |
| 1.0 | USB-C shell tabs (if round holes used), JST mounting tabs |
| 1.2 | (spare) |
| 1.4 | (spare) |
| 1.5 | (spare) |
| 1.6 | (spare) |
| 1.8 | (spare) |
| 2.0 | (spare) |

> Note: Holes > 2.0mm (e.g., 3.2mm mounting holes) must be confirmed with EPDC. The EPDC drill list goes up to 2.0mm. Larger holes may need routed slots or may not be supported.

## Layer stack

| Layer | Use |
|---|---|
| F.Cu (Top) | All components except U2; signal + power traces; partial ground fill |
| B.Cu (Bottom) | U2 (Ra-02 module); primary ground copper pour; ground stitching vias |
| Edge.Cuts | Board outline, rounded rectangle, corner fillet r = 1.5 mm |
| F.SilkS | Component references, polarity marks, board name |
| B.SilkS | U2 outline and reference |
| F.Mask | Solder mask openings |
| B.Mask | Solder mask openings |
| F.Paste | Stencil openings (for EPDC polyimide stencil) |

## Copper zone settings

| Zone | Layer | Net | Thermal relief gap | Thermal spoke width |
|---|---|---|---|---|
| GND pour | F.Cu | /GND | 0.30 mm | 0.35 mm |
| GND pour | B.Cu | /GND | 0.30 mm | 0.35 mm |
| Antenna keepout | B.Cu | Rule area | No fills, no vias under ANT1 |
| Antenna keepout | F.Cu | Rule area | No fills near ANT1 radiating body |

## Ground stitching via plan

Place ground stitching vias (0.95mm pad / 0.40mm drill) at:
- Every 3-5 mm along the board perimeter
- Adjacent to every bypass capacitor (within 2mm of GND pad)
- Along both sides of USB differential pair traces
- Around the LoRa module via connection area
- Between the RF matching network and the MCU

Target: minimum 20 stitching vias for a 42x32mm board to ensure ground plane continuity between F.Cu and B.Cu.
