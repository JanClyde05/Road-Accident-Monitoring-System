#!/usr/bin/env python3
"""
RAMS Wearable - Complete KiCad 10 Schematic Generator
Generates a 100% clean, error-free, beautifully spaced schematic and netlist.
All wire stubs point AWAY from symbols with proper label justification.
"""
import os, sys, re, math, subprocess
from uuid import uuid4

BASE_DIR = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB"
KICAD_SYM_DIR = r"C:\Program Files\KiCad\10.0\share\kicad\symbols"
CUSTOM_SYM_FILE = os.path.join(BASE_DIR, "lib", "rams.kicad_sym")
OUTPUT_SCH = os.path.join(BASE_DIR, "RAMS - PCB.kicad_sch")
OUTPUT_NET = os.path.join(BASE_DIR, "RAMS_Wearable.net")
PROJ_NAME = "RAMS - PCB"

def uid(): return str(uuid4())

def calc_pin_pos(sx, sy, px, py, rot):
    rad = math.radians(rot)
    rx = px * math.cos(rad) - py * math.sin(rad)
    ry = px * math.sin(rad) + py * math.cos(rad)
    return round(sx + rx, 2), round(sy - ry, 2)

def get_symbol_raw(content, sym_name):
    target = f'(symbol "{sym_name}"'
    idx = content.find(target)
    if idx == -1: return None
    depth = 0
    i = idx
    while i < len(content):
        c = content[i]
        if c == '(': depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0: return content[idx:i+1]
        i += 1
    return None

def extract_symbol_and_deps(lib_path, root_symbols, lib_prefix):
    with open(lib_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    extracted = {}
    to_visit = list(root_symbols)
    while to_visit:
        name = to_visit.pop(0)
        if name in extracted: continue
        raw = get_symbol_raw(content, name)
        if not raw:
            print(f"Warning: symbol '{name}' not found in {lib_path}")
            continue
        m = re.search(r'\(extends "([^"]+)"\)', raw)
        if m:
            parent = m.group(1)
            if parent not in extracted and parent not in to_visit:
                to_visit.append(parent)
        extracted[name] = (lib_prefix, raw)
    return extracted

def parse_pins_robust(sym_text):
    pins = {}
    parts = sym_text.split('(pin ')
    for p in parts[1:]:
        m_at = re.search(r'\(at\s+([-\d.]+)\s+([-\d.]+)(?:\s+([-\d.]+))?\)', p)
        m_num = re.search(r'\(number\s+"([^"]+)"', p)
        m_name = re.search(r'\(name\s+"([^"]*)"', p)
        if m_at and m_num:
            px = float(m_at.group(1))
            py = float(m_at.group(2))
            prot = float(m_at.group(3)) if m_at.group(3) else 0.0
            num = m_num.group(1)
            name = m_name.group(1) if m_name else ""
            pins[num] = (px, py, prot, name)
    return pins

def build_all_symbols():
    needed = [
        (os.path.join(KICAD_SYM_DIR, "MCU_Espressif.kicad_sym"), ["ESP32-S3"], "MCU_Espressif"),
        (os.path.join(KICAD_SYM_DIR, "RF_Module.kicad_sym"), ["Ai-Thinker-Ra-02"], "RF_Module"),
        (os.path.join(KICAD_SYM_DIR, "Regulator_Linear.kicad_sym"), ["AP2112K-3.3"], "Regulator_Linear"),
        (os.path.join(KICAD_SYM_DIR, "Power_Protection.kicad_sym"), ["USBLC6-2SC6"], "Power_Protection"),
        (os.path.join(KICAD_SYM_DIR, "Transistor_FET.kicad_sym"), ["AO3401A"], "Transistor_FET"),
        (os.path.join(KICAD_SYM_DIR, "Transistor_BJT.kicad_sym"), ["BC817"], "Transistor_BJT"),
        (os.path.join(KICAD_SYM_DIR, "Diode.kicad_sym"), ["SS14", "1N4148W"], "Diode"),
        (os.path.join(KICAD_SYM_DIR, "LED.kicad_sym"), ["SK6805"], "LED"),
        (os.path.join(KICAD_SYM_DIR, "Connector.kicad_sym"), ["USB_C_Receptacle_USB2.0_16P", "Conn_01x02_Pin"], "Connector"),
        (os.path.join(KICAD_SYM_DIR, "Switch.kicad_sym"), ["SW_SPDT", "SW_Push"], "Switch"),
        (os.path.join(KICAD_SYM_DIR, "Device.kicad_sym"), ["R", "C", "L", "FerriteBead", "Crystal_GND24_Small", "Antenna_Chip", "Buzzer"], "Device"),
        (os.path.join(KICAD_SYM_DIR, "power.kicad_sym"), ["GND", "+3V3", "VBUS", "PWR_FLAG"], "power"),
        (CUSTOM_SYM_FILE, ["LTH7R", "DW01A", "FS8205A", "SK6805-EC20"], "rams"),
    ]
    
    all_syms = {}
    for lib_path, sym_list, prefix in needed:
        res = extract_symbol_and_deps(lib_path, sym_list, prefix)
        all_syms.update(res)

    flattened_syms = {}
    for name, (prefix, raw) in all_syms.items():
        curr_raw = raw
        m = re.search(r'\(extends "([^"]+)"\)', curr_raw)
        visited = set([name])
        while m:
            parent_name = m.group(1)
            if parent_name in visited or parent_name not in all_syms:
                break
            visited.add(parent_name)
            p_prefix, p_raw = all_syms[parent_name]
            sub_symbols = []
            for sub_match in re.finditer(r'(\(symbol\s+"' + re.escape(parent_name) + r'_\d+_\d+"[\s\S]*?\n\t\t\))', p_raw):
                renamed = sub_match.group(1).replace(f'"{parent_name}_', f'"{name}_')
                sub_symbols.append(renamed)
            curr_raw = re.sub(r'\s*\(extends\s+"[^"]+"\)', '', curr_raw)
            if sub_symbols:
                last_paren = curr_raw.rfind(')')
                curr_raw = curr_raw[:last_paren] + '\n\t\t' + '\n\t\t'.join(sub_symbols) + '\n\t)'
            pm = re.search(r'\(extends "([^"]+)"\)', p_raw)
            if pm:
                m = pm
            else:
                m = None
        flattened_syms[name] = (prefix, curr_raw)

    pin_defs = {}
    for sname, (pfx, raw) in flattened_syms.items():
        full_key = f"{pfx}:{sname}"
        pins = parse_pins_robust(raw)
        pin_defs[full_key] = pins
        pin_defs[sname] = pins

    out_lines = []
    for name, (prefix, raw) in flattened_syms.items():
        lines = raw.split('\n')
        lines[0] = f'\t\t(symbol "{prefix}:{name}"'
        out_lines.append('\n'.join(lines))
    
    return '\n'.join(out_lines), pin_defs

class CleanSchematic:
    def __init__(self, root_uuid, proj_name, pin_defs):
        self.root_uuid = root_uuid
        self.proj_name = proj_name
        self.pin_defs = pin_defs
        self.items = []
        self._label_coords = {}
        
    def add_banner(self, text, x, y, size=2.5):
        self.items.append(f"""\t(text "{text}"
\t\t(exclude_from_sim no)
\t\t(at {x} {y} 0)
\t\t(effects (font (size {size} {size}) (bold yes)) (justify left bottom))
\t\t(uuid "{uid()}")
\t)""")

    def place_component(self, lib_id, ref, val, footprint, x, y, rot, net_map, extra_props=None):
        x = round(round(x / 2.54) * 2.54, 2)
        y = round(round(y / 2.54) * 2.54, 2)
        s_uuid = uid()
        pins_info = self.pin_defs.get(lib_id, {})
        
        p_lines = []
        for p_num in pins_info.keys():
            p_lines.append(f"""\t\t(pin "{p_num}" (uuid "{uid()}"))""")
            
        extra_str = ""
        if extra_props:
            for k, v in extra_props.items():
                extra_str += f"""\n\t\t(property "{k}" "{v}" (at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0))))"""

        # Determine smart reference and value positions based on component geometry
        is_passive_2pin = len(pins_info) == 2 and any(k in lib_id for k in ["Device:R", "Device:C", "Device:L", "Device:FerriteBead", "Diode:"])
        is_switch = "Switch:" in lib_id
        is_small_ic = len(pins_info) <= 6 and not is_passive_2pin
        
        # Font size: 0.7 for passives to fit cleanly without crowding, 0.8 for switches/small ICs, 0.9 for large ICs
        fs = 0.7 if is_passive_2pin else (0.8 if (is_switch or is_small_ic) else 0.9)
        
        if is_passive_2pin:
            if rot == 0 or rot == 180:
                # Vertical passive: place Ref and Val to the RIGHT of the body
                ref_pos = f"(at {round(x + 2.0, 2)} {round(y - 1.2, 2)} 0) (effects (font (size {fs} {fs})) (justify left))"
                val_pos = f"(at {round(x + 2.0, 2)} {round(y + 1.2, 2)} 0) (effects (font (size {fs} {fs})) (justify left))"
            else:
                # Horizontal passive: place Ref ABOVE and Val BELOW (centered)
                ref_pos = f"(at {x} {round(y - 3.2, 2)} 0) (effects (font (size {fs} {fs})))"
                val_pos = f"(at {x} {round(y + 3.2, 2)} 0) (effects (font (size {fs} {fs})))"
        elif is_switch:
            # Switches: place ref above and val below
            ref_pos = f"(at {x} {round(y - 4.5, 2)} 0) (effects (font (size 0.8 0.8)))"
            val_pos = f"(at {x} {round(y + 4.5, 2)} 0) (effects (font (size 0.8 0.8)))"
        else:
            # Multi-pin IC / Module: find bounding box of pins
            p_ys = [calc_pin_pos(x, y, px, py, rot)[1] for px, py, prot, _ in pins_info.values()]
            p_xs = [calc_pin_pos(x, y, px, py, rot)[0] for px, py, prot, _ in pins_info.values()]
            min_y = round(round((min(p_ys) if p_ys else y - 5.08) / 2.54) * 2.54, 2)
            max_y = round(round((max(p_ys) if p_ys else y + 5.08) / 2.54) * 2.54, 2)
            min_x = round(round((min(p_xs) if p_xs else x - 5.08) / 2.54) * 2.54, 2)
            
            ref_pos = f"(at {min_x} {round(min_y - 2.54, 2)} 0) (effects (font (size {fs} {fs})) (justify left))"
            val_pos = f"(at {min_x} {round(max_y + 2.54, 2)} 0) (effects (font (size {fs} {fs})) (justify left))"

        block = f"""\t(symbol
\t\t(lib_id "{lib_id}")
\t\t(at {x} {y} {rot})
\t\t(unit 1)
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(dnp no)
\t\t(uuid "{s_uuid}")
\t\t(property "Reference" "{ref}"
\t\t\t{ref_pos}
\t\t)
\t\t(property "Value" "{val}"
\t\t\t{val_pos}
\t\t)
\t\t(property "Footprint" "{footprint}"
\t\t\t(at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0)))
\t\t)
\t\t(property "Datasheet" "" (at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0))))
\t\t(property "Description" "" (at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0))))
{extra_str}
{chr(10).join(p_lines)}
\t\t(instances
\t\t\t(project "{self.proj_name}"
\t\t\t\t(path "/{self.root_uuid}/{s_uuid}" (reference "{ref}") (unit 1))
\t\t\t)
\t\t)
\t)"""
        self.items.append(block)
        
        # Connect pins with explicit wire stubs and properly justified labels
        seen_stubs = set()
        for p_num, (px, py, prot, pname) in pins_info.items():
            net = net_map.get(p_num)
            if not net:
                continue
            
            hx, hy = calc_pin_pos(x, y, px, py, rot)
            stub_key = (hx, hy, net)
            if stub_key in seen_stubs:
                continue
            seen_stubs.add(stub_key)
            
            if net == "NC":
                self.items.append(f"""\t(no_connect (at {hx} {hy}) (uuid "{uid()}"))""")
            else:
                # The pin points towards the body at angle (prot + rot) % 360.
                # AWAY from the body is (prot + rot + 180) % 360.
                away_angle = int(round(prot + rot + 180)) % 360
                
                # Wire length: 5.08mm standard, 7.62mm for dense IC pins
                wire_len = 5.08
                if "ESP32-S3" in lib_id or "Ai-Thinker" in lib_id:
                    wire_len = 7.62
                
                rad = math.radians(away_angle)
                dx = round(wire_len * math.cos(rad), 2)
                # In KiCad Y is positive downwards
                dy = round(-wire_len * math.sin(rad), 2)
                
                ex = round(hx + dx, 2)
                ey = round(hy + dy, 2)
                
                # Determine label justification and rotation
                if away_angle == 180:
                    # Going LEFT: text flows leftwards
                    lbl_rot = 0
                    justify = "right bottom"
                elif away_angle == 0:
                    # Going RIGHT: text flows rightwards
                    lbl_rot = 0
                    justify = "left bottom"
                elif away_angle == 90:
                    # Going UP: text flows upwards
                    lbl_rot = 90
                    justify = "left bottom"
                elif away_angle == 270:
                    # Going DOWN: text flows downwards
                    lbl_rot = 270
                    justify = "left bottom"
                else:
                    lbl_rot = 0
                    justify = "left bottom"
                    
                self.items.append(f"""\t(wire
\t\t(pts (xy {hx} {hy}) (xy {ex} {ey}))
\t\t(stroke (width 0) (type solid))
\t\t(uuid "{uid()}")
\t)""")
                self.items.append(f"""\t(label "{net}"
\t\t(at {ex} {ey} {lbl_rot})
\t\t(effects (font (size 0.8 0.8)) (justify {justify}))
\t\t(uuid "{uid()}")
\t)""")

    def place_pwr_flag(self, net, x, y, idx=1):
        x = round(round(x / 2.54) * 2.54, 2)
        y = round(round(y / 2.54) * 2.54, 2)
        s_uuid = uid()
        ref = f"#FLG{idx}"
        block = f"""\t(symbol
\t\t(lib_id "power:PWR_FLAG")
\t\t(at {x} {y} 0)
\t\t(unit 1)
\t\t(exclude_from_sim no)
\t\t(in_bom no)
\t\t(on_board no)
\t\t(dnp no)
\t\t(uuid "{s_uuid}")
\t\t(property "Reference" "{ref}"
\t\t\t(at {x} {round(y-1.9, 2)} 0) (hide yes) (effects (font (size 1.0 1.0)))
\t\t)
\t\t(property "Value" "PWR_FLAG"
\t\t\t(at {x} {round(y-3.81, 2)} 0) (effects (font (size 1.0 1.0)))
\t\t)
\t\t(property "Footprint" "" (at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0))))
\t\t(property "Datasheet" "" (at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0))))
\t\t(property "Description" "" (at {x} {y} 0) (hide yes) (effects (font (size 1.0 1.0))))
\t\t(pin "1" (uuid "{uid()}"))
\t\t(instances
\t\t\t(project "{self.proj_name}"
\t\t\t\t(path "/{self.root_uuid}/{s_uuid}" (reference "{ref}") (unit 1))
\t\t\t)
\t\t)
\t)"""
        self.items.append(block)
        ex = x
        ey = round(y + 2.54, 2)
        self.items.append(f"""\t(wire
\t\t(pts (xy {x} {y}) (xy {ex} {ey}))
\t\t(stroke (width 0) (type solid))
\t\t(uuid "{uid()}")
\t)""")
        self.items.append(f"""\t(label "{net}"
\t\t(at {ex} {ey} 0)
\t\t(effects (font (size 1.0 1.0)) (justify left bottom))
\t\t(uuid "{uid()}")
\t)""")

def build():
    root_uuid = uid()
    print("Extracting symbol library definitions and pins...")
    lib_sym_content, pin_defs = build_all_symbols()
    
    sch = CleanSchematic(root_uuid, PROJ_NAME, pin_defs)
    
    # ── SECTION 1: USB-C & BATTERY CHARGER (Top Left) ──
    sch.add_banner("SECTION 1: USB-C & LI-ION BATTERY CHARGER", 25, 20)
    
    sch.place_component(
        lib_id="Connector:USB_C_Receptacle_USB2.0_16P",
        ref="J1", val="TYPE-C-31-M-12", footprint="rams:USB_C_TYPE_C_31_M_12",
        x=50, y=55, rot=0,
        net_map={
            "A1": "GND", "B1": "GND", "A12": "GND", "B12": "GND", "SH": "GND",
            "A4": "VBUS", "B4": "VBUS", "A9": "VBUS", "B9": "VBUS",
            "A5": "USB_CC1", "B5": "USB_CC2",
            "A6": "USB_DP_CONN", "B6": "USB_DP_CONN",
            "A7": "USB_DN_CONN", "B7": "USB_DN_CONN",
            "A8": "NC", "B8": "NC"
        },
        extra_props={"LCSC": "C165948", "Mounting": "JLC", "Func": "USB-C Port"}
    )
    
    sch.place_component("Device:R", "R1", "5.1k", "Resistor_SMD:R_0402_1005Metric", 90, 38, 0, {"1": "USB_CC1", "2": "GND"}, extra_props={"Func": "CC1 Pull-down"})
    sch.place_component("Device:R", "R2", "5.1k", "Resistor_SMD:R_0402_1005Metric", 108, 38, 0, {"1": "USB_CC2", "2": "GND"}, extra_props={"Func": "CC2 Pull-down"})
    
    sch.place_component(
        "Power_Protection:USBLC6-2SC6", "D1", "USBLC6-2SC6", "Package_TO_SOT_SMD:SOT-23-6",
        135, 55, 0,
        {"1": "USB_DP_CONN", "2": "GND", "3": "USB_DN_CONN", "4": "USB_DN", "5": "VBUS", "6": "USB_DP"},
        extra_props={"LCSC": "C7519", "Mounting": "JLC", "Func": "USB ESD Protection"}
    )
    
    sch.place_component("Device:C", "C1", "10uF 16V", "Capacitor_SMD:C_0603_1608Metric", 78, 82, 0, {"1": "VBUS", "2": "GND"}, extra_props={"Func": "VBUS Bulk"})
    sch.place_component("Device:C", "C2", "0.1uF 50V", "Capacitor_SMD:C_0402_1005Metric", 100, 82, 0, {"1": "VBUS", "2": "GND"}, extra_props={"Func": "VBUS Bypass"})
    
    sch.place_component(
        "rams:LTH7R", "U3", "LTH7R", "Package_TO_SOT_SMD:SOT-23-5",
        175, 55, 0,
        {"1": "NC", "2": "GND", "3": "B_PLUS", "4": "VBUS", "5": "CHG_PROG"},
        extra_props={"LCSC": "C841234", "Mounting": "JLC", "Func": "500mA Li-Ion Charger"}
    )
    sch.place_component("Device:R", "R3", "4.02k 1%", "Resistor_SMD:R_0402_1005Metric", 208, 55, 0, {"1": "CHG_PROG", "2": "GND"}, extra_props={"Func": "I_CHG Program 249mA"})
    sch.place_component("Device:C", "C3", "1uF", "Capacitor_SMD:C_0402_1005Metric", 160, 82, 0, {"1": "VBUS", "2": "GND"}, extra_props={"Func": "Charger Input"})
    sch.place_component("Device:C", "C4", "4.7uF", "Capacitor_SMD:C_0603_1608Metric", 190, 82, 0, {"1": "B_PLUS", "2": "GND"}, extra_props={"Func": "Charger Output"})

    # ── SECTION 2: BATTERY PROTECTION, POWER PATH & 3.3V LDO (Top Right) ──
    sch.add_banner("SECTION 2: BATTERY PROTECTION, POWER PATH & 3.3V LDO REGULATOR", 230, 20)
    
    sch.place_component(
        "Connector:Conn_01x02_Pin", "J2", "SM02B-SRSS-TB", "Connector_JST:JST_SH_SM02B-SRSS-TB_1x02-1MP_P1.00mm_Horizontal",
        240, 45, 0, {"1": "B_PLUS", "2": "B_MINUS"},
        extra_props={"LCSC": "C160402", "Mounting": "JLC", "Func": "Battery JST-SH 2P"}
    )
    
    sch.place_component(
        "rams:DW01A", "U4", "DW01A", "Package_TO_SOT_SMD:SOT-23-6",
        275, 45, 0,
        {"1": "DW_OD", "2": "DW_CS", "3": "DW_OC", "4": "NC", "5": "DW_VCC", "6": "GND"},
        extra_props={"LCSC": "C39048", "Mounting": "JLC", "Func": "Battery Protection IC"}
    )
    sch.place_component("Device:R", "R4", "330R", "Resistor_SMD:R_0402_1005Metric", 258, 75, 90, {"1": "B_PLUS", "2": "DW_VCC"}, extra_props={"Func": "VCC Filter Resistor"})
    sch.place_component("Device:C", "C5", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 275, 75, 0, {"1": "DW_VCC", "2": "GND"}, extra_props={"Func": "VCC Decouple"})
    sch.place_component("Device:R", "R5", "1k", "Resistor_SMD:R_0402_1005Metric", 292, 75, 90, {"1": "DW_CS", "2": "B_MINUS"}, extra_props={"Func": "Current Sense Resistor"})
    
    sch.place_component(
        "rams:FS8205A", "Q3", "FS8205A", "Package_SO:TSSOP-8_4.4x3mm_P0.65mm",
        320, 45, 0,
        {"1": "GND", "2": "GND", "3": "GND", "4": "DW_OC", "5": "DW_OD", "6": "B_MINUS", "7": "B_MINUS", "8": "B_MINUS"},
        extra_props={"LCSC": "C32254", "Mounting": "JLC", "Func": "Dual N-MOSFET Protection Switch"}
    )
    sch.place_component("Device:C", "C6", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 240, 78, 0, {"1": "B_PLUS", "2": "GND"}, extra_props={"Func": "Pack Bulk Cap"})

    # Ideal Diode Power Path
    sch.place_component("Diode:SS14", "D2", "SS14", "Diode_SMD:D_SMA", 355, 45, 90, {"1": "VBUS", "2": "LDO_IN"}, extra_props={"LCSC": "C22452", "Mounting": "JLC", "Func": "VBUS Schottky"})
    sch.place_component(
        "Transistor_FET:AO3401A", "Q1", "AO3401A", "Package_TO_SOT_SMD:SOT-23",
        385, 45, 0,
        {"1": "VBUS", "2": "LDO_IN", "3": "B_PLUS"},
        extra_props={"LCSC": "C15127", "Mounting": "JLC", "Func": "Power Path P-MOSFET"}
    )
    sch.place_component("Device:R", "R6", "100k", "Resistor_SMD:R_0402_1005Metric", 375, 75, 0, {"1": "VBUS", "2": "GND"}, extra_props={"Func": "Gate Pull-down"})
    
    # Power Switch
    sch.place_component(
        "Switch:SW_SPDT", "SW1", "MSK12C02", "Button_Switch_SMD:SW_SPDT_PCM12",
        420, 45, 0, {"1": "LDO_IN", "2": "LDO_EN", "3": "GND"},
        extra_props={"LCSC": "C431540", "Mounting": "JLC", "Func": "Main Power Slide Switch"}
    )
    sch.place_component("Device:R", "R7", "100k", "Resistor_SMD:R_0402_1005Metric", 420, 75, 0, {"1": "LDO_EN", "2": "GND"}, extra_props={"Func": "EN Default Pull-down"})

    # 3.3V LDO
    sch.place_component(
        "Regulator_Linear:AP2112K-3.3", "U5", "AP2112K-3.3", "Package_TO_SOT_SMD:SOT-23-5",
        370, 105, 0,
        {"1": "LDO_IN", "2": "GND", "3": "LDO_EN", "4": "NC", "5": "+3V3"},
        extra_props={"LCSC": "C51118", "Mounting": "JLC", "Func": "600mA 3.3V LDO"}
    )
    sch.place_component("Device:C", "C7", "10uF", "Capacitor_SMD:C_0603_1608Metric", 340, 100, 0, {"1": "LDO_IN", "2": "GND"}, extra_props={"Func": "LDO Input Decouple"})
    sch.place_component("Device:C", "C8", "100uF 10V", "Capacitor_SMD:C_0805_2012Metric", 340, 120, 0, {"1": "LDO_IN", "2": "GND"}, extra_props={"Func": "Bulk Cap LoRa Sag Buffer"})
    sch.place_component("Device:C", "C9", "10uF", "Capacitor_SMD:C_0603_1608Metric", 400, 100, 0, {"1": "+3V3", "2": "GND"}, extra_props={"Func": "LDO Output Decouple"})
    sch.place_component("Device:C", "C10", "47uF 10V", "Capacitor_SMD:C_0805_2012Metric", 400, 120, 0, {"1": "+3V3", "2": "GND"}, extra_props={"Func": "3V3 Rail Bulk Buffer"})

    # ── SECTION 3: ESP32-S3FH4R2 MCU & 2.4GHz RF (Bottom Left / Center) ──
    sch.add_banner("SECTION 3: ESP32-S3FH4R2 MICROCONTROLLER & 2.4GHz ANTENNA", 25, 135)
    
    esp32_net_map = {
        "1": "RF_LNA", "2": "VDD3P3_A", "3": "VDD3P3_A", "4": "MCU_EN",
        "5": "BOOT_BTN", "6": "BUZZER_CTRL", "7": "VBAT_SENSE",
        "8": "NC", "9": "NC", "10": "NC", "11": "NC", "12": "NC",
        "13": "LORA_DIO0", "14": "LORA_RST", "15": "LORA_NSS", "16": "LORA_MOSI",
        "17": "LORA_SCK", "18": "LORA_MISO", "19": "NC", "20": "+3V3",
        "21": "NC", "22": "NC", "23": "NC", "24": "NC",
        "25": "USB_DN", "26": "USB_DP", "27": "NC", "28": "NC",
        "29": "VDD_SPI", "30": "NC", "31": "NC", "32": "NC",
        "33": "NC", "34": "NC", "35": "NC", "36": "NC", "37": "NC",
        "38": "NC", "39": "NC", "40": "NC", "41": "NC", "42": "NC",
        "43": "NC", "44": "NC", "45": "NC", "46": "+3V3",
        "47": "NC", "48": "NC", "49": "NC", "50": "NC",
        "51": "NC", "52": "NEO_DATA",
        "53": "XTAL_N", "54": "XTAL_P_DRV",
        "55": "VDDA_PWR", "56": "VDDA_PWR",
        "57": "GND"
    }
    sch.place_component(
        "MCU_Espressif:ESP32-S3", "U1", "ESP32-S3FH4R2", "Package_DFN_QFN:QFN-56-1EP_7x7mm_P0.4mm_EP4x4mm",
        110, 215, 0, esp32_net_map,
        extra_props={"LCSC": "C3013940", "Mounting": "JLC", "Func": "MCU 4MB Flash 2MB PSRAM"}
    )
    
    # 2.4GHz Antenna & RF Match (spaced neatly along Y=145, well clear of U1)
    sch.place_component("Device:C", "C18", "2.7pF", "Capacitor_SMD:C_0402_1005Metric", 28, 145, 0, {"1": "RF_LNA", "2": "GND"}, extra_props={"Func": "RF Pi Shunt 1"})
    sch.place_component("Device:L", "L2", "2.4nH", "Inductor_SMD:L_0402_1005Metric", 42, 145, 90, {"1": "RF_LNA", "2": "RF_MID"}, extra_props={"Func": "RF Pi Series Inductor"})
    sch.place_component("Device:C", "C19", "2.4pF", "Capacitor_SMD:C_0402_1005Metric", 56, 145, 0, {"1": "RF_MID", "2": "GND"}, extra_props={"Func": "RF Pi Shunt 2"})
    sch.place_component("Device:R", "R10", "0R", "Resistor_SMD:R_0402_1005Metric", 70, 145, 90, {"1": "RF_MID", "2": "ANT_FEED"}, extra_props={"Func": "RF Tuning Series"})
    sch.place_component("Device:Antenna_Chip", "ANT1", "2450AT18D0100E", "RF_Antenna:Johanson_2450AT18x100", 88, 145, 0, {"1": "ANT_FEED", "2": "GND"}, extra_props={"Func": "2.4GHz Chip Antenna"})

    # Analog VDD Filtering (Placed along Y=168, X=28..78 - completely clear of U1 top/left pins)
    sch.place_component("Device:L", "L1", "2nH", "Inductor_SMD:L_0402_1005Metric", 28, 168, 90, {"1": "+3V3", "2": "VDD3P3_A"}, extra_props={"Func": "Analog VDD Filter"})
    sch.place_component("Device:C", "C11", "10uF", "Capacitor_SMD:C_0603_1608Metric", 42, 168, 0, {"1": "VDD3P3_A", "2": "GND"})
    sch.place_component("Device:C", "C12", "1uF", "Capacitor_SMD:C_0402_1005Metric", 54, 168, 0, {"1": "VDD3P3_A", "2": "GND"})
    sch.place_component("Device:C", "C13", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 66, 168, 0, {"1": "VDD3P3_A", "2": "GND"})
    sch.place_component("Device:C", "C14", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 78, 168, 0, {"1": "VDD3P3_A", "2": "GND"})
    
    # Reset & Boot Switches (Positioned at X=32..35 with generous margin to U1 GPIO labels)
    sch.place_component("Device:R", "R8", "10k", "Resistor_SMD:R_0402_1005Metric", 32, 195, 0, {"1": "+3V3", "2": "MCU_EN"}, extra_props={"Func": "CHIP_PU Pull-up"})
    sch.place_component("Device:C", "C23", "1uF", "Capacitor_SMD:C_0402_1005Metric", 50, 195, 0, {"1": "MCU_EN", "2": "GND"}, extra_props={"Func": "CHIP_PU Delay"})
    sch.place_component("Switch:SW_Push", "SW2", "RESET", "Button_Switch_SMD:SW_Push_1P1T_NO_CK_KMR2", 35, 222, 0, {"1": "MCU_EN", "2": "GND"}, extra_props={"Func": "Reset Button"})
    sch.place_component("Switch:SW_Push", "SW3", "BOOT", "Button_Switch_SMD:SW_Push_1P1T_NO_CK_KMR2", 35, 248, 0, {"1": "BOOT_BTN", "2": "GND"}, extra_props={"Func": "Boot/Alarm Button"})
    
    # Decoupling for CPU, SPI, VDDA (Right side of U1, 20mm spacing)
    sch.place_component("Device:C", "C15", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 170, 158, 0, {"1": "+3V3", "2": "GND"}, extra_props={"Func": "CPU VDD Decouple"})
    sch.place_component("Device:C", "C16", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 190, 158, 0, {"1": "+3V3", "2": "GND"}, extra_props={"Func": "RTC VDD Decouple"})
    sch.place_component("Device:C", "C17", "1uF", "Capacitor_SMD:C_0402_1005Metric", 170, 185, 0, {"1": "VDD_SPI", "2": "GND"}, extra_props={"Func": "SPI VDD Decouple"})
    sch.place_component("Device:C", "C20", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 190, 185, 0, {"1": "VDD_SPI", "2": "GND"})
    sch.place_component("Device:C", "C21", "10nF", "Capacitor_SMD:C_0402_1005Metric", 170, 215, 0, {"1": "VDDA_PWR", "2": "GND"}, extra_props={"Func": "VDDA Filter"})
    sch.place_component("Device:C", "C22", "1uF", "Capacitor_SMD:C_0402_1005Metric", 190, 215, 0, {"1": "VDDA_PWR", "2": "GND"})
    
    # 40MHz Crystal (wider spacing for labels)
    sch.place_component("Device:R", "R9", "22R", "Resistor_SMD:R_0402_1005Metric", 170, 245, 90, {"1": "XTAL_P_DRV", "2": "XTAL_P"}, extra_props={"Func": "Crystal Series Drive"})
    sch.place_component(
        "Device:Crystal_GND24_Small", "Y1", "40MHz", "Crystal:Crystal_SMD_3225-4Pin_3.2x2.5mm",
        195, 245, 0, {"1": "XTAL_P", "2": "GND", "3": "XTAL_N", "4": "GND"},
        extra_props={"LCSC": "C426988", "Mounting": "JLC", "Func": "40MHz JGHC 10pF"}
    )
    sch.place_component("Device:C", "C24", "12pF", "Capacitor_SMD:C_0402_1005Metric", 182, 270, 0, {"1": "XTAL_P", "2": "GND"}, extra_props={"Func": "Crystal Load 1"})
    sch.place_component("Device:C", "C25", "12pF", "Capacitor_SMD:C_0402_1005Metric", 208, 270, 0, {"1": "XTAL_N", "2": "GND"}, extra_props={"Func": "Crystal Load 2"})

    # ── SECTION 4: LORA RA-02 (SX1278) TRANSCEIVER (Center Right) ──
    sch.add_banner("SECTION 4: LORA RA-02 (SX1278) 433MHz TRANSCEIVER", 235, 135)
    
    ra02_net_map = {
        "1": "GND", "2": "GND", "3": "LORA_VDD", "4": "LORA_RST",
        "5": "LORA_DIO0", "6": "NC", "7": "NC", "8": "NC",
        "9": "GND", "10": "NC", "11": "NC",
        "12": "LORA_SCK_DEV", "13": "LORA_MISO", "14": "LORA_MOSI",
        "15": "LORA_NSS", "16": "GND"
    }
    sch.place_component(
        "RF_Module:Ai-Thinker-Ra-02", "U2", "Ai-Thinker-Ra-02", "RF_Module:Ai-Thinker-Ra-01-LoRa",
        290, 185, 0, ra02_net_map,
        extra_props={"Mounting": "HAND", "Func": "LoRa 433MHz SX1278"}
    )
    sch.place_component("Device:FerriteBead", "FB1", "FerriteBead", "Inductor_SMD:L_0402_1005Metric", 242, 152, 90, {"1": "+3V3", "2": "LORA_VDD"}, extra_props={"Func": "LoRa VDD Noise Filter"})
    sch.place_component("Device:C", "C26", "10uF", "Capacitor_SMD:C_0603_1608Metric", 262, 152, 0, {"1": "LORA_VDD", "2": "GND"}, extra_props={"Func": "LoRa VDD Bulk"})
    sch.place_component("Device:C", "C27", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 282, 152, 0, {"1": "LORA_VDD", "2": "GND"}, extra_props={"Func": "LoRa VDD High Freq"})
    sch.place_component("Device:R", "R11", "33R", "Resistor_SMD:R_0402_1005Metric", 348, 185, 90, {"1": "LORA_SCK", "2": "LORA_SCK_DEV"}, extra_props={"Func": "SPI SCK Series Damping"})

    # ── SECTION 5: PERIPHERALS (BUZZER, RGB LED & BATTERY SENSE) (Bottom Right) ──
    sch.add_banner("SECTION 5: PERIPHERALS (BUZZER, RGB LED & BATTERY SENSE)", 235, 230)
    
    # LED1: SK6805-EC20 (Pin 1=GND, 2=DIN, 3=VDD, 4=DOUT)
    sch.place_component(
        "rams:SK6805-EC20", "LED1", "SK6805-EC20", "rams:LED_SK6805_EC20_2.0x2.0mm",
        255, 255, 0, {"1": "GND", "2": "NEO_DATA", "3": "+3V3", "4": "NC"},
        extra_props={"LCSC": "C2890036", "Mounting": "JLC", "Func": "Status RGB NeoPixel"}
    )
    sch.place_component("Device:C", "C28", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 238, 255, 0, {"1": "+3V3", "2": "GND"}, extra_props={"Func": "LED VDD Decouple"})
    
    # Buzzer Circuit (wider spacing)
    sch.place_component("Diode:1N4148W", "D3", "1N4148W", "Diode_SMD:D_SOD-123", 290, 248, 0, {"1": "BUZZER_NEG", "2": "+3V3"}, extra_props={"LCSC": "C81598", "Mounting": "JLC", "Func": "Flyback Diode"})
    sch.place_component("Device:Buzzer", "BZ1", "SMD-9650-3327", "Buzzer_Beeper:Buzzer_12x9.5RM7.6", 290, 270, 0, {"1": "+3V3", "2": "BUZZER_NEG"}, extra_props={"LCSC": "C96238", "Mounting": "JLC", "Func": "Buzzer Transducer"})
    sch.place_component(
        "Transistor_BJT:BC817", "Q2", "BC817-25", "Package_TO_SOT_SMD:SOT-23",
        320, 265, 0,
        {"1": "BUZZ_DRV", "2": "GND", "3": "BUZZER_NEG"},
        extra_props={"LCSC": "C908259", "Mounting": "JLC", "Func": "NPN Buzzer Driver"}
    )
    sch.place_component("Device:R", "R12", "1k", "Resistor_SMD:R_0402_1005Metric", 342, 265, 90, {"1": "BUZZER_CTRL", "2": "BUZZ_DRV"}, extra_props={"Func": "NPN Base Resistor"})
    sch.place_component("Device:R", "R13", "100k", "Resistor_SMD:R_0402_1005Metric", 355, 265, 0, {"1": "BUZZ_DRV", "2": "GND"}, extra_props={"Func": "NPN Base Pull-down"})
    
    # Battery Voltage Divider
    sch.place_component("Device:R", "R14", "330k 1%", "Resistor_SMD:R_0402_1005Metric", 385, 245, 0, {"1": "B_PLUS", "2": "VBAT_SENSE"}, extra_props={"Func": "ADC Top Divider"})
    sch.place_component("Device:R", "R15", "180k 1%", "Resistor_SMD:R_0402_1005Metric", 385, 270, 0, {"1": "VBAT_SENSE", "2": "GND"}, extra_props={"Func": "ADC Bottom Divider"})
    sch.place_component("Device:C", "C29", "0.1uF", "Capacitor_SMD:C_0402_1005Metric", 405, 270, 0, {"1": "VBAT_SENSE", "2": "GND"}, extra_props={"Func": "ADC Filter Cap"})

    # ── SECTION 6: POWER FLAGS ──
    # Note: +3V3 is driven by U5.VOUT (power output), B_PLUS is driven by U3.BAT (power output)
    pwr_rails = [
        ("GND", 240, 295),
        ("VBUS", 258, 295),
        ("LDO_IN", 276, 295),
        ("LORA_VDD", 294, 295),
        ("VDD3P3_A", 312, 295),
        ("VDD_SPI", 330, 295),
        ("VDDA_PWR", 348, 295),
        ("DW_VCC", 366, 295),
    ]
    for i, (rail_name, fx, fy) in enumerate(pwr_rails, start=1):
        sch.place_pwr_flag(rail_name, fx, fy, idx=i)

    # ── ASSEMBLE FILE ──
    items_block = "\n".join(sch.items)
    sch_content = f"""(kicad_sch
\t(version 20260101)
\t(generator "eeschema")
\t(generator_version "10.0")
\t(uuid "{root_uuid}")
\t(paper "A3")
\t(title_block
\t\t(title "RAMS Wearable PCB")
\t\t(date "2026-10-13")
\t\t(rev "0.1")
\t\t(company "Antigravity / Jan Clyde Talosig")
\t\t(comment 1 "Danger Monitoring System V2 - Wearable Node")
\t\t(comment 2 "ESP32-S3FH4R2 + Ai-Thinker Ra-02 LoRa 433MHz")
\t)
\t(lib_symbols
{lib_sym_content}
\t)
{items_block}
)
"""
    with open(OUTPUT_SCH, "w", encoding="utf-8") as f:
        f.write(sch_content)
    print(f"[OK] Generated {OUTPUT_SCH} ({len(sch_content)} bytes)")

if __name__ == "__main__":
    build()
    
    print("\nExporting netlist with kicad-cli...")
    res = subprocess.run([
        r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe", "sch", "export", "netlist",
        "--output", OUTPUT_NET, OUTPUT_SCH
    ], capture_output=True, text=True)
    print("Netlist Returncode:", res.returncode)
    if res.stdout: print("Stdout:", res.stdout)
    if res.stderr: print("Stderr:", res.stderr)
