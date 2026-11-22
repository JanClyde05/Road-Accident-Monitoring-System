import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import cars from './cars.json';

const vector = (x, y, z) => new T.Vector3(x, y, z);
const steel = '#a7bac2',
  rubber = '#182127',
  body = '#168d91',
  ink = '#263940';
export function surface(color, metalness = 0.08, roughness = 0.67) {
  return new T.MeshStandardMaterial({ color, metalness, roughness });
}
export function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const m = new T.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function block(group, size, position, color, radius = 0.025) {
  return mesh(group, new RoundedBoxGeometry(...size, 2, radius), surface(color), ...position);
}
function oval(group, scale, position, color) {
  const obj = mesh(group, new T.SphereGeometry(1, 16, 12), surface(color), ...position);
  obj.scale.set(...scale);
  return obj;
}
function strut(group, a, b, r, color, top = r) {
  const start = vector(...a),
    end = vector(...b),
    dir = end.clone().sub(start);
  const obj = mesh(group, new T.CylinderGeometry(top, r, dir.length(), 10), surface(color));
  obj.position.copy(start).lerp(end, 0.5);
  obj.quaternion.setFromUnitVectors(vector(0, 1, 0), dir.normalize());
  return obj;
}
function shell(group, rings, color) {
  const coords = [],
    idx = [],
    N = 18;
  for (const [y, rx, rz, dz = 0] of rings)
    for (let i = 0; i < N; i++) {
      const a = (i / N) * 2 * Math.PI;
      coords.push(Math.sin(a) * rx, y, dz + Math.cos(a) * rz);
    }
  for (let j = 0; j < rings.length - 1; j++)
    for (let i = 0; i < N; i++) {
      const a = j * N + i,
        b = j * N + ((i + 1) % N);
      idx.push(a, b, a + N, b, b + N, a + N);
    }
  for (let i = 1; i < N - 1; i++) {
    idx.push(0, i + 1, i);
    const m = (rings.length - 1) * N;
    idx.push(m, m + i, m + i + 1);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(coords, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return mesh(group, g, surface(color));
}

// Kenney Car Kit geometry, with the source palette sampled into vertex colours.
export function automobile(kind) {
  const raw = cars[kind],
    bytes = Uint8Array.from(atob(raw.vertices), (v) => v.charCodeAt(0));
  const view = new DataView(bytes.buffer),
    p = [],
    n = [],
    c = [],
    tint = new T.Color();
  for (let i = 0; i < bytes.length; i += 12) {
    for (let a = 0; a < 3; a++) {
      p.push(view.getInt16(i + 2 * a, true) / 10000);
      n.push(view.getInt8(i + 6 + a) / 127);
    }
    const r = bytes[i + 9],
      green = bytes[i + 10],
      b = bytes[i + 11],
      h = view.getInt16(i + 2, true) / 10000;
    if (h > 0.61 && r > 158 && green > 140 && (Math.abs(r - b) < 62 || b < green * 0.65)) {
      const shine = (r / 255) ** 2;
      tint.setRGB(0.12 + shine * 0.12, 0.18 + shine * 0.17, 0.2 + shine * 0.19, T.SRGBColorSpace);
    } else tint.setRGB(r / 255, green / 255, b / 255, T.SRGBColorSpace);
    c.push(tint.r, tint.g, tint.b);
  }
  const ib = Uint8Array.from(atob(raw.indices), (v) => v.charCodeAt(0));
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(p, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(n, 3));
  g.setAttribute('color', new T.Float32BufferAttribute(c, 3));
  g.setIndex(new T.BufferAttribute(new Uint16Array(ib.buffer), 1));
  const obj = new T.Group(),
    model = mesh(
      obj,
      g,
      new T.MeshStandardMaterial({ vertexColors: true, metalness: 0.21, roughness: 0.42 }),
    );
  model.scale.set(1.28, kind === 'suv' ? 1.36 : 1.13, 1.63);
  for (const s of [-1, 1]) {
    const lamp = mesh(
      obj,
      new T.BoxGeometry(0.27, 0.07, 0.035),
      new T.MeshBasicMaterial({ color: '#ffe3af' }),
      s * 0.57,
      0.56,
      kind === 'suv' ? 2.15 : 2.01,
    );
    lamp.castShadow = false;
    const stop = mesh(
      obj,
      new T.BoxGeometry(0.22, 0.075, 0.035),
      new T.MeshBasicMaterial({ color: '#f18b68' }),
      s * 0.58,
      0.56,
      kind === 'suv' ? -2.14 : -2.08,
    );
    stop.castShadow = false;
  }
  return obj;
}

export function motorcycle() {
  const root = new T.Group(),
    metal = surface('#8fa4ad', 0.66, 0.32),
    tire = surface(rubber);
  for (const z of [-0.75, 0.75]) {
    const wheel = mesh(root, new T.TorusGeometry(0.278, 0.075, 12, 32), tire, 0, 0.35, z);
    wheel.rotation.y = Math.PI / 2;
    const rim = mesh(root, new T.TorusGeometry(0.232, 0.022, 8, 32), metal, 0, 0.35, z);
    rim.rotation.y = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      strut(
        root,
        [0, 0.35, z],
        [0, 0.35 + Math.cos(angle) * 0.22, z + Math.sin(angle) * 0.22],
        0.012,
        steel,
      );
    }
    for (const side of [-0.072, 0.072]) {
      const disc = mesh(root, new T.CylinderGeometry(0.125, 0.125, 0.012, 24), metal, side, 0.35, z);
      disc.rotation.z = Math.PI / 2;
    }
  }
  for (const side of [-0.115, 0.115]) {
    strut(root, [side, 0.35, 0.75], [side, 0.99, 0.42], 0.028, steel);
    strut(root, [side, 0.38, -0.73], [side, 0.51, 0.05], 0.032, ink);
    strut(root, [side, 0.45, -0.62], [side, 0.79, -0.4], 0.037, steel);
    strut(root, [side, 0.46, 0.04], [side, 0.87, 0.29], 0.033, body);
    strut(root, [side, 0.87, 0.29], [side, 0.78, -0.46], 0.033, body);
  }
  oval(root, [0.228, 0.18, 0.324], [0, 0.72, -0.05], ink);
  for (let i = 0; i < 5; i++)
    block(root, [0.39, 0.019, 0.32], [0, 0.48 + i * 0.045, 0.025], i % 2 ? steel : '#536873', 0.008);
  const tank = oval(root, [0.245, 0.166, 0.34], [0, 0.9, 0.16], body);
  tank.rotation.x = 0.11;
  oval(root, [0.19, 0.071, 0.37], [0, 0.88, -0.36], rubber);
  const tail = block(root, [0.28, 0.13, 0.4], [0, 0.86, -0.68], body);
  tail.rotation.x = 0.13;
  block(root, [0.2, 0.047, 0.024], [0, 0.9, -0.885], '#ff8d67', 0.009);
  oval(root, [0.15, 0.115, 0.14], [0, 0.96, 0.54], ink);
  oval(root, [0.102, 0.072, 0.022], [0, 0.97, 0.675], '#ffe2a2');
  strut(root, [-0.31, 1, 0.43], [0.31, 1, 0.43], 0.02, steel);
  for (const s of [-1, 1]) {
    strut(root, [s * 0.28, 1.02, 0.45], [s * 0.35, 1.17, 0.45], 0.01, steel);
    oval(root, [0.062, 0.038, 0.027], [s * 0.36, 1.18, 0.45], ink);
  }
  strut(root, [0.19, 0.4, 0.22], [0.23, 0.37, -0.45], 0.039, steel);
  strut(root, [0.23, 0.37, -0.45], [0.24, 0.49, -0.82], 0.07, steel);
  return root;
}

const up = vector(0, 1, 0),
  pa = new T.Vector3(),
  pb = new T.Vector3(),
  dir = new T.Vector3();
function moveBone(bone, a, b) {
  pa.set(...a);
  pb.set(...b);
  dir.subVectors(pb, pa);
  bone.scale.y = dir.length();
  bone.position.copy(pa).lerp(pb, 0.5);
  bone.quaternion.setFromUnitVectors(up, dir.normalize());
}
function bone(group, bottom, top, color) {
  return mesh(group, new T.CylinderGeometry(top, bottom, 1, 14), surface(color));
}
function moveTo(obj, position) {
  obj.position.set(...position);
}

export function person(helmet = false) {
  const root = new T.Group(),
    upper = new T.Group(),
    head = new T.Group();
  root.add(upper);
  upper.add(head);
  const skin = '#a97557',
    coat = helmet ? '#27777d' : '#3c7e83',
    trousers = '#283f50';
  shell(
    upper,
    [
      [0.01, 0.145, 0.105],
      [0.12, 0.164, 0.118],
      [0.32, 0.202, 0.124],
      [0.43, 0.203, 0.105],
      [0.47, 0.088, 0.09],
    ],
    coat,
  );
  shell(
    upper,
    [
      [0.035, 0.154, 0.11],
      [0.069, 0.161, 0.115],
    ],
    ink,
  );
  const chestStripe = block(upper, [0.33, 0.023, 0.023], [0, 0.32, 0.114], '#c6d8ce', 0.007);
  chestStripe.rotation.z = -0.06;
  strut(upper, [-0.147, 0.435, 0.075], [0.007, 0.12, 0.132], 0.023, '#27383c');
  strut(upper, [0.145, 0.435, 0.075], [0.018, 0.12, 0.132], 0.019, '#2d4048');
  block(upper, [0.093, 0.098, 0.038], [0.054, 0.273, 0.143], '#183f42', 0.009);
  block(upper, [0.056, 0.035, 0.012], [0.054, 0.29, 0.169], '#78d9cf', 0.004);
  block(upper, [0.039, 0.023, 0.014], [0.054, 0.252, 0.168], steel, 0.003);
  const badge = new T.Object3D();
  badge.position.set(0.054, 0.277, 0.17);
  upper.add(badge);
  strut(upper, [0, 0.42, 0], [0, 0.513, 0.006], 0.064, skin);
  head.position.y = 0.52;
  if (helmet) {
    oval(head, [0.127, 0.151, 0.133], [0, 0.078, 0.009], '#d2ded9');
    const visor = oval(head, [0.121, 0.063, 0.047], [0, 0.085, 0.113], '#152a34');
    visor.rotation.x = 0.06;
    block(head, [0.155, 0.036, 0.031], [0, 0.012, 0.118], ink, 0.012);
  } else {
    shell(
      head,
      [
        [-0.039, 0.053, 0.072, 0.033],
        [-0.009, 0.085, 0.088, 0.022],
        [0.061, 0.104, 0.102, 0.01],
        [0.137, 0.105, 0.102],
        [0.19, 0.075, 0.074],
      ],
      skin,
    );
    oval(head, [0.108, 0.068, 0.108], [0, 0.149, -0.002], '#302a27');
    oval(head, [0.104, 0.082, 0.062], [0, 0.095, -0.061], '#302a27');
    oval(head, [0.021, 0.03, 0.022], [0, 0.063, 0.111], skin);
    for (const s of [-1, 1]) {
      oval(head, [0.017, 0.032, 0.021], [s * 0.103, 0.065, 0], skin);
      block(head, [0.028, 0.005, 0.008], [s * 0.046, 0.092, 0.097], '#302824', 0.002);
    }
  }
  const phone = new T.Group();
  root.add(phone);
  block(phone, [0.087, 0.164, 0.014], [0, 0, 0], '#0e1d25', 0.007);
  const display = block(phone, [0.075, 0.145, 0.007], [0, 0, 0.01], '#376571', 0.005);
  const screenMark = block(phone, [0.048, 0.036, 0.003], [0, 0.029, 0.015], '#7af0df', 0.003);
  for (let i = 0; i < 3; i++)
    block(phone, [0.05 - i * 0.008, 0.006, 0.003], [0, -0.009 - i * 0.018, 0.015], '#c3e2e1', 0.002);
  const legs = [],
    arms = [];
  for (const s of [-1, 1]) {
    const shoe = block(root, [0.124, 0.114, 0.239], [s * 0.1, 0.07, 0], '#233039', 0.038);
    legs.push({
      s,
      thigh: bone(root, 0.097, 0.084, trousers),
      shin: bone(root, 0.08, 0.055, trousers),
      knee: oval(root, [0.081, 0.081, 0.081], [0, 0, 0], trousers),
      shoe,
    });
    arms.push({
      s,
      arm: bone(root, 0.073, 0.056, coat),
      lower: bone(root, 0.054, 0.038, coat),
      shoulder: oval(root, [0.078, 0.078, 0.078], [0, 0, 0], coat),
      hand: oval(root, [0.042, 0.057, 0.035], [0, 0, 0], helmet ? ink : skin),
    });
  }
  function pose(mode, phase = 0) {
    const seated = mode === 'ride',
      usingPhone = mode === 'pair',
      striding = mode === 'walk';
    const lift = striding ? 0.022 * Math.abs(Math.cos(phase)) : 0;
    const waist = seated ? 0.916 : 0.9 + lift;
    upper.position.set(0, waist, 0);
    upper.rotation.x = seated ? 0.24 : usingPhone ? 0.05 : 0;
    head.rotation.x = usingPhone ? 0.28 : seated ? -0.1 : 0.015;
    for (const leg of legs) {
      const s = leg.s,
        swing = striding ? Math.sin(phase) * s : 0;
      const hip = [s * 0.09, waist + 0.034, -0.005];
      const knee = seated
        ? [s * 0.17, 0.67, 0.37]
        : [s * 0.106, 0.48 + Math.max(0, swing) * 0.04, 0.035 + swing * 0.17];
      const ankle = seated
        ? [s * 0.195, 0.46, 0.12]
        : [s * 0.112, 0.11 + Math.max(0, swing) * 0.085, swing * 0.3 - 0.015];
      moveBone(leg.thigh, hip, knee);
      moveBone(leg.shin, knee, ankle);
      moveTo(leg.knee, knee);
      moveTo(leg.shoe, [ankle[0], ankle[1] - 0.036, ankle[2] + 0.052]);
      leg.shoe.rotation.x = seated ? -0.14 : -0.12 * swing;
    }
    const raise = T.MathUtils.smoothstep(phase, 0, 0.85),
      tap = T.MathUtils.smoothstep(phase, 0.5, 1.05) * (1 - T.MathUtils.smoothstep(phase, 1.18, 1.64));
    const rightHand = [0.18, waist + 0.13 + 0.19 * raise, 0.24 + 0.1 * raise],
      gaze = 0.025 * Math.sin(phase);
    for (const arm of arms) {
      const s = arm.s,
        swing = striding ? Math.sin(phase) * s : 0;
      const shoulder = [s * 0.202, waist + 0.394, seated ? 0.108 : 0.028];
      const elbow = seated
        ? [s * 0.275, waist + 0.18, 0.31]
        : usingPhone
          ? [s * 0.217, waist + 0.13, 0.075]
          : [s * 0.232, waist + 0.149, 0.012 - swing * 0.077];
      const hand = seated
        ? [s * 0.295, waist + 0.105, 0.48]
        : usingPhone
          ? s === 1
            ? rightHand
            : [
                -0.09 + 0.2 * tap,
                waist + 0.17 + 0.09 * raise + 0.065 * tap + gaze * 0.35,
                0.22 + 0.065 * raise + 0.045 * tap,
              ]
          : [s * 0.225, waist - 0.075, 0.044 - swing * 0.121];
      moveBone(arm.arm, shoulder, elbow);
      moveBone(arm.lower, elbow, hand);
      moveTo(arm.shoulder, shoulder);
      moveTo(arm.hand, hand);
    }
    phone.visible = usingPhone;
    phone.position.set(rightHand[0] - 0.035, rightHand[1] + 0.035, rightHand[2] + 0.018);
    // The screen faces the wearer and remains visible from the camera over their shoulder.
    phone.rotation.set(-0.44, Math.PI - 0.45, -0.09);
    screenMark.material.color.set(phase > 0.5 ? '#8af7e4' : '#e5bb7e');
    display.material.roughness = 0.38;
  }
  pose(helmet ? 'ride' : 'walk');
  return { root, pose, badge, phone };
}
