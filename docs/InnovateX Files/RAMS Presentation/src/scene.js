import * as THREE from 'three';
import { alertPosition, makeTerrain } from './scene/terrain.js';
import { makeRainPass } from './scene/rain.js';
import { makeRelay } from './scene/relay.js';

function makeBeacon() {
  const beacon = new THREE.Group();
  beacon.position.copy(alertPosition);
  const amber = new THREE.Color().setRGB(1, 0.64, 0.22);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: amber,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader:
        'varying vec2 st; void main(){st=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:
        'varying vec2 st; void main(){float d=length(st-0.5)*2.0;gl_FragColor=vec4(1.0,0.51,0.11,0.30*exp(-d*d*6.3)*(1.0-smoothstep(0.65,1.0,d)));}',
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.2;
  halo.renderOrder = 6;
  beacon.add(halo);
  for (const [inner, outer, opacity] of [
    [2.78, 2.96, 0.85],
    [4.88, 4.95, 0.65],
    [7.8, 7.86, 0.25],
  ]) {
    const material = ringMaterial.clone();
    material.opacity = opacity;
    const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 96), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = outer * 0.04;
    ring.renderOrder = 7;
    beacon.add(ring);
  }
  const vertex = new THREE.Float32BufferAttribute([0, 0.35, 0, 0, 5.1, 0], 3);
  const stem = new THREE.BufferGeometry().setAttribute('position', vertex);
  beacon.add(
    new THREE.Line(
      stem,
      new THREE.LineBasicMaterial({ color: amber, transparent: true, opacity: 0.82 }),
    ),
  );
  const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.78), ringMaterial);
  tip.position.y = 5.6;
  beacon.add(tip);
  return beacon;
}

export function createRoadScene(container, { onMarker } = {}) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'pan-y',
    cursor: 'grab',
  });
  container.prepend(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-80, 80, 55, -55, 0.5, 460);
  const shared = {
    radius: { value: 27 },
    origin: { value: new THREE.Vector2(alertPosition.x, alertPosition.z) },
    pixelScale: { value: 1 },
  };
  const terrain = makeTerrain(shared);
  terrain.children.forEach((object, i) => {
    object.renderOrder = i;
  });
  const beacon = makeBeacon();
  scene.add(terrain, beacon);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const home = new THREE.Vector3(0, 5.35, -0.4),
    focus = home.clone(),
    marker = new THREE.Vector3();
  let azimuth = -0.65,
    elevation = 0.51,
    wantedAzimuth = azimuth,
    wantedElevation = elevation;
  let stage = 0,
    time = 0,
    scanTime = 2.4,
    wet = 0,
    rainOn = false,
    paused = false,
    inView = true;
  let width = 0,
    height = 0,
    frame = 0,
    last = 0,
    disposed = false,
    rain = null,
    drag = null;
  let relay = null,
    relayStep = 0;
  const stageAngles = [-0.65, -0.51, -0.76, -0.57, -0.7, -0.42];

  function resize() {
    width = Math.round(container.clientWidth);
    height = Math.round(container.clientHeight);
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    const aspect = width / height;
    const span = Math.max(77, 154 / aspect);
    camera.left = -span * aspect * 0.5;
    camera.right = -camera.left;
    camera.top = span * 0.5;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    shared.pixelScale.value = ratio * THREE.MathUtils.clamp(width / 650, 0.79, 1.25);
    rain?.resize(canvas.width, canvas.height);
    wake();
  }
  function render(now) {
    frame = 0;
    if (disposed || !inView || !width || !height || document.hidden) {
      last = 0;
      return;
    }
    const dt = Math.min(stage === 4 ? 0.25 : 0.065, Math.max(0, (now - (last || now)) / 1000));
    last = now;
    const moving = !paused;
    if (moving) {
      time += dt;
      scanTime = (scanTime + dt) % 11;
    }
    const shot = stage === 4 ? relay.update(time, paused || reduceMotion.matches) : null;
    const ease = moving && !shot?.settled ? 1 - Math.exp(-dt * (shot ? 4.4 : 12)) : 1;
    if (shot) {
      wantedAzimuth = shot.azimuth;
      wantedElevation = shot.elevation;
      focus.lerp(shot.focus, ease);
      const span = Math.max(shot.span, (shot.span * 1.54) / (width / height));
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, (camera.top - camera.bottom) / span, ease);
      camera.updateProjectionMatrix();
    }
    azimuth += (wantedAzimuth - azimuth) * ease;
    elevation += (wantedElevation - elevation) * ease;
    const angle = azimuth + (shot ? 0 : Math.sin(time * 0.16) * 0.013);
    camera.position.set(
      focus.x + Math.sin(angle) * Math.cos(elevation) * 163,
      focus.y + Math.sin(elevation) * 163,
      focus.z + Math.cos(angle) * Math.cos(elevation) * 163,
    );
    camera.lookAt(focus);
    camera.updateMatrixWorld();
    shared.radius.value = 2.0 + scanTime * 10.5;
    if (!shot && onMarker) {
      marker.copy(alertPosition);
      marker.y += 5.6;
      marker.project(camera);
      onMarker((marker.x + 1) / 2, (1 - marker.y) / 2);
    }
    const target = rainOn && !shot ? 0.83 : 0;
    if (shot) wet = 0;
    wet += (target - wet) * (moving ? 1 - Math.exp(-dt * (rainOn ? 2.4 : 1.8)) : 1);
    if (wet < 0.004) wet = 0;
    if (wet) {
      if (!rain) {
        rain = makeRainPass(renderer);
        rain.resize(canvas.width, canvas.height);
      }
      rain.paint(scene, camera, time, wet);
    } else {
      renderer.render(scene, camera);
    }
    if (moving && !shot?.settled) wake();
    else last = 0;
  }
  function wake() {
    if (!frame && !disposed && inView && !document.hidden) frame = requestAnimationFrame(render);
  }
  function pointerDown(event) {
    if (stage === 4 || event.button !== 0 || !event.isPrimary) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      azimuth: wantedAzimuth,
      elevation: wantedElevation,
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  }
  function pointerMove(event) {
    if (drag?.id !== event.pointerId) return;
    wantedAzimuth = drag.azimuth - (event.clientX - drag.x) * 0.0048;
    wantedElevation = THREE.MathUtils.clamp(
      drag.elevation + (event.clientY - drag.y) * 0.003,
      0.22,
      1.11,
    );
    wake();
  }
  function pointerUp(event) {
    if (drag?.id === event.pointerId) {
      drag = null;
      canvas.style.cursor = 'grab';
    }
  }
  function visibility() {
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  }
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('lostpointercapture', pointerUp);
  document.addEventListener('visibilitychange', visibility);
  reduceMotion.addEventListener('change', wake);
  const sizing = new ResizeObserver(resize);
  sizing.observe(container);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    last = 0;
    if (inView) wake();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  visibilityObserver.observe(container);
  resize();
  return {
    setStage(index) {
      stage = Number.isInteger(index) ? THREE.MathUtils.clamp(index, 0, stageAngles.length - 1) : 0;
      if (stage === 4 && !relay) {
        relay = makeRelay();
        scene.add(relay.root);
      }
      if (relay) {
        relay.root.visible = stage === 4;
        if (stage === 4) relay.setStep(relayStep, time);
      }
      beacon.visible = stage !== 4;
      if (stage !== 4) {
        focus.copy(home);
        camera.zoom = 1;
        camera.updateProjectionMatrix();
      }
      wantedAzimuth = stageAngles[stage];
      wantedElevation = stage === 1 ? 0.62 : 0.51;
      wake();
    },
    setRelayStep(index) {
      relayStep = Number.isInteger(index) ? THREE.MathUtils.clamp(index, 0, 3) : 0;
      last = 0;
      relay?.setStep(relayStep, time);
      wake();
    },
    setRain(value) {
      rainOn = Boolean(value);
      wake();
    },
    setPaused(value) {
      paused = Boolean(value);
      last = 0;
      wake();
    },
    scan() {
      scanTime = reduceMotion.matches || paused ? 3.6 : 0.05;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      sizing.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduceMotion.removeEventListener('change', wake);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('lostpointercapture', pointerUp);
      scene.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
      rain?.dispose();
      relay?.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
