import * as THREE from 'three';

// Screen-space wet glass. The slope field is linear data and never samples the scene.
const passVertex = `
  varying vec2 screenUv;
  void main() {
    screenUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fieldFragment = `
  varying vec2 screenUv;
  uniform float aspect, phase, wetness, fieldStep;
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(0.1071, 0.1137, 0.1031));
    q += dot(q, q.yzx + 19.73);
    return fract((q.x + q.z) * q.y);
  }
  float layer(vec2 p, float cells, float speed) {
    vec2 grid = p * cells;
    float column = floor(grid.x);
    grid.y += hash(vec2(column, 7.0)) * 14.0;
    grid.y += phase * speed * (0.62 + 0.74 * hash(vec2(column, 2.4)));
    vec2 id = floor(grid);
    float seed = hash(id);
    float chance = smoothstep(seed, seed + 0.1, wetness * 0.8);
    vec2 d = fract(grid) - vec2(0.21 + hash(id + 8.12) * 0.58, 0.27 + 0.28 * hash(id + 1.5));
    float r = 0.09 + 0.11 * hash(id + 9.3);
    float runner = step(0.01, speed);
    d.x += runner * sin(d.y * 7.3 + seed * 5.0) * 0.025;
    vec2 bulb = d / vec2(r, r * (1.0 + 0.43 * runner));
    float dome = pow(max(0.0, 1.0 - dot(bulb, bulb)), 1.45);
    float t = clamp(d.y / 0.55, 0.0, 1.0);
    float tail = runner * 0.25 * smoothstep(0.0, 0.09, d.y) * (1.0 - t)
      * (1.0 - smoothstep(0.0, r * mix(0.34, 0.05, t), abs(d.x)));
    return chance * max(dome, tail);
  }
  float water(vec2 p) {
    return max(0.72 * layer(p, 33.0, 0.0), layer(p + vec2(0.1, 0.28), 12.0, 0.39));
  }
  void main() {
    vec2 p = screenUv * vec2(aspect, 1.0);
    vec2 e = vec2(fieldStep, 0.0);
    vec2 normal = vec2(water(p + e) - water(p - e), water(p + e.yx) - water(p - e.yx));
    normal = clamp(normal / (fieldStep * 220.0), -1.0, 1.0);
    gl_FragColor = vec4((128.0 + normal * 127.0) / 255.0, water(p), 1.0);
  }
`;

const compositeFragment = `
  varying vec2 screenUv;
  uniform sampler2D dryScene, dropField;
  uniform float aspect, amount;
  void main() {
    vec3 field = texture2D(dropField, screenUv).rgb;
    vec2 slope = (field.rg * 255.0 - 128.0) / 127.0;
    vec2 shift = slope * vec2(1.0 / aspect, 1.0) * (0.012 * amount);
    vec4 under = texture2D(dryScene, clamp(screenUv + shift, 0.0, 1.0));
    float edge = field.b * max(0.0, dot(slope, vec2(-0.60, 0.80))) * amount;
    gl_FragColor = vec4(under.rgb * (1.0 + 0.16 * edge) + vec3(0.05, 0.09, 0.10) * edge,
                        max(under.a, edge * 0.30));
  }
`;

export function makeRainPass(renderer) {
  const color = new THREE.WebGLRenderTarget(1, 1, {
    samples: Math.min(4, renderer.capabilities.maxSamples),
  });
  const field = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  for (const target of [color, field]) {
    target.texture.colorSpace = THREE.NoColorSpace;
    target.texture.generateMipmaps = false;
    target.texture.minFilter = target.texture.magFilter = THREE.LinearFilter;
  }
  const uniforms = {
    dryScene: { value: color.texture },
    dropField: { value: field.texture },
    aspect: { value: 1 },
    phase: { value: 0 },
    wetness: { value: 0 },
    fieldStep: { value: 1 },
    amount: { value: 0 },
  };
  const shader = (fragmentShader) =>
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: passVertex,
      fragmentShader,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
  const drops = shader(fieldFragment),
    refract = shader(compositeFragment);
  const triangle = new THREE.BufferGeometry();
  triangle.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
  );
  const screen = new THREE.Mesh(triangle, drops);
  screen.frustumCulled = false;
  const post = new THREE.Scene(),
    camera = new THREE.Camera();
  post.add(screen);
  return {
    resize(w, h) {
      const fieldHeight = Math.max(1, Math.floor(h / 2));
      color.setSize(w, h);
      field.setSize(Math.max(1, Math.floor(w / 2)), fieldHeight);
      uniforms.aspect.value = w / h;
      uniforms.fieldStep.value = 1 / fieldHeight;
    },
    paint(scene, view, time, intensity) {
      uniforms.phase.value = time;
      uniforms.wetness.value = intensity;
      uniforms.amount.value = Math.min(1, intensity * 5);
      renderer.setRenderTarget(color);
      renderer.render(scene, view);
      screen.material = drops;
      renderer.setRenderTarget(field);
      renderer.render(post, camera);
      screen.material = refract;
      renderer.setRenderTarget(null);
      renderer.render(post, camera);
    },
    dispose() {
      color.dispose();
      field.dispose();
      drops.dispose();
      refract.dispose();
      triangle.dispose();
    },
  };
}
