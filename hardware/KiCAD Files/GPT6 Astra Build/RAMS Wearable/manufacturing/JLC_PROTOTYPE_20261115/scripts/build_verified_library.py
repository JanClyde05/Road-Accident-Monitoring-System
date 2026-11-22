"""Build only the three reviewed symbols and two package-specific footprints.

Source dimensions and pin contracts are recorded in docs/ELECTRICAL_REVIEW.md.
Run with KiCad's Python; output paths are restricted to this new project.
"""
from pathlib import Path
import re
import pcbnew

ROOT = Path(__file__).resolve().parents[1]
if (ROOT / 'RAMS_JLC_S3.kicad_pcb').exists():
    raise SystemExit('Refusing to regenerate libraries beside the active PCB. See scripts/README.md; use a separate construction copy.')
LIB = ROOT / "lib"
PRETTY = LIB / "RAMS_JLC.pretty"
PRETTY.mkdir(parents=True, exist_ok=True)


def symbol(name, ref, footprint, source, description, left, right):
    n = max(len(left), len(right))
    h = (n + 1) * 1.27
    out = [f'''(symbol "{name}" (pin_names (offset 0.5)) (in_bom yes) (on_board yes)
      (property "Reference" "{ref}" (at 0 {h + 2.54} 0) (effects (font (size 1.27 1.27))))
      (property "Value" "{name}" (at 0 {h} 0) (effects (font (size 1.27 1.27))))
      (property "Footprint" "{footprint}" (at 0 0 0) (effects (font (size 1.27 1.27)) hide))
      (property "Datasheet" "{source}" (at 0 0 0) (effects (font (size 1.27 1.27)) hide))
      (property "Description" "{description}" (at 0 0 0) (effects (font (size 1.27 1.27)) hide))
      (symbol "{name}_0_1" (rectangle (start -7.62 {h - 1.27}) (end 7.62 {-h + 1.27})
        (stroke (width 0.254) (type default)) (fill (type background))))
      (symbol "{name}_1_1"''']
    for items, x, angle in [(left, -10.16, 0), (right, 10.16, 180)]:
        for i, (number, label, electrical) in enumerate(items):
            y = (len(items) - 1) * 1.27 - i * 2.54
            out.append(f'''(pin {electrical} line (at {x} {y} {angle}) (length 2.54)
              (name "{label}" (effects (font (size 1.0 1.0))))
              (number "{number}" (effects (font (size 1.0 1.0)))))''')
    out.append('))')
    return '\n'.join(out)


syms = [symbol(
    "TPS63020", "U", "RAMS_JLC:TPS63020_DSJ14",
    "https://www.ti.com/lit/ds/symlink/tps63020.pdf",
    "Adjustable buck-boost. EP15 is PGND. Force PWM for the 3.45 V assembly.",
    [(1, "VINA", "power_in"), (10, "VIN", "power_in"), (11, "VIN", "power_in"),
     (12, "EN", "input"), (13, "PS/SYNC", "input"), (2, "GND", "power_in"),
     (15, "PGND_EP", "power_in")],
    [(4, "VOUT", "power_out"), (5, "VOUT", "passive"),
     (3, "FB", "input"), (14, "PG", "open_collector"),
     (8, "L1", "passive"), (9, "L1", "passive"),
     (6, "L2", "passive"), (7, "L2", "passive")]),
    symbol("FS8205A_Fuxin", "Q", "Package_TO_SOT_SMD:SOT-23-6",
           "https://datasheet.lcsc.com/datasheet/pdf/5d5d336ed528176185784e3faf8fb551.pdf?productCode=C908265",
           "FuxinSemi FS8205A v2.1 only; gate pins 6/4, common drains 2/5.",
           [(6, "G1_OD", "input"), (4, "G2_OC", "input")],
           [(1, "S1_CELL_MINUS", "passive"), (2, "D_COMMON", "passive"),
            (5, "D_COMMON", "passive"), (3, "S2_PACK_MINUS", "passive")]),
    symbol("DW01A_Slkor", "U", "Package_TO_SOT_SMD:SOT-23-6",
           "https://datasheet.lcsc.com/datasheet/pdf/7c412cac0dea0278008492f4ad08dd26.pdf?productCode=C42380662",
           "Slkor DW01A Rev2. VM senses PACK_MINUS; VSS is CELL_MINUS; pin4 NC.",
           [(5, "VDD", "power_in"), (2, "VM_CS", "input"), (6, "VSS_CELL_MINUS", "power_in")],
           [(1, "DO_OD", "output"), (3, "CO_OC", "output"), (4, "NC", "no_connect")]),
    symbol('TLV803EA30', 'U', 'Package_TO_SOT_SMD:SOT-23',
           'https://www.ti.com/lit/ds/symlink/tlv803e.pdf',
           'TLV803EA30DBZR only: GND1, RESET2, VDD3. 3.08V falling,200ms delay.',
           [(3, 'VDD', 'power_in'), (1, 'GND', 'power_in')],
           [(2, '~{RESET}', 'open_collector')])]
# Variant-specific VDD_SPI is an internally supplied memory rail, not a second external input.
from schematic_helpers import SymbolLibrary, children, child, sexpr, Quoted
mcu, _ = SymbolLibrary().load('MCU_Espressif:ESP32-S3')
mcu[1] = Quoted('ESP32-S3FH4R2')
for prop in children(mcu, 'property'):
    if prop[1]=='ki_fp_filters':prop[2]=Quoted('*QFN56_EP5p7*')
for unit in children(mcu, 'symbol'):
    unit[1] = Quoted(str(unit[1]).replace('ESP32-S3_', 'ESP32-S3FH4R2_'))
    for pin in children(unit, 'pin'):
        if child(pin, 'number')[1] == '29': pin[1] = 'power_out'
syms.append(sexpr(mcu))
connector, _ = SymbolLibrary().load('Connector:Conn_01x02_Pin')
connector[1] = Quoted('Battery_JST_SH')
for unit in children(connector, 'symbol'):
    unit[1] = Quoted(str(unit[1]).replace('Conn_01x02_Pin_', 'Battery_JST_SH_'))
for prop in children(connector, 'property'):
    if prop[1]=='ki_fp_filters':prop[2]=Quoted('JST_SH_SM02B*')
syms.append(sexpr(connector))
syms.append(symbol('MSK12C02', 'SW', 'Button_Switch_SMD:SW_SPDT_Shouhan_MSK12C02',
    'https://www.shouhan.com/', 'SPDT: pin2 common, pin1 ON throw, pin3 OFF throw; case SH grounded. Enable switching only.',
    [(1,'ON_THROW','passive'),(3,'OFF_THROW','passive'),('SH','CASE','passive')],
    [(2,'COMMON','passive')]))
(LIB / "RAMS_JLC.kicad_sym").write_text(
    '(kicad_symbol_lib (version 20231120) (generator "RAMS_verified_library")\n'
    + '\n'.join(syms) + '\n)\n', encoding='utf-8')


def pad(number, x, y, sx, sy, layers='"F.Cu" "F.Paste" "F.Mask"', shape="rect"):
    ratio = ' (roundrect_rratio 0.25)' if shape == 'roundrect' else ''
    return f'(pad "{number}" smd {shape} (at {x} {y}) (size {sx} {sy}) (layers {layers}){ratio})'


tps = ['''(footprint "TPS63020_DSJ14" (version 20260206) (generator "RAMS_verified_library")
 (layer "F.Cu") (attr smd)
 (descr "TI TPS63020 DSJ R-PVSON-N14; land pattern 4210895-2/E 02/16. PGND fingers are pad15.")
 (property "Reference" "REF**" (at 0 -2.8) (layer "F.SilkS") (effects (font (size 0.7 0.7) (thickness 0.12))))
 (property "Value" "TPS63020" (at 0 2.8) (layer "F.Fab") (effects (font (size 0.7 0.7) (thickness 0.12))))
 (fp_rect (start -1.5 -2) (end 1.5 2) (stroke (width 0.1) (type solid)) (fill none) (layer "F.Fab"))
 (fp_rect (start -1.95 -2.45) (end 1.95 2.45) (stroke (width 0.05) (type solid)) (fill none) (layer "F.CrtYd"))
 (fp_circle (center -1.8 -1.9) (end -1.7 -1.9) (stroke (width 0.1) (type solid)) (fill solid) (layer "F.SilkS"))''']
for i in range(7):
    tps.append(pad(i + 1, -1.4, round(-1.5 + i * .5, 3), .6, .24, shape='roundrect'))
    tps.append(pad(14 - i, 1.4, round(-1.5 + i * .5, 3), .6, .24, shape='roundrect'))
tps.append(pad(15, 0, 0, 1.58, 2.85, '"F.Cu" "F.Mask"'))
for x in [-.69, -.23, .23, .69]:
    for sign in [-1, 1]:
        # TI's exposed-pad extensions provide accessible PGND connections.
        tps.append(pad(15, x, sign * 1.775, .2, .85, '"F.Cu" "F.Mask"'))
        tps.append(pad('', x, sign * 1.775, .2, .85, '"F.Paste"'))
for x in [-.43, .43]:
    for y in [-.725, .725]:
        tps.append(pad('', x, y, .66, 1.25, '"F.Paste"'))
tps.append(')')
(PRETTY / 'TPS63020_DSJ14.kicad_mod').write_text('\n'.join(tps) + '\n', encoding='utf-8')

# Reuse native centers; JLC minimum land width 0.25 mm matches FH4R2 max lead.
source = Path(r'C:\Program Files\KiCad\10.0\share\kicad\footprints\Package_DFN_QFN.pretty\QFN-56-1EP_7x7mm_P0.4mm_EP4x4mm.kicad_mod')
raw = source.read_text(encoding='utf-8')
for number in range(1, 57):
    block = re.search(r'\t\(pad "'+str(number)+r'"[\s\S]*?\n\t\)', raw).group()
    changed = block.replace('(size 0.8 0.2)', '(size 0.8 0.25)').replace('(size 0.2 0.8)', '(size 0.25 0.8)')
    assert changed != block
    changed = changed[:-2] + '\t(solder_paste_margin -0.025)\n\t)'
    raw = raw.replace(block, changed)
raw, paste_removed = re.subn(r'\t\(pad ""[\s\S]*?\n\t\)\n', '', raw)
assert paste_removed == 9
ep = re.search(r'\t\(pad "57"[\s\S]*?\n\t\)', raw).group()
assert '(size 4 4)' in ep and 'F.Paste' not in ep
raw = raw.replace(ep, ep.replace('(size 4 4)', '(size 5.7 5.7)'))
raw = raw.replace('(footprint "' + source.stem + '"', '(footprint "ESP32-S3FH4R2_QFN56_EP5p7"', 1)
raw = re.sub(r'\(descr "[^"]*"\)', '(descr "ESP32-S3FH4R2: datasheet v2.2 Fig7-2 EP5.7x5.7; 16 paste windows 61.8%; board adds 9 GND vias at x/y -1.4,0,+1.4 mm. Body model illustrative.")', raw, count=1)
paste = []
for x in [-2.1, -.7, .7, 2.1]:
    for y in [-2.1, -.7, .7, 2.1]:
        paste.append(pad('', x, y, 1.12, 1.12, '"F.Paste"'))
raw = raw.rstrip()[:-1] + '\n'.join(paste) + '\n)\n'
(PRETTY / 'ESP32-S3FH4R2_QFN56_EP5p7.kicad_mod').write_text(raw, encoding='utf-8')

# Retain the GCT contact centers and holes; shorten only outer GND lands away from
# the locating pegs, giving >0.25mm nominal NPTH/copper gap instead of0.1944mm.
usb_source=Path(r'C:\Program Files\KiCad\10.0\share\kicad\footprints\Connector_USB.pretty\USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal.kicad_mod')
usb=usb_source.read_text()
for number in ['A1','B1','A12','B12']:
    block=re.search(r'\t\(pad "'+number+r'"[\s\S]*?\n\t\)',usb).group()
    changed=block.replace('-3.68)', '-3.755)').replace('(size 0.6 1.15)', '(size 0.6 1.0)')
    assert changed!=block
    usb=usb.replace(block,changed)
usb=usb.replace('(footprint "'+usb_source.stem+'"','(footprint "USB_C_Receptacle_GCT4105_NPTH"',1)
(PRETTY/'USB_C_Receptacle_GCT4105_NPTH.kicad_mod').write_text(usb)

# Native parser self-checks and independently declared high-risk contracts.
for name, expected in [('TPS63020_DSJ14', set(map(str, range(1, 16)))),
                       ('ESP32-S3FH4R2_QFN56_EP5p7', set(map(str, range(1, 58))))]:
    loaded = pcbnew.FootprintLoad(str(PRETTY), name)
    assert loaded is not None, name
    assert {p.GetNumber() for p in loaded.Pads() if p.GetNumber()} == expected, name
    if name.startswith('ESP32'):
        ep = next(p for p in loaded.Pads() if p.GetNumber() == '57')
        assert abs(pcbnew.ToMM(ep.GetSize().x) - 5.7) < 1e-6
        assert len([p for p in loaded.Pads() if not p.GetNumber()]) == 16
    else:
        p1 = next(p for p in loaded.Pads() if p.GetNumber() == '1')
        assert abs(pcbnew.ToMM(p1.GetPosition().x) + 1.4) < 1e-6
        assert abs(pcbnew.ToMM(p1.GetPosition().y) + 1.5) < 1e-6
print('Wrote 3 reviewed symbols and 2 native-loadable footprints; pin/pad geometry self-checks passed.')
