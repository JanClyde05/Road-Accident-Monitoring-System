"""Read-only geometry/pin snapshot for the 2026-11-14 parts review."""
from pathlib import Path
import hashlib
import json
import pcbnew as p

root = Path(__file__).resolve().parents[2]
source = root / 'RAMS_JLC_S3.kicad_pcb'
before = hashlib.sha256(source.read_bytes()).hexdigest()
board = p.LoadBoard(str(source))
refs = ['J1', 'J2', 'SW1', 'SW2', 'SW3', 'Q3', 'U4', 'BZ1', 'LED1', 'U1']
expected = {
    'Q3': {'1': 'B_MINUS', '2': 'FET_DRAIN', '3': 'GND', '4': 'DW_OC', '5': 'FET_DRAIN', '6': 'DW_OD'},
    'SW1': {'1': 'LED_GATE', '2': 'GND', '3': 'SYS_EN', 'SH': 'GND'},
    'SW2': {'1': 'MCU_EN', '2': 'GND'},
    'SW3': {'1': 'BOOT_BTN', '2': 'GND'},
    'BZ1': {'1': '+3V3', '2': 'BUZZER_NEG'},
    'U4': {'1': 'DW_OD', '2': 'DW_CS', '3': 'DW_OC', '5': 'DW_VCC', '6': 'B_MINUS'},
    'LED1': {'2': 'GND', '3': 'NEO_DIN', '4': 'LED_PWR'},
    'J2': {'1': 'B_PLUS', '2': 'B_MINUS'},
    'J1': {'A1': 'GND', 'A4': 'VBUS', 'A5': 'CC1', 'A6': 'USB_DP_CONN', 'A7': 'USB_DN_CONN',
           'A9': 'VBUS', 'A12': 'GND', 'B1': 'GND', 'B4': 'VBUS', 'B5': 'CC2',
           'B6': 'USB_DP_CONN', 'B7': 'USB_DN_CONN', 'B9': 'VBUS', 'B12': 'GND', 'SH': 'GND'},
}
items = []
for ref in refs:
    fp = board.FindFootprintByReference(ref)
    pads = []
    for pad in fp.Pads():
        number = pad.GetNumber()
        if number in expected.get(ref, {}):
            assert pad.GetNetname() == expected[ref][number], (ref, number, pad.GetNetname())
        pads.append({'number': number, 'net': pad.GetNetname(), 'local_xy_mm': p.ToMM(pad.GetFPRelativePosition()),
                     'size_mm': p.ToMM(pad.GetSize()), 'drill_mm': p.ToMM(pad.GetDrillSize()),
                     'front_copper': pad.IsOnLayer(p.F_Cu), 'front_mask': pad.IsOnLayer(p.F_Mask),
                     'front_paste': pad.IsOnLayer(p.F_Paste)})
    items.append({'reference': ref, 'value': fp.GetValue(), 'footprint': str(fp.GetFPID().GetLibItemName()), 'pads': pads})

origin = p.ToMM(board.FindFootprintByReference('U1').GetPosition())
vias = []
for track in board.GetTracks():
    if not isinstance(track, p.PCB_VIA):
        continue
    x, y = p.ToMM(track.GetPosition())
    if abs(x - origin[0]) < 2.85 and abs(y - origin[1]) < 2.85:
        vias.append({'u1_local_xy_mm': [x - origin[0], y - origin[1]], 'net': track.GetNetname(),
                     'drill_mm': p.ToMM(track.GetDrillValue()), 'diameter_mm': p.ToMM(track.GetWidth(p.F_Cu))})
assert len(vias) == 9 and all(v['net'] == 'GND' and v['drill_mm'] == 0.2 for v in vias)
assert hashlib.sha256(source.read_bytes()).hexdigest() == before, 'Source changed during snapshot; rerun.'
report = {'board_sha256': before, 'kicad': p.Version(), 'status': 'Selected pin contracts match; nine EP ground vias retained',
          'scope': 'Native CAD only. No actual component measurements, soldering or powered testing.', 'components': items, 'u1_ep_vias': vias}
Path(__file__).with_name('parts_pin_geometry_audit.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'board_sha256': before, 'status': report['status'], 'components': len(items)}))
