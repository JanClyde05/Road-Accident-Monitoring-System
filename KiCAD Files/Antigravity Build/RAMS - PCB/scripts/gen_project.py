#!/usr/bin/env python3
"""
RAMS Wearable PCB - KiCad 10 Project Generator
Generates: custom symbols, footprints, library tables, project file, and schematic.
Run from the RAMS - PCB directory.
"""
import os, json, sys
from uuid import uuid4

BASE = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB"
KICAD_SYM_DIR = r"C:\Program Files\KiCad\10.0\share\kicad\symbols"
KICAD_FP_DIR  = r"C:\Program Files\KiCad\10.0\share\kicad\footprints"

def uid(): return str(uuid4())

# === 1. CUSTOM SYMBOL LIBRARY ===
def write_symbol_library():
    path = os.path.join(BASE, "lib", "rams.kicad_sym")
    content = """(kicad_symbol_lib
\t(version 20251024)
\t(generator "rams_gen")
\t(generator_version "10.0")

\t(symbol "LTH7R"
\t\t(pin_names (offset 0.254))
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(duplicate_pin_numbers_are_jumpers no)
\t\t(property "Reference" "U"
\t\t\t(at -5.08 6.35 0)
\t\t\t(show_name no)
\t\t\t(do_not_autoplace no)
\t\t\t(effects (font (size 1.27 1.27)) (justify left))
\t\t)
\t\t(property "Value" "LTH7R"
\t\t\t(at 0 6.35 0)
\t\t\t(show_name no)
\t\t\t(do_not_autoplace no)
\t\t\t(effects (font (size 1.27 1.27)) (justify left))
\t\t)
\t\t(property "Footprint" "Package_TO_SOT_SMD:SOT-23-5"
\t\t\t(at 0 8.89 0)
\t\t\t(show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Datasheet" "https://www.alldatasheet.com/html-pdf/1144649/FUMAN/LTH7R/530/3/LTH7R.html"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Description" "500mA linear Li-Ion battery charger, SOT-23-5, LCSC C841234"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "LCSC" "C841234"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Mounting" "JLC"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "ki_keywords" "charger lithium li-ion lipo battery"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "ki_fp_filters" "SOT?23?5*"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(symbol "LTH7R_0_1"
\t\t\t(rectangle
\t\t\t\t(start -5.08 5.08)
\t\t\t\t(end 5.08 -5.08)
\t\t\t\t(stroke (width 0.254) (type default))
\t\t\t\t(fill (type background))
\t\t\t)
\t\t)
\t\t(symbol "LTH7R_1_1"
\t\t\t(pin power_in line
\t\t\t\t(at -7.62 2.54 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "VCC" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "4" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin power_in line
\t\t\t\t(at 0 -7.62 90)
\t\t\t\t(length 2.54)
\t\t\t\t(name "GND" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "2" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin power_out line
\t\t\t\t(at 7.62 2.54 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "BAT" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "3" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at 7.62 0 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "PROG" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "5" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin open_collector line
\t\t\t\t(at 7.62 -2.54 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "CHRG" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "1" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t)
\t\t(embedded_fonts no)
\t)

\t(symbol "DW01A"
\t\t(pin_names (offset 0.254))
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(duplicate_pin_numbers_are_jumpers no)
\t\t(property "Reference" "U"
\t\t\t(at -5.08 7.62 0)
\t\t\t(show_name no) (do_not_autoplace no)
\t\t\t(effects (font (size 1.27 1.27)) (justify left))
\t\t)
\t\t(property "Value" "DW01A"
\t\t\t(at 0 7.62 0)
\t\t\t(show_name no) (do_not_autoplace no)
\t\t\t(effects (font (size 1.27 1.27)) (justify left))
\t\t)
\t\t(property "Footprint" "Package_TO_SOT_SMD:SOT-23-6"
\t\t\t(at 0 10.16 0)
\t\t\t(show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Datasheet" ""
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Description" "Li-Ion/Li-Polymer battery protection IC, SOT-23-6, VERIFY pinout"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Mounting" "JLC"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "ki_keywords" "battery protection lithium DW01"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "ki_fp_filters" "SOT?23?6*"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(symbol "DW01A_0_1"
\t\t\t(rectangle
\t\t\t\t(start -5.08 6.35)
\t\t\t\t(end 5.08 -6.35)
\t\t\t\t(stroke (width 0.254) (type default))
\t\t\t\t(fill (type background))
\t\t\t)
\t\t)
\t\t(symbol "DW01A_1_1"
\t\t\t(pin output line
\t\t\t\t(at 7.62 3.81 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "OD" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "1" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin input line
\t\t\t\t(at 7.62 1.27 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "CS" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "2" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin output line
\t\t\t\t(at 7.62 -1.27 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "OC" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "3" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at -7.62 -3.81 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "TD" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "4" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin power_in line
\t\t\t\t(at -7.62 3.81 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "VCC" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "5" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin power_in line
\t\t\t\t(at -7.62 0 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "VSS" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "6" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t)
\t\t(embedded_fonts no)
\t)

\t(symbol "FS8205A"
\t\t(pin_names (offset 0.254))
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(duplicate_pin_numbers_are_jumpers no)
\t\t(property "Reference" "Q"
\t\t\t(at -7.62 8.89 0)
\t\t\t(show_name no) (do_not_autoplace no)
\t\t\t(effects (font (size 1.27 1.27)) (justify left))
\t\t)
\t\t(property "Value" "FS8205A"
\t\t\t(at 0 8.89 0)
\t\t\t(show_name no) (do_not_autoplace no)
\t\t\t(effects (font (size 1.27 1.27)) (justify left))
\t\t)
\t\t(property "Footprint" "Package_SO:TSSOP-8_4.4x3mm_P0.65mm"
\t\t\t(at 0 11.43 0)
\t\t\t(show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Datasheet" ""
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Description" "Dual N-Channel MOSFET for battery protection, TSSOP-8, VERIFY pinout"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Mounting" "JLC"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "ki_keywords" "dual nmos mosfet battery protection"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "ki_fp_filters" "TSSOP*8* SOP*8*"
\t\t\t(at 0 0 0) (show_name no) (do_not_autoplace no) (hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(symbol "FS8205A_0_1"
\t\t\t(rectangle
\t\t\t\t(start -7.62 7.62)
\t\t\t\t(end 7.62 -7.62)
\t\t\t\t(stroke (width 0.254) (type default))
\t\t\t\t(fill (type background))
\t\t\t)
\t\t\t(text "FET1"
\t\t\t\t(at -3.81 3.81 0)
\t\t\t\t(effects (font (size 1.27 1.27)))
\t\t\t)
\t\t\t(text "FET2"
\t\t\t\t(at -3.81 -3.81 0)
\t\t\t\t(effects (font (size 1.27 1.27)))
\t\t\t)
\t\t)
\t\t(symbol "FS8205A_1_1"
\t\t\t(pin passive line
\t\t\t\t(at -10.16 5.08 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "S1" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "1" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at -10.16 2.54 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "S1" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "2" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin input line
\t\t\t\t(at -10.16 0 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "G1" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "3" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin input line
\t\t\t\t(at -10.16 -2.54 0)
\t\t\t\t(length 2.54)
\t\t\t\t(name "G2" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "4" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at 10.16 -5.08 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "S2" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "5" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at 10.16 -2.54 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "S2" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "6" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at 10.16 2.54 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "D" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "7" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t\t(pin passive line
\t\t\t\t(at 10.16 5.08 180)
\t\t\t\t(length 2.54)
\t\t\t\t(name "D" (effects (font (size 1.27 1.27))))
\t\t\t\t(number "8" (effects (font (size 1.27 1.27))))
\t\t\t)
\t\t)
\t\t(embedded_fonts no)
\t)

)
"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


# === 2. CUSTOM FOOTPRINTS ===
def write_usbc_footprint():
    path = os.path.join(BASE, "lib", "rams.pretty", "USB_C_TYPE_C_31_M_12.kicad_mod")
    u = uid
    content = f"""(footprint "USB_C_TYPE_C_31_M_12"
\t(version 20260206)
\t(generator "rams_gen")
\t(generator_version "10.0")
\t(layer "F.Cu")
\t(descr "USB Type-C connector, TYPE-C-31-M-12, C165948, 16-pin")
\t(tags "USB USB-C Type-C connector")
\t(attr smd)
\t(fp_text reference "REF**"
\t\t(at 0 -5.5)
\t\t(layer "F.SilkS")
\t\t(effects (font (size 1 1) (thickness 0.15)))
\t\t(uuid "{u()}")
\t)
\t(fp_text value "USB_C_TYPE_C_31_M_12"
\t\t(at 0 5.5)
\t\t(layer "F.Fab")
\t\t(effects (font (size 1 1) (thickness 0.15)))
\t\t(uuid "{u()}")
\t)
\t(fp_rect
\t\t(start -4.77 -4.15)
\t\t(end 4.77 4.15)
\t\t(stroke (width 0.05) (type default))
\t\t(fill none)
\t\t(layer "F.CrtYd")
\t\t(uuid "{u()}")
\t)
\t(fp_rect
\t\t(start -4.47 -3.85)
\t\t(end 4.47 3.85)
\t\t(stroke (width 0.1) (type default))
\t\t(fill none)
\t\t(layer "F.Fab")
\t\t(uuid "{u()}")
\t)
\t(pad "A1" smd rect (at -3.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A4" smd rect (at -2.45 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A5" smd rect (at -1.75 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A6" smd rect (at -1.0 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A7" smd rect (at -0.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A8" smd rect (at 0.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A9" smd rect (at 1.0 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "A12" smd rect (at 3.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B1" smd rect (at 3.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B4" smd rect (at 2.45 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B5" smd rect (at 1.75 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B6" smd rect (at 1.0 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B7" smd rect (at 0.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B8" smd rect (at -0.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B9" smd rect (at -1.0 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "B12" smd rect (at -3.25 -2.85) (size 0.3 1.0) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "S1" smd rect (at -4.32 -1.55) (size 1.0 1.6) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "S2" smd rect (at 4.32 -1.55) (size 1.0 1.6) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "S3" smd rect (at -4.32 2.55) (size 1.0 1.6) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "S4" smd rect (at 4.32 2.55) (size 1.0 1.6) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
)
"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


def write_buzzer_footprint():
    path = os.path.join(BASE, "lib", "rams.pretty", "Buzzer_SMD_9650_3327.kicad_mod")
    u = uid
    content = f"""(footprint "Buzzer_SMD_9650_3327"
\t(version 20260206)
\t(generator "rams_gen")
\t(generator_version "10.0")
\t(layer "F.Cu")
\t(descr "SMD Active Buzzer 9.6x9.6mm, SMD-9650-3327, C42420997")
\t(tags "buzzer active SMD 9.6mm")
\t(attr smd)
\t(fp_text reference "REF**"
\t\t(at 0 -6)
\t\t(layer "F.SilkS")
\t\t(effects (font (size 1 1) (thickness 0.15)))
\t\t(uuid "{u()}")
\t)
\t(fp_text value "Buzzer_SMD_9650_3327"
\t\t(at 0 6)
\t\t(layer "F.Fab")
\t\t(effects (font (size 1 1) (thickness 0.15)))
\t\t(uuid "{u()}")
\t)
\t(fp_circle
\t\t(center 0 0)
\t\t(end 5.3 0)
\t\t(stroke (width 0.05) (type default))
\t\t(fill none)
\t\t(layer "F.CrtYd")
\t\t(uuid "{u()}")
\t)
\t(fp_circle
\t\t(center 0 0)
\t\t(end 4.8 0)
\t\t(stroke (width 0.1) (type default))
\t\t(fill none)
\t\t(layer "F.Fab")
\t\t(uuid "{u()}")
\t)
\t(fp_line
\t\t(start -4.2 -3.5)
\t\t(end -4.2 -4.5)
\t\t(stroke (width 0.2) (type default))
\t\t(layer "F.SilkS")
\t\t(uuid "{u()}")
\t)
\t(fp_line
\t\t(start -4.7 -4.0)
\t\t(end -3.7 -4.0)
\t\t(stroke (width 0.2) (type default))
\t\t(layer "F.SilkS")
\t\t(uuid "{u()}")
\t)
\t(pad "1" smd rect (at -3.25 0) (size 2.5 2.5) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
\t(pad "2" smd rect (at 3.25 0) (size 2.5 2.5) (layers "F.Cu" "F.Paste" "F.Mask") (uuid "{u()}"))
)
"""
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


# === 3. LIBRARY TABLES ===
def write_lib_tables():
    sym_table = """(sym_lib_table
\t(version 7)
\t(lib
\t\t(name "rams")
\t\t(type "KiCad")
\t\t(uri "${KIPRJMOD}/lib/rams.kicad_sym")
\t\t(options "")
\t\t(descr "RAMS project custom symbols (LTH7R, DW01A, FS8205A)")
\t)
)
"""
    fp_table = """(fp_lib_table
\t(version 7)
\t(lib
\t\t(name "rams")
\t\t(type "KiCad")
\t\t(uri "${KIPRJMOD}/lib/rams.pretty")
\t\t(options "")
\t\t(descr "RAMS project custom footprints (USB-C, Buzzer)")
\t)
)
"""
    for name, content in [("sym-lib-table", sym_table), ("fp-lib-table", fp_table)]:
        path = os.path.join(BASE, name)
        with open(path, 'w') as f:
            f.write(content)
        print(f"[OK] {path}")


# === 4. PROJECT FILE ===
def write_project_file():
    proj = {
        "board": {
            "3dviewports": [],
            "ipc2581": {"bom_rev":"","dist":"","distpn":"","internal_id":"","mfg":"","mpn":"","sch_revision":""},
            "layer_pairs": [],
            "layer_presets": [],
            "viewports": []
        },
        "boards": [],
        "component_class_settings": {
            "assignments": [],
            "meta": {"version": 0},
            "sheet_component_classes": {"enabled": False}
        },
        "cvpcb": {"equivalence_files": []},
        "libraries": {
            "pinned_footprint_libs": ["rams"],
            "pinned_symbol_libs": ["rams"]
        },
        "meta": {"filename": "RAMS - PCB.kicad_pro", "version": 3},
        "net_settings": {
            "classes": [
                {"bus_width":12,"clearance":0.15,"diff_pair_gap":0.127,"diff_pair_via_gap":0.25,"diff_pair_width":0.2,"line_style":0,"microvia_diameter":0.3,"microvia_drill":0.1,"name":"Default","pcb_color":"rgba(0, 0, 0, 0.000)","priority":2147483647,"schematic_color":"rgba(0, 0, 0, 0.000)","track_width":0.2,"tuning_profile":"","via_diameter":0.6,"via_drill":0.3,"wire_width":6},
                {"bus_width":12,"clearance":0.2,"diff_pair_gap":0.25,"diff_pair_via_gap":0.25,"diff_pair_width":0.2,"line_style":0,"microvia_diameter":0.3,"microvia_drill":0.1,"name":"Power","pcb_color":"rgba(255, 0, 0, 0.400)","priority":100,"schematic_color":"rgba(255, 0, 0, 0.400)","track_width":0.5,"tuning_profile":"","via_diameter":0.6,"via_drill":0.3,"wire_width":6},
                {"bus_width":12,"clearance":0.15,"diff_pair_gap":0.127,"diff_pair_via_gap":0.25,"diff_pair_width":0.18,"line_style":0,"microvia_diameter":0.3,"microvia_drill":0.1,"name":"RF_50ohm","pcb_color":"rgba(255, 165, 0, 0.400)","priority":50,"schematic_color":"rgba(255, 165, 0, 0.400)","track_width":0.183,"tuning_profile":"","via_diameter":0.45,"via_drill":0.2,"wire_width":6},
                {"bus_width":12,"clearance":0.15,"diff_pair_gap":0.1,"diff_pair_via_gap":0.25,"diff_pair_width":0.2,"line_style":0,"microvia_diameter":0.3,"microvia_drill":0.1,"name":"USB_DP","pcb_color":"rgba(0, 128, 0, 0.400)","priority":60,"schematic_color":"rgba(0, 128, 0, 0.400)","track_width":0.2,"tuning_profile":"","via_diameter":0.45,"via_drill":0.2,"wire_width":6},
                {"bus_width":12,"clearance":0.15,"diff_pair_gap":0.127,"diff_pair_via_gap":0.25,"diff_pair_width":0.2,"line_style":0,"microvia_diameter":0.3,"microvia_drill":0.1,"name":"LoRa_VDD","pcb_color":"rgba(128, 0, 128, 0.400)","priority":90,"schematic_color":"rgba(128, 0, 128, 0.400)","track_width":0.4,"tuning_profile":"","via_diameter":0.6,"via_drill":0.3,"wire_width":6}
            ],
            "meta": {"version": 5},
            "net_colors": None,
            "netclass_assignments": None,
            "netclass_patterns": [
                {"netclass":"Power","pattern":"VBUS"},
                {"netclass":"Power","pattern":"B_PLUS"},
                {"netclass":"Power","pattern":"LDO_IN"},
                {"netclass":"Power","pattern":"+3V3"},
                {"netclass":"RF_50ohm","pattern":"LNA_IN"},
                {"netclass":"RF_50ohm","pattern":"ANT_FEED"},
                {"netclass":"USB_DP","pattern":"USB_DP"},
                {"netclass":"USB_DP","pattern":"USB_DN"},
                {"netclass":"LoRa_VDD","pattern":"LORA_VDD"}
            ]
        },
        "pcbnew": {"last_paths":{"idf":"","netlist":"","plot":"","specctra_dsn":"","step":"","vrml":""},"page_layout_descr_file":""},
        "schematic": {"bus_aliases":{},"legacy_lib_dir":"","legacy_lib_list":[],"top_level_sheets":[]},
        "sheets": [],
        "text_variables": {"REVISION":"0.1","COMPANY":"Antigravity / JC Talosig","TITLE":"RAMS Wearable PCB"},
        "tuning_profiles": {"meta":{"version":0},"tuning_profiles_impedance_geometric":[]}
    }
    path = os.path.join(BASE, "RAMS - PCB.kicad_pro")
    with open(path, 'w') as f:
        json.dump(proj, f, indent=2)
    print(f"[OK] {path}")


# === 5. DESIGN RULES ===
def write_design_rules():
    path = os.path.join(BASE, "RAMS - PCB.kicad_dru")
    content = """(version 1)
; RAMS Wearable - JLCPCB 4-layer JLC04161H-3313 design rules

(rule "JLC min track/space"
\t(constraint clearance (min 0.09mm))
\t(condition "A.Type == 'track' && B.Type == 'track'")
)

(rule "JLC min via drill"
\t(constraint hole_size (min 0.2mm))
\t(condition "A.Type == 'via'")
)

(rule "JLC via to track"
\t(constraint clearance (min 0.254mm))
\t(condition "A.Type == 'via' && B.Type == 'track'")
)

(rule "Copper to edge"
\t(constraint edge_clearance (min 0.3mm))
)
"""
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


# === 6. PIN MAP HEADER ===
def write_pin_map():
    fdir = os.path.join(BASE, "firmware")
    os.makedirs(fdir, exist_ok=True)
    path = os.path.join(fdir, "pin_map.h")
    content = """// RAMS Wearable PCB - GPIO Pin Map
// Source: SPEC section 7, matching prototype firmware
// Date: 2026-10-13, Rev 0.1
#pragma once

#define PIN_BOOT        0   // BOOT / alarm cancel (strapping pin)
#define PIN_BUZZER      1   // Active buzzer via NPN driver
#define PIN_VBAT_SENSE  2   // Battery voltage divider ADC1
#define PIN_LORA_DIO0   8   // Ra-02 DIO0 interrupt
#define PIN_LORA_RST    9   // Ra-02 RESET
#define PIN_LORA_NSS    10  // Ra-02 NSS chip select
#define PIN_LORA_MOSI   11  // SPI MOSI
#define PIN_LORA_SCK    12  // SPI SCK
#define PIN_LORA_MISO   13  // SPI MISO
#define PIN_USB_DN      19  // USB D-
#define PIN_USB_DP      20  // USB D+
#define PIN_LED         48  // SK6805-EC15 DIN
"""
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


# === 7. BOM ===
def write_bom():
    path = os.path.join(BASE, "docs", "03_bom_notes.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    content = """# RAMS Wearable - Bill of Materials v0.1

| Ref | Value | Package | LCSC | Mount | Notes |
|-----|-------|---------|------|-------|-------|
| U1 | ESP32-S3FH4R2 | QFN-56 | C3013940 | JLC | MCU |
| U2 | Ra-02 | SMD-16 | -- | HAND | LoRa 433MHz |
| U3 | LTH7R | SOT-23-5 | C841234 | JLC | Charger |
| U4 | DW01A | SOT-23-6 | VERIFY | JLC | Batt protect |
| U5 | AP2112K-3.3 | SOT-23-5 | C51118 | JLC | 3.3V LDO |
| Q_P | FS8205A | TSSOP-8 | VERIFY | JLC | Dual N-FET |
| Q1 | AO3401A | SOT-23 | VERIFY | JLC | P-FET |
| Q2 | BC817-25 | SOT-23 | VERIFY | JLC | NPN buzzer |
| D1 | USBLC6-2SC6 | SOT-23-6 | C7519 | JLC | USB ESD |
| D2 | SS14 | SOD-123 | VERIFY | JLC | Schottky |
| J1 | TYPE-C-31-M-12 | USB-C | C165948 | JLC | USB conn |
| J2 | SM02B-SRSS-TB | JST-SH 2p | C160402 | JLC | Batt conn |
| Y1 | 40MHz | 3225 | C426988 | JLC | Crystal |
| ANT1 | 2450AT18D0100E | Chip | VERIFY | JLC | 2.4GHz ant |
| LED1 | SK6805-EC15 | 1.5mm | C2890035 | JLC | RGB LED |
| BZ1 | SMD-9650-3327 | 9.6mm | C42420997 | JLC | Buzzer |
| SW1 | MSK12C02 | SPDT | C431540 | JLC | Power sw |
"""
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


# === 8. NETLIST / CONNECTION GUIDE ===
def write_connection_guide():
    path = os.path.join(BASE, "docs", "02_spec_wearable.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    content = """# RAMS Wearable - Schematic Connection Guide v0.1

Use this guide to wire the schematic in KiCad. Net names match the SPEC.

## Section 1: USB-C and Charger

```
J1.VBUS ----+---- C1(10uF) ---- GND
            |---- C2(0.1uF) --- GND
            |---- D1.VBUS (USBLC6-2SC6)
            |---- D2.anode (Schottky SS14) --> cathode = LDO_IN
            |---- U3.VCC (LTH7R pin 4)
            |---- Q1.gate (P-FET) via R_GATE(100k to GND)

J1.CC1 ---- R_CC1(5.1k) ---- GND
J1.CC2 ---- R_CC2(5.1k) ---- GND
J1.D+ ----- D1.I/O1 --------- U1.GPIO20 (USB_DP)
J1.D- ----- D1.I/O2 --------- U1.GPIO19 (USB_DN)
J1.Shield -- GND
```

## Section 2: Battery, Protection, Power Path

```
J2.pin1(+) = B_PLUS
J2.pin2(-) = B_MINUS

U4.VCC(5) ---- R_DW01(330) ---- B_PLUS
U4.VSS(6) ---- B_MINUS
U4.OD(1)  ---- Q_P.G1(pin3)
U4.OC(3)  ---- Q_P.G2(pin4)
U4.CS(2)  ---- R_CS(1k) ---- Q_P.S1(pin1,2) = system GND
U4.TD(4)  ---- C_DW01(0.1uF) ---- B_MINUS
C_DW01b(0.1uF): U4.VCC to U4.VSS

Q_P.S1(1,2) = system GND
Q_P.S2(5,6) = B_MINUS (cell negative)
Q_P.D(7,8)  = internal common drain (connects S1-S2 path)

Q1(P-FET): source = LDO_IN, drain = B_PLUS, gate = VBUS
  R_GATE(100k): gate to GND (turn on when USB absent)

D2(Schottky): anode = VBUS, cathode = LDO_IN

SW1(MSK12C02): common = U5.EN, throw1 = LDO_IN, throw2 = GND

U5(AP2112K-3.3):
  VIN(1) = LDO_IN, EN(3) = SW1.common, GND(2) = GND, VOUT(5) = 3V3
  C_LDO_IN(10uF): LDO_IN to GND
  C_LDO_OUT(10uF): 3V3 to GND
  C_BULK(100uF): LDO_IN to GND (for LoRa TX sag, F3)
  C_3V3_BULK(47uF): 3V3 to GND (F3)

U3(LTH7R):
  VCC(4) = VBUS, BAT(3) = B_PLUS, GND(2) = GND
  PROG(5) ---- R_PROG(4.02k) ---- GND
  CHRG(1) = optional charge LED
  C_CHG_IN(1uF): VBUS to GND (at U3)
  C_CHG_OUT(4.7uF): B_PLUS to GND (at U3)
```

## Section 3: ESP32-S3FH4R2 (U1)

```
VDD3P3 analog (pins 2,3): 3V3 through L1(2nH) then:
  C_VDD1(10uF), C_VDD2(1uF), C_VDD3(0.1uF x2) to GND

VDD3P3_CPU (pin 46): C_CPU(0.1uF) to GND
VDD3P3_RTC (pin 20): C_RTC(0.1uF) to GND
VDD_SPI (pin 29): C_SPI(1uF) + C_SPI2(0.1uF) to GND
VDDA (pins 55,56): C_VDDA1(10nF) + C_VDDA2(1uF) to GND

CHIP_PU/EN (pin 4): R_EN(10k) to 3V3, C_EN(1uF) to GND, SW_RESET to GND
GPIO0 (pin 5): SW_BOOT to GND (internal pull-up)

XTAL_P (pin 54): Y1 pin 1, R_XTAL(22ohm) in series
XTAL_N (pin 53): Y1 pin 3
Y1 load caps: C_XTAL(12pF) each pin to GND

Exposed pad (pin 57): solid GND, thermal vias to In1

GPIO19(D-) = USB_DN, GPIO20(D+) = USB_DP
```

## Section 4: 2.4GHz Antenna

```
ANT1 feed ---- C_A(NC shunt) ---- R_A(0R series) ---- C_B(NC shunt)
  ---- C19(2.4pF shunt) ---- L2(2.4nH series) ---- C18(2.7pF shunt) ---- LNA_IN (U1 pin 1)
All shunt caps to GND. RF trace ~0.183mm, 50 ohm on F.Cu over In1 ground.
```

## Section 5: LoRa Ra-02 (U2)

```
U2.VDD = 3V3 (through FB1 ferrite bead for noise, F4)
  C_RA02(10uF) + C_RA02_2(0.1uF) at the pin to GND
U2.NSS  = GPIO10
U2.MOSI = GPIO11
U2.SCK  = GPIO12 (through R_SCK 33ohm series near MCU)
U2.MISO = GPIO13
U2.RST  = GPIO9
U2.DIO0 = GPIO8
U2.GND (4 pads) = GND
```

## Section 6: Peripherals

```
LED1(SK6805-EC15): VDD = 3V3 + C_LED(0.1uF), DIN = GPIO48, DOUT = NC

BZ1(buzzer): positive = 3V3, negative = Q2.collector
Q2(BC817): emitter = GND, base = GPIO1 via R_BZ(1k), R_BZ2(100k base-GND)

Battery sense:
  B_PLUS ---- R_DIV1(330k) ---- VBAT_SENSE ---- R_DIV2(180k) ---- GND
  C_ADC(0.1uF): VBAT_SENSE to GND
  VBAT_SENSE = GPIO2
```
"""
    with open(path, 'w') as f:
        f.write(content)
    print(f"[OK] {path}")


# === MAIN ===
if __name__ == "__main__":
    print("=== RAMS Wearable KiCad Project Generator ===")
    print(f"Output: {BASE}\n")

    for d in ["lib/rams.pretty", "scripts", "docs/decisions", "fab/wearable/jlcpcb", "firmware"]:
        os.makedirs(os.path.join(BASE, d), exist_ok=True)

    write_symbol_library()
    write_usbc_footprint()
    write_buzzer_footprint()
    write_lib_tables()
    write_project_file()
    write_design_rules()
    write_pin_map()
    write_bom()
    write_connection_guide()

    print("\n=== All files generated! ===")
    print("Open RAMS - PCB.kicad_pro in KiCad 10.")
    print("Custom symbols: rams:LTH7R, rams:DW01A, rams:FS8205A")
    print("Custom footprints: rams:USB_C_TYPE_C_31_M_12, rams:Buzzer_SMD_9650_3327")
    print("See docs/02_spec_wearable.md for wiring guide.")
