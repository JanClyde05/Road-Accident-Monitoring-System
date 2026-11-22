import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// The models are enlarged wayfinding symbols. Exact carrier geometry is in the PCB exhibit.
export function relayDevices() {
  const metal = new THREE.MeshStandardMaterial({ color: 0x78969e, metalness: 0.55, roughness: 0.33 });
  const black = new THREE.MeshStandardMaterial({ color: 0x35505b, roughness: 0.48 });
  const board = new THREE.MeshStandardMaterial({ color: 0x277168, roughness: 0.52 });
  const gold = new THREE.MeshBasicMaterial({ color: 0xefb968 });
  const cyan = new THREE.MeshBasicMaterial({ color: 0x73e5d8 });
  const sphere = new THREE.SphereGeometry(1, 12, 8);
  function part(parent, material, position, size, radius = 0) {
    const geometry = radius
      ? new RoundedBoxGeometry(...size, 2, radius)
      : new THREE.BoxGeometry(...size);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    parent.add(object);
    return object;
  }
  function led(parent, x, y, z) {
    const object = new THREE.Mesh(sphere, cyan);
    object.position.set(x, y, z);
    object.scale.setScalar(0.14);
    parent.add(object);
    return object;
  }
  function screen(parent, kind, width, height, depth) {
    const screen = document.createElement('canvas');
    screen.width = kind === 'phone' ? 304 : 560;
    screen.height = kind === 'phone' ? 520 : 306;
    const ctx = screen.getContext('2d');
    const w = screen.width,
      h = screen.height;
    ctx.fillStyle = '#0d202a';
    ctx.fillRect(0, 0, w, h);
    const label = (value, x, y, size = 19, color = '#c0e7e9') => {
      ctx.fillStyle = color;
      ctx.font = '600 ' + size + 'px sans-serif';
      ctx.fillText(value, x, y);
    };
    ctx.fillStyle = '#153942';
    ctx.fillRect(0, 0, w, 52);
    label('RAMS', 18, 34, 25);
    label(kind === 'phone' ? 'MOTION' : 'RECEIVER STATION', kind === 'phone' ? 157 : 297, 33, 16);
    ctx.strokeStyle = '#25414b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 56);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 58; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    if (kind === 'phone') {
      label('Motion window', 19, 100, 24);
      ctx.strokeStyle = '#86ecdc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const samples = [0, 1, 0, 2, 1, 3, 2, 5, 8, 0, 19, 80, -18, 9, 23, 6, 4, 2, 0, 3, 0, 1, 0, 0, 1];
      samples.forEach((v, i) => {
        const x = 15 + (i * (w - 30)) / (samples.length - 1),
          y = 231 - v * 1.15;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      label('Location', 19, 335, 22);
      label('Phone fix', 19, 374, 28, '#8de6db');
      ctx.fillStyle = '#eebd78';
      ctx.fillRect(19, 427, 5, 49);
      label('Event detected', 35, 462, 26, '#ffe0aa');
    } else {
      ctx.strokeStyle = '#437274';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 238);
      ctx.bezierCurveTo(84, 238, 94, 85, 176, 143);
      ctx.bezierCurveTo(242, 175, 261, 108, 330, 96);
      ctx.stroke();
      ctx.fillStyle = '#f3bd74';
      ctx.beginPath();
      ctx.arc(176, 143, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f3bd74';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(176, 143, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#152c34';
      ctx.fillRect(350, 56, 210, 252);
      label('Incident', 369, 113, 26);
      label('Alert received', 369, 151, 20, '#f3bd74');
      label('USB serial', 369, 201, 19);
      label('LORA_ALERT', 369, 231, 17, '#88d7cc');
    }
    const texture = new THREE.CanvasTexture(screen);
    // The survey renderer presents in linear display space. Preserve the drawn UI colors.
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    display.position.z = depth;
    parent.add(display);
    return texture;
  }
  const phone = new THREE.Group();
  part(phone, metal, [0, 0, 0], [4.25, 7.8, 0.48], 0.22);
  part(phone, black, [0, 0, 0.22], [4.14, 7.67, 0.19], 0.09);
  const phoneScreen = screen(phone, 'phone', 3.78, 6.72, 0.33);
  part(phone, metal, [0, 3.58, 0.328], [0.8, 0.07, 0.03], 0.015);
  part(phone, metal, [2.14, 1.52, 0], [0.09, 1.0, 0.2], 0.03);
  phone.rotation.set(-0.11, -0.42, -0.035);

  const wearable = new THREE.Group();
  part(wearable, board, [0, 0, 0], [5.6, 4.47, 0.29], 0.14);
  part(wearable, black, [-1.38, 0.23, 0.26], [1.95, 3.14, 0.29], 0.12);
  part(wearable, metal, [-1.38, 1.88, 0.48], [1.12, 0.63, 0.55], 0.12);
  part(wearable, black, [-1.38, 2.0, 0.65], [0.67, 0.29, 0.12], 0.04);
  part(wearable, metal, [1.16, 0.4, 0.37], [1.9, 2.17, 0.55], 0.15);
  part(wearable, gold, [2.59, 0.68, 0.13], [0.41, 0.43, 0.43], 0.09);
  const silk = new THREE.MeshBasicMaterial({ color: 0xa4c9bc });
  for (const y of [-0.7, -1.04, -1.38]) part(wearable, silk, [0.89, y, 0.17], [1.04, 0.048, 0.035]);
  const buzzer = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.35, 20), black);
  buzzer.position.set(1.9, -1.58, 0.33);
  buzzer.rotation.x = Math.PI / 2;
  wearable.add(buzzer);
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 16),
    new THREE.MeshBasicMaterial({ color: 0x102226 }),
  );
  hole.position.set(1.9, -1.58, 0.52);
  wearable.add(hole);
  part(wearable, black, [-1.34, 0.22, 0.46], [0.83, 0.82, 0.15], 0.045);
  const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.15, 0.12), gold, 28);
  const pin = new THREE.Matrix4();
  let index = 0;
  for (const x of [-2.39, -0.32, 0.13, 2.22]) {
    for (let j = 0; j < 7; j++)
      pads.setMatrixAt(index++, pin.makeTranslation(x, 1.19 - 0.39 * j, 0.23));
  }
  wearable.add(pads);
  const wearableLed = led(wearable, -1.33, -1.49, 0.38);
  wearable.rotation.set(-0.53, -0.28, -0.08);

  const desk = new THREE.Group();
  part(desk, black, [0, 0, 0], [9.12, 5.63, 0.39], 0.16);
  part(desk, metal, [0, -3.04, -0.05], [0.67, 1.06, 0.5], 0.08);
  part(desk, metal, [0, -3.63, 0.25], [3.22, 0.22, 1.69], 0.08);
  const deskScreen = screen(desk, 'desk', 8.55, 4.83, 0.205);
  led(desk, 3.77, -2.57, 0.24);
  desk.rotation.y = -0.28;
  return { phone, wearable, desk, wearableLed, textures: [phoneScreen, deskScreen] };
}
