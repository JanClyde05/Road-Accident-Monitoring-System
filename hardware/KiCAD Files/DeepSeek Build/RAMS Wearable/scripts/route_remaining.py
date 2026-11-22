"""Route remaining unconnected nets with rounded-geometry A*, accepting a route
only when a fresh native DRC of the saved candidate reports no new violations.

The previous pass inflated axis-aligned pad bounding boxes, which squares off the
corners of every land. On a 0.4 mm-pitch QFN escape those false corners closed the
0.15 mm corridors and the search reported 'blocked endpoint'. This version
inflates the true rectangle (rounded corners) and validates every accepted route
with kicad-cli before keeping it.

Width/clearance are the project's 0.15/0.15 mm (JLCPCB capable). Zones are not
obstacles: refill clears them around new copper. Empty-net zones are rule areas
and are honoured as keepouts.
"""
import heapq, json, os, shutil, subprocess, sys
from datetime import datetime
from pathlib import Path
import numpy as np
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'
STEP = 0.05
X0 = Y0 = 100.0
NX, NY = 841, 641
LAYERS = [p.F_Cu, p.In2_Cu, p.B_Cu]
W = float(os.environ.get('ROUTE_W', 0.15))       # routed track width
CLR = float(os.environ.get('ROUTE_CLR', 0.15))  # board rule is 0.127
VIA_D = 0.5
VIA_DRILL = 0.2
# U1's left pad row is a shared escape strip: VDD_RF walls F.Cu at x 110.0-110.3,
# +3V3 crosses B.Cu diagonally and any route that runs along In2 here seals every
# pad behind it. Cross the strip cheaply, travel along it expensively.
FUNNEL = (110.15, 110.15, 111.15, 112.25)
FUNNEL_COST = 8

RUN = None
BASELINE = None


def setup_run():
    global RUN, BASELINE
    RUN = ROOT / 'verification' / ('route_deepseek_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
    RUN.mkdir(parents=True, exist_ok=True)
    BASELINE = RUN / 'baseline.kicad_pcb'
    shutil.copy2(BOARD, BASELINE)


def mm(v):
    return p.ToMM(v)


def gx(x):
    return int(round((x - X0) / STEP))


def gy(y):
    return int(round((y - Y0) / STEP))


def rx(i):
    return X0 + i * STEP


def ry(j):
    return Y0 + j * STEP


def funnel_penalty(i, j):
    x, y = rx(i), ry(j)
    x1, y1, x2, y2 = FUNNEL
    return FUNNEL_COST if x1 <= x <= x2 and y1 <= y <= y2 else 0


def block_rect(arr, x1, y1, x2, y2, radius):
    """Block cells whose centre is within `radius` of the rectangle."""
    i1 = max(0, gx(x1 - radius)); i2 = min(NX - 1, gx(x2 + radius))
    j1 = max(0, gy(y1 - radius)); j2 = min(NY - 1, gy(y2 + radius))
    if i1 > i2 or j1 > j2:
        return
    xs = X0 + np.arange(i1, i2 + 1) * STEP
    ys = Y0 + np.arange(j1, j2 + 1) * STEP
    XX, YY = np.meshgrid(xs, ys, indexing='ij')
    dx = np.maximum(np.maximum(x1 - XX, 0.0), XX - x2)
    dy = np.maximum(np.maximum(y1 - YY, 0.0), YY - y2)
    arr[i1:i2 + 1, j1:j2 + 1] |= (dx * dx + dy * dy) <= radius * radius


def block_seg(arr, ax, ay, bx, by, radius):
    i1 = max(0, gx(min(ax, bx) - radius)); i2 = min(NX - 1, gx(max(ax, bx) + radius))
    j1 = max(0, gy(min(ay, by) - radius)); j2 = min(NY - 1, gy(max(ay, by) + radius))
    if i1 > i2 or j1 > j2:
        return
    xs = X0 + np.arange(i1, i2 + 1) * STEP
    ys = Y0 + np.arange(j1, j2 + 1) * STEP
    XX, YY = np.meshgrid(xs, ys, indexing='ij')
    vx, vy = bx - ax, by - ay
    t = np.clip(((XX - ax) * vx + (YY - ay) * vy) / max(vx * vx + vy * vy, 1e-20), 0, 1)
    arr[i1:i2 + 1, j1:j2 + 1] |= (XX - ax - t * vx) ** 2 + (YY - ay - t * vy) ** 2 <= radius * radius


def edge_box(board):
    bb = board.GetBoardEdgesBoundingBox()
    return (mm(bb.GetX()), mm(bb.GetY()), mm(bb.GetRight()), mm(bb.GetBottom()))


def masks(board, net):
    """Return (copper_block, via_block) for routing `net` at width W."""
    copper = np.zeros((3, NX, NY), dtype=bool)
    vias = np.zeros((NX, NY), dtype=bool)
    bx1, by1, bx2, by2 = edge_box(board)
    for k in range(3):
        copper[k][:gx(bx1 + 0.25) + 1, :] = True
        copper[k][gx(bx2 - 0.25):, :] = True
        copper[k][:, :gy(by1 + 0.25) + 1] = True
        copper[k][:, gy(by2 - 0.25):] = True
    vias[:gx(bx1 + 0.25) + 1, :] = True
    vias[gx(bx2 - 0.25):, :] = True
    vias[:, :gy(by1 + 0.25) + 1] = True
    vias[:, gy(by2 - 0.25):] = True
    # Rule areas / keepouts: zones carrying no net.
    for z in board.Zones():
        if z.GetNetname():
            continue
        # QFN_ESC is the named rule area that scopes the 0.10 mm escape rules; it
        # allows tracks and vias, so it limits nothing and must not mask them.
        if z.GetZoneName() == 'QFN_ESC':
            continue
        zb = z.GetBoundingBox()
        x1, y1 = mm(zb.GetX()), mm(zb.GetY())
        x2, y2 = mm(zb.GetRight()), mm(zb.GetBottom())
        if net == 'ANT_FEED':
            continue
        for k in range(3):
            block_rect(copper[k], x1, y1, x2, y2, CLR)
        block_rect(vias, x1, y1, x2, y2, CLR + VIA_D / 2)
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            bb = pad.GetBoundingBox()
            x1, y1 = mm(bb.GetX()), mm(bb.GetY())
            x2, y2 = mm(bb.GetRight()), mm(bb.GetBottom())
            same = pad.GetNetname() == net
            if not same:
                for k, layer in enumerate(LAYERS):
                    if pad.IsOnLayer(layer):
                        block_rect(copper[k], x1, y1, x2, y2, CLR + W / 2)
            block_rect(vias, x1, y1, x2, y2, CLR + VIA_D / 2)
            if pad.GetDrillSize().x:
                r = mm(max(pad.GetDrillSize().x, pad.GetDrillSize().y)) / 2 + 0.3
                cx, cy = mm(pad.GetPosition().x), mm(pad.GetPosition().y)
                block_seg(vias, cx, cy, cx, cy, r)
    for t in board.GetTracks():
        if t.Type() == p.PCB_VIA_T:
            if t.GetNetname() == net:
                r = CLR + VIA_D / 2 + mm(t.GetWidth(p.F_Cu)) / 2
                cx, cy = mm(t.GetPosition().x), mm(t.GetPosition().y)
                block_seg(vias, cx, cy, cx, cy, r)
                continue
            for k in range(3):
                block_seg(copper[k], mm(t.GetPosition().x), mm(t.GetPosition().y),
                          mm(t.GetPosition().x), mm(t.GetPosition().y),
                          CLR + W / 2 + mm(t.GetWidth(p.F_Cu)) / 2)
            block_seg(vias, mm(t.GetPosition().x), mm(t.GetPosition().y),
                      mm(t.GetPosition().x), mm(t.GetPosition().y),
                      CLR + VIA_D / 2 + mm(t.GetWidth(p.F_Cu)) / 2)
            continue
        if t.GetNetname() == net:
            continue
        if t.GetLayer() in LAYERS:
            k = LAYERS.index(t.GetLayer())
            block_seg(copper[k], mm(t.GetStart().x), mm(t.GetStart().y),
                      mm(t.GetEnd().x), mm(t.GetEnd().y),
                      CLR + (W + mm(t.GetWidth())) / 2)
        block_seg(vias, mm(t.GetStart().x), mm(t.GetStart().y),
                  mm(t.GetEnd().x), mm(t.GetEnd().y),
                  CLR + VIA_D / 2 + mm(t.GetWidth()) / 2)
    return copper, vias


def terminals(item):
    """Return [((layer, i, j), (x, y))] - grid cell plus the exact copper point."""
    if isinstance(item, p.PCB_VIA):
        x, y = mm(item.GetPosition().x), mm(item.GetPosition().y)
        return [((k, gx(x), gy(y)), (x, y)) for k in range(3)]
    if isinstance(item, p.PCB_TRACK):
        if item.GetLayer() not in LAYERS:
            return []
        k = LAYERS.index(item.GetLayer())
        return [((k, gx(mm(v.x)), gy(mm(v.y))), (mm(v.x), mm(v.y)))
                for v in (item.GetStart(), item.GetEnd())]
    x, y = mm(item.GetPosition().x), mm(item.GetPosition().y)
    return [((k, gx(x), gy(y)), (x, y))
            for k, layer in enumerate(LAYERS) if item.IsOnLayer(layer)]


def anchor_of(tlist, node):
    """Exact copper point of a terminal nearest the given grid node."""
    x, y = rx(node[1]), ry(node[2])
    return min((a for _, a in tlist), key=lambda q: (q[0] - x) ** 2 + (q[1] - y) ** 2)


def free_near(copper, cells, span=12):
    """Nearest free cell when pad inflation blocks the terminal cell itself.

    Terminal cells sit inside their own pad, which is not an obstacle, but a
    0.4 mm QFN row can still be covered by the inflated boxes of the
    neighbouring pads. Without this the goal is dropped and the route stops one
    grid step short, leaving a dangling track instead of a joined net.
    """
    best = None
    for k0, i0, j0 in cells:
        for k in range(3):
            for di in range(-span, span + 1):
                for dj in range(-span, span + 1):
                    i, j = i0 + di, j0 + dj
                    if not (0 <= i < NX and 0 <= j < NY) or copper[k, i, j]:
                        continue
                    d = di * di + dj * dj + (0 if k == k0 else 900)
                    if best is None or d < best[0]:
                        best = (d, (k, i, j))
    return [best[1]] if best else []


def search(copper, vias, start_cells, goal_cells):
    starts = [q for q in start_cells if not copper[q]] or free_near(copper, start_cells)
    goals = [q for q in goal_cells if not copper[q]] or free_near(copper, goal_cells)
    if not starts or not goals:
        return None, 'blocked endpoint'
    target = set(goals)
    gi = np.array([(g[1], g[2], g[0]) for g in goals], dtype=float)

    def h(node):
        dx = np.abs(gi[:, 0] - node[1]); dy = np.abs(gi[:, 1] - node[2])
        d = np.maximum(dx, dy) + 0.414214 * np.minimum(dx, dy) + 8 * (gi[:, 2] != node[0])
        return float(d.min())

    best = {q: 0.0 for q in starts}
    parent = {}
    queue = [(h(q), 0.0, q) for q in starts]
    heapq.heapify(queue)
    moves = [(1, 0, 1), (-1, 0, 1), (0, 1, 1), (0, -1, 1),
             (1, 1, 1.414214), (1, -1, 1.414214), (-1, 1, 1.414214), (-1, -1, 1.414214)]
    while queue:
        _, cost, q = heapq.heappop(queue)
        if cost > best.get(q, 1e30):
            continue
        if q in target:
            path = [q]
            while q in parent:
                q = parent[q]
                path.append(q)
            return list(reversed(path)), 'ok'
        k, i, j = q
        neighbours = []
        for dx, dy, w in moves:
            n = (k, i + dx, j + dy)
            if not (0 <= n[1] < NX and 0 <= n[2] < NY) or copper[n]:
                continue
            if dx and dy and (copper[k, i + dx, j] or copper[k, i, j + dy]):
                continue
            neighbours.append((n, w))
        if not vias[i, j]:
            for z in range(3):
                if z != k and not copper[z, i, j]:
                    neighbours.append(((z, i, j), 30))
        for n, w in neighbours:
            v = cost + w + funnel_penalty(n[1], n[2])
            if v >= best.get(n, 1e30):
                continue
            best[n] = v
            parent[n] = q
            heapq.heappush(queue, (v + h(n), v, n))
    return None, 'exhausted'


def simplify(path):
    keep = [path[0]]
    for i in range(1, len(path) - 1):
        a, b, c = path[i - 1:i + 2]
        if a[0] != b[0] or b[0] != c[0] or (b[1] - a[1], b[2] - a[2]) != (c[1] - b[1], c[2] - b[2]):
            keep.append(b)
    keep.append(path[-1])
    return keep


def apply_path(board, net, code, pts, width=W):
    """Draw [(layer, x, y)] as tracks, with vias wherever the layer changes."""
    added = {'segments': [], 'vias': []}
    via_pts = set()
    for a, b in zip(pts, pts[1:]):
        if a[0] != b[0]:
            key = (round(a[1], 3), round(a[2], 3))
            if key in via_pts:
                continue
            v = p.PCB_VIA(board)
            v.SetPosition(p.VECTOR2I(p.FromMM(a[1]), p.FromMM(a[2])))
            v.SetWidth(p.FromMM(VIA_D))
            v.SetDrill(p.FromMM(VIA_DRILL))
            v.SetViaType(p.VIATYPE_THROUGH)
            v.SetLayerPair(p.F_Cu, p.B_Cu)
            v.SetNetCode(code)
            board.Add(v)
            via_pts.add(key)
            added['vias'].append([round(a[1], 3), round(a[2], 3)])
            continue
        if (round(a[1], 4), round(a[2], 4)) == (round(b[1], 4), round(b[2], 4)):
            continue
        t = p.PCB_TRACK(board)
        t.SetStart(p.VECTOR2I(p.FromMM(a[1]), p.FromMM(a[2])))
        t.SetEnd(p.VECTOR2I(p.FromMM(b[1]), p.FromMM(b[2])))
        t.SetWidth(p.FromMM(width))
        t.SetLayer(LAYERS[a[0]])
        t.SetNetCode(code)
        board.Add(t)
        added['segments'].append([board.GetLayerName(LAYERS[a[0]]),
                                  [round(a[1], 3), round(a[2], 3)],
                                  [round(b[1], 3), round(b[2], 3)], width])
    return added


def drc(path):
    out = path.with_suffix('.drc.json')
    cmd = [KICAD, 'pcb', 'drc', '--severity-all', '--format', 'json',
           '--schematic-parity', '--refill-zones', '-o', str(out), str(path)]
    subprocess.run(cmd, check=False, capture_output=True)
    data = json.loads(out.read_text())
    return data


def sig(v):
    """Stable violation signature: type plus the items involved, order-free."""
    return (v['type'], tuple(sorted(it['uuid'] for it in v['items'])))


def main():
    setup_run()
    board = p.LoadBoard(str(BOARD))
    items = {}
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            items[str(pad.m_Uuid.AsString())] = pad
    for t in board.GetTracks():
        items[str(t.m_Uuid.AsString())] = t

    base = drc(BASELINE)
    issues = base['unconnected_items']
    # ROUTE_ORDER lets a run try a different net order without editing the file;
    # the QFN escape corridor is shared, so order decides who gets through.
    order = [n.strip() for n in os.environ.get('ROUTE_ORDER', '').split(',') if n.strip()]
    if order:
        def rank(issue):
            left = items.get(issue['items'][0]['uuid'])
            net = left.GetNetname() if left is not None else ''
            return order.index(net) if net in order else len(order)
        issues = sorted(issues, key=rank)
    # The baseline already carries accepted warnings (two dead VDD_RF stubs). Only
    # violations the route itself introduces may reject it.
    known = {}
    for v in base['violations']:
        known[sig(v)] = known.get(sig(v), 0) + 1
    print('baseline unconnected', len(issues), 'violations', len(base['violations']), flush=True)

    accepted = BASELINE
    results = []
    for issue in issues:
        board = p.LoadBoard(str(accepted))
        items = {}
        for fp in board.GetFootprints():
            for pad in fp.Pads():
                items[str(pad.m_Uuid.AsString())] = pad
        for t in board.GetTracks():
            items[str(t.m_Uuid.AsString())] = t
        left, right = [items.get(a['uuid']) for a in issue['items']]
        if left is None or right is None:
            results.append({'net': None, 'result': 'uuid not found'})
            continue
        net = left.GetNetname()
        if net != right.GetNetname():
            results.append({'net': net, 'result': 'net mismatch'})
            continue
        print('routing', net, flush=True)
        copper, vias = masks(board, net)
        t_left, t_right = terminals(left), terminals(right)
        path, status = search(copper, vias, [t[0] for t in t_left], [t[0] for t in t_right])
        if path is None:
            print('  FAILED', net, status, flush=True)
            results.append({'net': net, 'result': status})
            continue
        # Snap the open ends onto the real copper point so the track lands on
        # the pad instead of stopping at the last free grid cell.
        pts = [(k, rx(i), ry(j)) for (k, i, j) in simplify(path)]
        s_xy = anchor_of(t_left, path[0])
        e_xy = anchor_of(t_right, path[-1])
        pts[0] = (pts[0][0], s_xy[0], s_xy[1])
        pts[-1] = (pts[-1][0], e_xy[0], e_xy[1])
        added = apply_path(board, net, left.GetNetCode(), pts)
        tag = net.replace('/', '_')
        cand = RUN / ('cand_' + tag + '.kicad_pcb')
        p.SaveBoard(str(cand), board)
        # DRC in place so the project's own rules/netclasses are applied.
        shutil.copy2(str(cand), str(BOARD))
        report = drc(BOARD)
        seen = dict(known)
        bad = []
        for v in report['violations']:
            k = sig(v)
            if seen.get(k, 0):
                seen[k] -= 1
                continue
            bad.append(v)
        if len(report['unconnected_items']) >= len(issues):
            bad.append({'type': 'unconnected_not_reduced',
                        'description': 'route did not join the net'})
        if bad:
            print('  REJECTED', net, len(bad), 'violations', flush=True)
            for v in bad[:5]:
                print('    ', v['type'], v.get('description'), flush=True)
            shutil.copy2(str(accepted), str(BOARD))
            results.append({'net': net, 'result': 'rejected', 'violations': [v['type'] for v in bad],
                            'segments': added['segments']})
            continue
        print('  ACCEPTED', net, len(added['segments']), 'segments', len(added['vias']), 'vias', flush=True)
        results.append({'net': net, 'result': 'accepted', 'added': added})
        shutil.copy2(str(BOARD), str(RUN / 'accepted.kicad_pcb'))
        accepted = RUN / 'accepted.kicad_pcb'

    (RUN / 'route_results.json').write_text(json.dumps(results, indent=2) + '\n')
    final = drc(BOARD)
    print('final unconnected', len(final['unconnected_items']),
          'violations', len(final['violations']), 'parity', len(final.get('schematic_parity', [])), flush=True)


if __name__ == '__main__':
    main()
