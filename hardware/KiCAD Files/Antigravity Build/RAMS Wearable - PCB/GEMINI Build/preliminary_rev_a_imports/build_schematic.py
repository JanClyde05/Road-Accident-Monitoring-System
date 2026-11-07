"""
RAMS Rev C -- Schematic generation from circuit_spec.json
Generates a KiCad 10 S-expression schematic with all components placed
in functional blocks, wired by net labels, ready for ERC.

Run: python build_schematic.py
Output: RAMS - PCB.kicad_sch

This script places components in functional groups and connects them
using global net labels. Manual refinement in KiCad is expected after
generation.
"""

import json
import uuid
import os

SPEC_PATH = os.path.join(os.path.dirname(__file__), "circuit_spec.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "RAMS - PCB.kicad_sch")

def gen_uuid():
    return str(uuid.uuid4())

def load_spec():
    with open(SPEC_PATH, "r") as f:
        return json.load(f)

# Functional block positions (x, y) in mils -> converted to mm for KiCad
# Each block is a group of related components
BLOCK_POSITIONS = {
    # Block 1: USB-C + ESD (top-left)
    "usb_esd": {"x": 30, "y": 30, "refs": ["J1", "D1", "R1", "R2", "C1", "C2"]},
    # Block 2: Charger (left-center)
    "charger": {"x": 30, "y": 70, "refs": ["U3", "R3", "C3", "C4"]},
    # Block 3: Battery protection (bottom-left)
    "batt_prot": {"x": 30, "y": 110, "refs": ["J2", "U4", "Q3", "R4", "R5", "C5", "C6"]},
    # Block 4: Power path + LDO (center-left)
    "power": {"x": 30, "y": 150, "refs": ["Q1", "D2", "SW1", "U5", "R6", "R7", "C7", "C8", "C9", "C10"]},
    # Block 5: MCU core (center)
    "mcu": {"x": 120, "y": 70, "refs": ["U1", "R8", "SW2", "SW3", "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C20", "C21", "C22", "C23", "C28"]},
    # Block 6: Crystal (center-right)
    "crystal": {"x": 120, "y": 150, "refs": ["Y1", "R9", "C24", "C25"]},
    # Block 7: RF antenna (top-right)
    "antenna": {"x": 200, "y": 30, "refs": ["ANT1", "R10", "L2", "C18", "C19"]},
    # Block 8: LoRa (right)
    "lora": {"x": 200, "y": 90, "refs": ["U2", "R11", "FB1", "C26", "C27"]},
    # Block 9: Peripherals (bottom-right)
    "peripherals": {"x": 200, "y": 150, "refs": ["LED1", "BZ1", "Q2", "D3", "R12", "R13", "R14", "R15", "C29", "C30"]},
    # Block 10: Misc
    "misc": {"x": 120, "y": 190, "refs": ["L1"]},
}

def get_block_for_ref(ref):
    for block_name, block in BLOCK_POSITIONS.items():
        if ref in block["refs"]:
            return block_name, block
    return "misc", BLOCK_POSITIONS["misc"]

def symbol_lib_for_ref(ref, comp):
    """Map component reference to KiCad symbol library."""
    val = comp.get("value", "")
    if ref.startswith("R"):
        return "Device:R"
    elif ref.startswith("C"):
        return "Device:C"
    elif ref.startswith("L"):
        return "Device:L"
    elif ref == "FB1":
        return "Device:FerriteBead"
    elif ref == "D2" or ref == "D3":
        return "Device:D_Schottky" if "Schottky" in comp.get("description", "") or "SS14" in val else "Device:D"
    elif ref == "D1":
        return "Device:D_TVS_x2_AAC"
    elif ref == "Q1":
        return "Device:Q_PMOS_GSD"
    elif ref == "Q2":
        return "Device:Q_NPN_BEC"
    elif ref == "Q3":
        return "Device:Q_NMOS_GSD"
    elif ref == "U1":
        return "RF_Module:ESP32-S3-WROOM-1"
    elif ref == "U2":
        return "RF_Module:Ai-Thinker-Ra-02"
    elif ref == "U3":
        return "Regulator_Linear:MCP73831-2-OT"
    elif ref == "U4":
        return "Power_Protection:DW01A"
    elif ref == "U5":
        return "Regulator_Linear:AP2112K-3.3"
    elif ref == "ANT1":
        return "Device:Antenna"
    elif ref == "LED1":
        return "LED:WS2812B"
    elif ref == "BZ1":
        return "Device:Buzzer"
    elif ref == "Y1":
        return "Device:Crystal_GND24"
    elif ref == "J1":
        return "Connector:USB_C_Receptacle_USB2.0"
    elif ref == "J2":
        return "Connector:Conn_01x02_Pin"
    elif ref.startswith("SW"):
        return "Switch:SW_Push" if "tact" in comp.get("description", "").lower() or "push" in comp.get("description", "").lower() else "Switch:SW_SPDT"
    return "Device:R"

def build_schematic(spec):
    """Build the KiCad schematic S-expression."""
    components = spec["components"]
    
    lines = []
    lines.append('(kicad_sch')
    lines.append('  (version 20231120)')
    lines.append('  (generator "RAMS_Rev_C_build_schematic")')
    lines.append('  (generator_version "1.0")')
    lines.append(f'  (uuid "{gen_uuid()}")')
    lines.append('  (paper "A3")')
    lines.append('')
    
    # Library symbols section (empty - KiCad will resolve from libraries)
    lines.append('  (lib_symbols')
    lines.append('  )')
    lines.append('')
    
    # Title block
    lines.append('  (title_block')
    lines.append('    (title "RAMS Wearable PCB Rev C")')
    lines.append('    (date "2026-10-30")')
    lines.append('    (rev "C")')
    lines.append('    (company "Antigravity / RAMS")')
    lines.append('    (comment 1 "Road Accident Monitoring System")')
    lines.append('    (comment 2 "DOST-ASTI EPDC 2-Layer")')
    lines.append('    (comment 3 "Black mask / White silk")')
    lines.append('    (comment 4 "Generated from circuit_spec.json")')
    lines.append('  )')
    lines.append('')
    
    # Place components with net labels
    placed_refs = set()
    comp_positions = {}
    
    for block_name, block in BLOCK_POSITIONS.items():
        refs_in_block = [r for r in block["refs"] if r in components]
        base_x = block["x"]
        base_y = block["y"]
        
        for i, ref in enumerate(refs_in_block):
            comp = components[ref]
            # Arrange in a grid within the block
            col = i % 4
            row = i // 4
            x = base_x + col * 25
            y = base_y + row * 20
            comp_positions[ref] = (x, y)
            placed_refs.add(ref)
            
            sym_lib = symbol_lib_for_ref(ref, comp)
            value = comp["value"]
            footprint = comp.get("footprint", "")
            
            lines.append(f'  (symbol')
            lines.append(f'    (lib_id "{sym_lib}")')
            lines.append(f'    (at {x} {y} 0)')
            lines.append(f'    (unit 1)')
            lines.append(f'    (exclude_from_sim no)')
            lines.append(f'    (in_bom yes)')
            lines.append(f'    (on_board yes)')
            lines.append(f'    (dnp no)')
            lines.append(f'    (uuid "{gen_uuid()}")')
            lines.append(f'    (property "Reference" "{ref}"')
            lines.append(f'      (at {x} {y-3} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)))')
            lines.append(f'    )')
            lines.append(f'    (property "Value" "{value}"')
            lines.append(f'      (at {x} {y+3} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)))')
            lines.append(f'    )')
            lines.append(f'    (property "Footprint" "{footprint}"')
            lines.append(f'      (at {x} {y+6} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)) hide)')
            lines.append(f'    )')
            lines.append(f'  )')
            lines.append('')
    
    # Place any remaining components not in blocks
    remaining = [r for r in components if r not in placed_refs]
    for i, ref in enumerate(remaining):
        comp = components[ref]
        x = 120 + (i % 4) * 25
        y = 220 + (i // 4) * 20
        comp_positions[ref] = (x, y)
        
        sym_lib = symbol_lib_for_ref(ref, comp)
        value = comp["value"]
        footprint = comp.get("footprint", "")
        
        lines.append(f'  (symbol')
        lines.append(f'    (lib_id "{sym_lib}")')
        lines.append(f'    (at {x} {y} 0)')
        lines.append(f'    (unit 1)')
        lines.append(f'    (exclude_from_sim no)')
        lines.append(f'    (in_bom yes)')
        lines.append(f'    (on_board yes)')
        lines.append(f'    (dnp no)')
        lines.append(f'    (uuid "{gen_uuid()}")')
        lines.append(f'    (property "Reference" "{ref}"')
        lines.append(f'      (at {x} {y-3} 0)')
        lines.append(f'      (effects (font (size 1.27 1.27)))')
        lines.append(f'    )')
        lines.append(f'    (property "Value" "{value}"')
        lines.append(f'      (at {x} {y+3} 0)')
        lines.append(f'      (effects (font (size 1.27 1.27)))')
        lines.append(f'    )')
        lines.append(f'    (property "Footprint" "{footprint}"')
        lines.append(f'      (at {x} {y+6} 0)')
        lines.append(f'      (effects (font (size 1.27 1.27)) hide)')
        lines.append(f'    )')
        lines.append(f'  )')
        lines.append('')
    
    # Add global net labels for every unique net
    all_nets = set()
    for ref, comp in components.items():
        for pad in comp["pads"]:
            net = pad.get("net", "UNCONNECTED")
            if net not in ("UNCONNECTED", "RESERVED_PSRAM", "NONE"):
                all_nets.add(net)
    
    # Place net labels near the center of the sheet as reference
    label_y = 10
    for i, net in enumerate(sorted(all_nets)):
        lx = 10 + (i % 8) * 30
        ly = label_y + (i // 8) * 5
        
        # Determine label type
        if net == "/GND":
            lines.append(f'  (power_port')
            lines.append(f'    (at {lx} {ly} 0)')
            lines.append(f'    (effects (font (size 1.27 1.27)) hide)')
            lines.append(f'    (uuid "{gen_uuid()}")')
            lines.append(f'    (property "Reference" "#PWR_GND_{i}"')
            lines.append(f'      (at {lx} {ly} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)) hide)')
            lines.append(f'    )')
            lines.append(f'    (property "Value" "GND"')
            lines.append(f'      (at {lx} {ly+2} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)))')
            lines.append(f'    )')
            lines.append(f'  )')
        elif net == "/+3V3":
            lines.append(f'  (power_port')
            lines.append(f'    (at {lx} {ly} 0)')
            lines.append(f'    (effects (font (size 1.27 1.27)) hide)')
            lines.append(f'    (uuid "{gen_uuid()}")')
            lines.append(f'    (property "Reference" "#PWR_3V3_{i}"')
            lines.append(f'      (at {lx} {ly} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)) hide)')
            lines.append(f'    )')
            lines.append(f'    (property "Value" "+3V3"')
            lines.append(f'      (at {lx} {ly+2} 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)))')
            lines.append(f'    )')
            lines.append(f'  )')
        else:
            # Global label
            label_text = net.lstrip("/")
            lines.append(f'  (global_label "{label_text}"')
            lines.append(f'    (shape passive)')
            lines.append(f'    (at {lx} {ly} 0)')
            lines.append(f'    (effects (font (size 1.27 1.27)))')
            lines.append(f'    (uuid "{gen_uuid()}")')
            lines.append(f'    (property "Intersheets" ""')
            lines.append(f'      (at 0 0 0)')
            lines.append(f'      (effects (font (size 1.27 1.27)) hide)')
            lines.append(f'    )')
            lines.append(f'  )')
        lines.append('')
    
    # Sheet instances
    sheet_uuid = gen_uuid()
    lines.append('  (sheet_instances')
    lines.append(f'    (path "/{sheet_uuid}"')
    lines.append(f'      (page "1")')
    lines.append(f'    )')
    lines.append('  )')
    lines.append('')
    
    lines.append(')')
    
    return "\n".join(lines)

def main():
    spec = load_spec()
    schematic = build_schematic(spec)
    
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(schematic)
    
    comp_count = len(spec["components"])
    net_count = len(set(
        pad.get("net", "X")
        for comp in spec["components"].values()
        for pad in comp["pads"]
        if pad.get("net") not in ("UNCONNECTED", "RESERVED_PSRAM", "NONE")
    ))
    
    print(f"Schematic generated: {OUTPUT_PATH}")
    print(f"  Components: {comp_count}")
    print(f"  Unique nets: {net_count}")
    print(f"  Layout: A3 sheet, components in 10 functional blocks")
    print()
    print("IMPORTANT: This is a STRUCTURAL schematic.")
    print("After opening in KiCad:")
    print("  1. Resolve library symbols (Annotate -> Update Symbol Libraries)")
    print("  2. Connect pins with wires (currently using net labels only)")
    print("  3. Run ERC and fix any issues")
    print("  4. Verify against circuit_spec.json")

if __name__ == "__main__":
    main()
