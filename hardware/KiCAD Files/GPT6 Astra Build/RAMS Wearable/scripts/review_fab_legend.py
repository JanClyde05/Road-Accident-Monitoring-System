"""Read-only manufacturable-legend packing audit; writes reports, never CAD.

Bounded greedy packing is a feasibility experiment, not an impossibility proof.
Native ink rectangles use 0.10 mm padding, 0.16 mm pad clearance, and body
exclusion. Local placements stop 1.5 mm from their component body/courtyard.
"""
import hashlib
import json
import math
import random
from pathlib import Path
import numpy as np
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
STEP = .05
NX, NY = 841, 641


def box(bb):
    return tuple(p.ToMM(x) for x in [bb.GetX(), bb.GetY(), bb.GetRight(), bb.GetBottom()])


def mark(grid, bounds, extra=0):
    x1, y1, x2, y2 = bounds
    i, j = [max(0, math.floor((v - 100 - extra) / STEP)) for v in (x1, y1)]
    u, v = [math.ceil((z - 100 + extra) / STEP) for z in (x2, y2)]
    grid[i:min(NX, u + 1), j:min(NY, v + 1)] = True


def centers(grid, wh):
    w, h = wh
    summed = np.pad(grid.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    sums = summed[w:, h:] - summed[:-w, h:] - summed[w:, :-h] + summed[:-w, :-h]
    ij = np.argwhere(sums == 0)
    ij = ij[(ij[:, 0] % 2 == 0) & (ij[:, 1] % 2 == 0)]
    return (ij + np.array([w / 2, h / 2])) * STEP + 100


def gap(points, wh, bounds):
    hw, hh = np.array(wh) * STEP / 2
    x1, y1, x2, y2 = bounds
    dx = np.maximum(np.maximum(x1 - points[:, 0] - hw, points[:, 0] - hw - x2), 0)
    dy = np.maximum(np.maximum(y1 - points[:, 1] - hh, points[:, 1] - hh - y2), 0)
    return np.hypot(dx, dy)


def region(pos, wh):
    i, j = [round((q - 100) / STEP - width / 2) for q, width in zip(pos, wh)]
    return slice(i, i + wh[0]), slice(j, j + wh[1])


def main():
    board_hash = hashlib.sha256(BOARD.read_bytes()).hexdigest()
    board = p.LoadBoard(str(BOARD))
    footprints = {f.GetReference(): f for f in board.GetFootprints()}
    positions = {r: [p.ToMM(f.GetPosition().x), p.ToMM(f.GetPosition().y)] for r, f in footprints.items()}
    sides = {r: 'B' if f.IsFlipped() else 'F' for r, f in footprints.items()}
    bodies, courtyards, bases = {}, {}, {}
    for side, copper, courtyard, fab, silk in [('F', p.F_Cu, p.F_CrtYd, p.F_Fab, p.F_SilkS), ('B', p.B_Cu, p.B_CrtYd, p.B_Fab, p.B_SilkS)]:
        grid = np.zeros((NX, NY), dtype=bool)
        grid[:8, :], grid[-8:, :], grid[:, :8], grid[:, -8:] = True, True, True, True
        for ref, footprint in footprints.items():
            outline = footprint.GetCourtyard(courtyard)
            if outline.OutlineCount():
                bounds = courtyards[ref] = box(outline.BBox())
                shapes = [box(g.GetBoundingBox()) for g in footprint.GraphicalItems() if isinstance(g, p.PCB_SHAPE) and g.GetLayer() == fab]
                if shapes:
                    bounds = (min(v[0] for v in shapes), min(v[1] for v in shapes), max(v[2] for v in shapes), max(v[3] for v in shapes))
                bodies[ref] = bounds
                mark(grid, bounds, .03)
            for pad in footprint.Pads():
                if pad.IsOnLayer(copper):
                    mark(grid, box(pad.GetBoundingBox()), .16)
            for graphic in footprint.GraphicalItems():
                if graphic.GetLayer() == silk:
                    mark(grid, box(graphic.GetBoundingBox()), .05)
        for graphic in board.GetDrawings():
            if graphic.GetLayer() == silk:
                # Reserve functional text at standard-process size.
                if isinstance(graphic, p.PCB_TEXT):
                    graphic.SetTextSize(p.VECTOR2I(p.FromMM(1), p.FromMM(1)))
                    graphic.SetTextThickness(p.FromMM(.15))
                elif isinstance(graphic, p.PCB_SHAPE):
                    graphic.SetWidth(max(graphic.GetWidth(), p.FromMM(.15)))
                mark(grid, box(graphic.GetBoundingBox()), .05)
        bases[side] = grid
    essential = sorted(r for r in footprints if not r.startswith(('C', 'R', 'L')) or r == 'LED1')
    result = dict(board_sha256=board_hash, outline_mm=[42, 32], total_references=len(footprints), front_references=sum(s == 'F' for s in sides.values()), essential_references=essential, free_area_mm2={s: round(np.count_nonzero(~g) * STEP * STEP, 2) for s, g in bases.items()}, module_courtyard_mm=courtyards['U2'], assumptions='Native ink boxes + 0.10 mm total padding; body + 0.03 mm; pads + 0.16 mm; fixed other legend reserved at 1 mm/0.15 mm; 0.4 mm board inset; local means edge gap <=1.5 mm; greedy searches are not optimality proofs.', experiments=[])
    for height, stroke in [(1., .15), (.8, .15), (.8, .10)]:
        initial, nearest = {}, {}
        for ref, footprint in footprints.items():
            choices, best_gap = [], math.inf
            for angle in [0, 90]:
                t = footprint.Reference()
                t.SetTextSize(p.VECTOR2I(p.FromMM(height), p.FromMM(height)))
                t.SetTextThickness(p.FromMM(stroke))
                t.SetTextAngle(p.EDA_ANGLE(angle, p.DEGREES_T))
                t.SetKeepUpright(False)
                t.SetPosition(p.VECTOR2I(0, 0))
                bounds = t.GetEffectiveTextShape().BBox()
                wh = [math.ceil(p.ToMM(bounds.GetWidth()) / STEP) + 2, math.ceil(p.ToMM(bounds.GetHeight()) / STEP) + 2]
                pts = centers(bases[sides[ref]], wh)
                own = gap(pts, wh, courtyards[ref])
                best_gap = min(best_gap, float(own.min()) if len(own) else math.inf)
                foreign = [gap(pts, wh, b) for r, b in courtyards.items() if r != ref and sides[r] == sides[ref]]
                other = np.minimum.reduce(foreign) if foreign else own
                distance = np.linalg.norm(pts - positions[ref], axis=1)
                costs = own * own + 7 * np.maximum(own - other - .35, 0) ** 2 + .015 * distance * distance + .03 * (angle != 0)
                indices = np.flatnonzero(distance < (15 if ref in ['U1', 'U2', 'J1', 'BZ1'] else 9))
                for i in indices:
                    choices.append((float(costs[i]), float(own[i]), angle, pts[i].tolist(), wh))
            initial[ref] = sorted(choices)
            nearest[ref] = round(best_gap, 3)
        experiment = dict(height_mm=height, stroke_mm=stroke, no_individual_local_slot=sorted(r for r, d in nearest.items() if d > 1.5), nearest_possible_edge_gap_mm=nearest)
        for mode in ['all_local', 'all_anywhere', 'essential_local']:
            refs = essential if mode == 'essential_local' else sorted(footprints)
            options = {r: [c for c in initial[r] if mode == 'all_anywhere' or c[1] <= 1.5] for r in refs}
            best = None
            for attempt in range(12):
                rng = random.Random(attempt)
                occupied = {s: g.copy() for s, g in bases.items()}
                order = sorted(refs, key=lambda r: len(options[r]) * (.6 + rng.random() * .8))
                placed = {}
                for ref in order:
                    for cost, edge, angle, pos, wh in options[ref]:
                        cell = region(pos, wh)
                        if not occupied[sides[ref]][cell].any():
                            occupied[sides[ref]][cell] = True
                            placed[ref] = dict(side=sides[ref], xy=pos, angle=angle, box_cells=wh, edge_gap_mm=round(edge, 3), cost=round(cost, 4))
                            break
                score = (len(placed), -sum(v['cost'] for v in placed.values()))
                if best is None or score > best[0]:
                    best = score, placed
            experiment[mode] = dict(placed_count=len(best[1]), unplaced=sorted(set(refs) - set(best[1])), labels=best[1])
            print(height, stroke, mode, len(best[1]), 'unplaced', experiment[mode]['unplaced'], flush=True)
        result['experiments'].append(experiment)
    (ROOT / 'reports/fab_legend_feasibility_20261114.json').write_text(json.dumps(result, indent=2) + '\n')
    assert hashlib.sha256(BOARD.read_bytes()).hexdigest() == board_hash, 'Source changed during read-only audit'
    print('Free area', result['free_area_mm2'], 'board hash', board_hash)


if __name__ == '__main__':
    main()
