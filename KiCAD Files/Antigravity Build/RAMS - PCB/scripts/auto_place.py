import pcbnew

def solve_layout():
    board = pcbnew.LoadBoard('RAMS - PCB.kicad_pcb')

    pos = {
        # RF Zone (Top-Left)
        "ANT1": [103.5, 102.5, 180.0, "F.Cu", True],
        "R10":  [107.0, 102.5, 0.0, "F.Cu", False],
        "C19":  [109.0, 103.0, 90.0, "F.Cu", False],
        "L2":   [111.0, 102.5, 0.0, "F.Cu", False],
        "C18":  [113.0, 103.0, 90.0, "F.Cu", False],

        # Crystal Zone (Top)
        "R9":   [115.0, 102.5, 0.0, "F.Cu", False],
        "Y1":   [118.5, 103.5, 0.0, "F.Cu", False],
        "C24":  [116.5, 106.0, 0.0, "F.Cu", False],
        "C25":  [120.5, 106.0, 0.0, "F.Cu", False],

        # Buzzer Zone (Top-Right)
        "BZ1":  [134.0, 106.0, 0.0, "F.Cu", True],
        "D3":   [125.0, 102.5, 0.0, "F.Cu", False],
        "Q2":   [125.0, 105.5, 0.0, "F.Cu", False],
        "R12":  [125.0, 108.5, 0.0, "F.Cu", False],
        "R13":  [125.0, 110.5, 0.0, "F.Cu", False],

        # MCU Core (Center)
        "U1":   [115.0, 112.5, 0.0, "F.Cu", True],

        # West UI & Decoupling
        "SW2":  [103.0, 108.0, 90.0, "F.Cu", False],
        "SW3":  [103.0, 114.5, 90.0, "F.Cu", False],
        "LED1": [103.0, 121.0, 0.0, "F.Cu", False],

        "L1":   [107.0, 106.0, 0.0, "F.Cu", False],
        "C11":  [107.0, 108.5, 90.0, "F.Cu", False],
        "C12":  [109.5, 106.0, 0.0, "F.Cu", False],
        "C13":  [109.5, 107.8, 0.0, "F.Cu", False],
        "C14":  [109.5, 109.6, 0.0, "F.Cu", False],
        "C23":  [109.5, 111.4, 0.0, "F.Cu", False],
        "R8":   [109.5, 113.2, 0.0, "F.Cu", False],

        "R14":  [107.0, 112.0, 0.0, "F.Cu", False],
        "R15":  [107.0, 114.0, 0.0, "F.Cu", False],
        "C29":  [107.0, 116.0, 0.0, "F.Cu", False],

        # East Decoupling & Power Path
        "C21":  [121.0, 108.5, 0.0, "F.Cu", False],
        "C22":  [121.0, 110.5, 0.0, "F.Cu", False],
        "C17":  [121.0, 112.5, 0.0, "F.Cu", False],
        "C20":  [121.0, 114.5, 0.0, "F.Cu", False],

        "Q1":   [125.0, 113.5, 0.0, "F.Cu", False],
        "D2":   [125.0, 116.5, 0.0, "F.Cu", False],
        "R6":   [121.5, 116.5, 0.0, "F.Cu", False],

        "U3":   [129.5, 114.0, 0.0, "F.Cu", False],
        "R3":   [133.0, 113.0, 0.0, "F.Cu", False],
        "C4":   [133.0, 115.5, 0.0, "F.Cu", False],

        "SW1":  [137.5, 117.0, 90.0, "F.Cu", True],

        # South Decoupling
        "C15":  [112.5, 118.0, 90.0, "F.Cu", False],
        "C16":  [114.5, 118.0, 90.0, "F.Cu", False],
        "C28":  [116.5, 118.0, 90.0, "F.Cu", False],
        "R11":  [118.5, 118.0, 0.0, "F.Cu", False],

        # South-West LDO & Regulators
        "U5":   [110.5, 121.5, 0.0, "F.Cu", False],
        "R7":   [106.5, 119.5, 0.0, "F.Cu", False],
        "C7":   [106.5, 122.0, 0.0, "F.Cu", False],
        "C8":   [106.5, 125.0, 0.0, "F.Cu", False],
        "C9":   [106.5, 128.0, 0.0, "F.Cu", False],
        "C10":  [111.0, 126.5, 0.0, "F.Cu", False],

        # LoRa Power Filter
        "FB1":  [114.0, 121.5, 90.0, "F.Cu", False],
        "C26":  [114.0, 124.5, 90.0, "F.Cu", False],
        "C27":  [114.0, 127.5, 90.0, "F.Cu", False],

        # USB-C J1 & ESD
        "J1":   [122.5, 126.5, 0.0, "F.Cu", True],
        "D1":   [122.5, 120.0, 0.0, "F.Cu", False],
        "R1":   [119.5, 120.0, 90.0, "F.Cu", False],
        "R2":   [125.5, 120.0, 90.0, "F.Cu", False],
        "C1":   [116.5, 121.0, 0.0, "F.Cu", False],
        "C2":   [116.5, 123.5, 0.0, "F.Cu", False],
        "C3":   [116.5, 126.0, 0.0, "F.Cu", False],

        # Battery Protection & J2
        "U4":   [128.0, 120.5, 0.0, "F.Cu", False],
        "R4":   [127.5, 117.5, 0.0, "F.Cu", False],
        "R5":   [129.5, 117.5, 0.0, "F.Cu", False],
        "C5":   [131.5, 117.5, 0.0, "F.Cu", False],
        "C6":   [133.5, 117.5, 0.0, "F.Cu", False],
        "Q3":   [133.0, 119.5, 90.0, "F.Cu", False],
        "J2":   [138.0, 126.0, 0.0, "F.Cu", True],

        # Back Copper
        "U2":   [120.0, 114.0, 0.0, "B.Cu", True],
    }

    # Fetch initial footprint sizes
    for ref, (x, y, rot, layer, locked) in pos.items():
        fp = board.FindFootprintByReference(ref)
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)

    margin = 0.25 # mm clearance margin
    f_refs = [r for r in pos.keys() if pos[r][3] == 'F.Cu']

    print("Running AABB relaxation loop on F.Cu...")
    for iteration in range(300):
        for ref in f_refs:
            x, y, rot, layer, locked = pos[ref]
            fp = board.FindFootprintByReference(ref)
            fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))

        boxes = {}
        for ref in f_refs:
            fp = board.FindFootprintByReference(ref)
            bb = fp.GetBoundingBox(False, False)
            xmin = (bb.GetX() - pcbnew.FromMM(margin/2)) / 1e6
            xmax = (bb.GetX() + bb.GetWidth() + pcbnew.FromMM(margin/2)) / 1e6
            ymin = (bb.GetY() - pcbnew.FromMM(margin/2)) / 1e6
            ymax = (bb.GetY() + bb.GetHeight() + pcbnew.FromMM(margin/2)) / 1e6
            boxes[ref] = (xmin, xmax, ymin, ymax)

        overlaps = 0
        for i in range(len(f_refs)):
            r1 = f_refs[i]
            x1_min, x1_max, y1_min, y1_max = boxes[r1]
            for j in range(i + 1, len(f_refs)):
                r2 = f_refs[j]
                x2_min, x2_max, y2_min, y2_max = boxes[r2]

                if (x1_min < x2_max and x1_max > x2_min and
                    y1_min < y2_max and y1_max > y2_min):
                    overlaps += 1
                    ox = min(x1_max - x2_min, x2_max - x1_min)
                    oy = min(y1_max - y2_min, y2_max - y1_min)

                    lock1 = pos[r1][4]
                    lock2 = pos[r2][4]

                    if ox < oy:
                        push = (ox + 0.05) / (1 if (lock1 or lock2) else 2)
                        dir_x = 1 if (pos[r2][0] > pos[r1][0]) else -1
                        if not lock2: pos[r2][0] += push * dir_x
                        if not lock1: pos[r1][0] -= push * dir_x
                    else:
                        push = (oy + 0.05) / (1 if (lock1 or lock2) else 2)
                        dir_y = 1 if (pos[r2][1] > pos[r1][1]) else -1
                        if not lock2: pos[r2][1] += push * dir_y
                        if not lock1: pos[r1][1] -= push * dir_y

        if overlaps == 0:
            print(f"Converged at iteration {iteration}! Overlaps = 0")
            break

    # Final check with 0.1 mm margin
    for ref in f_refs:
        x, y, rot, layer, locked = pos[ref]
        fp = board.FindFootprintByReference(ref)
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))

    final_overlaps = []
    for i in range(len(f_refs)):
        fp1 = board.FindFootprintByReference(f_refs[i])
        bb1 = fp1.GetBoundingBox(False, False)
        bb1.Inflate(pcbnew.FromMM(0.1))
        for j in range(i + 1, len(f_refs)):
            fp2 = board.FindFootprintByReference(f_refs[j])
            bb2 = fp2.GetBoundingBox(False, False)
            if bb1.Intersects(bb2):
                final_overlaps.append((f_refs[i], f_refs[j]))

    print(f"Final Overlaps (with 0.1mm margin): {len(final_overlaps)}")
    for o in final_overlaps:
        print(f"  {o[0]} and {o[1]}")

    xs = [pos[r][0] for r in pos.keys()]
    ys = [pos[r][1] for r in pos.keys()]
    print(f"Design span X: [{min(xs):.1f}, {max(xs):.1f}] (width: {max(xs)-min(xs):.1f} mm)")
    print(f"Design span Y: [{min(ys):.1f}, {max(ys):.1f}] (height: {max(ys)-min(ys):.1f} mm)")

    if len(final_overlaps) == 0:
        print("\nAll components successfully placed with ZERO overlaps!")

if __name__ == '__main__':
    solve_layout()
