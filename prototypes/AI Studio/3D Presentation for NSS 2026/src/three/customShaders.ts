import * as THREE from 'three';

/**
 * Generates a luminous multi-temperature studio environment cubemap via PMREMGenerator
 * for realistic metallic speculars on motorcycle chrome, gold ENIG PCB pads, and glass visors.
 */
export function createStudioEnvironmentTexture(renderer: THREE.WebGLRenderer): THREE.Texture {
  const studioScene = new THREE.Scene();
  studioScene.background = new THREE.Color(0x070d18);

  const topPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 14),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 1.15, 1.65), side: THREE.DoubleSide })
  );
  topPanel.position.set(0, 10, 0);
  topPanel.rotation.x = Math.PI / 2;
  studioScene.add(topPanel);

  const keyPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 10),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 2.5, 1.1), side: THREE.DoubleSide })
  );
  keyPanel.position.set(11, 5.0, 6);
  keyPanel.lookAt(0, 1, 0);
  studioScene.add(keyPanel);

  const rimPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 6),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 3.1, 3.9), side: THREE.DoubleSide })
  );
  rimPanel.position.set(-12, 4.2, -8);
  rimPanel.lookAt(0, 1, 0);
  studioScene.add(rimPanel);

  const fillPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 4),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.4, 2.6), side: THREE.DoubleSide })
  );
  fillPanel.position.set(0, 1.5, -13);
  fillPanel.lookAt(0, 1, 0);
  studioScene.add(fillPanel);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envTex = pmrem.fromScene(studioScene, 0.035).texture;
  pmrem.dispose();

  studioScene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  });

  return envTex;
}

/**
 * AAA atmospheric night-storm mountain sky dome with moon halo, layered rolling storm clouds,
 * Rayleigh horizon gradient, and distant city highway glow.
 */
export function createAtmosphericSkyDome(): {
  mesh: THREE.Mesh;
  update: (
    time: number,
    zenithRgb: [number, number, number],
    horizonRgb: [number, number, number]
  ) => void;
  dispose: () => void;
} {
  const geo = new THREE.SphereGeometry(155, 56, 36);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uZenith: { value: new THREE.Color(0.02, 0.04, 0.09) },
      uHorizon: { value: new THREE.Color(0.07, 0.14, 0.26) },
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldDir;
      uniform float uTime;
      uniform vec3 uZenith;
      uniform vec3 uHorizon;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 5; i++) {
          v += amp * noise(p);
          p *= 2.06;
          amp *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 dir = normalize(vWorldDir);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        float horizonBand = pow(1.0 - abs(dir.y), 4.6);
        vec3 col = mix(uHorizon, uZenith, smoothstep(0.44, 0.94, h));

        // Layered storm-cloud deck catching cool sapphire & distant amber rim
        vec2 cloudUv = dir.xz / (abs(dir.y) + 0.22) * 1.35 + vec2(uTime * 0.006, -uTime * 0.004);
        float cloudBase = fbm(cloudUv);
        float cloudDetail = fbm(cloudUv * 2.4 - vec2(uTime * 0.011, 0.0));
        float cloudDensity = smoothstep(0.35, 0.85, cloudBase * 0.72 + cloudDetail * 0.38);
        float upperMask = smoothstep(0.02, 0.34, dir.y);
        col += mix(uHorizon * 0.9, vec3(0.24, 0.38, 0.58), cloudDetail) * cloudDensity * upperMask * 0.48;

        // Atmospheric moon & Mie scattering halo
        vec3 moonDir = normalize(vec3(-0.36, 0.38, -0.85));
        float moonDot = max(0.0, dot(dir, moonDir));
        float moonHalo = pow(moonDot, 16.0) * 0.35 + pow(moonDot, 140.0) * 0.8;
        float moonDisc = smoothstep(0.9986, 0.9992, moonDot) * (1.0 - cloudDensity * 0.65);
        col += vec3(0.72, 0.86, 1.0) * moonHalo + vec3(1.0, 0.98, 0.94) * moonDisc;

        // Distant valley city sodium haze at -Z corridor vanishing point
        float valleyMask = pow(max(0.0, -dir.z), 3.2) * pow(1.0 - abs(dir.y), 6.0);
        col += vec3(0.95, 0.52, 0.18) * valleyMask * 0.26;
        col += uHorizon * horizonBand * 0.32;

        // Crisp high-altitude stars peeking between clouds
        float starCell = hash21(floor(dir.xz * 290.0 + dir.y * 140.0));
        float star = step(0.997, starCell) * smoothstep(0.2, 0.68, dir.y) * (1.0 - cloudDensity * 0.85);
        col += vec3(0.82, 0.92, 1.0) * star * 0.72;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;

  return {
    mesh,
    update: (time, zenithRgb, horizonRgb) => {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uZenith.value.setRGB(zenithRgb[0], zenithRgb[1], zenithRgb[2]);
      mat.uniforms.uHorizon.value.setRGB(horizonRgb[0], horizonRgb[1], horizonRgb[2]);
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
}

/**
 * Shared terrain height function so trees, boulders, and roadside cliffs root flush into ground.
 */
export function terrainHeightAt(x: number, z: number): number {
  const absX = Math.abs(x);
  if (absX <= 6.2) return -0.05;

  // Grass berm behind barriers (6.0..11.5m), rising smoothly above guardrail height into Cordillera cliffs
  const bermSlope = THREE.MathUtils.smoothstep(absX, 6.0, 11.5) * 0.95;
  const corridorFade = THREE.MathUtils.smoothstep(absX, 9.2, 34.0);
  const wave1 = Math.sin(x * 0.075 + z * 0.042) * 0.5 + 0.5;
  const wave2 = Math.cos(x * 0.16 - z * 0.105) * 0.5 + 0.5;
  const wave3 = Math.sin(x * 0.34 + z * 0.24) * 0.5 + 0.5;
  const ridgeCrag = Math.abs(Math.sin(x * 0.115 - z * 0.068));
  const strata = Math.sin(x * 0.52 + z * 0.28) * 0.12;
  const fbm = wave1 * 0.44 + wave2 * 0.28 + wave3 * 0.14 + ridgeCrag * 0.14 + strata * 0.1;

  const peakEnvelope = Math.pow(corridorFade, 1.15) * (8.4 + (absX - 9.2) * 0.42);
  return -0.05 + bermSlope + Math.max(0, fbm) * peakEnvelope;
}

/**
 * High-poly sculpted Cordillera mountain & valley terrain flanking the highway corridor.
 */
export function createSculptedTerrainMesh(lowDetail = false): {
  mesh: THREE.Mesh;
  dispose: () => void;
} {
  const segX = lowDetail ? 72 : 152;
  const segZ = lowDetail ? 64 : 132;
  const geo = new THREE.PlaneGeometry(280, 230, segX, segZ);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i) - 34;
    pos.setZ(i, vz);
    const vy = terrainHeightAt(vx, vz);
    pos.setY(i, vy);

    const absX = Math.abs(vx);
    const tH = THREE.MathUtils.clamp(vy / 26.0, 0, 1);
    const cliffFactor = THREE.MathUtils.smoothstep(absX, 9.0, 18.0) * (1.0 - tH * 0.45);
    const microTex = 0.8 + 0.2 * Math.sin(vx * 0.85 + vz * 0.45) * Math.cos(vz * 0.7 - vx * 0.35);

    // Deep forest floor near corridor -> dark emerald mountain slope -> charcoal granite ridge
    let r = THREE.MathUtils.lerp(0.004, 0.014, tH) * microTex;
    let g = THREE.MathUtils.lerp(0.012, 0.026, tH) * microTex;
    let b = THREE.MathUtils.lerp(0.008, 0.022, tH) * microTex;

    r = THREE.MathUtils.lerp(r, 0.016, cliffFactor * 0.3);
    g = THREE.MathUtils.lerp(g, 0.022, cliffFactor * 0.25);
    b = THREE.MathUtils.lerp(b, 0.028, cliffFactor * 0.28);

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1.0,
    metalness: 0.0,
    envMapIntensity: 0.08,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;

  return {
    mesh,
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
}

/**
 * Extends asphalt PBR material with AAA wet-road specular pools (streetlight warm reflections,
 * ambulance red/blue ground strobes, motorcycle headlamp splash), scan-grid & Hotspot Predictor heat.
 */
export function enhanceAsphaltMaterial(material: THREE.MeshStandardMaterial): {
  update: (
    time: number,
    alertMix: number,
    hotspotMix: number,
    ambZ: number,
    ambFlash: number,
    motoZ: number,
    poleShiftZ?: number
  ) => void;
} {
  const uniforms = {
    uTime: { value: 0 },
    uAlertMix: { value: 0 },
    uHotspotMix: { value: 0 },
    uAmbZ: { value: -16.0 },
    uAmbFlash: { value: 0 },
    uMotoZ: { value: 2.0 },
    uPoleShiftZ: { value: 0 },
  };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uAlertMix = uniforms.uAlertMix;
    shader.uniforms.uHotspotMix = uniforms.uHotspotMix;
    shader.uniforms.uAmbZ = uniforms.uAmbZ;
    shader.uniforms.uAmbFlash = uniforms.uAmbFlash;
    shader.uniforms.uMotoZ = uniforms.uMotoZ;
    shader.uniforms.uPoleShiftZ = uniforms.uPoleShiftZ;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform float uAlertMix;
        uniform float uHotspotMix;
        uniform float uAmbZ;
        uniform float uAmbFlash;
        uniform float uMotoZ;
        uniform float uPoleShiftZ;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        // Anisotropic warm sodium puddle streaks synchronized with scrolling streetlights
        float polePeriod = mod(24.0 + uPoleShiftZ - vWorldPos.z + 6.0, 12.0) - 6.0;
        float polePool = exp(-(pow((vWorldPos.x + 2.6) * 0.3, 2.0) + pow(polePeriod * 0.14, 2.0)));
        totalEmissiveRadiance += vec3(1.0, 0.72, 0.35) * polePool * 0.16;

        // Motorcycle crisp warm-white headlamp splash forward along asphalt
        float headSplash = exp(-(pow(vWorldPos.x * 0.75, 2.0) + pow((vWorldPos.z - (uMotoZ - 3.8)) * 0.26, 2.0)));
        totalEmissiveRadiance += vec3(0.95, 0.92, 0.80) * headSplash * 0.36;

        // Subtle emergency red/blue strobe wash across wet highway around approaching ambulance
        float ambDist = exp(-(pow((vWorldPos.x - 1.6) * 0.28, 2.0) + pow((vWorldPos.z - uAmbZ) * 0.16, 2.0)));
        vec3 strobeCol = mix(vec3(0.08, 0.62, 1.0), vec3(1.0, 0.14, 0.22), uAmbFlash);
        totalEmissiveRadiance += strobeCol * ambDist * uHotspotMix * 0.42;

        // Subtle tactical LIDAR ground grid + scan wave
        float gridX = smoothstep(0.972, 1.0, abs(cos(vWorldPos.x * 1.25)));
        float gridZ = smoothstep(0.978, 1.0, abs(cos(vWorldPos.z * 0.55)));
        float gridMask = max(gridX, gridZ) * 0.08;
        float scanWave = exp(-pow(mod(vWorldPos.z + uTime * 6.5, 44.0) - 22.0, 2.0) * 0.16);
        vec3 baseTint = mix(vec3(0.14, 0.62, 0.94), vec3(0.96, 0.28, 0.26), uAlertMix);
        totalEmissiveRadiance += baseTint * (gridMask * 0.42 + scanWave * 0.12);

        // RAMS AI Hotspot Predictor thermal corridor zones
        float hotA = exp(-(pow(vWorldPos.x * 0.45, 2.0) + pow((vWorldPos.z + 6.0) * 0.18, 2.0)));
        float hotB = exp(-(pow((vWorldPos.x - 1.2) * 0.4, 2.0) + pow((vWorldPos.z + 18.0) * 0.14, 2.0)));
        float hotPulse = 0.78 + 0.22 * sin(uTime * 2.4);
        vec3 heatCol = mix(vec3(0.96, 0.55, 0.08), vec3(0.98, 0.22, 0.30), clamp(hotA * 1.15, 0.0, 1.0));
        totalEmissiveRadiance += heatCol * (hotA * 0.55 + hotB * 0.38) * uHotspotMix * hotPulse;`
      );
  };

  return {
    update: (time, alertMix, hotspotMix, ambZ, ambFlash, motoZ, poleShiftZ = 0) => {
      uniforms.uTime.value = time;
      uniforms.uAlertMix.value = alertMix;
      uniforms.uHotspotMix.value = hotspotMix;
      uniforms.uAmbZ.value = ambZ;
      uniforms.uAmbFlash.value = ambFlash;
      uniforms.uMotoZ.value = motoZ;
      uniforms.uPoleShiftZ.value = poleShiftZ;
    },
  };
}

/**
 * Soft additive volumetric streetlight shaft cone shader (no hard edges).
 */
export function createVolumetricLightConeMaterial(
  colorHex = 0xffcf88,
  opacity = 0.085
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      uniform vec3 uColor;
      uniform float uOpacity;

      void main() {
        vec3 viewDir = normalize(vViewPos);
        float edgeFade = pow(abs(dot(vNormal, viewDir)), 1.9);
        float topFade = smoothstep(0.0, 0.9, vUv.y);
        float bottomFade = smoothstep(0.0, 0.25, vUv.y);
        float alpha = edgeFade * topFade * bottomFade * uOpacity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.22));
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * Custom GLSL volumetric telemetry + subtle atmospheric mist particle system.
 */
export function createTelemetryParticleSystem(count = 1600): {
  points: THREE.Points;
  update: (time: number, scrollVel: number, rgb: [number, number, number]) => void;
  dispose: () => void;
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);

  let seed = 9001;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 90;
    positions[i * 3 + 1] = 0.25 + rand() * 20;
    positions[i * 3 + 2] = 24 - rand() * 110;
    scales[i] = 0.5 + rand() * 1.85;
    phases[i] = rand() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScrollVel: { value: 0 },
      uColor: { value: new THREE.Color(0.35, 0.72, 0.96) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: `
      attribute float aScale;
      attribute float aPhase;
      uniform float uTime;
      uniform float uScrollVel;
      uniform float uPixelRatio;
      varying float vAlpha;

      void main() {
        vec3 pos = position;
        float t = uTime * 0.45 + aPhase;
        pos.y += sin(t * 1.15 + pos.x * 0.08) * 0.4 + cos(t * 0.6) * 0.18;
        pos.x += cos(t * 0.8 + pos.z * 0.06) * 0.36;
        pos.z += sin(t * 0.55 + pos.y * 0.12) * 0.24 + clamp(uScrollVel, -2.5, 2.5) * aScale * 1.6;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp((28.0 * aScale * uPixelRatio) / max(-mvPosition.z, 1.0), 1.5, 16.0);

        float nearFade = smoothstep(1.8, 6.0, -mvPosition.z);
        float farFade = smoothstep(86.0, 14.0, -mvPosition.z);
        vAlpha = (0.3 + 0.4 * sin(uTime * 1.25 + aPhase)) * nearFade * farFade;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float strength = pow(1.0 - d * 2.0, 2.4);
        gl_FragColor = vec4(uColor, strength * clamp(vAlpha, 0.05, 0.76));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    update: (time: number, scrollVel: number, rgb: [number, number, number]) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uScrollVel.value = scrollVel;
      material.uniforms.uColor.value.setRGB(rgb[0], rgb[1], rgb[2]);
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * Custom ShaderMaterial for traveling RF / BLE data packets along a curved TubeGeometry.
 */
export function createPacketArcMaterial(colorHex: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color(colorHex) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;

      void main() {
        float packet1 = smoothstep(0.14, 0.0, abs(fract(vUv.x - uTime * 0.55) - 0.5));
        float packet2 = smoothstep(0.10, 0.0, abs(fract(vUv.x - uTime * 0.55 + 0.35) - 0.5));
        float baseLine = 0.24;
        float glow = baseLine + packet1 * 1.2 + packet2 * 0.72;
        vec3 col = uColor * glow + vec3(1.0) * packet1 * 0.45;
        gl_FragColor = vec4(col, clamp(glow * uOpacity, 0.0, 1.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * Expanding concentric RF pulse shader for LoRa 433 MHz beacon footprint & "Hey RAMS" voice halo.
 */
export function createRfWavefrontMaterial(colorHex: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color(colorHex) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;

      void main() {
        float dist = distance(vUv, vec2(0.5)) * 2.0;
        if (dist > 1.0) discard;

        float ring1 = smoothstep(0.06, 0.0, abs(fract(dist - uTime * 0.44) - 0.5));
        float ring2 = smoothstep(0.045, 0.0, abs(fract(dist - uTime * 0.44 + 0.5) - 0.5));
        float edgeFade = (1.0 - dist);
        float alpha = (ring1 + ring2 * 0.55) * edgeFade * 0.82 * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * Builds a 3D volumetric telemetry ribbon mesh from normalized G-force values or AI confidence.
 */
export function createTelemetryRibbonMesh(
  accelValuesG: number[],
  width = 11,
  isPothole = false
): {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  dispose: () => void;
} {
  const count = accelValuesG.length;
  const positions = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const indices: number[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = (t - 0.5) * width;
    const h = Math.min(3.5, accelValuesG[i] * 0.5);

    positions[i * 6] = x;
    positions[i * 6 + 1] = 0;
    positions[i * 6 + 2] = 0;

    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = h;
    positions[i * 6 + 5] = 0;

    uvs[i * 4] = t;
    uvs[i * 4 + 1] = 0;
    uvs[i * 4 + 2] = t;
    uvs[i * 4 + 3] = 1;

    if (i < count - 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uIsPothole: { value: isPothole ? 1.0 : 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uIsPothole;

      void main() {
        vec3 baseCol = vec3(0.18, 0.83, 0.75);
        if (uIsPothole < 0.5) {
          float isFreefall = smoothstep(0.15, 0.18, vUv.x) * (1.0 - smoothstep(0.21, 0.23, vUv.x));
          float isImpact = smoothstep(0.21, 0.23, vUv.x) * (1.0 - smoothstep(0.27, 0.30, vUv.x));
          float isLatch = smoothstep(0.38, 0.45, vUv.x);
          baseCol = mix(baseCol, vec3(0.96, 0.62, 0.04), isFreefall);
          baseCol = mix(baseCol, vec3(0.98, 0.24, 0.30), max(isImpact, isLatch));
        } else {
          float isSpike = smoothstep(0.19, 0.21, vUv.x) * (1.0 - smoothstep(0.26, 0.29, vUv.x));
          baseCol = mix(vec3(0.06, 0.72, 0.50), vec3(0.96, 0.65, 0.14), isSpike);
        }

        float scan = smoothstep(0.06, 0.0, abs(vUv.x - fract(uTime * 0.25)));
        float topRim = pow(vUv.y, 1.55);
        float alpha = (0.2 + topRim * 0.72 + scan * 0.26) * uOpacity;
        gl_FragColor = vec4(baseCol + vec3(0.35) * topRim * 0.4, clamp(alpha, 0.0, 0.95));
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    material,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * Soft volumetric headlight beam cone shader with zero hard edges.
 */
export function createHeadlightBeamMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0xfff1cc) },
      uOpacity: { value: 0.24 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      uniform vec3 uColor;
      uniform float uOpacity;

      void main() {
        vec3 viewDir = normalize(vViewPos);
        float edgeFade = pow(abs(dot(vNormal, viewDir)), 1.75);
        float distFade = smoothstep(0.0, 0.88, vUv.y);
        float tipFade = smoothstep(1.0, 0.92, vUv.y);
        float alpha = edgeFade * distFade * tipFade * uOpacity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.42));
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * Higgsfield Cinema Studio post-process shader:
 * - Subtle horizontal anamorphic lens flare streaks on high-luminance highlights (headlight, strobes, LoRa arc)
 * - Edge chromatic aberration pulse scaled by uImpactMix during Beat 06 crash latch
 * - Calibrated filmic shadow/highlight S-curve + optical vignette
 */
export const HiggsfieldCinemaShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignetteDarkness: { value: 0.42 },
    uImpactMix: { value: 0.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uVignetteDarkness;
    uniform float uImpactMix;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);

      // Subtle optical lens chromatic dispersion at frame edges + crash impact kick
      float caAmt = (0.0011 + 0.0048 * uImpactMix) * pow(dist * 1.45, 1.6);
      vec2 dir = dist > 0.0001 ? center / dist : vec2(0.0);
      float r = texture2D(tDiffuse, vUv + dir * caAmt).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * caAmt).b;
      vec3 baseCol = vec3(r, g, b);

      // Subtle anamorphic horizontal cyan-gold streak sample across bright highlights
      vec3 streak = vec3(0.0);
      for (int i = -3; i <= 3; i++) {
        if (i == 0) continue;
        float fi = float(i);
        vec3 s = texture2D(tDiffuse, clamp(vUv + vec2(fi * 0.0065, 0.0), 0.001, 0.999)).rgb;
        float luma = dot(s, vec3(0.2126, 0.7152, 0.0722));
        float bright = smoothstep(0.76, 1.25, luma);
        streak += s * bright * (1.0 - abs(fi) / 4.2);
      }
      vec3 anamorphicTint = mix(vec3(0.35, 0.85, 1.0), vec3(1.0, 0.36, 0.32), uImpactMix);
      baseCol += streak * anamorphicTint * 0.042;

      // Filmic subtle S-curve contrast without crushing shadow detail
      vec3 graded = baseCol * (1.03 + 0.04 * (1.0 - dist));
      graded = mix(graded, smoothstep(vec3(0.0), vec3(1.0), graded), 0.14);

      // Smooth optical lens vignette
      float vig = smoothstep(0.92, 0.27, dist);
      graded = mix(graded * (1.0 - uVignetteDarkness), graded, vig);

      gl_FragColor = vec4(clamp(graded, 0.0, 1.0), 1.0);
    }
  `,
};

export const CinematicGradeShader = HiggsfieldCinemaShader;

