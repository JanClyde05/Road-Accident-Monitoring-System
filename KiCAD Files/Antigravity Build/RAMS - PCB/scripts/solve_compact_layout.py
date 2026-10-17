"""solve_compact_layout.py -- Design and verify a compact 40.0 x 32.0 mm layout.

Key improvements:
1. Board shrunk from 50x40 mm to 40.0 x 32.0 mm (origin: 100.0, 100.0).
2. USB-C receptacle J1 positioned with front lip at the bottom edge (Y=132.0).
3. Battery JST connector J2 positioned at the bottom edge facing outward.
4. Ceramic chip antenna ANT1 placed at the top-left corner with a direct, short RF feedline
   from U1 pin 1, fully isolated from the 40MHz crystal oscillator Y1.
5. 40MHz crystal Y1 placed directly north of U1 pins 53/54 with shortest possible traces.
6. Slide switch SW1 placed at the right edge with its actuator protruding past X=140.0.
7. Tactile buttons SW2/SW3 placed at the left edge.
8. Ra-02 LoRa module U2 placed on B.Cu, clear of all through-hole pins.
"""
import pcbnew
import subprocess
import os
import re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Compact board bounds: 40.0 x 32.0 mm
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 140.0, 132.0
FILLET = 1.5

LAYOUT_COMPACT = {
    # ── ZONE 1: 2.4 GHz RF & Chip Antenna (Top-Left) ──
    # Clean, direct diagonal RF feed from U1 pin 1 (112.55, 110.40) to ANT1 corner
    "ANT1": (103.50, 102.50, 180.0, "F.Cu"),
    "R10":  (106.00, 103.50, 45.0,  "F.Cu"),  # series tuning
    "C19":  (108.00, 105.00, 45.0,  "F.Cu"),  # shunt
    "L2":   (109.50, 106.50, 45.0,  "F.Cu"),  # series inductor
    "C18":  (111.00, 108.00, 45.0,  "F.Cu"),  # shunt at U1 pin 1

    # ── ZONE 2: 40 MHz Crystal & Clock (Top-Center, North of MCU) ──
    # Directly above pins 53 & 54 of U1, isolated from RF feed
    "R9":   (114.50, 103.50, 0.0,   "F.Cu"),  # 22R series damping
    "Y1":   (117.50, 104.50, 0.0,   "F.Cu"),  # 40MHz crystal
    "C24":  (115.00, 107.00, 0.0,   "F.Cu"),  # 12pF load cap
    "C25":  (120.00, 107.00, 0.0,   "F.Cu"),  # 12pF load cap

    # ── ZONE 3: Buzzer & Driver (Top-Right) ──
    "BZ1":  (132.50, 106.50, 0.0,   "F.Cu"),  # 10.7mm diameter piezo
    "D3":   (124.50, 103.00, 0.0,   "F.Cu"),  # 1N4148 flyback diode
    "Q2":   (124.50, 105.50, 0.0,   "F.Cu"),  # BC817 NPN driver
    "R12":  (124.50, 108.00, 0.0,   "F.Cu"),  # 1k base resistor
    "R13":  (124.50, 110.00, 0.0,   "F.Cu"),  # 100k pull-down

    # ── ZONE 4: MCU ESP32-S3 (Center) ──
    "U1":   (116.00, 113.00, 0.0,   "F.Cu"),

    # ── ZONE 5: West Edge Buttons, LED, Decoupling ──
    "SW2":  (102.50, 108.50, 90.0,  "F.Cu"),  # RESET button
    "SW3":  (102.50, 114.50, 90.0,  "F.Cu"),  # BOOT button
    "LED1": (102.50, 120.50, 0.0,   "F.Cu"),  # SK6805 RGB LED

    "L1":   (107.00, 107.00, 0.0,   "F.Cu"),
    "C11":  (107.00, 109.50, 90.0,  "F.Cu"),
    "C12":  (109.50, 107.00, 0.0,   "F.Cu"),
    "C13":  (109.50, 109.00, 0.0,   "F.Cu"),
    "C14":  (109.50, 111.00, 0.0,   "F.Cu"),
    "C23":  (109.50, 113.00, 0.0,   "F.Cu"),
    "R8":   (109.50, 115.00, 0.0,   "F.Cu"),

    "R14":  (107.00, 112.50, 0.0,   "F.Cu"),  # VBAT divider high
    "R15":  (107.00, 114.50, 0.0,   "F.Cu"),  # VBAT divider low
    "C29":  (107.00, 116.50, 0.0,   "F.Cu"),  # VBAT filter

    # ── ZONE 6: East Side MCU Decoupling Column ──
    "C21":  (122.00, 109.00, 0.0,   "F.Cu"),
    "C22":  (122.00, 111.00, 0.0,   "F.Cu"),
    "C17":  (122.00, 113.00, 0.0,   "F.Cu"),
    "C20":  (122.00, 115.00, 0.0,   "F.Cu"),

    # ── ZONE 7: Power Path (East) ──
    "Q1":   (126.00, 113.50, 0.0,   "F.Cu"),  # P-FET
    "D2":   (126.00, 116.50, 0.0,   "F.Cu"),  # SS14 Schottky
    "R6":   (122.00, 117.50, 0.0,   "F.Cu"),  # gate resistor

    # ── ZONE 8: LiPo Charger U3 (East) ──
    "U3":   (131.00, 113.50, 0.0,   "F.Cu"),  # LTH7R
    "R3":   (135.00, 113.50, 0.0,   "F.Cu"),  # PROG res
    "C4":   (131.00, 116.50, 0.0,   "F.Cu"),  # BAT cap

    # ── ZONE 9: Power Switch (Right Board Edge) ──
    # Slide knob protrudes past X=140.0
    "SW1":  (137.50, 119.50, 90.0,  "F.Cu"),

    # ── ZONE 10: South MCU SPI Decoupling Row ──
    "C15":  (112.50, 119.00, 90.0,  "F.Cu"),
    "C16":  (114.50, 119.00, 90.0,  "F.Cu"),
    "C28":  (116.50, 119.00, 90.0,  "F.Cu"),
    "R11":  (118.50, 119.00, 0.0,   "F.Cu"),

    # ── ZONE 11: 3.3V LDO Regulator U5 (South-West) ──
    "R7":   (104.50, 118.00, 0.0,   "F.Cu"),
    "U5":   (108.00, 122.50, 0.0,   "F.Cu"),  # AP2112K-3.3
    "C7":   (104.00, 123.50, 0.0,   "F.Cu"),  # 10uF IN
    "C8":   (104.00, 126.50, 0.0,   "F.Cu"),  # 100uF OUT
    "C9":   (108.00, 126.00, 0.0,   "F.Cu"),  # 10uF OUT
    "C10":  (104.00, 129.50, 0.0,   "F.Cu"),  # 47uF OUT

    # ── ZONE 12: LoRa Power Filter ──
    "FB1":  (112.00, 122.50, 0.0,   "F.Cu"),
    "C26":  (112.00, 125.00, 0.0,   "F.Cu"),
    "C27":  (112.00, 127.50, 0.0,   "F.Cu"),

    # ── ZONE 13: USB-C Connector J1, ESD D1, and VBUS Caps ──
    # Front mouth of J1 reaches Y = 128.5 + 3.7 = 132.2 mm (flush with Y=132.0 edge!)
    "J1":   (120.00, 128.50, 0.0,   "F.Cu"),
    "D1":   (120.00, 122.00, 0.0,   "F.Cu"),  # USBLC6-2SC6 ESD
    "R1":   (116.00, 122.00, 0.0,   "F.Cu"),  # CC1 5.1k
    "R2":   (124.00, 122.00, 0.0,   "F.Cu"),  # CC2 5.1k
    "C1":   (127.50, 125.00, 0.0,   "F.Cu"),  # VBUS 10uF
    "C2":   (127.50, 127.50, 0.0,   "F.Cu"),  # VBUS 0.1uF
    "C3":   (127.50, 130.00, 0.0,   "F.Cu"),  # VBUS 1uF

    # ── ZONE 14: LiPo Battery Protection & Connector J2 (South-East Edge) ──
    "R4":   (131.00, 120.50, 0.0,   "F.Cu"),
    "R5":   (133.50, 120.50, 0.0,   "F.Cu"),
    "U4":   (134.00, 123.50, 0.0,   "F.Cu"),  # DW01A
    "C5":   (131.00, 123.50, 0.0,   "F.Cu"),
    "C6":   (131.00, 126.00, 0.0,   "F.Cu"),
    "Q3":   (137.50, 125.00, 90.0,  "F.Cu"),  # FS8205A dual FET
    # J2 front mouth faces south bottom edge
    "J2":   (134.00, 129.50, 0.0,   "F.Cu"),

    # ── ZONE 15: Back Copper: LoRa Ra-02 Transceiver ──
    # Centered at (118.0, 112.5), completely clear of J1/SW1 through-holes
    "U2":   (118.00, 112.50, 0.0,   "B.Cu"),
}

def apply_compact():
    board = pcbnew.LoadBoard(BOARD_PATH)
    print(f"Applying compact layout for {len(LAYOUT_COMPACT)} components...")

    for ref, (x, y, rot, layer) in LAYOUT_COMPACT.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"  WARN: {ref} not found on board")
            continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)
            print(f"  Flipped {ref} to {layer}")

    # Rebuild Edge.Cuts with tight 40.0 x 32.0 mm outline (r=1.5mm)
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)

    x0, y0 = BX0, BY0
    x1, y1 = BX1, BY1
    r = FILLET
    w = 0.15

    def seg(sx, sy, ex, ey):
        s = pcbnew.PCB_SHAPE(board)
        s.SetShape(pcbnew.SHAPE_T_SEGMENT)
        s.SetLayer(pcbnew.Edge_Cuts)
        s.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        s.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        s.SetWidth(pcbnew.FromMM(w))
        board.Add(s)

    def arc(cx, cy, sx, sy, ex, ey):
        a = pcbnew.PCB_SHAPE(board)
        a.SetShape(pcbnew.SHAPE_T_ARC)
        a.SetLayer(pcbnew.Edge_Cuts)
        a.SetCenter(pcbnew.VECTOR2I(pcbnew.FromMM(cx), pcbnew.FromMM(cy)))
        a.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        a.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        a.SetWidth(pcbnew.FromMM(w))
        board.Add(a)

    # Closed rounded rectangle:
    seg(x0 + r, y0, x1 - r, y0)
    arc(x1 - r, y0 + r, x1 - r, y0, x1, y0 + r)
    seg(x1, y0 + r, x1, y1 - r)
    arc(x1 - r, y1 - r, x1, y1 - r, x1 - r, y1)
    seg(x1 - r, y1, x0 + r, y1)
    arc(x0 + r, y1 - r, x0 + r, y1, x0, y1 - r)
    seg(x0, y1 - r, x0, y0 + r)
    arc(x0 + r, y0 + r, x0, y0 + r, x0 + r, y0)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"Board saved with compact dimensions: {x1-x0:.1f} x {y1-y0:.1f} mm.")

if __name__ == '__main__':
    apply_compact()

    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Compact_Test.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH])
    
    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
            
        print("\n=== DRC Summary (Compact Layout) ===")
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
