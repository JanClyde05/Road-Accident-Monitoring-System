import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { loadBoard } from '../board.js';

export function relayDevices() {
  const metal = new THREE.MeshStandardMaterial({ color: 0x5a7682, metalness: 0.82, roughness: 0.28 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1d2931, metalness: 0.88, roughness: 0.22 });
  const matteSlate = new THREE.MeshStandardMaterial({ color: 0x22353f, roughness: 0.45, metalness: 0.35 });
  const black = new THREE.MeshStandardMaterial({ color: 0x141f26, roughness: 0.42 });
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x226b62, roughness: 0.48 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xefb968, metalness: 0.75, roughness: 0.3 });
  const cyan = new THREE.MeshBasicMaterial({ color: 0x73e5d8 });
  const amber = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  const sphere = new THREE.SphereGeometry(1, 14, 10);

  function part(parent, material, position, size, radius = 0) {
    const geometry = radius
      ? new RoundedBoxGeometry(...size, 2, radius)
      : new THREE.BoxGeometry(...size);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    parent.add(object);
    return object;
  }

  function led(parent, x, y, z, colorMat = cyan, scale = 0.14) {
    const object = new THREE.Mesh(sphere, colorMat);
    object.position.set(x, y, z);
    object.scale.setScalar(scale);
    parent.add(object);
    return object;
  }

  function createScreen(kind, width, height, depth, parent) {
    const canvas = document.createElement('canvas');
    canvas.width = kind === 'phone' ? 440 : 880;
    canvas.height = kind === 'phone' ? 760 : 495;
    const ctx = canvas.getContext('2d');
    const w = canvas.width,
      h = canvas.height;

    ctx.fillStyle = '#0a161d';
    ctx.fillRect(0, 0, w, h);

    const label = (value, x, y, size = 18, color = '#c0e7e9', bold = true) => {
      ctx.fillStyle = color;
      ctx.font = (bold ? '600 ' : '400 ') + size + 'px sans-serif';
      ctx.fillText(value, x, y);
    };

    if (kind === 'phone') {
      // Top status bar
      ctx.fillStyle = '#102732';
      ctx.fillRect(0, 0, w, 56);
      label('RAMS · ACTIVE', 20, 36, 20, '#75e6d8');
      label('94% · 5G', w - 100, 36, 17, '#88a8b1', false);

      // Card 1: 50 Hz IMU Accelerometer Trace
      ctx.fillStyle = '#0f2029';
      ctx.beginPath();
      ctx.roundRect(16, 74, w - 32, 290, 12);
      ctx.fill();
      ctx.strokeStyle = '#1d3947';
      ctx.lineWidth = 1;
      ctx.stroke();

      label('50 Hz ACCELEROMETER STREAM', 32, 106, 15, '#7ee4d8');
      label('SVM: 7.2G (CRASH SPIKE)', w - 210, 106, 14, '#ffb84d');

      // Graph Grid
      ctx.strokeStyle = '#17313d';
      ctx.lineWidth = 1;
      for (let x = 32; x < w - 32; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 124);
        ctx.lineTo(x, 340);
        ctx.stroke();
      }
      for (let y = 130; y < 340; y += 42) {
        ctx.beginPath();
        ctx.moveTo(32, y);
        ctx.lineTo(w - 32, y);
        ctx.stroke();
      }

      // Waveform trace
      ctx.strokeStyle = '#5de4d7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const samples = [
        0.98, 1.02, 0.99, 1.01, 0.97, 1.04, 0.99, 1.01, 0.98, 1.05,
        1.12, 1.45, 0.22, 0.18, 7.21, 6.95, 4.12, 1.88, 1.25, 1.05,
        1.01, 0.99, 1.0, 0.99, 1.01,
      ];
      samples.forEach((val, i) => {
        const px = 32 + (i * (w - 64)) / (samples.length - 1);
        const py = 295 - (val / 8.0) * 160;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Card 2: Location and Relay State
      ctx.fillStyle = '#0f2029';
      ctx.beginPath();
      ctx.roundRect(16, 380, w - 32, 180, 12);
      ctx.fill();
      ctx.strokeStyle = '#1d3947';
      ctx.stroke();

      label('GNSS POSITION & BLE RELAY', 32, 412, 15, '#7ee4d8');
      label('17.6542287° N, 121.7445909° E', 32, 446, 20, '#d1f4f0');
      label('Enrile Boulevard · Fix Accuracy: 2.1 m', 32, 474, 15, '#88a8b1', false);

      ctx.fillStyle = '#183c48';
      ctx.beginPath();
      ctx.roundRect(32, 498, 160, 36, 6);
      ctx.fill();
      label('BLE NUS: 247 MTU', 44, 522, 14, '#7ee4d8');

      ctx.fillStyle = '#3a2e1c';
      ctx.beginPath();
      ctx.roundRect(204, 498, 200, 36, 6);
      ctx.fill();
      label('STATUS: BROADCASTING', 214, 522, 14, '#ffb84d');

      // Card 3: Alert Banner
      ctx.fillStyle = '#173642';
      ctx.beginPath();
      ctx.roundRect(16, 576, w - 32, 150, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffb347';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffb84d';
      ctx.fillRect(16, 576, 10, 150);
      label('ACCIDENT EVENT CONFIRMED', 42, 616, 20, '#ffe8ba');
      label('LiteRT 1D-CNN + G-Threshold Triggered', 42, 646, 15, '#d3ba92', false);
      label('Relayed 26-Byte Packet to Wearable LoRa TX', 42, 680, 15, '#7ee4d8');
    } else {
      // STATION MONITOR (Command & Control Console UI)
      ctx.fillStyle = '#0f242e';
      ctx.fillRect(0, 0, w, 58);
      label('RAMS EMERGENCY OPERATIONS CENTER', 24, 38, 22, '#7ee4d8');
      label('STATION-01 · COM3: 115200 8N1 · RSSI: -84 dBm · CRC: OK', w - 460, 38, 15, '#88a8b1', false);

      // Left Panel: Incident Road Network Map
      ctx.fillStyle = '#08171f';
      ctx.beginPath();
      ctx.roundRect(20, 76, 490, 396, 10);
      ctx.fill();
      ctx.strokeStyle = '#183441';
      ctx.lineWidth = 1;
      ctx.stroke();

      label('TOPOLOGICAL INCIDENT MAP', 38, 108, 15, '#7ee4d8');
      label('Tuguegarao City Sector 3', 38, 130, 13, '#6e8f99', false);

      // Roads
      ctx.strokeStyle = '#224656';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(38, 380);
      ctx.bezierCurveTo(150, 380, 190, 220, 310, 240);
      ctx.bezierCurveTo(410, 260, 440, 160, 480, 150);
      ctx.stroke();

      ctx.strokeStyle = '#2c596d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Intersection branch
      ctx.strokeStyle = '#224656';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(250, 430);
      ctx.lineTo(250, 110);
      ctx.stroke();

      // Station Marker
      ctx.fillStyle = '#6fe2d7';
      ctx.beginPath();
      ctx.arc(100, 220, 8, 0, Math.PI * 2);
      ctx.fill();
      label('STATION TOWER', 116, 226, 14, '#6fe2d7');

      // LoRa Transmission Vector (dashed)
      ctx.strokeStyle = '#f3bd74';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(100, 220);
      ctx.lineTo(320, 242);
      ctx.stroke();
      ctx.setLineDash([]);
      label('LoRa 433 MHz (1.42 km)', 170, 218, 13, '#f3bd74');

      // Incident Marker Beacon
      ctx.fillStyle = '#ff5e5e';
      ctx.beginPath();
      ctx.arc(320, 242, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffb347';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(320, 242, 18, 0, Math.PI * 2);
      ctx.stroke();
      label('INCIDENT BEACON', 344, 247, 14, '#ffb347');

      // Right Panel: 26-Byte Payload Inspector
      ctx.fillStyle = '#08171f';
      ctx.beginPath();
      ctx.roundRect(526, 76, 334, 396, 10);
      ctx.fill();
      ctx.strokeStyle = '#183441';
      ctx.stroke();

      label('26-BYTE PAYLOAD INSPECTOR', 544, 108, 15, '#7ee4d8');

      const rows = [
        ['PACKET TYPE', '0x01 (ACCIDENT_ALERT)'],
        ['DEVICE TOKEN', 'DEMO-041 (LINA CRUZ)'],
        ['VEHICLE / ROLE', 'COMMUTER MOTORCYCLE'],
        ['PEAK FORCE', '7.21 G-FORCE (IMPACT)'],
        ['TILT ANGLE', '64.2° DEVIATION'],
        ['COORDINATES', '17.6542287, 121.7445909'],
        ['TIMESTAMP', '14:06:00 UTC+8'],
      ];

      rows.forEach(([k, val], idx) => {
        const ry = 142 + idx * 34;
        ctx.fillStyle = '#10232d';
        ctx.fillRect(544, ry - 18, 298, 28);
        label(k, 552, ry, 12, '#699aa7', false);
        label(val, 660, ry, 13, idx === 3 ? '#ffb84d' : '#cef5f1');
      });

      // Raw Serial Ingestion Stream Box
      ctx.fillStyle = '#0b1b22';
      ctx.fillRect(544, 384, 298, 72);
      label('RAW SERIAL FRAME [USB-CDC]:', 552, 404, 11, '#537d8a', false);
      label('AA 01 29 00 11 0E 00 00 A4 78 ... [CRC:OK]', 552, 426, 12, '#6fe2d7');
      label('DISPATCH: EMERGENCY SERVICES NOTIFIED', 552, 446, 12, '#ffb84d');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    display.position.z = depth;
    parent.add(display);
    return texture;
  }

  // ==========================================
  // 1. SMARTPHONE (Environment-aesthetic design)
  // ==========================================
  const phone = new THREE.Group();
  // Titanium curved outer unibody
  part(phone, darkMetal, [0, 0, 0], [4.15, 8.1, 0.42], 0.38);
  // Rear frosted slate glass panel
  part(phone, matteSlate, [0, 0, -0.21], [3.95, 7.9, 0.04], 0.32);
  // Camera island on back (top-left)
  const camBump = part(phone, darkMetal, [-1.05, 2.75, -0.26], [1.45, 1.85, 0.12], 0.15);
  // Dual camera lenses
  for (const cy of [0.45, -0.45]) {
    const lensRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24),
      metal,
    );
    lensRing.rotation.x = Math.PI / 2;
    lensRing.position.set(0, cy, -0.06);
    camBump.add(lensRing);
    const pupil = new THREE.Mesh(
      new THREE.CircleGeometry(0.24, 20),
      black,
    );
    pupil.position.set(0, cy, -0.11);
    camBump.add(pupil);
  }
  // Side buttons
  part(phone, metal, [2.1, 1.6, 0], [0.08, 0.85, 0.16], 0.03); // Power
  part(phone, metal, [-2.1, 2.1, 0], [0.08, 0.65, 0.16], 0.03); // Vol Up
  part(phone, metal, [-2.1, 1.3, 0], [0.08, 0.65, 0.16], 0.03); // Vol Down
  // Front screen bezel layer
  part(phone, black, [0, 0, 0.2], [3.85, 7.8, 0.04], 0.28);
  // High-res Phone Screen
  const phoneScreen = createScreen('phone', 3.65, 7.42, 0.23, phone);
  // Punch-hole selfie camera
  const punchHole = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), black);
  punchHole.position.set(0, 3.48, 0.235);
  phone.add(punchHole);
  phone.rotation.set(-0.11, -0.42, -0.035);

  // ==========================================
  // 2. WEARABLE (Real Prototype 3D Board Model)
  // ==========================================
  const wearable = new THREE.Group();
  const placeholder = new THREE.Group();
  part(placeholder, boardMat, [0, 0, 0], [5.6, 4.47, 0.29], 0.14);
  part(placeholder, black, [-1.38, 0.23, 0.26], [1.95, 3.14, 0.29], 0.12);
  part(placeholder, metal, [-1.38, 1.88, 0.48], [1.12, 0.63, 0.55], 0.12);
  part(placeholder, metal, [1.16, 0.4, 0.37], [1.9, 2.17, 0.55], 0.15);
  part(placeholder, gold, [2.59, 0.68, 0.13], [0.41, 0.43, 0.43], 0.09);
  const buzzer = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.35, 20), black);
  buzzer.position.set(1.9, -1.58, 0.33);
  buzzer.rotation.x = Math.PI / 2;
  placeholder.add(buzzer);
  wearable.add(placeholder);

  // Transmission status LED
  const wearableLed = led(wearable, -1.33, -1.49, 0.42, cyan, 0.16);

  // Load the authentic fabricated prototype board 3D CAD model
  loadBoard('prototype')
    .then((gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const cad = new THREE.Group();
      cad.add(model);
      cad.rotation.x = -Math.PI / 2;
      cad.scale.setScalar(5.5 / Math.max(size.x, size.z));
      cad.position.set(0, 0, 0.16);

      placeholder.visible = false;
      wearable.add(cad);
    })
    .catch(() => {
      // Fallback remains visible
    });

  wearable.rotation.set(-0.53, -0.28, -0.08);

  // ==========================================
  // 3. RECEIVER STATION & COMMAND MONITOR CONSOLE
  // ==========================================
  const desk = new THREE.Group();

  // Desktop Base Surface / Pedestal
  const deskStandBase = part(desk, darkMetal, [0, -3.42, 0.3], [5.2, 0.24, 3.2], 0.12);

  // Articulating Display Support Arm with cable pass-through channel
  const arm = part(desk, metal, [0, -2.1, -0.15], [0.85, 2.6, 0.42], 0.08);
  arm.rotation.x = 0.12;

  // Station Receiver Unit sitting directly on desk base
  const rxUnit = part(desk, darkMetal, [-1.75, -3.05, 0.55], [2.1, 0.58, 1.6], 0.08);
  part(rxUnit, black, [0, 0.22, 0.12], [1.7, 0.14, 1.1], 0.04);
  // LoRa Rubber-Ducky Antenna
  const rxAntenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.065, 3.1, 16),
    black,
  );
  rxAntenna.position.set(-0.68, 1.6, 0.45);
  rxUnit.add(rxAntenna);
  // Antenna gold SMA base connector
  const sma = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 12), gold);
  sma.position.set(-0.68, 0.15, 0.45);
  rxUnit.add(sma);
  // Receiver Activity LEDs
  led(rxUnit, 0.35, 0.32, 0.55, cyan, 0.08);
  led(rxUnit, 0.65, 0.32, 0.55, amber, 0.08);

  // Braided USB Cable looping from Receiver Unit to Monitor Chassis
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.1, -3.05, 0.55),
    new THREE.Vector3(-0.6, -2.9, 0.1),
    new THREE.Vector3(-0.15, -2.3, -0.1),
    new THREE.Vector3(0, -1.2, -0.2),
  ]);
  const usbCord = new THREE.Mesh(
    new THREE.TubeGeometry(cableCurve, 20, 0.045, 6, false),
    black,
  );
  desk.add(usbCord);

  // Monitor Ultra-Thin Bezel Chassis
  part(desk, darkMetal, [0, 0, 0], [9.8, 5.8, 0.32], 0.18);
  part(desk, black, [0, 0, 0.15], [9.6, 5.6, 0.06], 0.1);

  // High-Resolution Command & Control Monitor Screen
  const deskScreen = createScreen('desk', 9.35, 5.35, 0.19, desk);

  // Subtle Status Indicator under monitor chin
  led(desk, 4.25, -2.62, 0.18, cyan, 0.09);

  desk.rotation.y = -0.28;

  return { phone, wearable, desk, wearableLed, textures: [phoneScreen, deskScreen] };
}
