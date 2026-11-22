import * as THREE from "three";

export type Pose = { pos: [number, number, number]; look: [number, number, number]; orbit: number };
export const SPACING = 90;

export const POSES: Pose[] = [
  { pos: [0, 3, 24], look: [0, 0.5, 0], orbit: 0.6 },
  { pos: [-3, 3, 17], look: [-1, 0, 0], orbit: 0.5 },
  { pos: [14, 9, 21], look: [0, 0, 0], orbit: 0.4 },
  { pos: [-4, 10, 25], look: [-2, 3, -1], orbit: 0.35 },
  { pos: [0, 7, 24], look: [0, 0, 0], orbit: 0.22 },
  { pos: [-27, 5, 13], look: [-2, 0, 0], orbit: 0.25 },
  { pos: [16, 8, 18], look: [0, 0, 0], orbit: 0.8 },
  { pos: [10, 12, 17], look: [0, 1, 0], orbit: 0.3 },
  { pos: [4, 2.5, 18], look: [0, 0, 0], orbit: 0.2 },
  { pos: [0, 3, 19], look: [0, 1.5, 0], orbit: 0.3 },
  { pos: [0, 19, 24], look: [0, 0, 0], orbit: 0.3 },
  { pos: [0, 3, 21], look: [0, 0.5, 0], orbit: 0.5 },
];

const C = {
  bg: 0x070a12,
  cyan: 0x00e5ff,
  crimson: 0xff2a54,
  emerald: 0x00a86b,
  gold: 0xf5a623,
  white: 0xffffff,
};
const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");

type Updater = (t: number, dt: number, a: number) => void;
type Builder = (g: THREE.Group) => Updater | void;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function mk(
  color: number,
  o: { emissive?: number; ei?: number; rough?: number; metal?: number; opacity?: number } = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: o.emissive ?? 0x000000,
    emissiveIntensity: o.ei ?? 1,
    roughness: o.rough ?? 0.55,
    metalness: o.metal ?? 0.2,
    transparent: o.opacity !== undefined && o.opacity < 1,
    opacity: o.opacity ?? 1,
  });
}

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  parent?: THREE.Object3D,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent?.add(m);
  return m;
}

function cyl(r: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent?: THREE.Object3D, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.position.set(x, y, z);
  parent?.add(m);
  return m;
}

function label(text: string, color = "#ffffff", size = 0.9) {
  const font = "600 34px ui-monospace, SFMono-Regular, Menlo, monospace";
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 44;
  c.width = w;
  c.height = 72;
  ctx.font = font;
  ctx.fillStyle = "rgba(7,10,18,0.82)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, 68, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 22, 38);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false }),
  );
  sp.scale.set((size * w) / 72, size, 1);
  sp.renderOrder = 10;
  return sp;
}

function addLabel(g: THREE.Object3D, text: string, x: number, y: number, z: number, color = "#ffffff", size = 0.9) {
  const s = label(text, color, size);
  s.position.set(x, y, z);
  g.add(s);
  return s;
}

function callout(g: THREE.Object3D, text: string, from: THREE.Vector3, to: THREE.Vector3, color: number, size = 0.7) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([from, to]),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }),
  );
  g.add(line);
  const s = label(text, hex(color), size);
  s.position.copy(to).add(new THREE.Vector3(0, size * 0.7, 0));
  g.add(s);
  return [line, s] as const;
}

function grid(g: THREE.Group, y = -5, size = 80) {
  const gh = new THREE.GridHelper(size, size / 2, 0x00e5ff, 0x12324a);
  gh.position.y = y;
  const m = gh.material as THREE.LineBasicMaterial;
  m.transparent = true;
  m.opacity = 0.4;
  g.add(gh);
}

function link(g: THREE.Object3D, curve: THREE.Curve<THREE.Vector3>, color: number, radius = 0.05) {
  g.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, radius, 6, false),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 }),
    ),
  );
}

function flow(g: THREE.Object3D, curve: THREE.Curve<THREE.Vector3>, color: number, count = 12, speed = 0.25, size = 0.35) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  pts.frustumCulled = false;
  g.add(pts);
  const v = new THREE.Vector3();
  return (t: number) => {
    for (let i = 0; i < count; i++) {
      const u = (((t * speed + i / count) % 1) + 1) % 1;
      curve.getPointAt(u, v);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
    }
    geo.attributes.position.needsUpdate = true;
  };
}

function fade(labels: THREE.Sprite[], a: number) {
  const o = 0.2 + 0.8 * a;
  for (const l of labels) l.material.opacity = o;
}

/* ---------------------------------------------------------------- PCBs */

function buildAlpha(withLabels: boolean) {
  const g = new THREE.Group();
  box(11, 0.18, 7.4, mk(0xc9962f, { rough: 0.7, metal: 0.05 }), 0, 0, 0, g);
  const copper = mk(0xf5a623, { emissive: 0x7a4a00, ei: 0.5, metal: 0.8, rough: 0.3 });
  const r = rng(7);
  for (let i = 0; i < 28; i++) {
    const horiz = r() > 0.5;
    const len = 1 + r() * 4;
    box(horiz ? len : 0.07, 0.03, horiz ? 0.07 : len, copper, (r() - 0.5) * 9.5, -0.1, (r() - 0.5) * 6, g);
  }
  const black = mk(0x111418, { rough: 0.8 });
  const gold = mk(0xf5a623, { metal: 0.9, rough: 0.3 });
  const module = (x: number, z: number, w: number, d: number, color: number, extra: (m: THREE.Group) => void) => {
    const m = new THREE.Group();
    m.position.set(x, 0.1, z);
    box(w, 0.4, 0.22, black, 0, 0.2, -d / 2 + 0.12, m);
    box(w, 0.4, 0.22, black, 0, 0.2, d / 2 - 0.12, m);
    box(w, 0.1, d, mk(color, { rough: 0.5 }), 0, 0.5, 0, m);
    extra(m);
    g.add(m);
  };
  module(-2.6, -1.8, 4.6, 2.4, 0x10306a, (m) => {
    box(1.8, 0.14, 1.5, mk(0xb8c0cc, { metal: 0.9, rough: 0.3 }), -0.4, 0.62, 0.1, m);
    box(1.0, 0.04, 0.6, gold, 1.5, 0.58, -0.7, m);
  });
  module(2.8, -1.9, 2.8, 2.4, 0x10306a, (m) => {
    box(1.4, 0.28, 1.4, mk(0xe9dcc0, { rough: 0.9 }), 0, 0.68, 0, m);
  });
  module(-3.8, 2.0, 2.0, 1.4, 0x1c4fa0, (m) => {
    box(0.5, 0.1, 0.5, black, 0, 0.6, 0, m);
  });
  module(1.5, 2.0, 3.4, 2.2, 0x10306a, (m) => {
    box(1.4, 0.12, 1.4, mk(0xb8c0cc, { metal: 0.9, rough: 0.3 }), -0.4, 0.6, 0, m);
    cyl(0.22, 0.8, gold, 1.3, 0.8, 0, m);
  });
  const wires = [0xff2a54, 0x00e5ff, 0x10b981, 0xf5a623];
  for (let i = 0; i < 8; i++) {
    box(0.05, 0.05, 1 + r() * 1.2, mk(wires[i % 4], { emissive: wires[i % 4], ei: 0.3 }), -4.5 + i * 1.2, 0.35, 0.2 + r() * 0.6, g);
  }
  const labels: THREE.Sprite[] = [];
  if (withLabels) {
    const [, a] = callout(g, "Module headers", new THREE.Vector3(-2.6, 0.5, -1.8), new THREE.Vector3(-3.5, 3.4, -3.2), C.cyan);
    const [, b] = callout(g, "Etched copper (bottom)", new THREE.Vector3(3.5, -0.1, 2.5), new THREE.Vector3(5, -2.2, 3.8), C.gold);
    const [, c] = callout(g, "Breakout modules", new THREE.Vector3(2.8, 1.0, -1.9), new THREE.Vector3(3.8, 3.0, -3.4), C.emerald);
    labels.push(a, b, c);
  }
  return { group: g, labels };
}

function buildRevC(withLabels: boolean) {
  const g = new THREE.Group();
  const W = 7.2;
  const D = 5;
  const maskMat = mk(0x0a5a40, { rough: 0.35, metal: 0.1, emissive: 0x021a12, ei: 0.6 });
  const plates: THREE.Mesh[] = [
    box(W, 0.1, D, maskMat, 0, 0, 0, g),
    box(W, 0.26, D, mk(0xb08a3e, { rough: 0.7, opacity: 0.9 }), 0, -0.18, 0, g),
    box(W, 0.04, D, mk(0x9a7420, { emissive: 0x3a2800, ei: 0.5, metal: 0.8, rough: 0.35 }), 0, -0.34, 0, g),
    box(W, 0.1, D, maskMat, 0, -0.44, 0, g),
  ];
  const top = plates[0];
  const y = 0.1;
  const silver = mk(0xc3cad6, { metal: 0.9, rough: 0.3 });
  const black = mk(0x0b0d12, { rough: 0.6 });
  const gold = mk(0xf5a623, { metal: 0.9, rough: 0.3 });
  box(2.0, 0.14, 1.5, silver, -1.8, y, -0.8, top);
  box(2.0, 0.12, 0.5, black, -1.8, y, -1.8, top);
  box(0.45, 0.1, 0.45, black, 2.4, y, 1.3, top);
  box(1.6, 0.12, 1.6, silver, 0.6, y, -1.1, top);
  cyl(0.12, 0.3, gold, 1.5, y + 0.1, -2.0, top, 12);
  box(1.0, 0.12, 1.0, mk(0x8d95a5, { metal: 0.8, rough: 0.4 }), 2.7, y, -1.2, top);
  const led = mk(0xffffff, { emissive: 0x00e5ff, ei: 1.5 });
  box(0.3, 0.08, 0.3, led, -3.0, y, 1.8, top);
  box(0.6, 0.3, 0.6, black, -2.8, y + 0.1, 0.5, top);
  cyl(0.2, 0.2, mk(0xff2a54, { emissive: 0xff2a54, ei: 0.6 }), -2.8, y + 0.35, 0.5, top, 16);
  box(0.3, 0.08, 0.2, black, -0.6, y, 1.5, top);
  box(0.3, 0.08, 0.2, black, 0.1, y, 1.5, top);
  box(0.3, 0.08, 0.2, black, 0.7, y, 1.5, top);
  box(0.8, 0.35, 0.5, mk(0xf2f2f2), 3.0, y + 0.1, -0.1, top);
  const r = rng(11);
  const passive = mk(0x8b7a55, { rough: 0.6 });
  for (let i = 0; i < 44; i++) {
    box(0.16, 0.06, 0.09, passive, (r() - 0.5) * 6.2, y, 0.5 + r() * 1.9, top);
  }
  for (let i = 0; i < 22; i++) box(0.18, 0.02, 0.18, gold, -3.3 + i * 0.3, y - 0.03, 2.3, top);
  for (const [cx, cz] of [
    [-3.3, -2.2],
    [3.3, -2.2],
    [-3.3, 2.0],
    [3.3, 2.0],
  ])
    cyl(0.16, 0.03, black, cx, y - 0.02, cz, top, 16);
  const labels: THREE.Sprite[] = [];
  if (withLabels) {
    const items: [string, [number, number, number], [number, number, number], number][] = [
      ["ESP32-S3FH4R2", [-1.8, 0.2, -0.8], [-3.6, 2.6, -3.0], C.cyan],
      ["SX1278 LoRa", [0.6, 0.2, -1.1], [0.6, 3.6, -3.4], C.gold],
      ["GNSS", [2.7, 0.2, -1.2], [4.8, 2.4, -2.6], C.emerald],
      ["MPU-6050", [2.4, 0.2, 1.3], [5.0, 1.4, 2.6], C.cyan],
      ["Cancel button", [-2.8, 0.4, 0.5], [-5.2, 1.4, 1.6], C.crimson],
      ["TP4054 + protection", [0.1, 0.2, 1.5], [-0.4, 1.8, 4.2], C.gold],
    ];
    for (const [t, f, to, col] of items) {
      const [, s] = callout(g, t, new THREE.Vector3(...f), new THREE.Vector3(...to), col, 0.62);
      labels.push(s);
    }
  }
  const setSpread = (s: number) => {
    plates.forEach((p, i) => {
      p.position.y = -i * (0.17 + s * 1.5);
    });
  };
  const update = (t: number) => {
    (led.emissive as THREE.Color).setHSL((t * 0.2) % 1, 1, 0.5);
  };
  return { group: g, labels, setSpread, update };
}

/* -------------------------------------------------------------- scenes */

const sceneHero: Builder = (g) => {
  grid(g);
  const pcb = buildRevC(false);
  pcb.group.scale.setScalar(1.5);
  g.add(pcb.group);
  const edge = new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.6 });
  const shellGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(12, 1.8, 8.6));
  const shellTop = new THREE.LineSegments(shellGeo, edge);
  const shellBot = new THREE.LineSegments(shellGeo, edge);
  g.add(shellTop, shellBot);
  const ringMat = new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.35 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(10, 0.04, 8, 120), ringMat);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(13, 0.03, 8, 120), new THREE.MeshBasicMaterial({ color: C.crimson, transparent: true, opacity: 0.3 }));
  g.add(ring1, ring2);
  // telemetry burst
  const burst = new THREE.Group();
  const r = rng(3);
  const lp: number[] = [];
  for (let i = 0; i < 60; i++) {
    const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    lp.push(...v.clone().multiplyScalar(8).toArray(), ...v.clone().multiplyScalar(8 + 2 + r() * 5).toArray());
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
  burst.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.35 })));
  g.add(burst);
  // traffic
  const mkTraffic = (color: number, sign: number) => {
    const n = 90;
    const pos = new Float32Array(n * 3);
    const lane = new Float32Array(n);
    const zr = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      lane[i] = sign * (6 + r() * 14);
      zr[i] = r();
      pos[i * 3 + 1] = -4.7;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.45, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    p.frustumCulled = false;
    g.add(p);
    return (t: number) => {
      for (let i = 0; i < n; i++) {
        const u = (zr[i] + t * (0.05 + (i % 5) * 0.012) * -sign) % 1;
        pos[i * 3] = lane[i];
        pos[i * 3 + 2] = (u < 0 ? u + 1 : u) * 90 - 45;
      }
      geo.attributes.position.needsUpdate = true;
    };
  };
  const t1 = mkTraffic(0xffffff, 1);
  const t2 = mkTraffic(C.crimson, -1);
  return (t) => {
    const s = Math.sin(t * 0.9);
    pcb.group.position.y = 1 + s * 0.25;
    pcb.group.rotation.set(0.35, t * 0.25, 0);
    pcb.update(t);
    shellTop.position.y = 1 + 1.4 + (s + 1) * 0.35;
    shellBot.position.y = 1 - 1.4 - (s + 1) * 0.35;
    shellTop.rotation.y = shellBot.rotation.y = t * 0.25;
    ring1.rotation.set(Math.PI / 2.4, t * 0.15, 0);
    ring2.rotation.set(Math.PI / 2.1, -t * 0.1, 0.3);
    burst.rotation.y = t * 0.08;
    burst.rotation.x = t * 0.05;
    t1(t);
    t2(t);
  };
};

const sceneProblem: Builder = (g) => {
  grid(g, -2.2);
  box(46, 0.2, 9, mk(0x151b28, { rough: 0.9 }), 0, -2.1, 0, g);
  for (let i = 0; i < 12; i++) box(1.8, 0.02, 0.18, mk(0xffffff, { emissive: 0x444444 }), -20 + i * 3.6, -1.98, 0, g);
  const pot = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  pot.rotation.x = -Math.PI / 2;
  pot.position.set(-6, -1.97, 1);
  g.add(pot);
  const wall = box(1, 6, 8, mk(0x5b6577, { rough: 0.9 }), 7, 0.9, 0, g);
  box(0.05, 0.4, 7.4, mk(0xf5a623, { emissive: 0xf5a623, ei: 0.6 }), 6.48, 2.2, 0, g);
  void wall;
  const car = new THREE.Group();
  box(4.2, 0.9, 2, mk(0xff2a54, { rough: 0.35, metal: 0.4, emissive: 0x330610 }), 0, 0, 0, car);
  box(2.1, 0.7, 1.8, mk(0x1a2233, { rough: 0.2, metal: 0.6 }), -0.2, 0.75, 0, car);
  const wheel = mk(0x0a0a0a);
  for (const [wx, wz] of [
    [-1.3, 1],
    [1.3, 1],
    [-1.3, -1],
    [1.3, -1],
  ]) {
    const w = cyl(0.45, 0.35, wheel, wx, -0.5, wz, car, 18);
    w.rotation.x = Math.PI / 2;
  }
  const arrows = [
    new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1.4, 0), 3, 0xff4d6d, 0.5, 0.3),
    new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1.4, 0), 3, 0x10b981, 0.5, 0.3),
    new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1.4, 0), 3, 0x00e5ff, 0.5, 0.3),
  ];
  arrows.forEach((a) => car.add(a));
  g.add(car);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 48), new THREE.MeshBasicMaterial({ color: C.crimson, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.y = Math.PI / 2;
    m.position.set(6.4, 0.5, 0);
    g.add(m);
    rings.push(m);
  }
  const labs = [
    addLabel(g, "a = (ax, ay, az)", -1, 4.0, 0, "#ff7a93", 0.8),
    addLabel(g, "ω = (ωx, ωy, ωz)", -1, 5.1, 0, "#00e5ff", 0.8),
    addLabel(g, "Pothole: ≤4.5 G, recovers upright", -6, 1.6, 2, "#f5a623", 0.8),
    addLabel(g, "Crash: >5 G, rests >45° tilt", 3.8, 6.0, 0, "#ff2a54", 0.8),
  ];
  return (t, _dt, a) => {
    fade(labs, a);
    const p = (t % 8) / 8;
    const hit = 0.6;
    let x: number;
    let yy = 0;
    let rz = 0;
    let rx = 0;
    if (p < hit) {
      x = -14 + 18.4 * (p / hit);
      const dp = x + 6;
      if (Math.abs(dp) < 1.6) {
        yy = Math.sin(((dp + 1.6) / 3.2) * Math.PI) * 0.45;
        rz = Math.sin(((dp + 1.6) / 3.2) * Math.PI) * 0.12;
      }
    } else {
      const q = p - hit;
      x = 4.4 - 0.8 * (1 - Math.exp(-q * 12));
      rz = Math.min(1.15, q * 5);
      yy = Math.min(0.6, q * 3);
      rx = Math.sin(t * 70) * 0.05 * Math.exp(-q * 9);
    }
    car.position.set(x, -1.1 + yy, 0);
    car.rotation.set(rx, 0, rz);
    car.visible = p < 0.96;
    rings.forEach((m, k) => {
      const u = (p - hit - k * 0.05) / 0.3;
      const mat = m.material as THREE.MeshBasicMaterial;
      if (p > hit && u >= 0 && u <= 1) {
        m.scale.setScalar(1 + u * 9);
        mat.opacity = (1 - u) * 0.8;
      } else mat.opacity = 0;
    });
  };
};

const sceneObjectives: Builder = (g) => {
  grid(g);
  const up: Updater[] = [];
  // edge hardware
  const hw = new THREE.Group();
  hw.position.set(-10, 0, 0);
  const pcb = buildRevC(false);
  pcb.group.scale.setScalar(0.9);
  hw.add(pcb.group);
  // AI core
  const ai = new THREE.Group();
  ai.position.set(0, 0, 0);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), new THREE.MeshBasicMaterial({ color: C.cyan, wireframe: true, transparent: true, opacity: 0.7 }));
  const inner = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), mk(C.cyan, { emissive: C.cyan, ei: 1.2 }));
  ai.add(core, inner);
  // dispatch
  const dp = new THREE.Group();
  dp.position.set(10, 0, 0);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 4), mk(C.crimson, { emissive: C.crimson, ei: 0.8 }));
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), mk(0xffffff, { emissive: C.crimson, ei: 2 }));
  beacon.position.y = 2.4;
  const pulse = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, 48), new THREE.MeshBasicMaterial({ color: C.crimson, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  pulse.rotation.x = -Math.PI / 2;
  pulse.position.y = -1.4;
  dp.add(cone, beacon, pulse);
  g.add(hw, ai, dp);
  const c1 = new THREE.CatmullRomCurve3([new THREE.Vector3(-7, 0, 0), new THREE.Vector3(-4, 1.5, 0), new THREE.Vector3(-2.4, 0, 0)]);
  const c2 = new THREE.CatmullRomCurve3([new THREE.Vector3(2.4, 0, 0), new THREE.Vector3(5, 1.5, 0), new THREE.Vector3(8, 0, 0)]);
  link(g, c1, C.cyan);
  link(g, c2, C.crimson);
  up.push(flow(g, c1, C.cyan, 10, 0.3), flow(g, c2, C.crimson, 10, 0.3));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(15.5, 0.05, 8, 160), new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.45 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.5;
  g.add(ring);
  const labs = [
    addLabel(g, "EDGE HARDWARE", -10, 4.2, 0, "#00a86b", 1),
    addLabel(g, "AI INFERENCE CORE", 0, 4.2, 0, "#00e5ff", 1),
    addLabel(g, "EMERGENCY DISPATCH", 10, 4.2, 0, "#ff2a54", 1),
    addLabel(g, "VALIDATION LOOP", 0, -3.4, 11, "#f5a623", 0.9),
  ];
  return (t, dt, a) => {
    fade(labs, a);
    up.forEach((u) => u(t, dt, a));
    pcb.group.rotation.set(0.3, t * 0.4, 0);
    pcb.update(t);
    core.rotation.set(t * 0.3, t * 0.4, 0);
    inner.scale.setScalar(1 + Math.sin(t * 3) * 0.12);
    cone.rotation.y = t * 0.8;
    const k = (t * 0.7) % 1;
    pulse.scale.setScalar(1 + k * 3);
    (pulse.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.6;
    ring.rotation.z = t * 0.1;
  };
};

const sceneArchitecture: Builder = (g) => {
  grid(g);
  const up: Updater[] = [];
  const P = {
    w: new THREE.Vector3(-12, 0, 0),
    phone: new THREE.Vector3(-6, 7, -4),
    base: new THREE.Vector3(0, 0, 0),
    desk: new THREE.Vector3(8, 0, 0),
    cloud: new THREE.Vector3(8, 8, -5),
  };
  const wear = buildRevC(false);
  wear.group.scale.setScalar(0.55);
  wear.group.position.copy(P.w);
  g.add(wear.group);
  const phone = new THREE.Group();
  phone.position.copy(P.phone);
  box(2, 3.6, 0.25, mk(0x10141f, { metal: 0.6, rough: 0.3 }), 0, 0, 0, phone);
  box(1.7, 3.2, 0.05, mk(0x00e5ff, { emissive: 0x00a6c0, ei: 0.9 }), 0, 0, 0.14, phone);
  g.add(phone);
  const base = new THREE.Group();
  base.position.copy(P.base);
  box(3, 0.9, 2.2, mk(0x1b2333, { metal: 0.5 }), 0, 0, 0, base);
  cyl(0.08, 3, mk(0xf5a623, { emissive: 0xf5a623, ei: 0.5 }), 0.9, 1.8, 0, base, 8);
  g.add(base);
  const desk = new THREE.Group();
  desk.position.copy(P.desk);
  box(5, 3.1, 0.2, mk(0x0b0f19, { metal: 0.6 }), 0, 1.4, 0, desk);
  box(4.6, 2.7, 0.04, mk(0x1a2744, { emissive: 0x10305a, ei: 0.9 }), 0, 1.4, 0.12, desk);
  cyl(0.15, 1.2, mk(0x2a3550), 0, -0.5, 0, desk, 10);
  box(2, 0.1, 1, mk(0x2a3550), 0, -1.1, 0, desk);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), mk(C.crimson, { emissive: C.crimson, ei: 1.5 }));
  pin.position.set(0.6, 1.5, 0.2);
  desk.add(pin);
  g.add(desk);
  const cloud = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.55 }));
  cloud.position.copy(P.cloud);
  g.add(cloud);
  const mid = (a: THREE.Vector3, b: THREE.Vector3, lift: number) => new THREE.QuadraticBezierCurve3(a, a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, lift, 0)), b);
  const ble = mid(P.w.clone().add(new THREE.Vector3(0, 1, 0)), P.phone.clone().add(new THREE.Vector3(0, -2, 0)), 1);
  const lora = mid(P.w.clone().add(new THREE.Vector3(1.5, 0.5, 0)), P.base.clone().add(new THREE.Vector3(-1.6, 0.5, 0)), 4);
  const usb = mid(P.base.clone().add(new THREE.Vector3(1.6, 0.4, 0)), P.desk.clone().add(new THREE.Vector3(-2.6, 1.2, 0)), 0.5);
  const rest = mid(P.desk.clone().add(new THREE.Vector3(0, 3.2, 0)), P.cloud.clone().add(new THREE.Vector3(0, -1.6, 0)), 0.5);
  const sms = mid(P.phone.clone().add(new THREE.Vector3(1.2, 1.5, 0)), P.cloud.clone().add(new THREE.Vector3(-1.8, 0, 0)), 4);
  const defs: [THREE.Curve<THREE.Vector3>, number][] = [
    [ble, C.cyan],
    [lora, C.gold],
    [usb, C.emerald],
    [rest, 0xffffff],
    [sms, 0xc084fc],
  ];
  defs.forEach(([c, col]) => {
    link(g, c, col);
    up.push(flow(g, c, col, 12, 0.22));
  });
  const labs = [
    addLabel(g, "WEARABLE RELAY", -12, -2.8, 0, "#00a86b", 0.85),
    addLabel(g, "RIDER PHONE", -6, 9.8, -4, "#00e5ff", 0.85),
    addLabel(g, "BASE STATION", 0, -2, 0, "#f5a623", 0.85),
    addLabel(g, "COMMAND CENTER", 8, -2.6, 0, "#ff2a54", 0.85),
    addLabel(g, "WEB MIRROR", 8, 10.6, -5, "#ffffff", 0.85),
    addLabel(g, "BLE", -10.3, 5.6, -2, "#00e5ff", 0.7),
    addLabel(g, "LoRa 433 MHz", -6, 4.6, 0, "#f5a623", 0.7),
    addLabel(g, "USB / Wi-Fi", 4.8, 2.6, 0, "#00a86b", 0.7),
    addLabel(g, "REST", 9.5, 6, -3, "#ffffff", 0.7),
    addLabel(g, "SMS / REST fallback", -2, 12, -5, "#c084fc", 0.7),
  ];
  return (t, dt, a) => {
    fade(labs, a);
    up.forEach((u) => u(t, dt, a));
    wear.group.rotation.set(0.35, t * 0.35, 0);
    wear.update(t);
    cloud.rotation.y = t * 0.3;
    pin.scale.setScalar(1 + Math.sin(t * 5) * 0.4);
    phone.rotation.y = Math.sin(t * 0.6) * 0.3;
  };
};

const sceneHardware: Builder = (g) => {
  grid(g, -4.5);
  const alpha = buildAlpha(true);
  alpha.group.position.set(-9.5, 0, 0);
  const rev = buildRevC(true);
  rev.group.scale.setScalar(1.45);
  rev.group.position.set(9.5, 0, 0);
  g.add(alpha.group, rev.group);
  const labs = [
    addLabel(g, "ALPHA · SELF-FABRICATED", -9.5, -4, 4, "#f5a623", 1),
    addLabel(g, "REV C · PRODUCTION PCB", 9.5, -4, 4, "#00a86b", 1),
    addLabel(g, "Layer stack (illustrative)", 9.5, -2.4, 0, "#94a3b8", 0.7),
    ...alpha.labels,
    ...rev.labels,
  ];
  let s = 0;
  return (t, dt, a) => {
    fade(labs, a);
    s += (a - s) * (1 - Math.exp(-dt * 2.2));
    rev.setSpread(s);
    rev.update(t);
    alpha.group.rotation.set(0.45, t * 0.3, 0);
    rev.group.rotation.set(0.45, -t * 0.18 + 0.6, 0);
  };
};

const sceneAI: Builder = (g) => {
  grid(g, -8);
  const sizes = [14, 8, 6, 6];
  const xs = [-13.5, -4.5, 4.5, 13.5];
  const outCols = [C.crimson, 0xff7a3d, C.gold, 0xffc857, C.cyan, C.emerald];
  const layers: THREE.Mesh[][] = [];
  const pos: THREE.Vector3[][] = [];
  sizes.forEach((n, li) => {
    const ms: THREE.Mesh[] = [];
    const ps: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      let y: number;
      let z: number;
      if (li === 0) {
        y = ((i % 7) - 3) * 1.7;
        z = i < 7 ? -1 : 1;
      } else if (li === 1) {
        y = ((i % 4) - 1.5) * 2.2;
        z = i < 4 ? -1.3 : 1.3;
      } else if (li === 2) {
        y = ((i % 3) - 1) * 2.6;
        z = i < 3 ? -1.3 : 1.3;
      } else {
        y = (i - 2.5) * 2.1;
        z = 0;
      }
      const col = li === 3 ? outCols[i] : li === 0 ? C.gold : C.cyan;
      const m = new THREE.Mesh(new THREE.SphereGeometry(li === 3 ? 0.55 : 0.38, 20, 20), mk(col, { emissive: col, ei: 0.4 }));
      m.position.set(xs[li], y, z);
      g.add(m);
      ms.push(m);
      ps.push(m.position.clone());
    }
    layers.push(ms);
    pos.push(ps);
  });
  const lp: number[] = [];
  for (let li = 0; li < 3; li++) for (const a of pos[li]) for (const b of pos[li + 1]) lp.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
  g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.16 })));
  // chip
  const chip = new THREE.Group();
  chip.position.set(-25, 0, 0);
  box(6, 0.6, 6, mk(0x0b0d12, { rough: 0.5, metal: 0.4 }), 0, 0, 0, chip);
  box(3.4, 0.2, 3.4, mk(0x22324d, { emissive: 0x00e5ff, ei: 0.35, metal: 0.8, rough: 0.3 }), 0, 0.4, 0, chip);
  const pin = mk(0xc3cad6, { metal: 0.9, rough: 0.3 });
  for (let i = 0; i < 12; i++) {
    const o = -2.5 + i * 0.45;
    box(0.2, 0.1, 0.6, pin, o, 0, 3.2, chip);
    box(0.2, 0.1, 0.6, pin, o, 0, -3.2, chip);
    box(0.6, 0.1, 0.2, pin, 3.2, 0, o, chip);
    box(0.6, 0.1, 0.2, pin, -3.2, 0, o, chip);
  }
  chip.rotation.x = 0.2;
  g.add(chip);
  const feed = new THREE.CatmullRomCurve3([new THREE.Vector3(-22, 0, 0), new THREE.Vector3(-18, 1, 0), new THREE.Vector3(-14.4, 0, 0)]);
  link(g, feed, C.gold, 0.08);
  const fl = flow(g, feed, C.gold, 14, 0.4);
  const labs: THREE.Sprite[] = [
    addLabel(g, "ESP32-S3 · MPU-6050 · 50 Hz", -25, 5, 0, "#f5a623", 0.9),
    addLabel(g, "14 FEATURES", xs[0], 7, 0, "#f5a623", 0.9),
    addLabel(g, "1D-CNN", xs[1], 7, 0, "#00e5ff", 0.9),
    addLabel(g, "SLM REASONER", xs[2], 7, 0, "#00e5ff", 0.9),
    addLabel(g, "3-WINDOW HYSTERESIS", xs[3], 7.2, 0, "#ff2a54", 0.9),
    addLabel(g, "illustrative network", 0, -7, 3, "#94a3b8", 0.7),
  ];
  const names = ["Collision", "Rollover", "Fall", "Skid", "Speed wobble", "Suppressed"];
  names.forEach((n, i) => {
    const s = label(n, hex(outCols[i]), 0.75);
    s.position.set(xs[3] + 1.2 + s.scale.x / 2, pos[3][i].y, 0);
    g.add(s);
    labs.push(s);
  });
  const mats = layers.map((l) => l.map((m) => m.material as THREE.MeshStandardMaterial));
  return (t, _dt, a) => {
    fade(labs, a);
    fl(t);
    mats.forEach((ms, li) =>
      ms.forEach((m, i) => {
        m.emissiveIntensity = 0.25 + 1.4 * Math.max(0, Math.sin(t * 3 - li * 1.3 + i * 0.35));
      }),
    );
    chip.rotation.y = Math.sin(t * 0.5) * 0.3;
  };
};

const sceneDataset: Builder = (g) => {
  grid(g, -8);
  const r = rng(21);
  const gauss = () => (r() + r() + r() + r() - 2) * 2;
  // axes: x = peak SVM, y = tilt delta, z = gyro peak
  const clusters: [string, [number, number, number], number, number, number][] = [
    ["Daily motion", [-7, -5, -4], 2.2, C.cyan, 120],
    ["Pothole / bump", [3, -5, 3], 1.8, C.gold, 120],
    ["Fall / skid", [-1, 2, -2], 1.9, 0xff7a3d, 100],
    ["Crash / rollover", [8, 6, 4], 1.8, C.crimson, 110],
  ];
  const total = clusters.reduce((s, c) => s + c[4], 0);
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  let k = 0;
  const cg = new THREE.Group();
  const color = new THREE.Color();
  for (const [, c, sd, cc, n] of clusters) {
    color.set(cc);
    for (let i = 0; i < n; i++) {
      pos[k * 3] = c[0] + gauss() * sd * 0.6;
      pos[k * 3 + 1] = c[1] + gauss() * sd * 0.6;
      pos[k * 3 + 2] = c[2] + gauss() * sd * 0.6;
      col[k * 3] = color.r;
      col[k * 3 + 1] = color.g;
      col[k * 3 + 2] = color.b;
      k++;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.34, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  pts.frustumCulled = false;
  cg.add(pts);
  const plane = (w: number, h: number, c: number) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
  const p1 = plane(18, 18, C.crimson);
  p1.rotation.y = Math.PI / 2;
  p1.position.x = 0.8;
  const p2 = plane(22, 18, C.cyan);
  p2.rotation.x = Math.PI / 2;
  p2.position.y = -1.2;
  cg.add(p1, p2);
  const axes = new THREE.AxesHelper(12);
  axes.position.set(-11, -9, -8);
  cg.add(axes);
  g.add(cg);
  const labs = [
    addLabel(cg, "Peak SVM →", 0, -9.6, -8, "#ff7a93", 0.8),
    addLabel(cg, "Tilt Δ ↑", -11, 4, -8, "#10b981", 0.8),
    addLabel(cg, "Gyro peak", -11, -9, 4.5, "#00e5ff", 0.8),
    ...clusters.map(([n, c, , cc]) => addLabel(cg, n, c[0], c[1] + 4.2, c[2], hex(cc), 0.75)),
    addLabel(g, "illustrative geometry · not measured data", 0, -10.5, 9, "#94a3b8", 0.75),
  ];
  return (t, _dt, a) => {
    fade(labs, a);
    cg.rotation.y = t * 0.12;
  };
};

const sceneResults: Builder = (g) => {
  grid(g, -0.01, 50);
  const names = ["ADL", "Bump", "Fall/Skid", "Crash"];
  const tiles: { m: THREE.Mesh; target: number; diag: boolean }[] = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const diag = i === j;
      const mat = mk(diag ? C.cyan : C.crimson, { emissive: diag ? C.cyan : C.crimson, ei: diag ? 0.6 : 0.25, opacity: diag ? 0.85 : 0.6, rough: 0.3 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1, 2.2), mat);
      m.position.set((j - 1.5) * 2.7, 0, (i - 1.5) * 2.7);
      g.add(m);
      tiles.push({ m, target: diag ? 5 : 0.6, diag });
    }
  const labs: THREE.Sprite[] = [];
  names.forEach((n, i) => {
    labs.push(addLabel(g, n, (i - 1.5) * 2.7, 0.4, 6.6, "#94a3b8", 0.6));
    labs.push(addLabel(g, n, -7.8 - 0.4, 0.4, (i - 1.5) * 2.7, "#94a3b8", 0.6));
  });
  labs.push(addLabel(g, "PREDICTED →", 0, 0.4, 8.2, "#00e5ff", 0.7));
  labs.push(addLabel(g, "ACTUAL →", -11.5, 0.4, 0, "#ff7a93", 0.7));
  const ins: THREE.Sprite[] = [];
  for (let i = 0; i < 4; i++) {
    const s = addLabel(g, "[INSERT]", (i - 1.5) * 2.7, 6.2, (i - 1.5) * 2.7, "#f5a623", 0.7);
    ins.push(s);
  }
  labs.push(...ins, addLabel(g, "placeholder geometry · insert measured values", 0, 8, 0, "#94a3b8", 0.75));
  return (t, _dt, a) => {
    fade(labs, a);
    for (const tl of tiles) {
      const cur = tl.m.scale.y;
      const want = Math.max(0.05, tl.target * a);
      const h = cur + (want - cur) * 0.08;
      tl.m.scale.y = h;
      tl.m.position.y = h / 2;
      if (tl.diag) (tl.m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.25;
    }
  };
};

function drawDashboard() {
  const c = document.createElement("canvas");
  c.width = 1280;
  c.height = 720;
  const x = c.getContext("2d")!;
  x.fillStyle = "#0b1220";
  x.fillRect(0, 0, 1280, 720);
  x.fillStyle = "#0f1a2e";
  x.fillRect(0, 0, 1280, 56);
  x.fillStyle = "#00e5ff";
  x.font = "700 24px ui-monospace, monospace";
  x.fillText("RAMS COMMAND CENTER", 24, 36);
  x.fillStyle = "#10b981";
  x.fillText("● LIVE", 1130, 36);
  // sidebar
  x.fillStyle = "#0d1626";
  x.fillRect(0, 56, 300, 664);
  const cards: [string, string, string][] = [
    ["Rider A", "CRASH", "#ff2a54"],
    ["Rider B", "NORMAL", "#10b981"],
    ["Rider C", "SKID", "#f5a623"],
    ["Rider D", "NORMAL", "#10b981"],
  ];
  cards.forEach(([n, s, col], i) => {
    const y = 76 + i * 116;
    x.fillStyle = "#14223a";
    x.fillRect(16, y, 268, 100);
    x.fillStyle = "#fff";
    x.font = "600 22px sans-serif";
    x.fillText(n, 30, y + 34);
    x.fillStyle = col;
    x.fillRect(30, y + 50, 100, 28);
    x.fillStyle = "#0b1220";
    x.font = "700 16px ui-monospace, monospace";
    x.fillText(s, 40, y + 70);
    x.fillStyle = "#334155";
    x.fillRect(150, y + 58, 110, 12);
    x.fillStyle = col;
    x.fillRect(150, y + 58, 40 + ((i * 23) % 70), 12);
  });
  // map
  x.fillStyle = "#0a1424";
  x.fillRect(300, 56, 980, 664);
  x.strokeStyle = "#16304d";
  x.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    x.beginPath();
    x.moveTo(300 + i * 60, 56);
    x.lineTo(300 + i * 60 + (i % 3) * 20, 720);
    x.stroke();
  }
  for (let i = 0; i < 12; i++) {
    x.beginPath();
    x.moveTo(300, 90 + i * 55);
    x.lineTo(1280, 70 + i * 55 + (i % 4) * 15);
    x.stroke();
  }
  x.strokeStyle = "#1d4ed8";
  x.lineWidth = 14;
  x.beginPath();
  x.moveTo(300, 600);
  x.bezierCurveTo(600, 480, 800, 640, 1280, 420);
  x.stroke();
  x.strokeStyle = "#f5a623";
  x.lineWidth = 6;
  x.beginPath();
  x.moveTo(300, 250);
  x.bezierCurveTo(600, 300, 700, 200, 1280, 330);
  x.stroke();
  const zone = (cx: number, cy: number, r1: number, r2: number) => {
    x.fillStyle = "rgba(239,68,68,0.22)";
    x.setLineDash([10, 8]);
    x.strokeStyle = "#ef4444";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(cx, cy, r1, 0, Math.PI * 2);
    x.fill();
    x.stroke();
    x.setLineDash([]);
    x.fillStyle = "rgba(239,68,68,0.45)";
    x.beginPath();
    x.arc(cx, cy, r2, 0, Math.PI * 2);
    x.fill();
  };
  zone(1010, 250, 90, 40);
  zone(580, 500, 70, 30);
  const pin = (px: number, py: number, col: string) => {
    x.fillStyle = col;
    x.beginPath();
    x.arc(px, py, 14, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = "#fff";
    x.lineWidth = 3;
    x.stroke();
  };
  pin(820, 360, "#ff2a54");
  pin(640, 190, "#10b981");
  pin(1040, 520, "#f5a623");
  x.fillStyle = "rgba(255,42,84,0.92)";
  x.fillRect(320, 640, 620, 60);
  x.fillStyle = "#fff";
  x.font = "700 24px sans-serif";
  x.fillText("CRASH · Severe collision · [LAST FIX]", 340, 678);
  x.fillStyle = "#0f1a2e";
  x.fillRect(960, 600, 300, 100);
  x.fillStyle = "#00e5ff";
  x.font = "600 18px ui-monospace, monospace";
  x.fillText("AI BRIEF", 976, 630);
  x.fillStyle = "#94a3b8";
  x.font = "16px sans-serif";
  x.fillText("Dispatch nearest unit.", 976, 660);
  x.fillText("Medical profile attached.", 976, 684);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const sceneDashboard: Builder = (g) => {
  grid(g, -5);
  const mon = new THREE.Group();
  mon.rotation.y = -0.2;
  box(16.6, 9.6, 0.3, mk(0x0b0f19, { metal: 0.6, rough: 0.3 }), 0, 0, -0.2, mon);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ map: drawDashboard(), toneMapped: false }));
  mon.add(scr);
  cyl(0.4, 2, mk(0x1b2333), 0, -5.7, -0.3, mon, 12);
  box(5, 0.2, 2.4, mk(0x1b2333), 0, -6.8, -0.3, mon);
  const pulses: THREE.Mesh[] = [];
  const mp = (px: number, py: number, col: number) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.34, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.position.set((px / 1280 - 0.5) * 16, (0.5 - py / 720) * 9, 0.05);
    mon.add(m);
    pulses.push(m);
  };
  mp(820, 360, C.crimson);
  mp(640, 190, C.emerald);
  mp(1040, 520, C.gold);
  g.add(mon);
  const pcb = buildRevC(false);
  pcb.group.scale.setScalar(0.9);
  pcb.group.position.set(-11, -3.4, 7);
  g.add(pcb.group);
  const arc = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-9.5, -2.5, 7), new THREE.Vector3(-6, 3, 4), new THREE.Vector3(2, 0, 0.5));
  link(g, arc, C.gold);
  const fl = flow(g, arc, C.gold, 14, 0.3);
  const labs = [
    addLabel(g, "REV C WEARABLE", -11, -0.8, 7, "#00a86b", 0.8),
    addLabel(g, "LoRa → BASE → COMMAND CENTER", -5, 3.4, 4, "#f5a623", 0.75),
  ];
  return (t, _dt, a) => {
    fade(labs, a);
    fl(t);
    pcb.group.rotation.set(0.4, t * 0.4, 0);
    pcb.update(t);
    pulses.forEach((m, i) => {
      const k = (t * 0.8 + i * 0.3) % 1;
      m.scale.setScalar(1 + k * 3);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9;
    });
    mon.rotation.y = -0.2 + Math.sin(t * 0.3) * 0.06;
  };
};

const sceneEthics: Builder = (g) => {
  grid(g, -5);
  const metal = mk(0x9aa6bb, { metal: 0.8, rough: 0.3 });
  cyl(0.35, 8, metal, 0, -1, 0, g, 16);
  box(5, 0.3, 3, mk(0x1b2333), 0, -5.1, 0, g);
  const beam = new THREE.Group();
  beam.position.y = 3;
  box(12, 0.25, 0.25, mk(0xf5a623, { metal: 0.8, rough: 0.3, emissive: 0x3a2800 }), 0, 0, 0, beam);
  g.add(beam);
  const mkPan = (x: number, col: number) => {
    const p = new THREE.Group();
    p.position.x = x;
    const line = new THREE.LineBasicMaterial({ color: 0xcbd5e1 });
    for (const dx of [-1.8, 1.8])
      p.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(dx, -3.2, 0)]), line));
    cyl(2.2, 0.15, mk(col, { emissive: col, ei: 0.4, metal: 0.6, rough: 0.3 }), 0, -3.3, 0, p, 40);
    beam.add(p);
    return p;
  };
  const left = mkPan(-6, C.gold);
  const right = mkPan(6, C.cyan);
  // limits blocks
  for (let i = 0; i < 3; i++) box(1, 1, 1, mk(0x475569, { rough: 0.8 }), -6.8 + i * 1.2, -2.6 + (i % 2) * 0.1, 0, left);
  // shield
  const sh = new THREE.Shape();
  sh.moveTo(0, 1.6);
  sh.bezierCurveTo(1.4, 1.5, 1.6, 1.3, 1.6, 0.8);
  sh.bezierCurveTo(1.6, -0.6, 0.8, -1.4, 0, -1.8);
  sh.bezierCurveTo(-0.8, -1.4, -1.6, -0.6, -1.6, 0.8);
  sh.bezierCurveTo(-1.6, 1.3, -1.4, 1.5, 0, 1.6);
  const shield = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 }), mk(C.cyan, { emissive: C.cyan, ei: 0.7, metal: 0.5, rough: 0.3 }));
  shield.position.set(0, -1.6, -0.2);
  right.add(shield);
  const labs = [
    addLabel(g, "TECHNICAL LIMITS", -6, 0.8, 0, "#f5a623", 0.9),
    addLabel(g, "SAFEGUARDS · RA 10173", 6, 0.8, 0, "#00e5ff", 0.9),
    addLabel(g, "30 s cancel window", 6, 8, 0, "#10b981", 0.75),
    addLabel(g, "store-and-forward", -6, 8, 0, "#f5a623", 0.75),
    addLabel(g, "offline voice cancel", 11, 5, 0, "#10b981", 0.75),
    addLabel(g, "range · domain gap", -11.5, 5, 0, "#f5a623", 0.75),
  ];
  return (t, _dt, a) => {
    fade(labs, a);
    const tilt = Math.sin(t * 0.7) * 0.07;
    beam.rotation.z = tilt;
    left.rotation.z = -tilt;
    right.rotation.z = -tilt;
    shield.rotation.y = Math.sin(t * 0.8) * 0.5;
  };
};

const heightAt = (x: number, z: number) =>
  4.5 * Math.exp(-((x - 20) ** 2) / 55) + 5 * Math.exp(-((x + 20) ** 2) / 65) + 0.7 * Math.sin(x * 0.45 + z * 0.3) * Math.cos(z * 0.35) + 0.6 * Math.max(0, Math.abs(x) / 20) ;

const sceneImpact: Builder = (g) => {
  const geo = new THREE.PlaneGeometry(64, 46, 96, 70);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  g.position.y = -3;
  g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x08111f, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })));
  g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.cyan, wireframe: true, transparent: true, opacity: 0.22 })));
  const P = (x: number, z: number) => new THREE.Vector3(x, heightAt(x, z) + 0.35, z);
  const main = new THREE.CatmullRomCurve3([P(-2, -21), P(2, -12), P(-1, -4), P(0, 2), P(3, 10), P(0, 21)]);
  const west = new THREE.CatmullRomCurve3([P(0, 2), P(-8, 0), P(-14, -4), P(-18, -9)]);
  const east = new THREE.CatmullRomCurve3([P(0, 2), P(8, 5), P(14, 9), P(17, 14)]);
  const up: ((t: number) => void)[] = [];
  [main, west, east].forEach((c, i) => {
    link(g, c, i === 0 ? C.gold : C.emerald, 0.09);
    up.push(flow(g, c, i === 0 ? C.gold : 0x4ade80, 16, 0.12, 0.5));
  });
  const nodes: [THREE.Vector3, string][] = [
    [P(0, 2), "Tuguegarao"],
    [P(-18, -9), "LGU DRRMO"],
    [P(17, 14), "LGU DRRMO"],
    [P(0, 21), "Hospital"],
  ];
  const rings: THREE.Mesh[] = [];
  const labs: THREE.Sprite[] = [];
  nodes.forEach(([v, n]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), mk(C.crimson, { emissive: C.crimson, ei: 1.5 }));
    m.position.copy(v);
    g.add(m);
    const r = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.72, 40), new THREE.MeshBasicMaterial({ color: C.crimson, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    r.rotation.x = -Math.PI / 2;
    r.position.copy(v);
    g.add(r);
    rings.push(r);
    labs.push(addLabel(g, n, v.x, v.y + 2.2, v.z, "#ffffff", 0.9));
  });
  labs.push(addLabel(g, "stylized terrain · not a survey map", 0, 9, 24, "#94a3b8", 0.8));
  labs.push(addLabel(g, "REGION II · CAGAYAN VALLEY CORRIDOR", 0, 7, -24, "#00e5ff", 1));
  return (t, _dt, a) => {
    fade(labs, a);
    up.forEach((u) => u(t));
    rings.forEach((r, i) => {
      const k = (t * 0.6 + i * 0.25) % 1;
      r.scale.setScalar(1 + k * 5);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9;
    });
  };
};

const sceneClosing: Builder = (g) => {
  grid(g, -5);
  const alpha = buildAlpha(false);
  alpha.group.position.set(-9, 0, 0);
  const rev = buildRevC(false);
  rev.group.scale.setScalar(1.4);
  rev.group.position.set(9, 0, 0);
  g.add(alpha.group, rev.group);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(15, 0.05, 8, 160), new THREE.MeshBasicMaterial({ color: C.crimson, transparent: true, opacity: 0.6 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -3;
  g.add(ring);
  const live = addLabel(g, "● LIVE PROTOTYPE DEMONSTRATION READY", 0, 5, 0, "#ff2a54", 1.15);
  return (t, _dt, a) => {
    alpha.group.position.y = Math.sin(t) * 0.3;
    rev.group.position.y = Math.sin(t + 1) * 0.3;
    alpha.group.rotation.set(0.45, t * 0.3, 0);
    rev.group.rotation.set(0.45, -t * 0.3, 0);
    rev.update(t);
    const k = (t * 0.7) % 1;
    ring.scale.setScalar(1 + k * 0.35);
    (ring.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.6;
    live.material.opacity = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.2)) * (0.3 + 0.7 * a);
  };
};

const BUILDERS: Builder[] = [
  sceneHero,
  sceneProblem,
  sceneObjectives,
  sceneArchitecture,
  sceneHardware,
  sceneAI,
  sceneDataset,
  sceneResults,
  sceneDashboard,
  sceneEthics,
  sceneImpact,
  sceneClosing,
];

/* -------------------------------------------------------------- runtime */

function bezier(p: number, x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1) {
  // cubic-bezier(0.22, 1, 0.36, 1) solved with Newton + bisection
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  let t = p;
  for (let i = 0; i < 6; i++) {
    const x = ((ax * t + bx) * t + cx) * t - p;
    const d = (3 * ax * t + 2 * bx) * t + cx;
    if (Math.abs(x) < 1e-5 || Math.abs(d) < 1e-6) break;
    t -= x / d;
  }
  t = Math.min(1, Math.max(0, t));
  return ((ay * t + by) * t + cy) * t;
}

export class DeckScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private groups: THREE.Group[] = [];
  private updaters: (Updater | null)[] = [];
  private act: number[] = [];
  private idx = 0;
  private tweenStart = 0;
  private tweenDur = 2.6;
  private fromPos = new THREE.Vector3();
  private fromLook = new THREE.Vector3();
  private curLook = new THREE.Vector3();
  private mouse = { x: 0, y: 0 };
  private smooth = { x: 0, y: 0 };
  private raf = 0;
  private last = 0;
  private t0 = performance.now();
  private ro: ResizeObserver;
  private onMove: (e: PointerEvent) => void;
  private disposed = false;

  constructor(private host: HTMLElement, initial = 0) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setClearColor(C.bg, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.scene.background = new THREE.Color(C.bg);
    this.scene.fog = new THREE.FogExp2(C.bg, 0.011);
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1200);

    this.scene.add(new THREE.AmbientLight(0xaabbd0, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(10, 20, 14);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(C.cyan, 1.6);
    rim.position.set(-14, 6, -12);
    this.scene.add(rim);
    const warm = new THREE.DirectionalLight(C.crimson, 0.8);
    warm.position.set(14, -4, 8);
    this.scene.add(warm);

    // star dust across the whole journey
    const r = rng(99);
    const n = 2200;
    const sp = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      sp[i * 3] = -80 + r() * (BUILDERS.length * SPACING + 160);
      sp[i * 3 + 1] = -30 + r() * 80;
      sp[i * 3 + 2] = -90 + r() * 100;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.35, transparent: true, opacity: 0.7, depthWrite: false }));
    stars.frustumCulled = false;
    this.scene.add(stars);

    BUILDERS.forEach((b, i) => {
      const g = new THREE.Group();
      g.position.x = i * SPACING;
      const u = b(g);
      this.scene.add(g);
      this.groups.push(g);
      this.updaters.push(u || null);
      this.act.push(0);
    });

    this.idx = Math.max(0, Math.min(BUILDERS.length - 1, initial));
    const tp = this.target(this.idx, 0);
    this.camera.position.copy(tp.pos);
    this.curLook.copy(tp.look);
    this.fromPos.copy(tp.pos);
    this.fromLook.copy(tp.look);
    this.tweenStart = -100;

    this.onMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", this.onMove);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private resize() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.camera.aspect = w / h;
    if (w > 1000) this.camera.setViewOffset(w, h, w * 0.08, 0, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private target(i: number, t: number) {
    const p = POSES[i];
    const ox = i * SPACING;
    const look = new THREE.Vector3(p.look[0] + ox, p.look[1], p.look[2]);
    const pos = new THREE.Vector3(p.pos[0] + ox, p.pos[1], p.pos[2]);
    const off = pos.clone().sub(look);
    const ang = Math.sin(t * 0.25) * p.orbit;
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
    off.y += Math.sin(t * 0.37) * 0.8;
    return { pos: look.clone().add(off), look };
  }

  goTo(i: number) {
    const n = Math.max(0, Math.min(BUILDERS.length - 1, i));
    if (n === this.idx) return;
    this.fromPos.copy(this.camera.position);
    this.fromLook.copy(this.curLook);
    this.idx = n;
    this.tweenStart = (performance.now() - this.t0) / 1000;
  }

  private loop() {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const t = (performance.now() - this.t0) / 1000;
    const dt = Math.min(0.05, t - this.last);
    this.last = t;
    const p = Math.min(1, Math.max(0, (t - this.tweenStart) / this.tweenDur));
    const e = bezier(p);
    const tg = this.target(this.idx, t);
    const pos = this.fromPos.clone().lerp(tg.pos, e);
    const dist = this.fromPos.distanceTo(tg.pos);
    const arc = Math.sin(Math.PI * p) * Math.min(16, dist * 0.14);
    pos.y += arc;
    const look = this.fromLook.clone().lerp(tg.look, e);
    this.smooth.x += (this.mouse.x - this.smooth.x) * 0.05;
    this.smooth.y += (this.mouse.y - this.smooth.y) * 0.05;
    pos.x += this.smooth.x * 1.4;
    pos.y -= this.smooth.y * 0.8;
    const dir = Math.sign(tg.pos.x - this.fromPos.x) || 1;
    const roll = Math.sin(Math.PI * p) * 0.07 * dir;
    this.camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    this.camera.position.copy(pos);
    this.curLook.copy(look);
    this.camera.lookAt(look);

    for (let i = 0; i < this.groups.length; i++) {
      const vis = Math.abs(i - this.idx) <= 1;
      this.groups[i].visible = vis;
      const want = i === this.idx && p > 0.5 ? 1 : 0;
      this.act[i] += (want - this.act[i]) * (1 - Math.exp(-dt * 2.5));
      if (vis) this.updaters[i]?.(t, dt, this.act[i]);
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("pointermove", this.onMove);
    this.ro.disconnect();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      const list = Array.isArray(mat) ? mat : mat ? [mat] : [];
      for (const x of list) {
        const mm = x as THREE.Material & { map?: THREE.Texture | null };
        mm.map?.dispose?.();
        x.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
