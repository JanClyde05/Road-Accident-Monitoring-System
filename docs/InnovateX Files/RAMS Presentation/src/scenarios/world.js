import * as T from 'three';
import { automobile, motorcycle, person, mesh, surface } from './actors.js';
import { backdrop, pavement, lamps } from './landscape.js';
import { contactScan } from './contact.js';

const lerp = T.MathUtils.lerp;
const step = (t, a, b) => T.MathUtils.smoothstep(t, a, b);
const clamp = (x) => Math.min(1, Math.max(0, x));
function approach(t, contact, rest, start, impact, end) {
  if (t < contact) return lerp(start, impact, t / contact);
  const r = clamp((t - contact) / (rest - contact));
  return lerp(impact, end, 1 - (1 - r) ** 2);
}
function box(root, x, y, z, w, h, d, material) {
  return mesh(root, new T.BoxGeometry(w, h, d), material, x, y, z);
}
function circuit(scene) {
  const setting = new T.Group();
  scene.add(setting);
  const asphalt = pavement(),
    curb = surface('#657278'),
    grass = surface('#203d3e');
  const marking = surface('#afc1c1'),
    amber = surface('#e4ae61');
  box(setting, 0, -0.24, 0, 53, 0.28, 35, grass);
  box(setting, 0, -0.069, 0, 54, 0.13, 8.5, asphalt);
  box(setting, 0, -0.073, 0, 6.5, 0.13, 35, asphalt);
  for (let s of [-1, 1]) {
    for (let k of [-1, 1]) {
      box(setting, k * 15.25, -0.007, s * 4.15, 23.5, 0.023, 0.052, marking);
      box(setting, k * 15.25, 0.047, s * 4.6, 23.5, 0.14, 0.72, curb);
    }
    for (let i = -5; i <= 5; i++)
      if (i < -1 || i > 1) box(setting, i * 4.35, 0.013, s * 0.059, 2.3, 0.018, 0.043, amber);
  }
  const crossing = new T.Group();
  setting.add(crossing);
  for (let j = -4; j <= 4; j++) box(crossing, 0, 0.02, j * 0.87, 2.05, 0.012, 0.36, marking);
  const linePts = [];
  for (let i = 0; i < 1500; i++) {
    const rnd = (q) => {
      const r = Math.sin(i * 391.21 + q * 71.2) * 12719.3;
      return r - Math.floor(r);
    };
    const x = (rnd(1) - 0.5) * 48,
      z = (rnd(2) - 0.5) * 21;
    if (Math.abs(z) > 4.96 && Math.abs(x) > 3.4) linePts.push(x, -0.08, z);
  }
  const g = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(linePts, 3));
  setting.add(
    new T.Points(
      g,
      new T.PointsMaterial({
        color: '#76aaa8',
        size: 0.047,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    ),
  );
  const post = surface('#6d868a'),
    reflector = surface('#ffcc8a'),
    dark = surface('#40595d');
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    for (let s of [-1, 1]) {
      const x = i * 6;
      box(setting, x, 0.37, s * 5.13, 0.09, 0.85, 0.1, post);
      box(setting, x, 0.69, s * 5.13, 0.105, 0.11, 0.112, reflector);
    }
  }
  for (const x of [-9, 8]) {
    box(setting, x, 1.97, -5.2, 0.078, 4, 0.085, dark);
    box(setting, x, 3.92, -4.78, 0.09, 0.09, 0.93, post);
    box(setting, x, 3.88, -4.28, 0.28, 0.085, 0.52, reflector);
  }
  backdrop(setting);
  return crossing;
}

export function createWorld(holder, onAnchor) {
  const scene = new T.Scene();
  scene.background = new T.Color('#0e2029');
  scene.fog = new T.FogExp2('#233c49', 0.025);
  const camera = new T.PerspectiveCamera(34, 1, 0.035, 115);
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.55));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  holder.prepend(renderer.domElement);
  const hemi = new T.HemisphereLight('#b7ddeb', '#28333d', 1.02);
  scene.add(hemi);
  const key = new T.DirectionalLight('#ffdcab', 2.65);
  key.position.set(-7, 7, 3);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -13, right: 13, top: 10, bottom: -10, near: 0.1, far: 35 });
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.00045;
  key.shadow.normalBias = 0.012;
  scene.add(key);
  const edge = new T.DirectionalLight('#79e1e6', 3.0);
  edge.position.set(3, 3, -8);
  scene.add(edge);
  const crossing = circuit(scene),
    sedan = automobile('sedan'),
    suv = automobile('suv'),
    bike = motorcycle(),
    rider = person(true),
    walker = person(false);
  const glowTextures = lamps(scene, [sedan, suv], bike);
  const riderRig = new T.Group();
  riderRig.add(bike);
  scene.add(sedan, suv, riderRig, rider.root, walker.root);
  // Restrict the grazing light to the subjects. The road and trees stay in the dusk palette.
  for (const subject of [sedan, suv, bike, rider.root, walker.root])
    subject.traverse((node) => {
      if (!node.material?.isMeshStandardMaterial) return;
      node.material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <opaque_fragment>',
          `
        float grazing=pow(1.-clamp(dot(normalize(normal),normalize(vViewPosition)),0.,1.),3.);
        outgoingLight+=vec3(.024,.098,.114)*grazing;
        #include <opaque_fragment>
      `,
        );
      };
    });
  const actors = { car: sedan, motorcycle: rider.root, pedestrian: walker.root },
    scans = new Map();
  const wear = new T.Vector3(),
    phone = new T.Vector3(),
    mid = new T.Vector3();
  const bleGeometry = new T.BufferGeometry().setAttribute(
    'position',
    new T.Float32BufferAttribute(new Float32Array(3 * 41), 3),
  );
  const bleLine = new T.Line(
    bleGeometry,
    new T.LineBasicMaterial({ color: '#77eee6', transparent: true, opacity: 0.93 }),
  );
  const bead = mesh(
    scene,
    new T.SphereGeometry(0.016, 10, 7),
    new T.MeshBasicMaterial({ color: '#e1fbf3' }),
  );
  scene.add(bleLine);
  bleLine.frustumCulled = false;
  bead.castShadow = false;
  const cam = new T.Vector3(),
    target = new T.Vector3(),
    projected = new T.Vector3();
  let film = 'pairing',
    lastT = 0;
  function frame(id, t) {
    film = id;
    lastT = t;
    const pair = id === 'pairing',
      car = id === 'car',
      moto = id === 'motorcycle',
      ped = id === 'pedestrian';
    sedan.visible = car || ped;
    suv.visible = car;
    riderRig.visible = moto || pair;
    rider.root.visible = moto;
    walker.root.visible = ped || pair;
    crossing.visible = ped;
    bleLine.visible = bead.visible = pair && t >= 0.31;
    let mark = null;
    if (pair) {
      walker.root.position.set(5.42, 0.118, 4.58);
      walker.root.rotation.set(0, -0.43, 0);
      walker.pose('pair', t * 2.5);
      riderRig.position.set(3.48, 0.035, 3.56);
      riderRig.rotation.set(0, Math.PI / 2 + 0.13, 0.09, 'YXZ');
      walker.root.updateMatrixWorld(true);
      walker.badge.getWorldPosition(wear);
      walker.phone.getWorldPosition(phone);
      mid.copy(wear).lerp(phone, 0.5);
      mid.y += 0.1;
      const curve = new T.QuadraticBezierCurve3(phone, mid, wear),
        attr = bleGeometry.attributes.position;
      for (let i = 0; i <= 40; i++) {
        curve.getPoint(i / 40, projected);
        attr.setXYZ(i, projected.x, projected.y, projected.z);
      }
      attr.needsUpdate = true;
      bleGeometry.setDrawRange(0, Math.floor(41 * step(t, 0.31, 0.5)));
      curve.getPoint((Math.max(0, t - 0.31) * 3.1) % 1, bead.position);
      const zoom = step(t, 0.12, 0.67);
      target.set(
        5.42 + lerp(0, 0.02, zoom),
        0.118 + lerp(1.02, 1.25, zoom),
        4.58 + lerp(0.06, 0.15, zoom),
      );
      const az = lerp(0.26, 1.28, step(t, 0.05, 0.72));
      const distance = lerp(3.09, 1.38, zoom);
      cam.set(
        target.x + Math.sin(az) * distance,
        target.y + lerp(0.39, 0.39, zoom),
        target.z + Math.cos(az) * distance,
      );
      mark = t < 0.35 ? phone : wear;
    } else if (moto) {
      const x = approach(t, 0.52, 0.83, -6, -0.28, 2.4),
        fall = step(t, 0.48, 0.72);
      riderRig.position.set(x, 0.035 + 0.17 * fall, 1.5 - 0.51 * fall);
      riderRig.rotation.set(0, Math.PI / 2 + 0.27 * fall, 1.29 * fall, 'YXZ');
      const separate = step(t, 0.58, 0.83);
      rider.pose('ride');
      rider.root.position.set(x + 0.94 * separate, 0.035 + 0.115 * fall, 1.5 + 0.44 * separate);
      rider.root.rotation.set(
        0.04 + 0.15 * separate,
        Math.PI / 2 + 0.33 * fall + 0.35 * separate,
        1.44 * fall,
        'YXZ',
      );
      const close = step(t, 0.17, 0.65);
      target.set(x + 0.15 + 0.41 * separate, 0.89 - 0.39 * fall, 1.4 + 0.35 * fall);
      cam.set(
        target.x + lerp(2.8, 1.9, close),
        lerp(1.8, 2.37, close),
        target.z + lerp(4.97, 4.55, close),
      );
    } else if (car) {
      const x = approach(t, 0.52, 0.7, -9, -2.57, -1.93);
      const z = approach(t, 0.52, 0.74, -7, -0.21, 0.72);
      sedan.position.set(x, 0.012, 1.54 + 0.25 * step(t, 0.53, 0.72));
      sedan.rotation.set(0, Math.PI / 2 - 0.14 * step(t, 0.53, 0.73), 0);
      suv.position.set(0.39 + 1.13 * step(t, 0.52, 0.74), 0.012, z);
      suv.rotation.set(0, 0.24 * step(t, 0.52, 0.75), 0);
      target.set(lerp(x, -0.35, 0.5), 0.58, lerp(z, 1.25, 0.65));
      const pull = step(t, 0.17, 0.67);
      cam.set(
        target.x + lerp(7.1, 4.1, pull),
        lerp(4.65, 3.25, pull),
        target.z + lerp(9.0, 6.55, pull),
      );
    } else {
      const x = approach(t, 0.52, 0.7, -9.2, -2.35, -1.82),
        z = approach(t, 0.52, 0.65, 3.8, 1.42, 1.26);
      sedan.position.set(x, 0.012, 1.42);
      sedan.rotation.set(0, Math.PI / 2, 0);
      walker.root.position.set(
        -0.2 + 1.04 * step(t, 0.52, 0.72),
        0.21 * step(t, 0.52, 0.7),
        z - 0.56 * step(t, 0.52, 0.73),
      );
      walker.root.rotation.set(0, Math.PI - 0.12, 0.99 * step(t, 0.52, 0.73), 'YXZ');
      walker.pose('walk', Math.min(t, 0.5) * 32);
      const pull = step(t, 0.13, 0.59);
      target.set(lerp(x * 0.28, -0.88, pull), 0.72, 1.52);
      cam.set(target.x + lerp(6.3, 3.75, pull), lerp(4.15, 2.7, pull), target.z + lerp(8.1, 6.4, pull));
    }
    const scanning = !pair && t >= 0.5 && t <= 0.76;
    if (scanning && !scans.has(id)) scans.set(id, contactScan(actors[id], car));
    for (const [name, cloud] of scans) {
      cloud.visible = scanning && name === id;
      if (cloud.visible)
        cloud.material.uniforms.front.value = lerp(-0.1, 1.24, clamp((t - 0.5) / 0.26));
    }
    if (camera.aspect < 1.2)
      cam
        .sub(target)
        .multiplyScalar(1.2 / Math.max(0.82, camera.aspect))
        .add(target);
    camera.position.copy(cam);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    if (mark) {
      projected.copy(mark).project(camera);
      onAnchor((projected.x + 1) / 2, (1 - projected.y) / 2, t < 0.35 ? 'Phone' : 'Wearable');
    } else onAnchor(null);
  }
  function resize() {
    const w = Math.max(1, holder.clientWidth),
      h = Math.max(1, holder.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    frame(film, lastT);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(holder);
  resize();
  return {
    frame,
    dispose() {
      observer.disconnect();
      const g = new Set(),
        m = new Set();
      scene.traverse((o) => {
        if (o.geometry) g.add(o.geometry);
        if (o.material) for (const mat of [].concat(o.material)) m.add(mat);
      });
      for (const item of [...g, ...m]) item.dispose();
      for (const texture of glowTextures) texture.dispose();
      key.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
