import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

async function loadBoard(name) {
  const loader = new GLTFLoader();
  if (location.protocol !== 'file:') return loader.loadAsync('public/hardware/' + name + '.glb');
  // Local files cannot fetch neighboring GLBs. Load the same compressed bytes as a classic script.
  if (!window.ramsBoards?.[name]) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/' + name + '.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  const packed = Uint8Array.from(atob(window.ramsBoards[name]), (char) => char.charCodeAt(0));
  const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'));
  return loader.parseAsync(await new Response(stream).arrayBuffer(), '');
}

export function inspectBoard(element, name, report) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 8;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.domElement.setAttribute('aria-label', 'Rotatable CAD model');
  renderer.domElement.style.visibility = 'hidden';
  element.append(renderer.domElement);
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = generator.fromScene(room, 0.04, 0.1, 100, { size: 64 });
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.85;
  room.dispose();
  generator.dispose();
  scene.add(new THREE.HemisphereLight(0xf0fcff, 0x9bb1b7, 0.92));
  const key = new THREE.DirectionalLight(0xfff0da, 1.65);
  key.position.set(3, 5, 2);
  scene.add(key);
  let closed = false;
  let underside = false;
  let animation = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const paint = () => {
    if (!closed) renderer.render(scene, camera);
  };
  function stopTurn() {
    cancelAnimationFrame(animation);
    animation = 0;
  }
  function frame(flip = false, animate = true) {
    stopTurn();
    underside = flip;
    const distance = 4.8 * Math.max(1, 1.1 / camera.aspect);
    controls.target.set(0, 0, 0);
    const target = new THREE.Vector3(0.46, flip ? -1.14 : 1.14, 0.78)
      .normalize()
      .multiplyScalar(distance);
    if (!animate || reduced.matches) {
      camera.position.copy(target);
      controls.update();
      paint();
      return;
    }
    const from = new THREE.Spherical().setFromVector3(camera.position);
    const to = new THREE.Spherical().setFromVector3(target);
    const turn =
      THREE.MathUtils.euclideanModulo(to.theta - from.theta + Math.PI, 2 * Math.PI) - Math.PI;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / 620);
      const mix = t * t * (3 - 2 * t);
      camera.position.setFromSphericalCoords(
        THREE.MathUtils.lerp(from.radius, to.radius, mix),
        THREE.MathUtils.lerp(from.phi, to.phi, mix),
        from.theta + turn * mix,
      );
      controls.update();
      paint();
      if (t < 1) animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
  }
  function resize() {
    const rect = element.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    paint();
  }
  function release(root) {
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    root.traverse((node) => {
      if (node.geometry) geometries.add(node.geometry);
      for (const mat of [].concat(node.material || [])) {
        materials.add(mat);
        for (const prop of Object.values(mat)) if (prop?.isTexture) textures.add(prop);
      }
    });
    for (const item of [...geometries, ...materials, ...textures]) item.dispose();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(element);
  controls.addEventListener('change', paint);
  controls.addEventListener('start', stopTurn);
  resize();
  frame(false, false);
  let model;
  loadBoard(name)
    .then((gltf) => {
      if (closed) {
        release(gltf.scene);
        return;
      }
      model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const group = new THREE.Group();
      group.add(model);
      model.position.sub(center);
      group.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
      scene.add(group);
      paint();
      renderer.domElement.style.visibility = '';
      element.querySelector('img').hidden = true;
      if (!reduced.matches) {
        const entrance = new THREE.Spherical().setFromVector3(camera.position);
        entrance.theta -= 0.35;
        entrance.phi -= 0.14;
        camera.position.setFromSpherical(entrance);
        controls.update();
        frame();
      }
      report('Drag to orbit · scroll to zoom', true);
    })
    .catch(() => {
      if (!closed) report('CAD still · interactive model unavailable', false);
    });
  return {
    flip: () => frame(!underside),
    reset: () => frame(false),
    dispose() {
      closed = true;
      stopTurn();
      observer.disconnect();
      controls.dispose();
      if (model) release(model);
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
