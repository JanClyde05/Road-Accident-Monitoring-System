import * as THREE from 'three';
import { alertPosition, receiverPosition } from './terrain.js';
import { relayDevices } from './relay-devices.js';

const rgb = (r, g, b) => new THREE.Color().setRGB(r, g, b);

function makeMast() {
  const mast = new THREE.Group();
  mast.position.copy(receiverPosition);
  const struts = [],
    stays = [];
  const towerPoint = (corner, level) => {
    const angle = (Math.PI * 2 * corner) / 3 + 0.3;
    const radius = 1.1 - level * 0.21;
    return [Math.cos(angle) * radius, level * 2, Math.sin(angle) * radius];
  };
  for (let corner = 0; corner < 3; corner++) {
    for (let tier = 0; tier < 4; tier++) {
      const bottom = towerPoint(corner, tier),
        next = towerPoint(corner + 1, tier);
      struts.push(
        ...bottom,
        ...towerPoint(corner, tier + 1),
        ...bottom,
        ...next,
        ...next,
        ...towerPoint(corner, tier + 1),
      );
    }
    const angle = (corner * Math.PI * 2) / 3 + 0.56;
    stays.push(0, 6.2, 0, 3.55 * Math.cos(angle), 0, 3.55 * Math.sin(angle));
  }
  struts.push(0, 8, 0, 0, 11.4, 0, -0.88, 8.15, 0, 0.88, 8.15, 0);
  const lines = (positions, color, opacity) =>
    new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
      ),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
    );
  const lattice = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(1, 1, 1, 5),
    new THREE.MeshBasicMaterial({ color: rgb(0.46, 0.74, 0.73) }),
    struts.length / 6,
  );
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    up = new THREE.Vector3(0, 1, 0),
    beam = new THREE.Object3D();
  for (let i = 0; i < struts.length; i += 6) {
    a.fromArray(struts, i);
    b.fromArray(struts, i + 3);
    beam.position.copy(a).lerp(b, 0.5);
    const length = b.sub(a).length();
    beam.quaternion.setFromUnitVectors(up, b.normalize());
    beam.scale.set(0.065, length, 0.065);
    beam.updateMatrix();
    lattice.setMatrixAt(i / 6, beam.matrix);
  }
  const cables = lines(stays, rgb(0.39, 0.68, 0.64), 0.55);
  // Draw the tower's fine linework after the translucent terrain surface.
  lattice.renderOrder = cables.renderOrder = 12;
  mast.add(lattice, cables);
  const cabinet = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 1.85, 0.82),
    new THREE.MeshBasicMaterial({ color: rgb(0.27, 0.46, 0.46) }),
  );
  cabinet.position.set(0.63, 1.66, 0.35);
  mast.add(cabinet);
  const light = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.53),
    new THREE.MeshBasicMaterial({ color: rgb(0.58, 0.97, 0.94) }),
  );
  light.position.y = 11.4;
  mast.add(light);
  const footing = new THREE.Mesh(
    new THREE.RingGeometry(2.23, 2.42, 64),
    new THREE.MeshBasicMaterial({
      color: rgb(0.32, 0.9, 0.88),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
  );
  footing.rotation.x = -Math.PI / 2;
  footing.position.y = 0.38;
  mast.add(footing);
  return mast;
}

export function makeRelay() {
  const root = new THREE.Group();
  const devices = relayDevices();
  devices.phone.position.copy(alertPosition).add(new THREE.Vector3(-6.6, 6.1, 0.7));
  devices.wearable.position.copy(alertPosition).add(new THREE.Vector3(3.2, 5.3, -0.4));
  devices.desk.position.copy(receiverPosition).add(new THREE.Vector3(7.4, 6.4, 4.2));
  const from = devices.wearable.position.clone().add(new THREE.Vector3(2.4, 0.8, 0));
  const to = receiverPosition.clone().add(new THREE.Vector3(0, 11.4, 0));
  const crest = from.clone().lerp(to, 0.53);
  crest.y = Math.max(from.y, to.y) + 15;
  const route = new THREE.QuadraticBezierCurve3(from, crest, to);
  const stage = { value: 0 },
    progress = { value: 0.15 };
  const strand = (radius, glow) =>
    new THREE.Mesh(
      new THREE.TubeGeometry(route, 88, radius, 8, false),
      new THREE.ShaderMaterial({
        uniforms: { stage, progress, glow: { value: glow } },
        transparent: true,
        depthWrite: false,
        vertexShader: `
        varying float along;
        void main() { along = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
        fragmentShader: `
        varying float along; uniform float stage, progress, glow;
        void main() {
          vec3 tint = mix(vec3(1.0, 0.63, 0.19), vec3(0.29, 0.92, 0.92), smoothstep(0.20, 0.73, along));
          float dash = smoothstep(0.18, 0.36, fract(along * 22.0));
          float opacity = (0.05 + dash * 0.32) * (0.65 + stage * 0.15);
          if (stage > 1.5) opacity = 0.51 + 0.41 * (1.0 - smoothstep(progress, progress + 0.025, along));
          if (stage > 2.5) opacity = 0.94;
          gl_FragColor = vec4(tint, opacity * glow);
        }
      `,
      }),
    );
  const packet = new THREE.Group();
  packet.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 12, 8),
      new THREE.MeshBasicMaterial({ color: rgb(1, 0.98, 0.8) }),
    ),
  );
  packet.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 16, 8),
      new THREE.MeshBasicMaterial({
        color: rgb(0.85, 0.98, 0.86),
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    ),
  );
  const glow = strand(0.52, 0.16),
    core = strand(0.15, 1);
  glow.renderOrder = 9;
  core.renderOrder = 10;
  packet.renderOrder = 11;
  const localPath = (start, end, rise) => {
    const middle = start.clone().lerp(end, 0.5);
    middle.y += rise;
    return new THREE.QuadraticBezierCurve3(start, middle, end);
  };
  const blePath = localPath(
    devices.phone.position.clone().add(new THREE.Vector3(1.8, 0, 0.1)),
    devices.wearable.position.clone().add(new THREE.Vector3(-2.2, 0, 0.4)),
    1.5,
  );
  const usbPath = localPath(
    receiverPosition.clone().add(new THREE.Vector3(0.7, 1.25, 0.75)),
    devices.desk.position.clone().add(new THREE.Vector3(-3.4, -1.7, 0)),
    -1.7,
  );
  const shortLink = (path, color) =>
    new THREE.Mesh(
      new THREE.TubeGeometry(path, 24, 0.105, 5, false),
      new THREE.MeshBasicMaterial({ color }),
    );
  const ble = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(blePath.getPoints(56)),
    new THREE.LineDashedMaterial({ color: rgb(0.41, 0.94, 0.83), dashSize: 0.43, gapSize: 0.23 }),
  );
  ble.computeLineDistances();
  ble.renderOrder = 12;
  const usb = shortLink(usbPath, 0xdeab76);
  const light = new THREE.DirectionalLight(0xffdfad, 2.9);
  light.position.set(-24, 57, 43);
  const ambient = new THREE.HemisphereLight(0xcfe8eb, 0x33434d, 1.85);
  const mast = makeMast();
  root.add(
    mast,
    glow,
    core,
    packet,
    ble,
    usb,
    devices.phone,
    devices.wearable,
    devices.desk,
    light,
    ambient,
  );
  const wideTarget = from.clone().lerp(to, 0.51);
  wideTarget.y += 4;
  const mastTarget = receiverPosition.clone().add(new THREE.Vector3(0, 6.3, 0));
  const closePhone = devices.phone.position.clone().add(new THREE.Vector3(1.7, 0, 0));
  const closeBoard = devices.wearable.position.clone().add(new THREE.Vector3(-1.55, 0, 0));
  const closeDesk = devices.desk.position.clone().add(new THREE.Vector3(-1.55, -0.35, 0));
  const shot = { focus: new THREE.Vector3(), span: 16, azimuth: -0.4, elevation: 0.32, settled: false };
  const smooth = THREE.MathUtils.smoothstep;
  let entered = 0;
  return {
    root,
    setStep(value, time) {
      entered = time;
      stage.value = value;
      glow.visible = core.visible = value === 2;
      ble.visible = value === 1;
      usb.visible = value === 3;
    },
    update(time, immediate) {
      const t = immediate ? 12 : Math.max(0, time - entered);
      const step = stage.value;
      const fraction = step === 2 ? smooth(t, 0.75, 2.9) : smooth(t, 0.28, 1.45);
      shot.settled = t > (step === 2 ? 4.9 : 3.1);
      packet.visible = step > 0 && fraction > 0 && fraction < 1;
      packet.scale.setScalar(step === 2 ? 1 : 0.47);
      devices.wearableLed.scale.setScalar(
        0.14 + (step === 1 ? 0.15 * Math.sin(Math.PI * fraction) : 0),
      );
      if (step === 0) {
        shot.focus.copy(closePhone);
        shot.span = 15.6;
        shot.azimuth = -0.32;
        shot.elevation = 0.28;
      } else if (step === 1) {
        blePath.getPoint(fraction, packet.position);
        shot.focus.copy(closeBoard);
        shot.span = 14.4;
        shot.azimuth = -0.36;
        shot.elevation = 0.43;
      } else if (step === 2) {
        route.getPointAt(fraction, packet.position);
        progress.value = fraction;
        const arrival = smooth(t, 2.18, 3.65);
        shot.focus.copy(wideTarget).lerp(mastTarget, arrival);
        shot.span = THREE.MathUtils.lerp(43, 24, arrival);
        shot.azimuth = THREE.MathUtils.lerp(-0.66, -0.42, arrival);
        shot.elevation = THREE.MathUtils.lerp(0.48, 0.37, arrival);
      } else {
        usbPath.getPoint(fraction, packet.position);
        shot.focus.copy(closeDesk);
        shot.span = 15.6;
        shot.azimuth = -0.33;
        shot.elevation = 0.31;
      }
      if (step !== 2) shot.span += 2.6 * (1 - smooth(t, 0.2, 1.45));
      return shot;
    },
    dispose() {
      devices.textures.forEach((texture) => texture.dispose());
    },
  };
}
