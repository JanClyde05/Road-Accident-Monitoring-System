import pcbnew

def get_layout():
    return {
        # RF Zone
        "ANT1": (103.5, 103.0, 180.0, "F.Cu"),
        "R10":  (107.0, 103.0, 0.0, "F.Cu"),
        "C19":  (108.5, 104.5, 90.0, "F.Cu"),
        "L2":   (110.0, 103.0, 0.0, "F.Cu"),
        "C18":  (111.5, 104.5, 90.0, "F.Cu"),

        # Clock Zone
        "R9":   (113.5, 103.0, 0.0, "F.Cu"),
        "Y1":   (117.5, 103.5, 0.0, "F.Cu"),
        "C24":  (115.5, 106.5, 0.0, "F.Cu"),
        "C25":  (119.5, 106.5, 0.0, "F.Cu"),

        # Buzzer Zone
        "BZ1":  (132.5, 107.0, 0.0, "F.Cu"),
        "D3":   (124.5, 103.0, 90.0, "F.Cu"),
        "Q2":   (124.5, 106.5, 0.0, "F.Cu"),
        "R12":  (124.5, 109.5, 0.0, "F.Cu"),
        "R13":  (124.5, 111.5, 0.0, "F.Cu"),

        # Core MCU
        "U1":   (115.0, 112.5, 0.0, "F.Cu"),

        # West Flank (Decoupling & UI)
        "SW2":  (103.5, 109.5, 90.0, "F.Cu"),
        "SW3":  (103.5, 117.0, 90.0, "F.Cu"),
        "LED1": (103.5, 124.5, 0.0, "F.Cu"),

        "L1":   (107.5, 108.0, 0.0, "F.Cu"),
        "C11":  (107.5, 110.5, 90.0, "F.Cu"),
        "C12":  (109.5, 108.0, 0.0, "F.Cu"),
        "C13":  (109.5, 109.5, 0.0, "F.Cu"),
        "C14":  (109.5, 111.0, 0.0, "F.Cu"),
        "C23":  (109.5, 113.0, 0.0, "F.Cu"),
        "R8":   (109.5, 115.0, 0.0, "F.Cu"),

        "R14":  (107.5, 114.0, 0.0, "F.Cu"),
        "R15":  (107.5, 116.0, 0.0, "F.Cu"),
        "C29":  (107.5, 118.0, 0.0, "F.Cu"),

        # East Flank
        "C21":  (121.0, 110.0, 0.0, "F.Cu"),
        "C22":  (121.0, 112.0, 0.0, "F.Cu"),
        "C17":  (121.0, 114.0, 0.0, "F.Cu"),
        "C20":  (121.0, 116.0, 0.0, "F.Cu"),

        "Q1":   (124.5, 115.0, 0.0, "F.Cu"),
        "D2":   (124.5, 118.5, 0.0, "F.Cu"),
        "R6":   (121.5, 118.0, 0.0, "F.Cu"),

        "C4":   (128.5, 115.0, 0.0, "F.Cu"),
        "U3":   (128.5, 118.5, 0.0, "F.Cu"),
        "R3":   (131.5, 115.0, 0.0, "F.Cu"),

        "SW1":  (137.0, 118.0, 90.0, "F.Cu"),

        # South Flank (Under MCU)
        "C15":  (113.5, 118.5, 90.0, "F.Cu"),
        "C16":  (115.5, 118.5, 90.0, "F.Cu"),
        "C28":  (117.5, 118.5, 90.0, "F.Cu"),
        "R11":  (119.5, 118.5, 0.0, "F.Cu"),

        # LDO & Power
        "U5":   (112.5, 122.5, 0.0, "F.Cu"),
        "R7":   (109.5, 121.0, 0.0, "F.Cu"),
        "C7":   (107.0, 121.0, 0.0, "F.Cu"),
        "C8":   (108.0, 124.0, 0.0, "F.Cu"),
        "C9":   (108.0, 127.0, 0.0, "F.Cu"),
        "C10":  (112.5, 127.0, 0.0, "F.Cu"),

        "FB1":  (115.5, 122.5, 90.0, "F.Cu"),
        "C26":  (115.5, 125.0, 90.0, "F.Cu"),
        "C27":  (115.5, 127.5, 90.0, "F.Cu"),

        # USB-C & Protection
        "D1":   (123.5, 121.5, 0.0, "F.Cu"),
        "R1":   (120.5, 121.5, 90.0, "F.Cu"),
        "R2":   (126.5, 121.5, 90.0, "F.Cu"),
        "C1":   (119.5, 124.0, 0.0, "F.Cu"),
        "C2":   (119.5, 126.0, 0.0, "F.Cu"),
        "C3":   (119.5, 128.0, 0.0, "F.Cu"),
        "J1":   (124.5, 126.0, 0.0, "F.Cu"),

        # Battery Protection & Connector
        "U4":   (131.5, 122.0, 0.0, "F.Cu"),
        "R4":   (129.0, 122.0, 0.0, "F.Cu"),
        "R5":   (129.0, 124.0, 0.0, "F.Cu"),
        "C5":   (129.0, 126.0, 0.0, "F.Cu"),
        "C6":   (129.0, 128.0, 0.0, "F.Cu"),
        "Q3":   (133.5, 126.0, 90.0, "F.Cu"),
        "J2":   (137.5, 125.5, 0.0, "F.Cu"),

        # Bottom Copper
        "U2":   (120.0, 115.0, 0.0, "B.Cu"),
    }

def run():
    layout = get_layout()
    board = pcbnew.LoadBoard('RAMS - PCB.kicad_pcb')

    for ref, (x, y, rot, layer) in layout.items():
        fp = board.FindFootprintByReference(ref)
        if not fp: continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)

    f_fps = [fp for fp in board.GetFootprints() if fp.GetLayerName() == 'F.Cu']
    b_fps = [fp for fp in board.GetFootprints() if fp.GetLayerName() == 'B.Cu']

    overlaps_f = []
    for i in range(len(f_fps)):
        for j in range(i + 1, len(f_fps)):
            fp1, fp2 = f_fps[i], f_fps[j]
            bb1 = fp1.GetBoundingBox(False, False)
            bb2 = fp2.GetBoundingBox(False, False)
            margin = pcbnew.FromMM(0.05)
            bb1.Inflate(margin)
            if bb1.Intersects(bb2):
                overlaps_f.append((fp1.GetReference(), fp2.GetReference()))

    print(f"F.Cu Overlaps (0.05mm margin): {len(overlaps_f)}")
    for o in overlaps_f:
        print(f"  Overlap: {o[0]} and {o[1]}")

    overlaps_b = []
    for i in range(len(b_fps)):
        for j in range(i + 1, len(b_fps)):
            fp1, fp2 = b_fps[i], b_fps[j]
            bb1 = fp1.GetBoundingBox(False, False)
            bb2 = fp2.GetBoundingBox(False, False)
            if bb1.Intersects(bb2):
                overlaps_b.append((fp1.GetReference(), fp2.GetReference()))
    print(f"B.Cu Overlaps: {len(overlaps_b)}")

if __name__ == '__main__':
    run()
