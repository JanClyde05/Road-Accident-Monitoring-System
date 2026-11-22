"""Native-shape clearance polish for the saved fabrication-legend candidate.

Only the verification candidate is written. The active board is promoted after
separate DRC, association, glyph-spacing and geometry-invariant review.
"""
import json
import math
from pathlib import Path
import pcbnew as p

R = Path(__file__).resolve().parents[1]
PATH = R / 'verification/fab_legend_candidate_20261115/RAMS_JLC_S3.kicad_pcb'
MM = p.ToMM
XY = lambda x, y: p.VECTOR2I(p.FromMM(x), p.FromMM(y))


def bounds(shape):
    bb = shape.BBox()
    return tuple(MM(v) for v in [bb.GetX(), bb.GetY(), bb.GetRight(), bb.GetBottom()])


def box_distance(a, z):
    return math.hypot(max(a[0] - z[2], z[0] - a[2], 0), max(a[1] - z[3], z[1] - a[3], 0))


def main():
    b = p.LoadBoard(str(PATH))
    fps = {f.GetReference(): f for f in b.GetFootprints()}
    texts = {r: f.Reference() for r, f in fps.items() if f.Reference().IsVisible()}
    texts.update({g.GetText(): g for g in b.GetDrawings() if isinstance(g, p.PCB_TEXT) and g.GetLayer() in [p.F_SilkS, p.B_SilkS]})
    shapes = {r: t.GetEffectiveTextShape() for r, t in texts.items()}
    fixed, bodies = [], []
    for ref, f in fps.items():
        side = p.B_SilkS if f.IsFlipped() else p.F_SilkS
        fab = p.B_Fab if f.IsFlipped() else p.F_Fab
        fab_boxes = []
        for g in f.GraphicalItems():
            if g.GetLayer() in [p.F_SilkS, p.B_SilkS]:
                fixed.append((g.GetLayer(), g.GetEffectiveShape(), 'silk ' + ref, .151))
            if isinstance(g, p.PCB_SHAPE) and g.GetLayer() == fab:
                fab_boxes.append(bounds(g.GetEffectiveShape()))
        if fab_boxes:
            bodies.append((side, (min(v[0] for v in fab_boxes), min(v[1] for v in fab_boxes), max(v[2] for v in fab_boxes), max(v[3] for v in fab_boxes)), ref))
        for pad in f.Pads():
            for cu, silk in [(p.F_Cu, p.F_SilkS), (p.B_Cu, p.B_SilkS)]:
                if pad.IsOnLayer(cu):
                    fixed.append((silk, pad.GetEffectiveShape(cu), 'pad ' + ref + '.' + pad.GetNumber(), .171))
    for g in b.GetDrawings():
        if isinstance(g, p.PCB_SHAPE) and g.GetLayer() in [p.F_SilkS, p.B_SilkS]:
            fixed.append((g.GetLayer(), g.GetEffectiveShape(), 'board silk', .151))
    fixed_bounds = [(side, shape, bounds(shape), name, clear) for side, shape, name, clear in fixed]

    def violations(name, shape):
        side, bb = texts[name].GetLayer(), bounds(shape)
        bad = []
        edge = min(bb[0] - 100, bb[1] - 100, 142 - bb[2], 132 - bb[3])
        if edge < .25:
            bad.append(('edge', edge, .25))
        for oside, other, ob, label, clear in fixed_bounds:
            if side == oside and box_distance(bb, ob) < clear:
                distance = MM(shape.GetClearance(other))
                if distance < clear:
                    bad.append((label, distance, clear))
        for other_name, other in shapes.items():
            if name != other_name and texts[other_name].GetLayer() == side and box_distance(bb, bounds(other)) < .151:
                distance = MM(shape.GetClearance(other))
                if distance < .151:
                    bad.append((other_name, distance, .151))
        for oside, ob, label in bodies:
            if side == oside and min(bb[2], ob[2]) > max(bb[0], ob[0]) and min(bb[3], ob[3]) > max(bb[1], ob[1]):
                bad.append(('body ' + label, 0, .1))
        return bad

    initial = {r: violations(r, s) for r, s in shapes.items()}
    moves = []
    offsets = sorted([(x * .025, y * .025) for x in range(-12, 13) for y in range(-12, 13) if x or y], key=lambda d: d[0] ** 2 + d[1] ** 2)
    for iteration in range(8):
        changed = 0
        for name in sorted(texts, key=lambda r: -len(violations(r, shapes[r]))):
            before = violations(name, shapes[name])
            if not before:
                continue
            old = texts[name].GetPosition()
            best = (len(before), sum((clear - dist) ** 2 for _, dist, clear in before), math.inf)
            winner = None
            for dx, dy in offsets:
                texts[name].SetPosition(old + XY(dx, dy))
                shape = texts[name].GetEffectiveTextShape()
                bad = violations(name, shape)
                score = (len(bad), sum((clear - dist) ** 2 for _, dist, clear in bad), dx * dx + dy * dy)
                if score < best:
                    best, winner = score, (dx, dy, shape)
                if not bad:
                    break
            texts[name].SetPosition(old)
            if winner:
                dx, dy, shape = winner
                texts[name].SetPosition(old + XY(dx, dy))
                shapes[name] = shape
                moves.append(dict(iteration=iteration, reference=name, delta=[dx, dy], remaining=best[0]))
                changed += 1
        remaining = {r: violations(r, s) for r, s in shapes.items() if violations(r, s)}
        print('Pass', iteration, 'moved', changed, 'remaining', remaining, flush=True)
        if not remaining or not changed:
            break
    assert p.SaveBoard(str(PATH), b)
    report = dict(initial={r: v for r, v in initial.items() if v}, moves=moves, remaining=remaining, note='Native effective-shape checks; candidate only, CLI DRC still required.')
    (R / 'reports/fab_legend_native_polish_20261115.json').write_text(json.dumps(report, indent=2) + '\n')


if __name__ == '__main__':
    main()
