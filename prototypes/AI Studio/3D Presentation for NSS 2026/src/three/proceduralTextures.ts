import * as THREE from 'three';

export function createAsphaltAlbedoTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e141f';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < data.length; i += 4) {
    const speckle = rand();
    const grain = (speckle - 0.5) * 24 + (speckle > 0.94 ? 14 : 0);
    data[i] = Math.max(0, Math.min(255, 14 + grain));
    data[i + 1] = Math.max(0, Math.min(255, 19 + grain));
    data[i + 2] = Math.max(0, Math.min(255, 29 + grain));
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Damp polished wheel tracks + slightly darker wet shoulder gutters
  const trackGrad = ctx.createLinearGradient(0, 0, size, 0);
  trackGrad.addColorStop(0.0, 'rgba(3,5,9,0.45)');
  trackGrad.addColorStop(0.08, 'rgba(10,14,22,0.18)');
  trackGrad.addColorStop(0.24, 'rgba(38,54,78,0.18)');
  trackGrad.addColorStop(0.38, 'rgba(12,18,28,0.08)');
  trackGrad.addColorStop(0.5, 'rgba(8,12,19,0.16)');
  trackGrad.addColorStop(0.62, 'rgba(12,18,28,0.08)');
  trackGrad.addColorStop(0.76, 'rgba(38,54,78,0.18)');
  trackGrad.addColorStop(0.92, 'rgba(10,14,22,0.18)');
  trackGrad.addColorStop(1.0, 'rgba(3,5,9,0.45)');
  ctx.fillStyle = trackGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle asphalt patching & tar seams
  ctx.strokeStyle = 'rgba(4, 7, 13, 0.62)';
  ctx.lineWidth = 2.2;
  for (let c = 0; c < 14; c++) {
    ctx.beginPath();
    let cx = 80 + rand() * (size - 160);
    let cy = rand() * size;
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      cx += (rand() - 0.5) * 44;
      cy += 34 + rand() * 56;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Crisp thermoplastic edge stripes + slightly worn edges
  ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
  ctx.fillRect(36, 0, 14, size);
  ctx.fillRect(size - 50, 0, 14, size);

  // Rumble-strip shoulder grooves near curb
  ctx.fillStyle = 'rgba(2, 4, 8, 0.48)';
  for (let y = 0; y < size; y += 32) {
    ctx.fillRect(10, y, 18, 12);
    ctx.fillRect(size - 28, y, 18, 12);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 20);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createAsphaltRoughnessTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9b9ba0';
  ctx.fillRect(0, 0, size, size);

  const trackGrad = ctx.createLinearGradient(0, 0, size, 0);
  trackGrad.addColorStop(0.0, 'rgba(170, 170, 175, 0.55)');
  trackGrad.addColorStop(0.24, 'rgba(84, 84, 92, 0.7)');
  trackGrad.addColorStop(0.38, 'rgba(135, 135, 142, 0.35)');
  trackGrad.addColorStop(0.5, 'rgba(160, 160, 168, 0.45)');
  trackGrad.addColorStop(0.62, 'rgba(135, 135, 142, 0.35)');
  trackGrad.addColorStop(0.76, 'rgba(84, 84, 92, 0.7)');
  trackGrad.addColorStop(1.0, 'rgba(170, 170, 175, 0.55)');
  ctx.fillStyle = trackGrad;
  ctx.fillRect(0, 0, size, size);

  let seed = 8821;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 92; i++) {
    const px = 56 + rand() * (size - 112);
    const py = rand() * size;
    const w = 10 + rand() * 28;
    const h = 80 + rand() * 210;
    const g = ctx.createLinearGradient(px, py, px, py + h);
    g.addColorStop(0, 'rgba(92, 92, 98, 0.0)');
    g.addColorStop(0.5, 'rgba(56, 56, 62, 0.46)');
    g.addColorStop(1, 'rgba(92, 92, 98, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(px, py, w, h);
  }

  ctx.fillStyle = '#56565c';
  ctx.fillRect(36, 0, 14, size);
  ctx.fillRect(size - 50, 0, 14, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 16);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createAsphaltBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  let seed = 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < data.length; i += 4) {
    const coarse = rand();
    const v = Math.floor(82 + coarse * coarse * 162);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 30);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createConcreteTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#313a4a';
  ctx.fillRect(0, 0, size, size);

  let seed = 3199;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 1600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 1 + rand() * 3.5;
    const shade = Math.floor(34 + rand() * 36);
    ctx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 16})`;
    ctx.fillRect(x, y, r, r);
  }
  // Bottom road splash weathering
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, 'rgba(255,255,255,0.06)');
  g.addColorStop(0.7, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createSolarPanelTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0c1c3d';
  ctx.fillRect(0, 0, size, size);

  const cols = 6;
  const rows = 8;
  const cellW = size / cols;
  const cellH = size / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#0f2752' : '#0b1e42';
      ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createRadialShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    4,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.88)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.42)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPhoneTelemetryTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  bgGrad.addColorStop(0, '#091120');
  bgGrad.addColorStop(1, '#050810');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 1024);

  ctx.fillStyle = '#0f1b2e';
  ctx.fillRect(28, 36, 456, 78);
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 36, 456, 78);

  ctx.fillStyle = '#2dd4bf';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('RAMS SENSOR + AI', 48, 84);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px monospace';
  ctx.fillText('PHONE MOTION · GPS · BLUETOOTH', 32, 158);

  ctx.fillStyle = '#0a1424';
  ctx.fillRect(28, 184, 456, 224);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.strokeRect(28, 184, 456, 224);

  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 420; x += 6) {
    const px = 46 + x;
    const py = 308 + Math.sin(x * 0.06) * 24 - (x > 220 && x < 260 ? 72 : 0);
    if (x === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  const rows = [
    ['BUMP & POTHOLE FILTER', 'ACTIVE · SAFE RIDE', '#2dd4bf'],
    ['GPS LOCATION LOCK', '17.6132 N, 121.7270 E', '#f8fafc'],
    ['WEARABLE BRIDGE', 'CONNECTED TO ESP32-S3', '#38bdf8'],
    ['VOICE CANCEL READY', '"HEY RAMS" (OFFLINE)', '#f59e0b'],
  ] as const;

  let y = 442;
  for (const [k, v, valColor] of rows) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(28, y, 456, 102);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(28, y, 456, 102);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px monospace';
    ctx.fillText(k, 48, y + 36);

    ctx.fillStyle = valColor;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(v, 48, y + 74);
    y += 120;
  }

  ctx.fillStyle = '#10b981';
  ctx.fillRect(28, 945, 456, 44);
  ctx.fillStyle = '#052e16';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('ARMED  ·  RIDER PROTECTED', 96, 974);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createPcbSilkscreenTexture(
  title: string,
  boardHex: string,
  traceHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = boardHex;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = traceHex;
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 16; i++) {
    const offset = 36 + i * 28;
    ctx.beginPath();
    ctx.moveTo(22, offset);
    ctx.lineTo(175 + (i % 4) * 32, offset);
    ctx.lineTo(235 + (i % 4) * 32, offset + 20);
    ctx.lineTo(490, offset + 20);
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(175 + (i % 4) * 32, offset, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#f59e0b';
  for (let i = 0; i < 10; i++) {
    const py = 46 + i * 44;
    ctx.fillRect(8, py, 26, 17);
    ctx.fillRect(478, py, 26, 17);
  }

  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(title, 52, 472);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createThtCarrierPcbTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 1024;
  const h = 768;
  const albedo = document.createElement('canvas');
  albedo.width = w;
  albedo.height = h;
  const ctx = albedo.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = w;
  bump.height = h;
  const bctx = bump.getContext('2d')!;

  ctx.fillStyle = '#08241d';
  ctx.fillRect(0, 0, w, h);

  bctx.fillStyle = '#505050';
  bctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }
  for (let j = 0; j < h; j += 16) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(w, j);
    ctx.stroke();
  }

  ctx.fillStyle = '#0c3329';
  ctx.fillRect(28, 28, w - 56, h - 56);
  ctx.strokeStyle = '#185c49';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, w - 56, h - 56);

  const drawTrace = (pts: [number, number][], width = 9, copperCol = '#34a87c') => {
    for (const [context, color, lw] of [
      [ctx, copperCol, width] as const,
      [bctx, '#d4d4d4', width] as const,
    ]) {
      context.strokeStyle = color;
      context.lineWidth = lw;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
      context.stroke();
    }
  };

  for (let i = 0; i < 6; i++) {
    const sy = 205 + i * 42;
    drawTrace([
      [355, sy],
      [445 + i * 10, sy],
      [475 + i * 10, sy - 16],
      [605, sy - 16],
    ]);
  }

  drawTrace(
    [
      [250, 610],
      [250, 520],
      [435, 520],
    ],
    12,
    '#3fc48f'
  );
  drawTrace(
    [
      [555, 552],
      [405, 552],
      [330, 465],
      [330, 445],
    ],
    9,
    '#3fc48f'
  );
  drawTrace(
    [
      [355, 452],
      [580, 452],
      [675, 540],
      [755, 540],
    ],
    9,
    '#3fc48f'
  );

  const drawPad = (x: number, y: number, rOuter = 11, rHole = 4.5) => {
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x, y, rOuter, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#070b10';
    ctx.beginPath();
    ctx.arc(x, y, rHole, 0, Math.PI * 2);
    ctx.fill();

    bctx.fillStyle = '#ffffff';
    bctx.beginPath();
    bctx.arc(x, y, rOuter, 0, Math.PI * 2);
    bctx.fill();
  };

  for (let i = 0; i < 9; i++) {
    const py = 185 + i * 32;
    drawPad(180, py, 10, 4);
    drawPad(355, py, 10, 4);
  }
  for (let i = 0; i < 8; i++) {
    const py = 170 + i * 34;
    drawPad(605, py, 10, 4);
    drawPad(835, py, 10, 4);
  }
  drawPad(435, 520, 12, 5);
  drawPad(555, 520, 12, 5);
  drawPad(435, 585, 12, 5);
  drawPad(555, 585, 12, 5);
  drawPad(755, 535, 12, 5);
  drawPad(755, 605, 12, 5);
  drawPad(225, 615, 13, 5.5);
  drawPad(275, 615, 13, 5.5);
  for (const [mx, my] of [
    [62, 62],
    [w - 62, 62],
    [62, h - 62],
    [w - 62, h - 62],
  ]) {
    drawPad(mx, my, 24, 13);
  }

  ctx.fillStyle = 'rgba(248, 250, 252, 0.94)';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('RAMS SELF-FABRICATED THT PCB', 110, 68);
  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(226, 232, 240, 0.88)';
  ctx.fillText('COPPER-ROUTED TRACES · ZERO TRACE WIRES', 110, 96);

  ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.lineWidth = 2;
  ctx.strokeRect(156, 152, 224, 326);
  ctx.fillText('U1 ESP32-S3 SUPERMINI', 162, 142);

  ctx.strokeRect(584, 142, 274, 304);
  ctx.fillText('U2 RA-02 433MHz LORA', 592, 132);

  ctx.strokeRect(410, 492, 170, 120);
  ctx.fillText('BATTERY MONITOR', 416, 482);

  ctx.fillText('J1 3.7V LIPO', 180, 668);
  ctx.fillText('BZ1 ALARM BUZZER', 685, 668);

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bump);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

export function createRealSmdPcbTextureSet(maxAnisotropy: number): {
  topMap: THREE.CanvasTexture;
  bottomMap: THREE.CanvasTexture;
} {
  const makeBoardCanvas = (label: string, copperSrc: string, silkSrc: string): THREE.CanvasTexture => {
    const w = 1024;
    const h = 768;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    ctx.fillStyle = '#364329';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#475736';
    ctx.fillRect(28, 24, w - 56, h - 48);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(label, 52, h - 42);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    Promise.all([loadImg(copperSrc), loadImg(silkSrc)])
      .then(([copperImg, silkImg]) => {
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const octx = off.getContext('2d', { willReadFrequently: true })!;

        const sx = Math.round(copperImg.width * 0.044);
        const sy = Math.round(copperImg.height * 0.056);
        const sw = Math.round(copperImg.width * 0.912);
        const sh = Math.round(copperImg.height * 0.886);

        octx.drawImage(copperImg, sx, sy, sw, sh, 0, 0, w, h);
        const cData = octx.getImageData(0, 0, w, h);
        const px = cData.data;

        for (let i = 0; i < px.length; i += 4) {
          const r = px[i];
          const b = px[i + 2];
          const g = px[i + 1];
          const isWhiteBg = r > 228 && g > 228 && b > 228;
          const isCopper = !isWhiteBg && Math.abs(r - b) > 32;
          if (isCopper) {
            px[i] = 68;
            px[i + 1] = 88;
            px[i + 2] = 48;
            px[i + 3] = 255;
          } else {
            px[i] = 32;
            px[i + 1] = 44;
            px[i + 2] = 26;
            px[i + 3] = 255;
          }
        }
        ctx.putImageData(cData, 0, 0);

        octx.clearRect(0, 0, w, h);
        const ssx = Math.round(silkImg.width * 0.044);
        const ssy = Math.round(silkImg.height * 0.056);
        const ssw = Math.round(silkImg.width * 0.912);
        const ssh = Math.round(silkImg.height * 0.886);
        octx.drawImage(silkImg, ssx, ssy, ssw, ssh, 0, 0, w, h);

        const sData = octx.getImageData(0, 0, w, h);
        const spx = sData.data;
        const out = ctx.getImageData(0, 0, w, h);
        const opx = out.data;

        for (let i = 0; i < spx.length; i += 4) {
          const r = spx[i];
          const g = spx[i + 1];
          const b = spx[i + 2];
          const alpha = spx[i + 3];
          const isDrillBlack = r < 24 && g < 24 && b < 24 && alpha > 200;
          const isWhiteBg = r > 244 && g > 244 && b > 244;
          const isSilkInk = alpha > 55 && !isWhiteBg && !isDrillBlack;
          if (isSilkInk) {
            opx[i] = 244;
            opx[i + 1] = 248;
            opx[i + 2] = 250;
            opx[i + 3] = 255;
          } else if (isDrillBlack) {
            opx[i] = 10;
            opx[i + 1] = 14;
            opx[i + 2] = 18;
            opx[i + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
        tex.needsUpdate = true;
      })
      .catch(() => {});

    return tex;
  };

  return {
    topMap: makeBoardCanvas(
      'ASTRA CUSTOM SMD · 42×32mm TOP',
      '/assets/hardware/smd_top_copper.png',
      '/assets/hardware/smd_top_silk.png'
    ),
    bottomMap: makeBoardCanvas(
      'RA-02 433MHz · SMD BOTTOM',
      '/assets/hardware/smd_bottom_copper.png',
      '/assets/hardware/smd_bottom_silk.png'
    ),
  };
}
