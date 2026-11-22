import * as THREE from 'three';

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const smooth = THREE.MathUtils.smoothstep;
const roadWidth = 3.55;

function hash(x, z) {
  const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function noise(x, z) {
  const ix = Math.floor(x),
    iz = Math.floor(z);
  const fx = smooth(x - ix, 0, 1),
    fz = smooth(z - iz, 0, 1);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), fx),
    THREE.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), fx),
    fz,
  );
}

const roadZ = (x) => 4 - x * 0.18 + 10 * Math.sin(x * 0.069 + 0.5) + 4.5 * Math.sin(x * 0.115 - 0.2);
const roadY = (x) => 1.6 + x * 0.018 + 1.3 * Math.sin(x * 0.073 - 0.2);
const roadSlope = (x) => -0.18 + 0.69 * Math.cos(x * 0.069 + 0.5) + 0.5175 * Math.cos(x * 0.115 - 0.2);
const lateral = (x, z) => (z - roadZ(x)) / Math.hypot(1, roadSlope(x));

function coverage(x, z) {
  const ellipse = Math.hypot(x / 79, z / 44);
  return clamp((1.12 - ellipse + (noise(x * 0.075, z * 0.075) - 0.5) * 0.17) * 5, 0, 1);
}

function height(x, z) {
  const cross = lateral(x, z);
  const slope = smooth(Math.abs(cross), roadWidth, roadWidth + 20);
  const ridge =
    Math.exp(-(((x + 15) / 24) ** 2 + ((z + 25) / 12) ** 2)) * 19 +
    Math.exp(-(((x - 36) / 30) ** 2 + ((z + 29) / 17) ** 2)) * 15 +
    Math.exp(-(((x + 48) / 22) ** 2 + ((z + 9) / 17) ** 2)) * 13 +
    Math.exp(-(((x - 9) / 19) ** 2 + ((z - 33) / 11) ** 2)) * 5.5;
  const rough =
    noise(x * 0.09, z * 0.09) * 4.8 +
    noise(x * 0.23, z * 0.23) * 1.8 +
    Math.abs(noise(x * 0.16, z * 0.16) - 0.5) * 3.5 +
    noise(x * 0.65, z * 0.65) * 0.7;
  return roadY(x) + slope * (ridge + rough - 2.5);
}

export const alertPosition = new THREE.Vector3(6.2, roadY(6.2) + 0.33, roadZ(6.2) + 0.3);
export const receiverPosition = new THREE.Vector3(42, height(42, -19), -19);

const scanField = `
  uniform float radius;
  uniform vec2 origin;
  float pulse(vec2 p) {
    float d = radius - distance(p, origin);
    return smoothstep(-1.1, 0.0, d) * (1.0 - smoothstep(0.0, 4.5, d));
  }
`;

const surfaceVertex = `
  attribute float edge;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vEdge;
  void main() {
    vPosition = position;
    vNormal = normal;
    vEdge = edge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function makeSurface(geometry, shared) {
  return new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: shared,
      vertexShader: surfaceVertex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      fragmentShader:
        scanField +
        `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vEdge;
      void main() {
        if (vEdge < 0.075) discard;
        float light = clamp(dot(normalize(vNormal), normalize(vec3(-0.57, 0.66, -0.58))), 0.0, 1.0);
        float elevation = smoothstep(5.0, 23.0, vPosition.y);
        vec3 base = mix(vec3(0.030, 0.075, 0.099), vec3(0.082, 0.202, 0.220), pow(light, 1.7));
        base += vec3(0.028, 0.056, 0.071) * elevation;
        float fresnel = pow(1.0 - max(0.0, dot(normalize(cameraPosition - vPosition), normalize(vNormal))), 2.1);
        base += vec3(0.032, 0.087, 0.082) * fresnel * elevation;
        float level = (vPosition.y + 0.15) / 1.48;
        float width = fwidth(level);
        float contour = 1.0 - smoothstep(0.0, max(0.008, min(0.48, width * 0.85)), abs(fract(level + 0.5) - 0.5));
        float hills = smoothstep(1.8, 7.0, vPosition.y);
        base += vec3(0.051, 0.159, 0.17) * contour * hills;
        base += vec3(0.032, 0.11, 0.11) * pulse(vPosition.xz);
        gl_FragColor = vec4(base, smoothstep(0.04, 0.68, vEdge));
      }
    `,
    }),
  );
}

function makeReturns(positions, colors, sizes, shared) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    vertexShader:
      scanField +
      `
      uniform float pixelScale;
      attribute float size;
      varying vec3 tint;
      void main() {
        float scan = pulse(position.xz);
        tint = color + vec3(0.24, 0.63, 0.64) * scan;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(pixelScale * (size + scan * 0.45), 0.85, 4.5);
      }
    `,
    fragmentShader: `
      varying vec3 tint;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        gl_FragColor = vec4(tint, (1.0 - smoothstep(0.18, 0.51, r)) * 0.94);
      }
    `,
  });
  return new THREE.Points(geometry, material);
}

function makeLines(vertices, tint, opacity, shared) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.ShaderMaterial({
    uniforms: { ...shared, tint: { value: new THREE.Vector3(...tint) }, opacity: { value: opacity } },
    transparent: true,
    depthWrite: false,
    vertexShader:
      scanField +
      `
      varying float light;
      void main() {
        light = pulse(position.xz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 tint;
      uniform float opacity;
      varying float light;
      void main() { gl_FragColor = vec4(tint + vec3(0.12, 0.28, 0.30) * light, opacity); }
    `,
  });
  return new THREE.LineSegments(geometry, material);
}

function makeRoad(shared) {
  // Quads share the source path's segment normals so the shoulder width stays consistent on bends.
  const vertices = [],
    offsets = [],
    indices = [],
    posts = [],
    rails = [];
  let previousRail = null;
  for (let i = 0; i <= 550; i++) {
    const x = -78 + (i * 156) / 550,
      z = roadZ(x),
      y = roadY(x) + 0.18;
    const slope = roadSlope(x),
      normal = Math.hypot(1, slope);
    for (const side of [-1, 1]) {
      const w = side * roadWidth;
      const px = x - (w * slope) / normal;
      vertices.push(px, roadY(px) + 0.22, z + w / normal);
      offsets.push(w, x);
      if (i % 17 === 2 && Math.abs(x) < 73) {
        const px = x - ((w + side * 0.4) * slope) / normal,
          pz = z + (w + side * 0.4) / normal;
        posts.push(px, y + 0.18, pz, px, y + 0.9, pz);
      }
      if (side === 1) {
        const guarded = (x > 17 && x < 41) || (x > -43 && x < -32);
        const width = w + 0.8;
        const railX = x - (width * slope) / normal,
          railZ = z + width / normal;
        const here = [railX, roadY(railX) + 1.06, railZ];
        if (guarded && previousRail) rails.push(...previousRail, ...here);
        if (guarded && i % 8 === 0) posts.push(railX, here[1] - 0.67, railZ, ...here);
        previousRail = guarded ? here : null;
      }
    }
    if (i) {
      const j = i * 2;
      indices.push(j - 2, j - 1, j, j, j - 1, j + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(offsets, 2));
  geometry.setIndex(indices);
  const material = new THREE.ShaderMaterial({
    uniforms: shared,
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: `
      varying vec2 road;
      varying vec2 ground;
      void main() {
        road = uv; ground = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader:
      scanField +
      `
      varying vec2 road;
      varying vec2 ground;
      float line(float value, float width) {
        float aa = max(fwidth(value) * 0.65, 0.015);
        return 1.0 - smoothstep(max(0.0, width - aa), width + aa, abs(value));
      }
      void main() {
        float d = abs(road.x);
        float end = 1.0 - smoothstep(66.0, 78.0, abs(road.y));
        float shoulder = line(d - 3.04, 0.115);
        float gutter = line(d - 3.46, 0.055);
        float median = line(d - 0.15, 0.065);
        float dash = smoothstep(0.20, 0.24, fract(road.y / 7.0));
        float grain = fract(sin(dot(floor(ground * 13.0), vec2(13.713, 58.37))) * 16272.43);
        vec3 c = mix(vec3(0.055, 0.081, 0.096), vec3(0.14, 0.14, 0.14), exp(-d * 1.25)) + vec3(0.015 * grain);
        c += vec3(0.63, 0.79, 0.76) * shoulder * 0.93 + vec3(0.15, 0.51, 0.52) * gutter;
        c += vec3(1.0, 0.57, 0.12) * median * (0.4 + 0.6 * dash) + vec3(0.1, 0.04, 0.0) * exp(-d * 1.4);
        c += vec3(0.06, 0.20, 0.18) * pulse(ground);
        gl_FragColor = vec4(c, end);
      }
    `,
  });
  return [
    new THREE.Mesh(geometry, material),
    makeLines(posts, [0.58, 0.81, 0.8], 0.65, shared),
    makeLines(rails, [0.53, 0.72, 0.73], 0.94, shared),
  ];
}

export function makeTerrain(shared) {
  const land = [],
    edge = [],
    indices = [],
    positions = [],
    colors = [],
    sizes = [],
    trunks = [],
    scanEdges = [];
  const nx = 260,
    nz = 157;
  const point = (x, y, z, r, g, b, size) => {
    positions.push(x, y, z);
    colors.push(r, g, b);
    sizes.push(size);
  };
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = (i / nx - 0.5) * 171 + (hash(i, j) - 0.5) * 0.32;
      const z = (j / nz - 0.5) * 100 + (hash(j, i + 25) - 0.5) * 0.32;
      const y = height(x, z),
        mask = coverage(x, z),
        random = hash(i + 3, j + 18);
      land.push(x, y, z);
      edge.push(mask);
      if (i < nx && j < nz && mask > 0.02) {
        const k = i + j * (nx + 1);
        indices.push(k, k + nx + 1, k + 1, k + 1, k + nx + 1, k + nx + 2);
      }
      if (mask < random * 0.92 || Math.abs(lateral(x, z)) < roadWidth + 0.13) continue;
      const normalLight = clamp(0.65 + (height(x + 0.4, z + 0.4) - y) * 1.4, 0.1, 1.16);
      const signal = (0.25 + 0.75 * random * random) * normalLight * Math.min(mask + 0.15, 1);
      const ridge = smooth(y, 5, 20) * (0.4 + random * 0.6);
      point(
        x,
        y + 0.07,
        z,
        0.14 + signal * 0.48 + ridge * 0.12,
        0.29 + signal * 0.66 + ridge * 0.17,
        0.34 + signal * 0.62 + ridge * 0.18,
        0.71 + random * 0.76,
      );
    }
  }
  // Sparse canopy returns sit directly on the sampled terrain. Broken rings leave air between branches.
  for (let i = 0; i < 640; i++) {
    const x = (hash(i, 167) - 0.5) * 157,
      z = (hash(i, 170) - 0.5) * 82;
    const mask = coverage(x, z),
      cross = Math.abs(lateral(x, z));
    if (mask < 0.37 || cross < roadWidth + 2.8 || noise(x * 0.1, z * 0.1) < 0.35) continue;
    const y = height(x, z),
      h = 1.8 + hash(i, 173) ** 1.25 * 5.6;
    const broadleaf = y < 12 && hash(i, 190) < 0.52;
    const width = h * (0.2 + hash(i, 177) * 0.13);
    trunks.push(x, y, z, x, y + h * 0.91, z);
    const density = Math.round(22 + h * 8);
    for (let k = 0; k < density; k++) {
      const layer = 0.13 + hash(i * 11, k + 9) * 0.87;
      const angle = hash(i * 17, k + 31) * TAU;
      const local = (layer * 5.6) % 1;
      const branch = broadleaf
        ? Math.sin((Math.max(0, layer - 0.3) / 0.7) * Math.PI) ** 0.72
        : (1 - layer) ** 0.81;
      const radius =
        width *
        branch *
        (broadleaf ? 1.2 : 0.35 + 0.65 * (1 - local)) *
        (0.62 + 0.38 * hash(i + 30, k));
      const lit = (0.35 + 0.65 * Math.max(0, -Math.cos(angle - 0.7))) * (0.55 + 0.45 * hash(i, k + 62));
      point(
        x + Math.cos(angle) * radius,
        y + layer * h,
        z + Math.sin(angle) * radius,
        0.13 + lit * 0.6,
        0.27 + lit * 0.65,
        0.28 + lit * 0.57,
        0.85 + lit * 1.1,
      );
    }
  }
  const mesh = new THREE.BufferGeometry();
  mesh.setAttribute('position', new THREE.Float32BufferAttribute(land, 3));
  mesh.setAttribute('edge', new THREE.Float32BufferAttribute(edge, 1));
  mesh.setIndex(indices);
  mesh.computeVertexNormals();
  // Reuse indexed triangle edges on selected rows and columns; the survey cage follows every ridge.
  for (let k = 0; k < indices.length; k += 6) {
    const a = indices[k],
      i = a % (nx + 1),
      j = Math.floor(a / (nx + 1));
    if (edge[a] < 0.2 || Math.abs(lateral(land[a * 3], land[a * 3 + 2])) < roadWidth + 0.3) continue;
    for (const b of [i % 7 === 0 ? indices[k + 1] : -1, j % 7 === 0 ? indices[k + 2] : -1]) {
      if (b < 0) continue;
      scanEdges.push(
        land[a * 3],
        land[a * 3 + 1] + 0.065,
        land[a * 3 + 2],
        land[b * 3],
        land[b * 3 + 1] + 0.065,
        land[b * 3 + 2],
      );
    }
  }
  const cage = makeLines(scanEdges, [0.25, 0.69, 0.71], 0.36, shared);
  cage.material.fragmentShader = `
    varying float light;
    void main() {
      if (light < 0.015) discard;
      gl_FragColor = vec4(0.31, 0.70, 0.73, light * 0.36);
    }
  `;
  const group = new THREE.Group();
  group.add(
    makeSurface(mesh, shared),
    cage,
    makeLines(trunks, [0.18, 0.4, 0.4], 0.6, shared),
    ...makeRoad(shared),
    makeReturns(positions, colors, sizes, shared),
  );
  return group;
}
