"""Refine reference slots without saving any CAD file.

Existing numpy is used for the occupancy grid; exact-size assignment uses a
standard-library Hungarian implementation. Proximity is only a layout
heuristic: inspect the reported ambiguous outliers before applying the plan.
"""
from collections import defaultdict
from copy import deepcopy
import hashlib
import json
import math
from pathlib import Path
import numpy as np
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
SOURCE = ROOT / 'reports/silkscreen_ink_0.55.json'
STEP = .05
NX, NY = 841, 641


def hungarian(cost):
    """Return minimum-cost column for each row of a square cost matrix."""
    n = len(cost)
    u, v, match, way = [0.] * (n + 1), [0.] * (n + 1), [0] * (n + 1), [0] * (n + 1)
    for row in range(1, n + 1):
        match[0], col = row, 0
        minimum, used = [math.inf] * (n + 1), [False] * (n + 1)
        while True:
            used[col] = True
            active, delta, next_col = match[col], math.inf, 0
            for j in range(1, n + 1):
                if not used[j]:
                    cur = cost[active - 1][j - 1] - u[active] - v[j]
                    if cur < minimum[j]:
                        minimum[j], way[j] = cur, col
                    if minimum[j] < delta:
                        delta, next_col = minimum[j], j
            for j in range(n + 1):
                if used[j]:
                    u[match[j]] += delta
                    v[j] -= delta
                else:
                    minimum[j] -= delta
            col = next_col
            if match[col] == 0:
                break
        while col:
            previous = way[col]
            match[col] = match[previous]
            col = previous
    result = [0] * n
    for j in range(1, n + 1):
        result[match[j] - 1] = j - 1
    return result


def bounding(bb):
    return tuple(p.ToMM(q) for q in (bb.GetX(), bb.GetY(), bb.GetRight(), bb.GetBottom()))


def mark(grid, rect, grow=0):
    x1, y1, x2, y2 = rect
    i1, j1 = [max(0, math.floor((z - 100 - grow) / STEP)) for z in (x1, y1)]
    i2, j2 = [math.ceil((z - 100 + grow) / STEP) for z in (x2, y2)]
    grid[i1:min(NX, i2 + 1), j1:min(NY, j2 + 1)] = True


def slice_for(label):
    w, h = label['box_cells']
    x, y = [(q - 100) / STEP for q in label['xy']]
    # Odd text widths have half-cell centers. Round the rectangle origin once,
    # rather than snapping its center first and shifting a half cell left.
    i, j = round(x - w / 2), round(y - h / 2)
    return slice(i, i + w), slice(j, j + h)


def free_centers(grid, wh):
    w, h = wh
    summed = np.pad(grid.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    sums = summed[w:, h:] - summed[:-w, h:] - summed[w:, :-h] + summed[:-w, :-h]
    points = np.argwhere(sums == 0)
    points = points[(points[:, 0] % 2 == 0) & (points[:, 1] % 2 == 0)]
    return (points + np.array([w / 2, h / 2])) * STEP + 100


def rect_gaps(points, wh, rect):
    """Distances between a label rectangle and one courtyard rectangle."""
    hw, hh = [q * STEP / 2 for q in wh]
    x1, y1, x2, y2 = rect
    dx = np.maximum(np.maximum(x1 - points[:, 0] - hw, points[:, 0] - hw - x2), 0)
    dy = np.maximum(np.maximum(y1 - points[:, 1] - hh, points[:, 1] - hh - y2), 0)
    return np.hypot(dx, dy)


def main():
    source_hash = hashlib.sha256(BOARD.read_bytes()).hexdigest()
    board = p.LoadBoard(str(BOARD))
    footprints = {f.GetReference(): f for f in board.GetFootprints()}
    plan = json.loads(SOURCE.read_text())
    original = deepcopy(plan['labels'])
    labels = deepcopy(original)
    assert not plan['unplaced'] and set(labels) == set(footprints)
    positions = {r: (p.ToMM(f.GetPosition().x), p.ToMM(f.GetPosition().y)) for r, f in footprints.items()}
    bases, bodies, sides = {}, {}, {}
    for side, copper, courtyard, silk in [('F', p.F_Cu, p.F_CrtYd, p.F_SilkS), ('B', p.B_Cu, p.B_CrtYd, p.B_SilkS)]:
        grid = np.zeros((NX, NY), dtype=bool)
        grid[:8, :], grid[-8:, :], grid[:, :8], grid[:, -8:] = True, True, True, True
        for ref, footprint in footprints.items():
            outline = footprint.GetCourtyard(courtyard)
            if outline.OutlineCount():
                bodies[ref] = bounding(outline.BBox())
                sides[ref] = side
                fab=p.B_Fab if side=='B' else p.F_Fab
                shapes=[bounding(g.GetBoundingBox()) for g in footprint.GraphicalItems() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==fab]
                bounds=bodies[ref]
                if shapes:bounds=(min(v[0] for v in shapes),min(v[1] for v in shapes),max(v[2] for v in shapes),max(v[3] for v in shapes))
                mark(grid,bounds,.03)
            for pad in footprint.Pads():
                if pad.IsOnLayer(copper):
                    mark(grid, bounding(pad.GetBoundingBox()), .16)
            for graphic in footprint.GraphicalItems():
                if graphic.GetLayer() == silk:
                    mark(grid, bounding(graphic.GetBoundingBox()), .05)
        for graphic in board.GetDrawings():
            if graphic.GetLayer() == silk:
                mark(grid, bounding(graphic.GetBoundingBox()), .05)
        bases[side] = grid
    assert set(bodies) == set(labels), 'Every reference requires a real courtyard'

    def costs(ref, points, wh, angle):
        own = rect_gaps(points, wh, bodies[ref])
        others = [rect_gaps(points, wh, box) for other, box in bodies.items() if other != ref and sides[other] == sides[ref]]
        nearest = np.minimum.reduce(others) if others else own
        mismatch = np.maximum(own - nearest - .35, 0)
        center = np.linalg.norm(points - positions[ref], axis=1)
        return own ** 2 + 7 * mismatch ** 2 + .015 * center ** 2 + .03 * (angle != 0)

    def objective(ref, label):
        return float(costs(ref, np.array([label['xy']]), label['box_cells'], label['angle'])[0])

    def assignment():
        groups = defaultdict(list)
        for ref, label in labels.items():
            groups[(label['side'], tuple(sorted(label['box_cells'])))].append(ref)
        changed = 0
        for refs in groups.values():
            refs.sort()
            slots = [deepcopy(labels[r]) for r in refs]
            matrix = []
            for ref in refs:
                row = [0.] * len(slots)
                for angle in [0, 90]:
                    indices = [i for i, slot in enumerate(slots) if slot['angle'] == angle]
                    if indices:
                        values = costs(ref, np.array([slots[i]['xy'] for i in indices]), slots[indices[0]]['box_cells'], angle)
                        for i, value in zip(indices, values):
                            row[i] = float(value)
                matrix.append(row)
            for ref, slot_index in zip(refs, hungarian(matrix)):
                changed += labels[ref]['xy'] != slots[slot_index]['xy']
                labels[ref] = slots[slot_index]
        return changed

    def occupied(exclude=None):
        grids = {s: g.copy() for s, g in bases.items()}
        for ref, label in labels.items():
            if ref != exclude:
                grids[label['side']][slice_for(label)] = True
        return grids

    history = []
    for iteration in range(3):
        reassigned = assignment()
        moves = 0
        for ref in sorted(labels, key=lambda ref: -objective(ref, labels[ref])):
            previous = labels[ref]
            best, best_cost = previous, objective(ref, previous)
            grid = occupied(ref)[previous['side']]
            short, long = sorted(previous['box_cells'])
            for angle, wh in [(0, [long, short]), (90, [short, long])]:
                pts = free_centers(grid, wh)
                pts = pts[np.linalg.norm(pts - positions[ref], axis=1) < (15 if ref in ['U1', 'U2', 'J1', 'BZ1'] else 9)]
                if not len(pts):
                    continue
                scores = costs(ref, pts, wh, angle)
                index = int(scores.argmin())
                if scores[index] < best_cost - .01:
                    best_cost = float(scores[index])
                    best = dict(previous, xy=pts[index].tolist(), angle=angle, box_cells=wh)
            if best is not previous:
                labels[ref] = best
                moves += 1
        score = sum(objective(r, v) for r, v in labels.items())
        history.append(dict(iteration=iteration, reassigned=reassigned, local_moves=moves, cost=round(score, 4)))
        print(history[-1], flush=True)
        if not moves and not reassigned:
            break

    grids = {s: g.copy() for s, g in bases.items()}
    for ref, label in labels.items():
        region = slice_for(label)
        assert not grids[label['side']][region].any(), f'Collision: {ref}'
        grids[label['side']][region] = True
        label['distance_mm'] = round(math.dist(label['xy'], positions[ref]), 3)

    def audit(items):
        result = []
        for ref, label in items.items():
            pts = np.array([label['xy']])
            own = float(rect_gaps(pts, label['box_cells'], bodies[ref])[0])
            nearby = sorted((float(rect_gaps(pts, label['box_cells'], box)[0]), other) for other, box in bodies.items() if other != ref and sides[other] == sides[ref])
            nearest = nearby[0] if nearby else (own, None)
            result.append(dict(reference=ref, label_xy=label['xy'], component_xy=positions[ref], edge_distance_mm=round(own, 3), nearest_other=nearest[1], nearest_other_edge_mm=round(nearest[0], 3), ambiguity_gap_mm=round(max(own-nearest[0], 0), 3), ambiguous=own > 1 and own-nearest[0] > .75))
        return sorted(result, key=lambda row: (-row['ambiguity_gap_mm'], -row['edge_distance_mm']))

    before, after = audit(original), audit(labels)
    result = dict(plan, labels=labels, unplaced=[], refinement=dict(source=str(SOURCE.relative_to(ROOT)), board_sha256=source_hash, method='Exact-size Hungarian assignment and collision-safe local moves; courtyard-edge/foreign-association cost', history=history, before_ambiguous=sum(r['ambiguous'] for r in before), after_ambiguous=sum(r['ambiguous'] for r in after), before=before, after=after, warning='Rectangular clearance and proximity scores do not prove visual association; inspect outliers and route leaders where needed.'))
    target = ROOT / 'reports/silkscreen_refined.json'
    target.write_text(json.dumps(result, indent=2) + '\n')
    print('Saved', target)
    print('Ambiguous', result['refinement']['before_ambiguous'], '->', result['refinement']['after_ambiguous'])
    print('Worst', [(r['reference'], r['edge_distance_mm'], r['nearest_other']) for r in after[:15]])


if __name__ == '__main__':
    main()
