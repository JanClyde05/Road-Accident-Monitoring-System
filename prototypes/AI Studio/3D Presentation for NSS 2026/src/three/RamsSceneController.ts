import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  generateCrashTrace,
  generatePotholeTrace,
  getBeatFromProgress,
  HardwareRevision,
} from '../rams/crashStateMachine';
import { PRESENTATION_BEATS } from '../rams/presentationData';
import {
  createAtmosphericSkyDome,
  createPacketArcMaterial,
  createRfWavefrontMaterial,
  createSculptedTerrainMesh,
  createStudioEnvironmentTexture,
  createTelemetryParticleSystem,
  createTelemetryRibbonMesh,
  enhanceAsphaltMaterial,
  HiggsfieldCinemaShader,
  terrainHeightAt,
} from './customShaders';
import {
  createAmbulanceGroup,
  createBaseStationGroup,
  createCellTowerGroup,
  createHardwareAssemblyGroup,
  createHighwayInfrastructure,
  createMortalityBarsGroup,
  createMotorcycleGroup,
} from './proceduralModels';
import {
  createAsphaltAlbedoTexture,
  createAsphaltBumpTexture,
  createAsphaltRoughnessTexture,
  createRadialShadowTexture,
} from './proceduralTextures';

export interface SceneControlState {
  scrollProgress: number;
  explodeFactor: number;
  selectedHardwareId: string;
  hardwareRevision: HardwareRevision;
  smdFlipped: boolean;
  potholeSimActive: boolean;
  cellularDropped: boolean;
  crashCanceled: boolean;
  showPotholeRibbon: boolean;
}

const _camPosTarget = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.0, 2.0);
const _tmpVecA = new THREE.Vector3();
const _tmpVecB = new THREE.Vector3();
const _colorTmp = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export class RamsSceneController {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private cinemaPass: ShaderPass | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;

  private state: SceneControlState = {
    scrollProgress: 0,
    explodeFactor: 0.45,
    selectedHardwareId: 'smartphone',
    hardwareRevision: 'tht',
    smdFlipped: false,
    potholeSimActive: false,
    cellularDropped: false,
    crashCanceled: false,
    showPotholeRibbon: true,
  };

  private smoothedProgress = 0;
  private smoothedExplode = 0.45;
  private smoothedRollRad = 0;
  private impactTrauma = 0;
  private wasCrashBeat = false;
  private prevProgress = 0;
  private elapsedTime = 0;
  private cruiseSpeed = 0;
  private roadScrollZ = 0;
  private prevAmbZ = -34;
  private lastTickTime = performance.now();
  private pointerX = 0;
  private pointerY = 0;
  private dragYaw = 0;
  private dragPitch = 0;
  private isDragging = false;
  private lastDragX = 0;
  private lastDragY = 0;

  private loadCustomThtGlbFn: ((url: string) => void) | null = null;
  private disposables: Array<() => void> = [];
  private envMapTexture: THREE.Texture | null = null;

  constructor(container: HTMLElement, onContextLostChange?: (lost: boolean) => void) {
    this.container = container;
    this.isSoftwareGl = detectSoftwareWebGL();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.setAttribute('data-testid', 'rams-webgl-canvas');
    container.appendChild(canvas);

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      onContextLostChange?.(true);
    });
    canvas.addEventListener('webglcontextrestored', () => {
      onContextLostChange?.(false);
    });

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0b1526, 0.0115);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 250);
    this.camera.position.set(...PRESENTATION_BEATS[0].camera.position);
    _currentLookAt.set(...PRESENTATION_BEATS[0].camera.target);
    this.camera.lookAt(_currentLookAt);

    this.envMapTexture = createStudioEnvironmentTexture(this.renderer);
    this.scene.environment = this.envMapTexture;
    this.scene.environmentIntensity = 1.25;

    this.setupLighting();
    const actors = this.buildWorld();

    if (!this.isSoftwareGl) {
      const composer = new EffectComposer(this.renderer);
      composer.setSize(width, height);
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      composer.addPass(new RenderPass(this.scene, this.camera));

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2))),
        0.38,
        0.45,
        0.82
      );
      composer.addPass(bloomPass);
      const cinemaPass = new ShaderPass(HiggsfieldCinemaShader);
      composer.addPass(cinemaPass);
      composer.addPass(new OutputPass());

      this.composer = composer;
      this.bloomPass = bloomPass;
      this.cinemaPass = cinemaPass;
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindInputEvents(canvas);
    this.startLoop(actors);
  }

  public updateState(next: Partial<SceneControlState>) {
    this.state = { ...this.state, ...next };
  }

  public setScrollProgress(scrollProgress: number) {
    this.state.scrollProgress = scrollProgress;
  }

  public loadCustomThtGlb(url: string) {
    this.loadCustomThtGlbFn?.(url);
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0x88b8ff, 0x101724, 0.9);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffead2, 2.45);
    keyLight.position.set(16, 26, 14);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 85;
    keyLight.shadow.camera.left = -28;
    keyLight.shadow.camera.right = 28;
    keyLight.shadow.camera.top = 28;
    keyLight.shadow.camera.bottom = -28;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
    rimLight.position.set(-18, 13, -24);
    this.scene.add(rimLight);
  }

  private buildWorld() {
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const shadowTex = createRadialShadowTexture();
    const asphaltAlbedo = createAsphaltAlbedoTexture(maxAnisotropy);
    const asphaltRoughness = createAsphaltRoughnessTexture(maxAnisotropy);
    const asphaltBump = createAsphaltBumpTexture(maxAnisotropy);

    const skyDome = createAtmosphericSkyDome();
    this.scene.add(skyDome.mesh);

    const terrain = createSculptedTerrainMesh(this.isSoftwareGl);
    this.scene.add(terrain.mesh);

    // Wet storm-slicked 2-lane highway with puddle specular roughness mask
    const roadGeo = new THREE.PlaneGeometry(10.6, 168);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: asphaltAlbedo,
      roughnessMap: asphaltRoughness,
      bumpMap: asphaltBump,
      bumpScale: 0.04,
      roughness: 0.92,
      metalness: 0.24,
      envMapIntensity: 1.45,
    });
    const roadShaderControl = enhanceAsphaltMaterial(roadMat);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.0, -32);
    road.receiveShadow = true;
    this.scene.add(road);

    const infra = createHighwayInfrastructure(this.scene, this.isSoftwareGl);

    const particles = createTelemetryParticleSystem(this.isSoftwareGl ? 520 : 1650);
    this.scene.add(particles.points);

    const motorcycle = createMotorcycleGroup(shadowTex);
    motorcycle.group.position.set(0, 0, 2);
    this.scene.add(motorcycle.group);

    // Warm motorcycle headlamp splash light (unshadowed, fast)
    const motoHeadLight = new THREE.PointLight(0xfff1cc, 6.5, 11, 1.6);
    motoHeadLight.position.set(0, 1.0, -0.5);
    this.scene.add(motoHeadLight);

    const cellTowers = (
      [
        [15.4, terrainHeightAt(15.4, -16) - 0.12, -16],
        [15.8, terrainHeightAt(15.8, -34) - 0.12, -34],
        [-15.6, terrainHeightAt(-15.6, -24) - 0.12, -24],
      ] as [number, number, number][]
    ).map(([xPos, yPos, zPos]) => {
      const tower = createCellTowerGroup();
      tower.group.position.set(xPos, yPos, zPos);
      this.scene.add(tower.group);
      return tower;
    });

    const mortalityBars = createMortalityBarsGroup();
    mortalityBars.group.position.set(2.8, 2.35, -22.5);
    mortalityBars.group.rotation.y = -0.22;
    this.scene.add(mortalityBars.group);

    // Beat 04: Elevated Dual-Revision Hardware Showcase + RAMS AI Core
    const hardware = createHardwareAssemblyGroup(maxAnisotropy);
    hardware.root.position.set(3.45, 10.25, 0.0);
    hardware.root.scale.setScalar(1.0);
    this.scene.add(hardware.root);
    this.loadCustomThtGlbFn = hardware.loadCustomThtGlb;

    const hwKeyLight = new THREE.PointLight(0xfff4e0, 18, 18, 1.3);
    hwKeyLight.position.set(2.8, 12.8, 4.6);
    this.scene.add(hwKeyLight);

    const hwRimLight = new THREE.PointLight(0x38bdf8, 11, 16, 1.3);
    hwRimLight.position.set(2.0, 8.8, -3.6);
    this.scene.add(hwRimLight);

    // Beat 06: 3D Acceleration Magnitude Ribbons
    const crashValues = generateCrashTrace(140).map((s) => s.accelG);
    const potholeValues = generatePotholeTrace(140).map((s) => s.accelG);
    const crashRibbon = createTelemetryRibbonMesh(crashValues, 9.5, false);
    crashRibbon.mesh.position.set(1.2, 0.55, -6.0);
    crashRibbon.mesh.rotation.y = Math.PI / 2;
    this.scene.add(crashRibbon.mesh);

    const potholeRibbon = createTelemetryRibbonMesh(potholeValues, 9.5, true);
    potholeRibbon.mesh.position.set(2.4, 0.55, -6.0);
    potholeRibbon.mesh.rotation.y = Math.PI / 2;
    this.scene.add(potholeRibbon.mesh);

    const voiceHaloMat = createRfWavefrontMaterial(0x2dd4bf);
    const voiceHaloPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8.5, 8.5).rotateX(-Math.PI / 2),
      voiceHaloMat
    );
    voiceHaloPlane.position.set(0, 0.045, -6.0);
    this.scene.add(voiceHaloPlane);

    // Beat 07: ESP32-S3 Base Station + LoRa 433 MHz Packet Arc + Expanding Wavefront Rings
    const baseStation = createBaseStationGroup(shadowTex);
    baseStation.group.position.set(7.5, 0, -24);
    this.scene.add(baseStation.group);

    const loraArcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.15, -6.0),
      new THREE.Vector3(3.8, 7.6, -14.5),
      new THREE.Vector3(7.5, 5.1, -24.0),
    ]);
    const loraArcMat = createPacketArcMaterial(0x10b981);
    const loraArcMesh = new THREE.Mesh(
      new THREE.TubeGeometry(loraArcCurve, 48, 0.14, 10, false),
      loraArcMat
    );
    this.scene.add(loraArcMesh);

    const crashWaveMat = createRfWavefrontMaterial(0xef4444);
    const crashWavePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2),
      crashWaveMat
    );
    crashWavePlane.position.set(0, 0.03, -6.0);
    this.scene.add(crashWavePlane);

    const baseWaveMat = createRfWavefrontMaterial(0x10b981);
    const baseWavePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2),
      baseWaveMat
    );
    baseWavePlane.position.set(7.5, 0.03, -24.0);
    this.scene.add(baseWavePlane);

    // Beat 07–08: Emergency Sprinter Ambulance + Strobe Light
    const ambulance = createAmbulanceGroup(shadowTex);
    ambulance.group.position.set(1.6, 0, -34);
    ambulance.group.rotation.y = Math.PI;
    this.scene.add(ambulance.group);

    const ambStrobeLight = new THREE.PointLight(0xff2b3a, 10, 14, 1.5);
    ambStrobeLight.position.set(1.6, 2.8, -16.5);
    this.scene.add(ambStrobeLight);

    this.disposables.push(() => {
      skyDome.dispose();
      terrain.dispose();
      asphaltAlbedo.dispose();
      asphaltRoughness.dispose();
      asphaltBump.dispose();
      shadowTex.dispose();
      particles.dispose();
      hardware.dispose();
      crashRibbon.dispose();
      potholeRibbon.dispose();
      voiceHaloMat.dispose();
      loraArcMat.dispose();
      crashWaveMat.dispose();
      baseWaveMat.dispose();
    });

    return {
      skyDome,
      roadShaderControl,
      infra,
      asphaltAlbedo,
      asphaltRoughness,
      asphaltBump,
      particles,
      motorcycle,
      motoHeadLight,
      cellTowers,
      mortalityBars,
      hardware,
      crashRibbon,
      potholeRibbon,
      voiceHaloMat,
      baseStation,
      loraArcMesh,
      loraArcMat,
      crashWaveMat,
      baseWaveMat,
      ambulance,
      ambStrobeLight,
    };
  }

  private bindInputEvents(canvas: HTMLCanvasElement) {
    const onResize = () => {
      if (this.disposed) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      if (this.composer) {
        this.composer.setSize(w, h);
      }
      if (this.bloomPass) {
        this.bloomPass.resolution.set(
          Math.max(1, Math.floor(w / 2)),
          Math.max(1, Math.floor(h / 2))
        );
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      if (this.isDragging) {
        const dx = e.clientX - this.lastDragX;
        const dy = e.clientY - this.lastDragY;
        this.lastDragX = e.clientX;
        this.lastDragY = e.clientY;
        this.dragYaw = THREE.MathUtils.clamp(this.dragYaw - dx * 0.005, -1.55, 1.55);
        this.dragPitch = THREE.MathUtils.clamp(this.dragPitch - dy * 0.0035, -0.42, 0.48);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    window.addEventListener('resize', onResize);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    this.disposables.push(() => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    });
  }

  private startLoop(actors: ReturnType<RamsSceneController['buildWorld']>) {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (status === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 4);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 24);
        }
      };
      this.frameId = window.setTimeout(poll, 4);
    };

    const tick = () => {
      if (this.disposed) return;

      const now = performance.now();
      const rawDt = (now - this.lastTickTime) / 1000;
      const dt = Math.min(this.isSoftwareGl ? 0.25 : 0.05, Math.max(0.001, rawDt));
      this.lastTickTime = now;
      this.elapsedTime += dt;

      const progressGap = Math.abs(this.state.scrollProgress - this.smoothedProgress);
      if (progressGap > 0.16) {
        this.smoothedProgress = this.isSoftwareGl
          ? this.state.scrollProgress
          : THREE.MathUtils.lerp(this.smoothedProgress, this.state.scrollProgress, 0.8);
      }
      const progressLambda = this.isSoftwareGl ? 32.0 : 12.0;
      this.smoothedProgress = THREE.MathUtils.damp(
        this.smoothedProgress,
        this.state.scrollProgress,
        progressLambda,
        dt
      );
      this.smoothedExplode = THREE.MathUtils.damp(
        this.smoothedExplode,
        this.state.explodeFactor,
        9.0,
        dt
      );

      if (!this.isDragging) {
        const dragDecay =
          this.smoothedProgress >= 0.24 && this.smoothedProgress <= 0.62 ? 1.15 : 2.5;
        this.dragYaw = THREE.MathUtils.damp(this.dragYaw, 0, dragDecay, dt);
        this.dragPitch = THREE.MathUtils.damp(this.dragPitch, 0, dragDecay, dt);
      }

      const scrollVel = (this.smoothedProgress - this.prevProgress) / dt;
      this.prevProgress = this.smoothedProgress;

      const interp = getBeatFromProgress(this.smoothedProgress, PRESENTATION_BEATS.length);
      const beatA = PRESENTATION_BEATS[interp.beatIndex];
      const beatB = PRESENTATION_BEATS[interp.nextBeatIndex];

      _tmpVecA.set(...beatA.camera.position);
      _tmpVecB.set(...beatB.camera.position);
      _camPosTarget.lerpVectors(_tmpVecA, _tmpVecB, interp.easedT);

      // Gentle optical cinema breathing + pointer parallax + user drag
      const breathX = Math.sin(this.elapsedTime * 0.65) * 0.04;
      const breathY = Math.cos(this.elapsedTime * 0.48) * 0.028;
      _camPosTarget.x += this.pointerX * 0.28 + Math.sin(this.dragYaw) * 2.1 + breathX;
      _camPosTarget.y += -this.pointerY * 0.18 + this.dragPitch * 2.1 + breathY;

      _tmpVecA.set(...beatA.camera.target);
      _tmpVecB.set(...beatB.camera.target);
      _camLookTarget.lerpVectors(_tmpVecA, _tmpVecB, interp.easedT);

      const isColdCruise = this.smoothedProgress < 0.095;
      const isRidingBeat = this.smoothedProgress >= 0.45 && this.smoothedProgress < 0.68;
      const isCrashBeat = this.smoothedProgress >= 0.66 && !this.state.crashCanceled;
      const isRescueBeat = this.smoothedProgress >= 0.78;
      const isHotspotBeat = this.smoothedProgress >= 0.72;
      const isCruising =
        isColdCruise ||
        (this.smoothedProgress >= 0.45 && this.smoothedProgress < 0.665) ||
        (this.smoothedProgress >= 0.66 && this.state.crashCanceled);

      if (isCrashBeat && !this.wasCrashBeat) {
        this.impactTrauma = 1.0;
      }
      this.wasCrashBeat = isCrashBeat;
      this.impactTrauma = Math.max(0, this.impactTrauma - dt * 1.45);

      const shakeAmp = this.impactTrauma * this.impactTrauma * 0.085;
      const camLambda = this.isSoftwareGl ? 48.0 : 9.0;
      if (this.isSoftwareGl && progressGap > 0.12) {
        this.camera.position.copy(_camPosTarget);
        _currentLookAt.copy(_camLookTarget);
      } else {
        this.camera.position.x =
          THREE.MathUtils.damp(this.camera.position.x, _camPosTarget.x, camLambda, dt) +
          Math.sin(this.elapsedTime * 42.0) * shakeAmp;
        this.camera.position.y =
          THREE.MathUtils.damp(this.camera.position.y, _camPosTarget.y, camLambda, dt) +
          Math.cos(this.elapsedTime * 37.0) * shakeAmp;
        this.camera.position.z = THREE.MathUtils.damp(
          this.camera.position.z,
          _camPosTarget.z,
          camLambda,
          dt
        );

        _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _camLookTarget.x, camLambda, dt);
        _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _camLookTarget.y, camLambda, dt);
        _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _camLookTarget.z, camLambda, dt);
      }
      this.camera.lookAt(_currentLookAt);

      // Apply Higgsfield Cinema optical Dutch roll around camera viewing axis
      const targetRollRad = THREE.MathUtils.degToRad(
        THREE.MathUtils.lerp(beatA.camera.rollDeg, beatB.camera.rollDeg, interp.easedT)
      );
      this.smoothedRollRad = THREE.MathUtils.damp(this.smoothedRollRad, targetRollRad, 6.5, dt);
      if (Math.abs(this.smoothedRollRad) > 0.0002) {
        this.camera.rotateZ(this.smoothedRollRad);
      }

      const targetFov = THREE.MathUtils.lerp(beatA.camera.fov, beatB.camera.fov, interp.easedT);
      if (Math.abs(this.camera.fov - targetFov) > 0.02) {
        this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 7.0, dt);
        this.camera.updateProjectionMatrix();
      }

      if (this.cinemaPass) {
        const targetImpactMix = isCrashBeat ? 0.55 + this.impactTrauma * 0.45 : 0.0;
        this.cinemaPass.uniforms.uImpactMix.value = THREE.MathUtils.damp(
          this.cinemaPass.uniforms.uImpactMix.value,
          targetImpactMix,
          6.0,
          dt
        );
        this.cinemaPass.uniforms.uTime.value = this.elapsedTime;
      }

      const zR = THREE.MathUtils.lerp(beatA.skyZenith[0], beatB.skyZenith[0], interp.easedT);
      const zG = THREE.MathUtils.lerp(beatA.skyZenith[1], beatB.skyZenith[1], interp.easedT);
      const zB = THREE.MathUtils.lerp(beatA.skyZenith[2], beatB.skyZenith[2], interp.easedT);
      const hR = THREE.MathUtils.lerp(beatA.skyHorizon[0], beatB.skyHorizon[0], interp.easedT);
      const hG = THREE.MathUtils.lerp(beatA.skyHorizon[1], beatB.skyHorizon[1], interp.easedT);
      const hB = THREE.MathUtils.lerp(beatA.skyHorizon[2], beatB.skyHorizon[2], interp.easedT);
      actors.skyDome.update(this.elapsedTime, [zR, zG, zB], [hR, hG, hB]);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setRGB(hR * 0.68, hG * 0.7, hB * 0.78);
      }

      // Fluid Highway Motion: wheel spin, suspension heave, rider head movement, & scrolling belt
      const targetSpeed = isCrashBeat ? 0 : isCruising ? 13.5 : 0;
      this.cruiseSpeed = THREE.MathUtils.damp(
        this.cruiseSpeed,
        targetSpeed,
        isCrashBeat ? 10.0 : 3.2,
        dt
      );
      this.roadScrollZ += this.cruiseSpeed * dt;

      const targetMotoZ = this.smoothedProgress < 0.55 ? 2.0 : -6.0;
      actors.motorcycle.group.position.z = THREE.MathUtils.damp(
        actors.motorcycle.group.position.z,
        targetMotoZ,
        5.0,
        dt
      );
      actors.motoHeadLight.position.z = actors.motorcycle.group.position.z - 2.4;

      const speedNorm = THREE.MathUtils.clamp(this.cruiseSpeed / 13.5, 0, 1);
      const suspensionHeave =
        speedNorm > 0.04 ? Math.sin(this.elapsedTime * 8.4) * 0.016 * speedNorm : 0;
      const potholeBounce =
        this.state.potholeSimActive && isRidingBeat
          ? Math.abs(Math.sin(this.elapsedTime * 16.0)) * 0.28
          : 0;
      actors.motorcycle.group.position.y = suspensionHeave + potholeBounce;

      const roadWeave =
        speedNorm > 0.05 && !isCrashBeat ? Math.sin(this.elapsedTime * 1.15) * 0.045 * speedNorm : 0;
      actors.motorcycle.group.rotation.y = THREE.MathUtils.damp(
        actors.motorcycle.group.rotation.y,
        roadWeave * 0.5,
        5.0,
        dt
      );

      const targetLean = isCrashBeat
        ? -1.12
        : this.state.potholeSimActive
        ? 0.08
        : roadWeave;
      actors.motorcycle.leanPivot.rotation.z = THREE.MathUtils.damp(
        actors.motorcycle.leanPivot.rotation.z,
        targetLean,
        6.0,
        dt
      );

      if (this.cruiseSpeed > 0.05) {
        const wheelSpinStep = (this.cruiseSpeed / 0.39) * dt;
        for (const wheelPivot of actors.motorcycle.wheelPivots) {
          wheelPivot.rotation.x -= wheelSpinStep;
        }
        const distStep = this.cruiseSpeed * dt;
        actors.asphaltAlbedo.offset.y -= distStep / 8.4;
        actors.asphaltRoughness.offset.y -= distStep / 10.5;
        actors.asphaltBump.offset.y -= distStep / 5.6;
      }
      actors.infra.updateRoadScroll(this.roadScrollZ);

      const riderBones = actors.motorcycle.getRiderBones();
      if (riderBones) {
        if (riderBones.spine2) {
          riderBones.spine2.rotation.x = 0.26 + Math.sin(this.elapsedTime * 2.1) * 0.016;
        }
        if (riderBones.head) {
          riderBones.head.rotation.y = isCrashBeat
            ? 0.34
            : Math.sin(this.elapsedTime * 0.72) * 0.11 * (0.4 + 0.6 * speedNorm);
          riderBones.head.rotation.x = isCrashBeat
            ? 0.22
            : -0.14 + Math.cos(this.elapsedTime * 1.35) * 0.025;
        }
      }

      const beaconMat = actors.motorcycle.beaconLed.material as THREE.MeshBasicMaterial;
      if (isCrashBeat) {
        beaconMat.color.setHex(0xef4444);
      } else if (this.state.potholeSimActive) {
        beaconMat.color.setHex(0xf59e0b);
      } else {
        beaconMat.color.setHex(0x10b981);
      }

      // Beat 04 Dual-Revision Hardware Showcase (Self-Fabricated THT vs Astra Custom SMD + Flip)
      const showHardware = this.smoothedProgress >= 0.24 && this.smoothedProgress <= 0.62;
      actors.hardware.root.visible = showHardware;
      actors.hardware.thtGroup.visible = this.state.hardwareRevision === 'tht';
      actors.hardware.smdGroup.visible = this.state.hardwareRevision === 'smd';

      const targetFlipYaw = this.state.smdFlipped ? Math.PI : 0;
      if (this.isSoftwareGl) {
        actors.hardware.smdFlipPivot.rotation.y = targetFlipYaw;
      } else {
        actors.hardware.smdFlipPivot.rotation.y = THREE.MathUtils.damp(
          actors.hardware.smdFlipPivot.rotation.y,
          targetFlipYaw,
          9.5,
          dt
        );
      }

      actors.hardware.root.rotation.y =
        Math.sin(this.elapsedTime * 0.42) * 0.2 - this.dragYaw * 0.85;
      actors.hardware.root.rotation.x = this.dragPitch * 0.48;
      actors.hardware.aiCoreMesh.rotation.y += dt * 0.55;
      actors.hardware.aiCoreMesh.rotation.x += dt * 0.32;
      actors.hardware.aiRingA.rotation.z += dt * 0.85;
      actors.hardware.aiRingB.rotation.x -= dt * 0.65;

      let activeMod: (typeof actors.hardware.modules)[number] | null = null;
      for (const mod of actors.hardware.modules) {
        if (mod.revision !== 'shared' && mod.revision !== this.state.hardwareRevision) {
          continue;
        }
        const isSelected = mod.id === this.state.selectedHardwareId;
        if (isSelected) activeMod = mod;
        _tmpVecA.copy(mod.basePos).addScaledVector(mod.explodeOffset, this.smoothedExplode);
        if (isSelected) {
          _tmpVecA.z += 0.32;
          _tmpVecA.y += 0.1 + Math.sin(this.elapsedTime * 2.2) * 0.03;
        }
        mod.group.position.lerp(_tmpVecA, 1 - Math.exp(-8 * dt));
        const targetScale = isSelected ? 1.09 : 0.98;
        const nextScale = THREE.MathUtils.damp(mod.group.scale.x, targetScale, 8.0, dt);
        mod.group.scale.setScalar(nextScale);
      }

      if (showHardware && activeMod) {
        actors.hardware.focusHalo.visible = true;
        _tmpVecA.set(0, 0, 0);
        activeMod.group.updateMatrixWorld(true);
        activeMod.group.localToWorld(_tmpVecA);
        actors.hardware.root.worldToLocal(_tmpVecA);
        _tmpVecA.z -= 0.18;
        actors.hardware.focusHalo.position.lerp(_tmpVecA, 1 - Math.exp(-12 * dt));
        actors.hardware.focusHalo.lookAt(this.camera.position);
        const baseHaloScale = activeMod.id === 'smartphone' ? 2.15 : 1.25;
        actors.hardware.focusHalo.scale.setScalar(
          baseHaloScale + Math.sin(this.elapsedTime * 3.2) * 0.06
        );
      } else {
        actors.hardware.focusHalo.visible = false;
      }

      actors.hardware.bleArcMat.uniforms.uTime.value = this.elapsedTime;

      const showBars = this.smoothedProgress >= 0.18 && this.smoothedProgress <= 0.37;
      actors.mortalityBars.group.visible = showBars;
      const barFactor = showBars ? 1.0 : 0.05;
      actors.mortalityBars.bar2011.scale.y = THREE.MathUtils.damp(
        actors.mortalityBars.bar2011.scale.y,
        3.2 * barFactor,
        5.0,
        dt
      );
      actors.mortalityBars.bar2021.scale.y = THREE.MathUtils.damp(
        actors.mortalityBars.bar2021.scale.y,
        4.45 * barFactor,
        5.0,
        dt
      );
      actors.mortalityBars.motoSlice.scale.y = THREE.MathUtils.damp(
        actors.mortalityBars.motoSlice.scale.y,
        2.4 * barFactor,
        5.0,
        dt
      );

      const towerColor =
        this.state.cellularDropped || this.smoothedProgress > 0.1 ? 0xef4444 : 0x38bdf8;
      const showLandmarks = !isColdCruise && !isRidingBeat;
      for (const ct of actors.cellTowers) {
        ct.group.visible = showLandmarks;
        (ct.statusRing.material as THREE.MeshBasicMaterial).color.setHex(towerColor);
      }
      actors.baseStation.group.visible = this.smoothedProgress >= 0.64;

      actors.infra.conesGroup.visible = this.smoothedProgress >= 0.56;

      const ribbonOpacity =
        this.smoothedProgress >= 0.62 && this.smoothedProgress <= 0.88 ? 1.0 : 0.0;
      actors.crashRibbon.material.uniforms.uTime.value = this.elapsedTime;
      actors.crashRibbon.material.uniforms.uOpacity.value = THREE.MathUtils.damp(
        actors.crashRibbon.material.uniforms.uOpacity.value,
        ribbonOpacity,
        6.0,
        dt
      );
      actors.crashRibbon.mesh.visible = actors.crashRibbon.material.uniforms.uOpacity.value > 0.02;

      actors.potholeRibbon.material.uniforms.uTime.value = this.elapsedTime;
      actors.potholeRibbon.material.uniforms.uOpacity.value = THREE.MathUtils.damp(
        actors.potholeRibbon.material.uniforms.uOpacity.value,
        this.state.showPotholeRibbon ? ribbonOpacity * 0.72 : 0.0,
        6.0,
        dt
      );
      actors.potholeRibbon.mesh.visible = actors.potholeRibbon.material.uniforms.uOpacity.value > 0.02;

      const voiceHaloTarget =
        this.smoothedProgress >= 0.48 && this.smoothedProgress <= 0.78
          ? this.state.crashCanceled
            ? 0.95
            : 0.45
          : 0.0;
      actors.voiceHaloMat.uniforms.uTime.value = this.elapsedTime;
      actors.voiceHaloMat.uniforms.uOpacity.value = THREE.MathUtils.damp(
        actors.voiceHaloMat.uniforms.uOpacity.value,
        voiceHaloTarget,
        6.0,
        dt
      );

      const loraOpacity = isRescueBeat ? 1.0 : 0.0;
      actors.loraArcMat.uniforms.uTime.value = this.elapsedTime;
      actors.loraArcMat.uniforms.uOpacity.value = THREE.MathUtils.damp(
        actors.loraArcMat.uniforms.uOpacity.value,
        loraOpacity,
        6.0,
        dt
      );
      actors.loraArcMesh.visible = actors.loraArcMat.uniforms.uOpacity.value > 0.02;

      actors.crashWaveMat.uniforms.uTime.value = this.elapsedTime;
      actors.crashWaveMat.uniforms.uOpacity.value = THREE.MathUtils.damp(
        actors.crashWaveMat.uniforms.uOpacity.value,
        isCrashBeat ? 0.9 : 0.0,
        6.0,
        dt
      );
      actors.baseWaveMat.uniforms.uTime.value = this.elapsedTime;
      actors.baseWaveMat.uniforms.uOpacity.value = THREE.MathUtils.damp(
        actors.baseWaveMat.uniforms.uOpacity.value,
        loraOpacity,
        6.0,
        dt
      );

      actors.ambulance.group.visible = this.smoothedProgress >= 0.7;
      const targetAmbZ = this.smoothedProgress >= 0.92 ? -12.8 : isRescueBeat ? -16.5 : -34.0;
      actors.ambulance.group.position.z = THREE.MathUtils.damp(
        actors.ambulance.group.position.z,
        targetAmbZ,
        2.6,
        dt
      );
      const ambDeltaZ = actors.ambulance.group.position.z - this.prevAmbZ;
      this.prevAmbZ = actors.ambulance.group.position.z;
      const ambSpeed = ambDeltaZ / dt;
      if (Math.abs(ambDeltaZ) > 0.0005) {
        const ambWheelStep = ambDeltaZ / 0.42;
        for (const wheel of actors.ambulance.wheels) {
          wheel.rotation.x -= ambWheelStep;
        }
      }
      actors.ambulance.group.rotation.x = THREE.MathUtils.damp(
        actors.ambulance.group.rotation.x,
        Math.abs(ambSpeed) > 0.35 ? -0.024 : 0,
        8.0,
        dt
      );

      const flash = Math.sin(this.elapsedTime * 10.0) > 0;
      (actors.ambulance.redBar.material as THREE.MeshBasicMaterial).color.setHex(
        flash ? 0xff2b3a : 0x450a0a
      );
      (actors.ambulance.blueBar.material as THREE.MeshBasicMaterial).color.setHex(
        flash ? 0x0c2440 : 0x38bdf8
      );
      actors.ambStrobeLight.intensity = actors.ambulance.group.visible ? 12 : 0;
      actors.ambStrobeLight.position.z = actors.ambulance.group.position.z;
      actors.ambStrobeLight.color.setHex(flash ? 0xff2b3a : 0x38bdf8);

      _colorTmp.setRGB(
        THREE.MathUtils.lerp(beatA.particleHue[0], beatB.particleHue[0], interp.easedT),
        THREE.MathUtils.lerp(beatA.particleHue[1], beatB.particleHue[1], interp.easedT),
        THREE.MathUtils.lerp(beatA.particleHue[2], beatB.particleHue[2], interp.easedT)
      );
      actors.particles.update(this.elapsedTime, scrollVel, [
        _colorTmp.r,
        _colorTmp.g,
        _colorTmp.b,
      ]);
      actors.roadShaderControl.update(
        this.elapsedTime,
        isCrashBeat ? 1.0 : 0.0,
        isHotspotBeat ? 1.0 : 0.0,
        actors.ambulance.group.position.z,
        flash ? 1.0 : 0.0,
        actors.motorcycle.group.position.z,
        this.roadScrollZ
      );

      if (this.composer && !this.isSoftwareGl) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.disposables.forEach((fn) => fn());
    this.composer?.dispose();
    this.envMapTexture?.dispose();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
