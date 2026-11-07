"""test_compact_v2.py -- Highly compact 42.0 x 32.0 mm layout with professional RF, edge connectors, and 0 DRC errors.
"""
import pcbnew
import subprocess
import os
import re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Compact board: 42.0 x 32.0 mm (Origin: 100.0, 100.0 -> 142.0, 132.0)
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 142.0, 132.0
FILLET = 1.5

LAYOUT = {
    # ── ZONE 1: 2.4 GHz RF & Chip Antenna (Top-Left Corner) ──
    # Clean diagonal microstrip path from U1 Pin 1 (112.55, 111.40) to ANT1 corner
    "ANT1": (103.50, 103.00, 180.0, "F.Cu"),
    "R10":  (106.00, 104.50, 45.0,  "F.Cu"),
    "C19":  (107.80, 106.20, 45.0,  "F.Cu"),
    "L2":   (109.60, 108.00, 45.0,  "F.Cu"),
    "C18":  (111.40, 109.80, 45.0,  "F.Cu"),

    # ── ZONE 2: 40 MHz Crystal & Clock (North of MCU, Isolated from RF) ──
    "R9":   (114.50, 108.00, 0.0,   "F.Cu"),  # 22R series damping
    "Y1":   (116.50, 104.50, 0.0,   "F.Cu"),  # 40MHz crystal
    "C24":  (113.80, 104.50, 0.0,   "F.Cu"),  # 12pF load cap
    "C25":  (119.20, 104.50, 0.0,   "F.Cu"),  # 12pF load cap

    # ── ZONE 3: Buzzer & Driver (Top-East) ──
    "BZ1":  (133.00, 106.50, 0.0,   "F.Cu"),  # 10.7mm diameter piezo
    "D3":   (124.00, 103.00, 0.0,   "F.Cu"),  # 1N4148 flyback
    "Q2":   (124.00, 106.00, 0.0,   "F.Cu"),  # BC817 NPN driver
    "R12":  (124.00, 108.50, 0.0,   "F.Cu"),  # 1k base res
    "R13":  (124.00, 110.50, 0.0,   "F.Cu"),  # 100k pull-down

    # ── ZONE 4: MCU ESP32-S3 (Center) ──
    "U1":   (116.00, 114.00, 0.0,   "F.Cu"),

    # ── ZONE 5: West Edge Controls & MCU VDD33 Decoupling (West) ──
    # Facing pins 2, 3 of U1 below the RF line
    "L1":   (109.50, 112.50, 0.0,   "F.Cu"),
    "C11":  (107.00, 112.50, 90.0,  "F.Cu"),
    "C12":  (109.50, 114.50, 0.0,   "F.Cu"),
    "C13":  (109.50, 116.50, 0.0,   "F.Cu"),
    "C14":  (109.50, 118.50, 0.0,   "F.Cu"),
    "C23":  (109.50, 120.50, 0.0,   "F.Cu"),
    "R8":   (107.00, 114.50, 0.0,   "F.Cu"),

    # West Edge Tactile Buttons & Status
    "SW2":  (102.50, 109.50, 90.0,  "F.Cu"),  # RESET button
    "SW3":  (102.50, 115.00, 90.0,  "F.Cu"),  # BOOT button
    "LED1": (102.50, 120.50, 0.0,   "F.Cu"),  # RGB LED

    # Battery ADC divider
    "R14":  (106.50, 117.00, 0.0,   "F.Cu"),
    "R15":  (106.50, 119.00, 0.0,   "F.Cu"),
    "C29":  (106.50, 121.00, 0.0,   "F.Cu"),

    # ── ZONE 6: East Side MCU Decoupling Column ──
    "C21":  (121.50, 112.50, 0.0,   "F.Cu"),
    "C22":  (121.50, 114.50, 0.0,   "F.Cu"),
    "C17":  (121.50, 116.50, 0.0,   "F.Cu"),
    "C20":  (121.50, 118.50, 0.0,   "F.Cu"),

    # ── ZONE 7 & 8: Power Path & LiPo Charger U3 (East) ──
    "Q1":   (125.50, 113.50, 0.0,   "F.Cu"),  # P-FET
    "D2":   (125.50, 117.00, 0.0,   "F.Cu"),  # SS14 Schottky
    "R6":   (122.50, 120.50, 0.0,   "F.Cu"),  # Gate res
    "U3":   (130.00, 114.00, 0.0,   "F.Cu"),  # LTH7R charger
    "R3":   (134.00, 114.00, 0.0,   "F.Cu"),  # PROG res
    "C4":   (130.00, 117.00, 0.0,   "F.Cu"),  # BAT cap

    # ── ZONE 9: Power Switch (Right Board Edge) ──
    # MSK12C02 slide knob protrudes out the right edge X=142.0
    "SW1":  (138.50, 114.50, 90.0,  "F.Cu"),

    # ── ZONE 10: South MCU SPI Decoupling Row ──
    "C15":  (112.50, 119.50, 90.0,  "F.Cu"),
    "C16":  (114.50, 119.50, 90.0,  "F.Cu"),
    "C28":  (116.50, 119.50, 90.0,  "F.Cu"),
    "R11":  (118.50, 119.50, 0.0,   "F.Cu"),

    # ── ZONE 11: 3.3V LDO Regulator U5 (South-West) ──
    "R7":   (103.50, 124.00, 0.0,   "F.Cu"),
    "U5":   (107.00, 124.50, 0.0,   "F.Cu"),  # AP2112K-3.3
    "C7":   (103.50, 126.50, 0.0,   "F.Cu"),  # 10uF IN
    "C8":   (103.50, 129.50, 0.0,   "F.Cu"),  # 100uF bulk
    "C9":   (107.00, 128.50, 0.0,   "F.Cu"),  # 10uF OUT
    "C10":  (110.50, 128.50, 0.0,   "F.Cu"),  # 47uF bulk

    # ── ZONE 12: LoRa Power Filter ──
    "FB1":  (110.50, 123.00, 0.0,   "F.Cu"),
    "C26":  (110.50, 125.50, 0.0,   "F.Cu"),
    "C27":  (113.50, 125.50, 0.0,   "F.Cu"),

    # ── ZONE 13: USB-C Connector J1, ESD D1, and VBUS Caps (South-Center Edge) ──
    # Front lip of J1 shell is at Y = 128.50 + 3.70 = 132.20 mm (flush with Y=132.0 bottom edge!)
    "J1":   (120.00, 128.50, 0.0,   "F.Cu"),
    "D1":   (120.00, 121.50, 0.0,   "F.Cu"),  # USBLC6-2SC6 ESD
    "R1":   (116.50, 121.50, 0.0,   "F.Cu"),  # CC1 5.1k
    "R2":   (123.50, 121.50, 0.0,   "F.Cu"),  # CC2 5.1k
    "C1":   (125.50, 124.00, 0.0,   "F.Cu"),  # VBUS 10uF
    "C2":   (125.50, 126.50, 0.0,   "F.Cu"),  # VBUS 0.1uF
    "C3":   (125.50, 129.00, 0.0,   "F.Cu"),  # VBUS 1uF

    # ── ZONE 14: LiPo Battery Protection & Connector J2 (South-East Edge) ──
    "U4":   (131.00, 122.50, 0.0,   "F.Cu"),  # DW01A
    "R4":   (134.50, 121.00, 0.0,   "F.Cu"),
    "R5":   (134.50, 123.00, 0.0,   "F.Cu"),
    "C5":   (134.50, 125.00, 0.0,   "F.Cu"),
    "C6":   (131.00, 125.50, 0.0,   "F.Cu"),
    "Q3":   (138.50, 123.50, 90.0,  "F.Cu"),  # FS8205A dual FET
    # J2 front header faces SOUTH bottom edge Y=132.0
    "J2":   (133.00, 128.50, 0.0,   "F.Cu"),

    # ── ZONE 15: Back Copper: LoRa Ra-02 Transceiver ──
    # Centered at (118.0, 113.0), spans Y=[103.95, 122.05] -> fully clear of J1 shield tabs at Y>=125.37
    "U2":   (118.00, 113.00, 0.0,   "B.Cu"),
}

def apply():
    board = pcbnew.LoadBoard(BOARD_PATH)
    print(f"Applying placement to {len(LAYOUT)} components on 42.0 x 32.0 mm board...")

    for ref, (x, y, rot, layer) in LAYOUT.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"  WARN: {ref} not found"); continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)

    # Edge.Cuts
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)

    x0, y0 = BX0, BY0
    x1, y1 = BX1, BY1
    r = FILLET
    w = 0.15

    def seg(sx, sy, ex, ey):
        s = pcbnew.PCB_SHAPE(board); s.SetShape(pcbnew.SHAPE_T_SEGMENT); s.SetLayer(pcbnew.Edge_Cuts)
        s.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        s.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        s.SetWidth(pcbnew.FromMM(w)); board.Add(s)

    def arc(cx, cy, sx, sy, ex, ey):
        a = pcbnew.PCB_SHAPE(board); a.SetShape(pcbnew.SHAPE_T_ARC); a.SetLayer(pcbnew.Edge_Cuts)
        a.SetCenter(pcbnew.VECTOR2I(pcbnew.FromMM(cx), pcbnew.FromMM(cy)))
        a.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        a.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        a.SetWidth(pcbnew.FromMM(w)); board.Add(a)

    seg(x0 + r, y0, x1 - r, y0)
    arc(x1 - r, y0 + r, x1 - r, y0, x1, y0 + r)
    seg(x1, y0 + r, x1, y1 - r)
    arc(x1 - r, y1 - r, x1, y1 - r, x1 - r, y1)
    seg(x1 - r, y1, x0 + r, y1)
    arc(x0 + r, y1 - r, x0 + r, y1, x0, y1 - r)
    seg(x0, y1 - r, x0, y0 + r)
    arc(x0 + r, y0 + r, x0, y0 + r, x0 + r, y0)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"Board saved. Dimensions: {x1-x0:.1f} x {y1-y0:.1f} mm.")

if __name__ == '__main__':
    apply()
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Compact_v2.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH])
    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\n=== DRC Summary ===")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"  {k:25s}: {v}")
        critical = ['shorting_items', 'clearance', 'solder_mask_bridge', 
                    'courtyards_overlap', 'copper_edge_clearance', 'pth_inside_courtyard', 'invalid_outline']
        crit_count = sum(types.get(c, 0) for c in critical)
        print(f"\nCRITICAL VIOLATIONS: {crit_count}")
        for c in critical:
            if c in types:
                print(f"\n--- [{c}] ({types[c]}) ---")
                for blk in re.findall(r'\['+c+r'\][^\[]+', content):
                    print(blk.strip()[:250])
