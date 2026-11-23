import * as T from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

const steel = new T.MeshStandardMaterial({ color: 0x30444e, metalness: 0.68, roughness: 0.35 });
const masonry = new T.MeshStandardMaterial({ color: 0x25343e, metalness: 0.16, roughness: 0.73 });
const concrete = new T.MeshStandardMaterial({ color: 0x838e91, roughness: 0.79 });
const line = new T.MeshStandardMaterial({ color: 0xadb4ad, roughness: 0.52 });
const brass = new T.MeshStandardMaterial({ color: 0xcda850, roughness: 0.52 });
const lit = (hex) => new T.MeshBasicMaterial({ color: hex, toneMapped: false });
function bar(root, m, x, y, z, w, h, d) {
  const n = new T.Mesh(new T.BoxGeometry(w, h, d), m);
  n.position.set(x, y, z);
  n.receiveShadow = true;
  root.add(n);
  return n;
}
function lightPool(root, x, z, w, h, color, strength) {
  const g = new T.PlaneGeometry(w, h);
  const m = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    uniforms: { tint: { value: new T.Color(color) }, power: { value: strength } },
    vertexShader:
      'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec2 v;uniform vec3 tint;uniform float power;void main(){
      vec2 p=(v-.5)*2.;float n=fract(sin(dot(floor(v*vec2(59.,220.)),vec2(12.98,78.23)))*42758.5);
      float rip=.48+.52*pow(.5+.5*cos(v.y*350.+sin(v.x*25.)*2.+n*1.8),2.);
      gl_FragColor=vec4(tint,exp(-3.5*p.x*p.x-2.3*p.y*p.y)*rip*power);
      #include <colorspace_fragment>
    }`,
  });
  const n = new T.Mesh(g, m);
  n.rotation.x = -Math.PI / 2;
  n.position.set(x, 0.011, z);
  root.add(n);
}
export function street(scene, surface, normal) {
  for (const map of [surface, normal]) {
    map.wrapS = map.wrapT = T.RepeatWrapping;
    map.repeat.set(24, 24);
    map.anisotropy = 4;
  }
  surface.colorSpace = T.SRGBColorSpace;
  const road = new T.Mesh(
    new T.PlaneGeometry(80, 80),
    new T.MeshStandardMaterial({
      map: surface,
      normalMap: normal,
      normalScale: new T.Vector2(0.39, 0.39),
      color: 0x4a5058,
      metalness: 0.11,
      roughness: 0.41,
      envMapIntensity: 0.65,
    }),
  );
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  scene.add(road);
  const reflectShader = Reflector.ReflectorShader;
  const puddle = new Reflector(new T.PlaneGeometry(52, 26), {
    textureWidth: 448,
    textureHeight: 192,
    multisample: 0,
    clipBias: 0.002,
    shader: {
      uniforms: reflectShader.uniforms,
      vertexShader: reflectShader.vertexShader
        .replace('varying vec4 vUv;', 'varying vec4 vUv;varying vec2 streetUV;')
        .replace('vUv = textureMatrix', 'streetUV=position.xy; vUv = textureMatrix'),
      fragmentShader: `uniform sampler2D tDiffuse;varying vec4 vUv;varying vec2 streetUV;
    void main(){vec2 p=streetUV;vec2 screen=vUv.xy/vUv.w;float wave=sin(p.y*57.+sin(p.x*17.)*1.4+sin(p.y*11.));
    screen.y+=wave*.0011;screen.x+=sin(p.y*37.+p.x*4.)*.0018;
    vec3 c=texture2D(tDiffuse,screen).rgb*.50+texture2D(tDiffuse,screen+vec2(.0019,.0015)).rgb*.25+texture2D(tDiffuse,screen-vec2(.0019,.0015)).rgb*.25;
    float pool=.5+.5*sin(p.y*2.14+1.6*sin(p.x*1.19)+.3*sin(p.y*7.));
    gl_FragColor=vec4(c,.12+.35*smoothstep(.16,.79,pool));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`,
    },
  });
  puddle.material.transparent = true;
  puddle.material.depthWrite = false;
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.y = 0.001;
  scene.add(puddle);
  for (let i = -10; i <= 10; i++)
    if (Math.abs(i) > 1) bar(scene, brass, i * 3.6, 0.003, 0, 1.69, 0.009, 0.085);
  for (const side of [-1, 1])
    for (const sign of [-1, 1]) {
      bar(scene, line, sign * 20, 0.004, side * 4.22, 33, 0.008, 0.08);
      bar(scene, concrete, sign * 20, 0.07, side * 5.95, 33, 0.14, 3.18);
      for (let j = 0; j < 12; j++) {
        const t = sign * (4.6 + 2.65 * j);
        bar(scene, steel, t, 0.142, side * 5.9, 0.019, 0.004, 3.03);
        bar(scene, concrete, t, 0.08, side * 4.31, 2.6, 0.17, 0.19);
      }
    }
  const crossing = new T.Group();
  scene.add(crossing);
  for (let j = -4; j <= 4; j++) bar(crossing, line, 0, 0.008, j * 0.91, 2, 0.009, 0.43);
  // Shop windows and awnings break up the panorama at street level. Reflections share their positions and colours.
  for (const [x, z, h, warm] of [
    [-15.8, -9.3, 3.5, true],
    [13.2, -10.2, 3.8, false],
  ]) {
    bar(scene, masonry, x, h / 2, z, 5.48, h, 2.6);
    const col = warm ? 0xe5a363 : 0x69c8cf;
    const glass = new T.MeshStandardMaterial({
      color: warm ? 0x8d6952 : 0x36616b,
      emissive: warm ? 0xc48547 : 0x448f9b,
      emissiveIntensity: 0.45,
      metalness: 0.55,
      roughness: 0.19,
    });
    bar(scene, glass, x, 1.56, z + 1.31, 4.81, 2.51, 0.05);
    const mullion = steel;
    for (let k = -2; k <= 2; k++) bar(scene, mullion, x + k * 1.15, 1.53, z + 1.35, 0.056, 2.62, 0.065);
    bar(scene, mullion, x, 2.16, z + 1.37, 4.83, 0.045, 0.07);
    for (let row = 0; row < 4; row++)
      bar(scene, mullion, x, 1.97 + row * 0.115, z + 1.36, 4.64, 0.018, 0.038);
    bar(scene, steel, x, 3.04, z + 1.49, 5.6, 0.19, 0.69);
    bar(scene, lit(col), x, 2.946, z + 1.81, 4.87, 0.046, 0.048);
    lightPool(scene, x, -4.9, 3.8, 8.1, col, 0.23);
  }
  const lamp = lit(0xffe2aa);
  for (const x of [-13, -6, 8, 16]) {
    bar(scene, steel, x, 2.5, -4.95, 0.083, 5, 0.09);
    bar(scene, steel, x, 5, -4.45, 0.095, 0.085, 1.08);
    bar(scene, lamp, x, 4.94, -3.99, 0.28, 0.043, 0.47);
    lightPool(scene, x, -3.3, 4.8, 9, 0xf8bb7a, 0.28);
  }
  const key = new T.DirectionalLight(0xffe0b8, 3.35);
  key.position.set(1, 8, 4);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 10, bottom: -10, near: 0.3, far: 28 });
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.normalBias = 0.007;
  key.shadow.bias = -0.0002;
  scene.add(key);
  const rim = new T.DirectionalLight(0x8de3ef, 2.9);
  rim.position.set(-4, 4, -4);
  scene.add(rim);
  scene.add(new T.HemisphereLight(0xd0e2f2, 0x756458, 0.86));
  return crossing;
}

export function reflections(vehicle, halfWidth, front) {
  for (const side of [-1, 1])
    lightPool(vehicle, side * halfWidth, front + 1.8, 0.82, 4.8, 0xffdcac, 0.46);
}
