import pcbnew

def solve():
    board = pcbnew.LoadBoard('RAMS - PCB.kicad_pcb')

    layout = {
        # --- RF & 2.4GHz ---
        "ANT1": (103.5, 102.5, 180.0, "F.Cu"),
        "R10":  (107.0, 102.5, 0.0, "F.Cu"),
        "C19":  (108.8, 103.5, 90.0, "F.Cu"),
        "L2":   (110.5, 102.5, 0.0, "F.Cu"),
        "C18":  (112.2, 103.5, 90.0, "F.Cu"),

        # --- Crystal & Clock ---
        "R9":   (114.0, 102.5, 0.0, "F.Cu"),
        "Y1":   (118.0, 103.5, 0.0, "F.Cu"),
        "C24":  (116.0, 106.5, 0.0, "F.Cu"),
        "C25":  (120.0, 106.5, 0.0, "F.Cu"),

        # --- Buzzer & Driver ---
        "BZ1":  (133.5, 106.5, 0.0, "F.Cu"),
        "D3":   (124.5, 102.5, 0.0, "F.Cu"),
        "Q2":   (124.5, 106.0, 0.0, "F.Cu"),
        "R12":  (124.5, 108.8, 0.0, "F.Cu"),
        "R13":  (124.5, 110.5, 0.0, "F.Cu"),

        # --- MCU ESP32-S3 ---
        "U1":   (115.0, 112.5, 0.0, "F.Cu"),

        # --- West Side: Buttons & Decoupling ---
        "SW2":  (103.5, 108.5, 90.0, "F.Cu"),
        "SW3":  (103.5, 115.5, 90.0, "F.Cu"),
        "LED1": (102.5, 122.5, 0.0, "F.Cu"),

        "L1":   (107.0, 106.5, 0.0, "F.Cu"),
        "C11":  (107.0, 109.5, 90.0, "F.Cu"),
        "C12":  (109.2, 106.5, 0.0, "F.Cu"),
        "C13":  (109.2, 108.5, 0.0, "F.Cu"),
        "C14":  (109.2, 110.5, 0.0, "F.Cu"),
        "C23":  (109.0, 112.5, 0.0, "F.Cu"),
        "R8":   (109.0, 114.5, 0.0, "F.Cu"),

        "R14":  (107.0, 113.0, 0.0, "F.Cu"),
        "R15":  (107.0, 115.0, 0.0, "F.Cu"),
        "C29":  (107.0, 117.0, 0.0, "F.Cu"),

        # --- East Side: Power Path & Decoupling ---
        "C21":  (121.0, 109.0, 0.0, "F.Cu"),
        "C22":  (121.0, 111.0, 0.0, "F.Cu"),
        "C17":  (121.0, 113.0, 0.0, "F.Cu"),
        "C20":  (121.0, 115.0, 0.0, "F.Cu"),

        "Q1":   (124.5, 113.0, 0.0, "F.Cu"),
        "D2":   (124.0, 116.0, 0.0, "F.Cu"),
        "R6":   (121.0, 117.0, 0.0, "F.Cu"),

        "U3":   (129.0, 114.5, 0.0, "F.Cu"),
        "R3":   (132.5, 113.0, 0.0, "F.Cu"),
        "C4":   (131.5, 115.5, 0.0, "F.Cu"),

        "SW1":  (137.5, 117.0, 90.0, "F.Cu"),

        # --- South-Center: Decoupling & SPI series ---
        "C15":  (112.5, 118.0, 90.0, "F.Cu"),
        "C16":  (114.5, 118.0, 90.0, "F.Cu"),
        "C28":  (116.5, 118.0, 90.0, "F.Cu"),
        "R11":  (118.5, 118.0, 0.0, "F.Cu"),

        # --- South-West: LDO & Regulators ---
        "U5":   (111.0, 122.0, 0.0, "F.Cu"),
        "R7":   (106.0, 120.0, 0.0, "F.Cu"),
        "C7":   (106.0, 122.0, 0.0, "F.Cu"),
        "C8":   (106.0, 125.0, 0.0, "F.Cu"),
        "C9":   (106.0, 127.5, 0.0, "F.Cu"),
        "C10":  (111.5, 126.5, 0.0, "F.Cu"),

        # LoRa Power Filter
        "FB1":  (114.0, 121.5, 90.0, "F.Cu"),
        "C26":  (114.0, 124.5, 90.0, "F.Cu"),
        "C27":  (114.0, 127.5, 90.0, "F.Cu"),

        # --- South-Center: USB-C Connector J1 ---
        "J1":   (122.5, 126.5, 0.0, "F.Cu"),
        "D1":   (122.5, 120.0, 0.0, "F.Cu"),
        "R1":   (119.5, 120.0, 90.0, "F.Cu"),
        "R2":   (125.5, 120.0, 90.0, "F.Cu"),
        "C1":   (115.5, 122.0, 0.0, "F.Cu"),
        "C2":   (115.5, 124.0, 0.0, "F.Cu"),
        "C3":   (115.5, 126.0, 0.0, "F.Cu"),

        # --- South-East: Battery Protection & Connector J2 ---
        "U4":   (128.5, 120.5, 0.0, "F.Cu"),
        "R4":   (126.5, 118.5, 0.0, "F.Cu"),
        "R5":   (128.5, 118.5, 0.0, "F.Cu"),
        "C5":   (130.5, 118.5, 0.0, "F.Cu"),
        "C6":   (132.5, 118.5, 0.0, "F.Cu"),
        "Q3":   (131.0, 122.5, 0.0, "F.Cu"),
        "J2":   (137.0, 126.5, 0.0, "F.Cu"),

        # --- Back Copper: LoRa Ra-02 ---
        "U2":   (120.0, 114.0, 0.0, "B.Cu"),
    }

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
    print(f"B.Cu Overlaps: 0")
    return len(overlaps_f)

if __name__ == '__main__':
    solve()
