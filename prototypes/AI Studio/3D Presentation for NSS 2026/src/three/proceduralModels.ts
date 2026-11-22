import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  createConcreteTexture,
  createPcbSilkscreenTexture,
  createPhoneTelemetryTexture,
  createRealSmdPcbTextureSet,
  createSolarPanelTexture,
  createThtCarrierPcbTextures,
} from './proceduralTextures';
import {
  createHeadlightBeamMaterial,
  createPacketArcMaterial,
  createVolumetricLightConeMaterial,
  terrainHeightAt,
} from './customShaders';
import {
  buildArticulatedRiderOnBike,
  loadGlbTemplate,
  mountHardwareBoardGlb,
  normalizeGlbGroup,
  RiderBoneRefs,
} from './gltfLoaderUtils';

/**
 * Hardware 3D Model Registry:
 * - astraSmd: Real CAD .glb converted from Astra's RAMS_JLC_S3_3D.step (42 x 32 mm).
 * - selfFabricatedTht: Drop your future THT PCB model at `/public/assets/hardware/prototype_tht_pcb.glb`
 *   and set this path (or pass it at runtime via loadCustomThtGlb) to replace the built-in THT board cleanly.
 */
export const HARDWARE_GLB_SLOTS = {
  astraSmd: '/assets/hardware/astra_smd_pcb.glb',
  selfFabricatedTht: null as string | null,
};

function loadRa02ModelTemplate(): Promise<THREE.Group> {
  return loadGlbTemplate('/assets/hardware/Ra02.glb');
}

function mountRealRa02IntoGroup(
  container: THREE.Group,
  fallbackGroup: THREE.Group,
  targetWidth: number,
  orientX: number,
  orientZ: number,
  isDisposedFn: () => boolean
) {
  loadRa02ModelTemplate()
    .then((template) => {
      if (isDisposedFn()) return;
      const clone = template.clone(true);
      clone.rotation.set(orientX, 0, orientZ);
      clone.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxPlanar = Math.max(size.x, size.y, 0.0001);
      const scale = targetWidth / maxPlanar;
      clone.scale.setScalar(scale);
      clone.updateMatrixWorld(true);

      const scaledBox = new THREE.Box3().setFromObject(clone);
      const scaledCenter = new THREE.Vector3();
      scaledBox.getCenter(scaledCenter);

      clone.position.x -= scaledCenter.x;
      clone.position.y -= scaledCenter.y;
      clone.position.z -= scaledBox.min.z - 0.015;

      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.castShadow = true;
          if (m.material) {
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            mats.forEach((mat) => {
              if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.25;
              }
            });
          }
        }
      });

      fallbackGroup.visible = false;
      container.add(clone);
    })
    .catch(() => {});
}

function addContactShadow(
  group: THREE.Group,
  shadowTex: THREE.Texture,
  radiusX: number,
  radiusZ: number
) {
  const geo = new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.position.y = 0.014;
  group.add(shadow);
}

function createSculptedWheel(
  outerRadius: number,
  width: number,
  tireMat: THREE.Material,
  alloyMat: THREE.Material,
  caliperMat: THREE.Material,
  includeBrakeDisc = true
): THREE.Group {
  const wheel = new THREE.Group();
  const rimR = outerRadius * 0.62;
  const halfW = width * 0.5;
  const tireProfile: THREE.Vector2[] = [
    new THREE.Vector2(rimR, -halfW * 0.72),
    new THREE.Vector2(rimR + (outerRadius - rimR) * 0.35, -halfW * 0.96),
    new THREE.Vector2(outerRadius * 0.96, -halfW * 0.78),
    new THREE.Vector2(outerRadius, -halfW * 0.25),
    new THREE.Vector2(outerRadius, halfW * 0.25),
    new THREE.Vector2(outerRadius * 0.96, halfW * 0.78),
    new THREE.Vector2(rimR + (outerRadius - rimR) * 0.35, halfW * 0.96),
    new THREE.Vector2(rimR, halfW * 0.72),
  ];
  const tireGeo = new THREE.LatheGeometry(tireProfile, 48);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, tireMat);
  tireMesh.castShadow = true;
  wheel.add(tireMesh);

  const hubGeo = new THREE.CylinderGeometry(rimR * 0.32, rimR * 0.32, width * 0.86, 28);
  hubGeo.rotateZ(Math.PI / 2);
  wheel.add(new THREE.Mesh(hubGeo, alloyMat));

  const outerLipGeo = new THREE.TorusGeometry(rimR, 0.022, 14, 48);
  outerLipGeo.rotateY(Math.PI / 2);
  for (const sx of [-halfW * 0.64, halfW * 0.64]) {
    const lip = new THREE.Mesh(outerLipGeo, alloyMat);
    lip.position.x = sx;
    wheel.add(lip);
  }

  const spokeGeo = new RoundedBoxGeometry(width * 0.22, rimR * 0.88, 0.034, 3, 0.01);
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(spokeGeo, alloyMat);
    const angle = (i / 6) * Math.PI * 2;
    spoke.position.set(0, Math.cos(angle) * rimR * 0.48, Math.sin(angle) * rimR * 0.48);
    spoke.rotation.x = angle;
    wheel.add(spoke);
  }

  if (includeBrakeDisc) {
    const rotorGeo = new THREE.RingGeometry(rimR * 0.44, rimR * 0.88, 40);
    rotorGeo.rotateY(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0xc8d4e3,
      roughness: 0.2,
      metalness: 0.94,
      side: THREE.DoubleSide,
    });
    for (const side of [-halfW * 0.78, halfW * 0.78]) {
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.position.x = side;
      wheel.add(rotor);
    }

    const caliper = new THREE.Mesh(
      new RoundedBoxGeometry(0.06, 0.12, 0.085, 3, 0.015),
      caliperMat
    );
    caliper.position.set(-halfW * 0.82, rimR * 0.68, 0.04);
    wheel.add(caliper);
  }

  return wheel;
}

/**
 * Real GLB CafeRacer Sportbike + Rigged Mixamo Rider + Helmet + RAMS Wearable Pod.
 * Extracts front & rear wheel spin pivots plus rider bone references for fluid road kinematics.
 */
export function createMotorcycleGroup(shadowTex: THREE.Texture): {
  group: THREE.Group;
  headlightSpot: THREE.Mesh;
  beaconLed: THREE.Mesh;
  leanPivot: THREE.Group;
  wheelPivots: THREE.Object3D[];
  getRiderBones: () => RiderBoneRefs | null;
} {
  const root = new THREE.Group();
  const leanPivot = new THREE.Group();
  root.add(leanPivot);

  const fallbackGroup = new THREE.Group();
  leanPivot.add(fallbackGroup);

  addContactShadow(root, shadowTex, 1.05, 1.98);

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f141e,
    roughness: 0.52,
    metalness: 0.36,
  });
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f766e,
    roughness: 0.14,
    metalness: 0.72,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    iridescence: 0.45,
    iridescenceIOR: 1.45,
  });
  const amberAccentMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.18,
    metalness: 0.88,
    clearcoat: 0.85,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0xdce6f4,
    roughness: 0.14,
    metalness: 0.95,
  });
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d12,
    roughness: 0.86,
    metalness: 0.05,
  });
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x071324,
    roughness: 0.04,
    metalness: 0.25,
    clearcoat: 1.0,
    iridescence: 0.75,
  });

  const chassisShape = new THREE.Shape();
  chassisShape.moveTo(-0.78, 0.38);
  chassisShape.bezierCurveTo(-0.35, 0.3, 0.25, 0.32, 0.46, 0.42);
  chassisShape.bezierCurveTo(0.68, 0.54, 0.88, 0.72, 0.86, 0.86);
  chassisShape.bezierCurveTo(0.66, 0.98, 0.28, 0.9, -0.1, 0.86);
  chassisShape.bezierCurveTo(-0.46, 0.84, -0.78, 0.82, -0.84, 0.68);
  chassisShape.closePath();

  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
    depth: 0.21,
    curveSegments: 32,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.045,
    bevelSegments: 7,
  });
  chassisGeo.center();
  chassisGeo.rotateY(Math.PI / 2);
  const chassisMesh = new THREE.Mesh(chassisGeo, carbonMat);
  chassisMesh.position.set(0, 0.66, 0);
  chassisMesh.castShadow = true;
  fallbackGroup.add(chassisMesh);

  const tankShape = new THREE.Shape();
  tankShape.moveTo(-0.32, 0.0);
  tankShape.bezierCurveTo(-0.18, 0.24, 0.14, 0.28, 0.34, 0.12);
  tankShape.bezierCurveTo(0.42, 0.05, 0.36, -0.08, 0.14, -0.09);
  tankShape.bezierCurveTo(-0.1, -0.1, -0.34, -0.06, -0.32, 0.0);
  const tankGeo = new THREE.ExtrudeGeometry(tankShape, {
    depth: 0.26,
    curveSegments: 32,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 8,
  });
  tankGeo.center();
  tankGeo.rotateY(Math.PI / 2);
  const tankMesh = new THREE.Mesh(tankGeo, paintMat);
  tankMesh.position.set(0, 0.96, -0.3);
  tankMesh.castShadow = true;
  fallbackGroup.add(tankMesh);

  const noseShape = new THREE.Shape();
  noseShape.moveTo(0.0, 0.0);
  noseShape.bezierCurveTo(0.24, 0.02, 0.42, 0.16, 0.46, 0.34);
  noseShape.bezierCurveTo(0.28, 0.44, 0.04, 0.42, -0.12, 0.22);
  noseShape.closePath();
  const noseGeo = new THREE.ExtrudeGeometry(noseShape, {
    depth: 0.24,
    curveSegments: 24,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.055,
    bevelSegments: 7,
  });
  noseGeo.center();
  noseGeo.rotateY(Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseGeo, paintMat);
  noseMesh.position.set(0, 0.96, -0.74);
  noseMesh.castShadow = true;
  fallbackGroup.add(noseMesh);

  const windscreen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.22, 0.36, 36, 1, true, -Math.PI * 0.38, Math.PI * 0.76),
    visorMat
  );
  windscreen.rotation.x = 0.54;
  windscreen.rotation.y = Math.PI;
  windscreen.position.set(0, 1.18, -0.76);
  fallbackGroup.add(windscreen);

  const saddle = new THREE.Mesh(
    new RoundedBoxGeometry(0.28, 0.1, 0.52, 5, 0.04),
    tireMat
  );
  saddle.position.set(0, 0.9, 0.26);
  saddle.rotation.x = -0.06;
  fallbackGroup.add(saddle);

  const tailCowl = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.14, 0.56, 5, 0.06),
    paintMat
  );
  tailCowl.position.set(0, 0.94, 0.66);
  tailCowl.rotation.x = 0.14;
  fallbackGroup.add(tailCowl);

  const tailLight = new THREE.Mesh(
    new RoundedBoxGeometry(0.19, 0.042, 0.04, 3, 0.015),
    new THREE.MeshBasicMaterial({ color: 0xff2b3a })
  );
  tailLight.position.set(0, 0.96, 0.95);
  leanPivot.add(tailLight);

  // Plate bracket & warm license light
  const plateBracket = new THREE.Mesh(
    new RoundedBoxGeometry(0.18, 0.11, 0.016, 2, 0.004),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.25 })
  );
  plateBracket.position.set(0, 0.81, 0.99);
  plateBracket.rotation.x = 0.28;
  leanPivot.add(plateBracket);

  // Subtle asphalt reflection splashes beneath front headlamp & rear taillight
  const headSplash = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 28).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xffefc2,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  headSplash.scale.set(0.85, 1, 2.2);
  headSplash.position.set(0, 0.025, -2.55);
  leanPivot.add(headSplash);

  const tailSplash = new THREE.Mesh(
    new THREE.CircleGeometry(0.65, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xff2b3a,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  tailSplash.position.set(0, 0.024, 1.35);
  leanPivot.add(tailSplash);

  const frontWheel = createSculptedWheel(0.39, 0.14, tireMat, alloyMat, amberAccentMat, true);
  frontWheel.position.set(0, 0.39, -0.94);
  fallbackGroup.add(frontWheel);

  const rearWheel = createSculptedWheel(0.39, 0.17, tireMat, alloyMat, amberAccentMat, true);
  rearWheel.position.set(0, 0.39, 0.9);
  fallbackGroup.add(rearWheel);

  const wheelPivots: THREE.Object3D[] = [frontWheel, rearWheel];
  let riderBonesRef: RiderBoneRefs | null = null;

  const haloDrls = new THREE.Mesh(
    new THREE.TorusGeometry(0.088, 0.014, 14, 36),
    new THREE.MeshBasicMaterial({ color: 0xfff5d6 })
  );
  haloDrls.position.set(0, 0.91, -0.96);
  leanPivot.add(haloDrls);

  const headLens = new THREE.Mesh(
    new THREE.SphereGeometry(0.068, 28, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  headLens.position.set(0, 0.91, -0.94);
  leanPivot.add(headLens);

  const beamLen = 7.4;
  const beamGeo = new THREE.ConeGeometry(1.28, beamLen, 36, 1, true);
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, -beamLen / 2);
  const beamMat = createHeadlightBeamMaterial();
  beamMat.uniforms.uOpacity.value = 0.24;
  const headlightSpot = new THREE.Mesh(beamGeo, beamMat);
  headlightSpot.position.set(0, 0.89, -0.98);
  headlightSpot.rotation.x = -0.09;
  leanPivot.add(headlightSpot);

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x162032,
    roughness: 0.68,
    metalness: 0.22,
  });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.38, 12, 20), jacketMat);
  torso.position.set(0, 1.25, 0.14);
  torso.rotation.x = 0.48;
  fallbackGroup.add(torso);

  // Detailed RAMS Wearable Pod (ESP32-S3 + 433 MHz LoRa stub antenna + tactile cancel + NeoPixel ring)
  const wearablePack = new THREE.Group();
  const packShell = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.19, 0.058, 4, 0.016),
    carbonMat
  );
  wearablePack.add(packShell);

  const packBezel = new THREE.Mesh(
    new RoundedBoxGeometry(0.125, 0.172, 0.012, 3, 0.008),
    alloyMat
  );
  packBezel.position.set(0, 0, 0.026);
  wearablePack.add(packBezel);

  const beaconLed = new THREE.Mesh(
    new THREE.TorusGeometry(0.032, 0.01, 12, 24),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  beaconLed.position.set(0, 0.026, 0.036);
  wearablePack.add(beaconLed);

  const cancelCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.02, 0.018, 18).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, metalness: 0.2 })
  );
  cancelCap.position.set(0, -0.042, 0.035);
  wearablePack.add(cancelCap);

  const smaFerrule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.012, 0.025, 14),
    amberAccentMat
  );
  smaFerrule.position.set(0.042, 0.105, 0);
  wearablePack.add(smaFerrule);

  const stubAntenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.009, 0.125, 12),
    tireMat
  );
  stubAntenna.position.set(0.042, 0.175, 0);
  wearablePack.add(stubAntenna);

  wearablePack.position.set(0, 1.32, 0.33);
  wearablePack.rotation.x = 0.48;
  leanPivot.add(wearablePack);

  Promise.all([
    loadGlbTemplate('/assets/models/motorcycle.glb'),
    loadGlbTemplate('/assets/models/rider.glb'),
    loadGlbTemplate('/assets/models/helmet.glb').catch(() => null),
  ])
    .then(([bikeTpl, riderTpl, helmetTpl]) => {
      const bikeModel = normalizeGlbGroup(bikeTpl, {
        targetSize: 2.15,
        axis: 'zLength',
        rotateY: 0,
        castShadow: true,
        receiveShadow: true,
        envMapIntensity: 1.5,
      });

      bikeModel.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          const updated = mats.map((mat) => {
            if (!mat) return mat;
            const n = (mat.name || '').toLowerCase();
            if (n.includes('purple')) return paintMat;
            if (n.includes('chrome')) return alloyMat;
            if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const std = mat as THREE.MeshStandardMaterial;
              std.envMapIntensity = 1.45;
              return std;
            }
            return mat;
          });
          m.material = Array.isArray(m.material) ? updated : updated[0];
        }
      });

      // Wrap front/rear wheel meshes around centered axle pivots for smooth wheel rotation
      bikeModel.updateMatrixWorld(true);
      const wheelNodes: THREE.Mesh[] = [];
      for (const grpName of ['Tires', 'TireRim', 'Spokes', 'BrakeDiscs']) {
        const g = bikeModel.getObjectByName(grpName);
        if (g) {
          g.traverse((c) => {
            if ((c as THREE.Mesh).isMesh) wheelNodes.push(c as THREE.Mesh);
          });
        }
      }

      const frontMeshes: { mesh: THREE.Mesh; center: THREE.Vector3 }[] = [];
      const rearMeshes: { mesh: THREE.Mesh; center: THREE.Vector3 }[] = [];
      const tmpBox = new THREE.Box3();
      const tmpCenter = new THREE.Vector3();

      for (const m of wheelNodes) {
        tmpBox.setFromObject(m);
        tmpBox.getCenter(tmpCenter);
        if (tmpCenter.z < 0) frontMeshes.push({ mesh: m, center: tmpCenter.clone() });
        else rearMeshes.push({ mesh: m, center: tmpCenter.clone() });
      }

      const buildAxlePivot = (entries: { mesh: THREE.Mesh; center: THREE.Vector3 }[]) => {
        if (entries.length === 0) return null;
        const avg = new THREE.Vector3();
        entries.forEach((e) => avg.add(e.center));
        avg.divideScalar(entries.length);

        const pivot = new THREE.Group();
        pivot.position.copy(avg);
        leanPivot.add(pivot);

        for (const e of entries) {
          pivot.attach(e.mesh);
        }
        return pivot;
      };

      const builtRider = buildArticulatedRiderOnBike(riderTpl, helmetTpl, wearablePack);
      riderBonesRef = builtRider.bones;

      fallbackGroup.visible = false;
      leanPivot.add(bikeModel);
      leanPivot.add(builtRider.rider);

      const fPivot = buildAxlePivot(frontMeshes);
      const rPivot = buildAxlePivot(rearMeshes);
      wheelPivots.length = 0;
      if (fPivot) wheelPivots.push(fPivot);
      if (rPivot) wheelPivots.push(rPivot);
    })
    .catch(() => {});

  return {
    group: root,
    headlightSpot,
    beaconLed,
    leanPivot,
    wheelPivots,
    getRiderBones: () => riderBonesRef,
  };
}

/**
 * Real GLB Rescue Ambulance pivoted at bottom-center (y = 0) with spinning wheels & live strobes.
 */
export function createAmbulanceGroup(shadowTex: THREE.Texture): {
  group: THREE.Group;
  redBar: THREE.Mesh;
  blueBar: THREE.Mesh;
  wheels: THREE.Object3D[];
} {
  const group = new THREE.Group();
  const fallbackAmb = new THREE.Group();
  group.add(fallbackAmb);
  const wheels: THREE.Object3D[] = [];

  addContactShadow(group, shadowTex, 1.45, 2.9);

  const pearlBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xeef3f9,
    roughness: 0.2,
    metalness: 0.16,
    clearcoat: 0.95,
    clearcoatRoughness: 0.06,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x111722,
    roughness: 0.62,
    metalness: 0.28,
  });

  const cabin = new THREE.Mesh(
    new RoundedBoxGeometry(2.04, 1.86, 2.98, 4, 0.16),
    pearlBodyMat
  );
  cabin.position.set(0, 1.32, 0.65);
  fallbackAmb.add(cabin);

  const barHousing = new THREE.Mesh(
    new RoundedBoxGeometry(1.58, 0.13, 0.35, 4, 0.05),
    trimMat
  );
  barHousing.position.set(0, 2.18, -0.68);
  group.add(barHousing);

  const redBar = new THREE.Mesh(
    new RoundedBoxGeometry(0.58, 0.13, 0.29, 4, 0.04),
    new THREE.MeshBasicMaterial({ color: 0xff2b3a })
  );
  redBar.position.set(-0.44, 2.22, -0.68);
  group.add(redBar);

  const blueBar = new THREE.Mesh(
    new RoundedBoxGeometry(0.58, 0.13, 0.29, 4, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  blueBar.position.set(0.44, 2.22, -0.68);
  group.add(blueBar);

  // Center white takedown optics + rear amber flasher strip + twin warm headlights
  const centerTakedown = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.1, 0.31, 3, 0.03),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc })
  );
  centerTakedown.position.set(0, 2.22, -0.68);
  group.add(centerTakedown);

  const rearBeacon = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.08, 0.16, 3, 0.02),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  );
  rearBeacon.position.set(0, 2.34, 1.85);
  group.add(rearBeacon);

  for (const hx of [-0.68, 0.68]) {
    const ambHead = new THREE.Mesh(
      new RoundedBoxGeometry(0.24, 0.12, 0.08, 2, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xfff5d6 })
    );
    ambHead.position.set(hx, 0.72, -2.38);
    group.add(ambHead);
  }

  loadGlbTemplate('/assets/models/ambulance.glb')
    .then((tpl) => {
      const ambModel = normalizeGlbGroup(tpl, {
        targetSize: 5.0,
        axis: 'zLength',
        rotateY: Math.PI,
        castShadow: true,
        receiveShadow: true,
        envMapIntensity: 1.35,
      });
      for (const wName of [
        'wheel-front-right',
        'wheel-front-left',
        'wheel-back-right',
        'wheel-back-left',
      ]) {
        const w = ambModel.getObjectByName(wName);
        if (w) wheels.push(w);
      }
      fallbackAmb.visible = false;
      group.add(ambModel);
    })
    .catch(() => {});

  return { group, redBar, blueBar, wheels };
}

export interface HardwareSubModule {
  id: string;
  revision: 'shared' | 'tht' | 'smd';
  group: THREE.Group;
  basePos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
}

function createAxialThtResistor(
  bandColors: [number, number, number, number],
  goldMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  const bodyProfile = [
    new THREE.Vector2(0.0, -0.15),
    new THREE.Vector2(0.055, -0.14),
    new THREE.Vector2(0.062, -0.09),
    new THREE.Vector2(0.048, -0.04),
    new THREE.Vector2(0.048, 0.04),
    new THREE.Vector2(0.062, 0.09),
    new THREE.Vector2(0.055, 0.14),
    new THREE.Vector2(0.0, 0.15),
  ];
  const bodyGeo = new THREE.LatheGeometry(bodyProfile, 24);
  bodyGeo.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0xd9c29c,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.65,
    })
  );
  g.add(body);

  const bandOffsets = [-0.085, -0.035, 0.015, 0.08];
  bandColors.forEach((hex, idx) => {
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.053, 0.053, 0.022, 20).rotateZ(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.38, metalness: 0.1 })
    );
    ring.position.x = bandOffsets[idx];
    g.add(ring);
  });

  for (const sx of [-1, 1]) {
    const leadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.15, 0, 0),
      new THREE.Vector3(sx * 0.23, 0, 0),
      new THREE.Vector3(sx * 0.24, 0, -0.12),
    ]);
    const lead = new THREE.Mesh(
      new THREE.TubeGeometry(leadCurve, 16, 0.014, 10, false),
      goldMat
    );
    g.add(lead);
  }

  return g;
}

function createProceduralRa02Fallback(
  boardTitle: string,
  shieldMat: THREE.Material,
  goldMat: THREE.Material,
  maxAnisotropy: number,
  texturesToDispose: THREE.Texture[]
): THREE.Group {
  const g = new THREE.Group();
  const tex = createPcbSilkscreenTexture(boardTitle, '#064e3b', '#059669', maxAnisotropy);
  texturesToDispose.push(tex);
  const base = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.88, 0.05, 3, 0.015),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.2 })
  );
  g.add(base);

  const can = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.58, 0.11, 3, 0.02), shieldMat);
  can.position.set(0, -0.02, 0.07);
  g.add(can);

  const ufl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.06, 0.05, 20).rotateX(Math.PI / 2),
    goldMat
  );
  ufl.position.set(0.28, 0.28, 0.055);
  g.add(ufl);

  return g;
}

/**
 * Beat 04 Dual-Revision Hardware Showcase:
 * - Left: Smartphone Sensor Hub (GPS + Motion + RAMS AI Core)
 * - Right Mode A ('tht'): Self-Fabricated Copper THT Prototype (plus seamless drop-in/custom .GLB slot)
 * - Right Mode B ('smd'): Astra Custom SMD PCB (/assets/hardware/astra_smd_pcb.glb converted from RAMS_JLC_S3_3D.step)
 */
export function createHardwareAssemblyGroup(maxAnisotropy: number): {
  root: THREE.Group;
  thtGroup: THREE.Group;
  smdGroup: THREE.Group;
  smdFlipPivot: THREE.Group;
  modules: HardwareSubModule[];
  bleArcMat: THREE.ShaderMaterial;
  aiCoreMesh: THREE.Mesh;
  aiRingA: THREE.Mesh;
  aiRingB: THREE.Mesh;
  focusHalo: THREE.Mesh;
  loadCustomThtGlb: (url: string) => void;
  dispose: () => void;
} {
  let isDisposed = false;
  const root = new THREE.Group();
  const modules: HardwareSubModule[] = [];
  const texturesToDispose: THREE.Texture[] = [];

  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0x243044,
    roughness: 0.2,
    metalness: 0.92,
    clearcoat: 0.55,
  });
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0xd4dde8,
    roughness: 0.16,
    metalness: 0.96,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.16,
    metalness: 0.94,
  });
  const copperTraceMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.24,
    metalness: 0.92,
  });
  const qfnEpoxyMat = new THREE.MeshStandardMaterial({
    color: 0x10141c,
    roughness: 0.42,
    metalness: 0.15,
  });
  const darkHeaderMat = new THREE.MeshStandardMaterial({
    color: 0x0b0f16,
    roughness: 0.65,
    metalness: 0.1,
  });

  // Glowing active-component target ring shown smoothly around selected BOM module
  const focusHaloMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.46,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const focusHalo = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.355, 48), focusHaloMat);
  root.add(focusHalo);

  // =========================================================================
  // SHARED NODE 1: SMARTPHONE SENSOR HUB
  // =========================================================================
  const phoneGroup = new THREE.Group();
  const phoneFrame = new THREE.Mesh(
    new RoundedBoxGeometry(1.06, 2.08, 0.12, 6, 0.045),
    titaniumMat
  );
  phoneGroup.add(phoneFrame);

  const phoneTex = createPhoneTelemetryTexture(maxAnisotropy);
  texturesToDispose.push(phoneTex);
  const phoneScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.92, 1.92),
    new THREE.MeshBasicMaterial({ map: phoneTex })
  );
  phoneScreen.position.z = 0.062;
  phoneGroup.add(phoneScreen);

  const camPlateau = new THREE.Mesh(
    new RoundedBoxGeometry(0.38, 0.4, 0.04, 4, 0.02),
    titaniumMat
  );
  camPlateau.position.set(-0.24, 0.72, -0.072);
  phoneGroup.add(camPlateau);

  const lensRingGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.025, 28).rotateX(Math.PI / 2);
  for (const [lx, ly] of [
    [-0.31, 0.8],
    [-0.17, 0.72],
    [-0.31, 0.64],
  ]) {
    const lens = new THREE.Mesh(lensRingGeo, shieldMat);
    lens.position.set(lx, ly, -0.092);
    phoneGroup.add(lens);
  }

  const phoneBase = new THREE.Vector3(-2.32, 0.04, 0.24);
  phoneGroup.position.copy(phoneBase);
  phoneGroup.rotation.y = 0.24;
  root.add(phoneGroup);
  modules.push({
    id: 'smartphone',
    revision: 'shared',
    group: phoneGroup,
    basePos: phoneBase.clone(),
    explodeOffset: new THREE.Vector3(-0.48, 0.14, 0.26),
  });

  // =========================================================================
  // SHARED NODE 2: RAMS AI CORE
  // =========================================================================
  const aiGroup = new THREE.Group();
  const aiCoreMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      emissiveIntensity: 0.78,
      roughness: 0.12,
      metalness: 0.25,
      clearcoat: 1.0,
      wireframe: true,
    })
  );
  aiGroup.add(aiCoreMesh);

  aiGroup.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x2dd4bf,
        emissiveIntensity: 1.45,
        roughness: 0.15,
        metalness: 0.3,
      })
    )
  );

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.85,
  });
  const aiRingA = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.016, 18, 84), ringMat);
  aiRingA.rotation.x = Math.PI / 3;
  aiGroup.add(aiRingA);

  const aiRingB = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.013, 18, 84), goldMat);
  aiRingB.rotation.y = Math.PI / 4;
  aiRingB.rotation.x = -Math.PI / 5;
  aiGroup.add(aiRingB);

  const aiBase = new THREE.Vector3(-1.02, 0.42, 0.36);
  aiGroup.position.copy(aiBase);
  root.add(aiGroup);
  modules.push({
    id: 'rams-ai',
    revision: 'shared',
    group: aiGroup,
    basePos: aiBase.clone(),
    explodeOffset: new THREE.Vector3(-0.08, 0.46, 0.42),
  });

  const bleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.68, 0.16, 0.22),
    new THREE.Vector3(-1.02, 0.42, 0.36),
    new THREE.Vector3(-0.24, 0.14, 0.12),
  ]);
  const bleArcMat = createPacketArcMaterial(0x2dd4bf);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(bleCurve, 48, 0.02, 12, false), bleArcMat));

  // =========================================================================
  // DESIGN 01: SELF-FABRICATED THT PROTOTYPE (COPPER PCB + CUSTOM .GLB SLOT)
  // =========================================================================
  const thtGroup = new THREE.Group();
  thtGroup.position.set(1.42, 0.06, 0.0);
  root.add(thtGroup);

  const thtProceduralGroup = new THREE.Group();
  thtGroup.add(thtProceduralGroup);

  const thtCustomGlbMount = new THREE.Group();
  thtGroup.add(thtCustomGlbMount);

  const loadCustomThtGlb = (url: string) => {
    while (thtCustomGlbMount.children.length > 0) {
      thtCustomGlbMount.remove(thtCustomGlbMount.children[0]);
    }
    mountHardwareBoardGlb(thtCustomGlbMount, thtProceduralGroup, url, {
      targetWidth: 3.15,
      envMapIntensity: 1.5,
      isDisposed: () => isDisposed,
    });
  };

  if (HARDWARE_GLB_SLOTS.selfFabricatedTht) {
    loadCustomThtGlb(HARDWARE_GLB_SLOTS.selfFabricatedTht);
  }

  const thtTextures = createThtCarrierPcbTextures(maxAnisotropy);
  texturesToDispose.push(thtTextures.map, thtTextures.bumpMap);

  const carrierBoard = new THREE.Mesh(
    new RoundedBoxGeometry(3.15, 2.32, 0.08, 4, 0.025),
    new THREE.MeshStandardMaterial({
      map: thtTextures.map,
      bumpMap: thtTextures.bumpMap,
      bumpScale: 0.018,
      roughness: 0.36,
      metalness: 0.24,
    })
  );
  thtProceduralGroup.add(carrierBoard);

  const standoffGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.18, 6).rotateX(Math.PI / 2);
  const screwHeadGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.032, 16).rotateX(Math.PI / 2);
  for (const [sx, sy] of [
    [-1.4, -1.0],
    [1.4, -1.0],
    [-1.4, 1.0],
    [1.4, 1.0],
  ]) {
    const st = new THREE.Mesh(standoffGeo, goldMat);
    st.position.set(sx, sy, -0.1);
    thtProceduralGroup.add(st);
    const screw = new THREE.Mesh(screwHeadGeo, shieldMat);
    screw.position.set(sx, sy, 0.055);
    thtProceduralGroup.add(screw);
  }

  // Raised wire-free copper traces + ENIG solder fillet pads across THT carrier
  const copperPaths: [number, number, number, number][] = [
    [-0.45, 0.56, 0.24, 0.56],
    [-0.45, 0.42, 0.24, 0.42],
    [-0.45, 0.28, 0.24, 0.28],
    [-0.45, 0.14, 0.24, 0.14],
    [-0.45, 0.0, 0.24, 0.0],
    [-0.84, -0.62, -0.84, -0.18],
    [-0.84, -0.46, -0.26, -0.46],
    [-0.26, -0.37, -0.26, -0.59],
    [-0.46, -0.22, 0.58, -0.22],
    [0.58, -0.22, 0.84, -0.46],
    [-0.48, -0.66, 0.28, -0.66],
  ];
  for (const [x1, y1, x2, y2] of copperPaths) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.024, 0.01), copperTraceMat);
    bar.position.set((x1 + x2) * 0.5, (y1 + y2) * 0.5, 0.043);
    bar.rotation.z = Math.atan2(dy, dx);
    thtProceduralGroup.add(bar);
  }

  // Gold solder fillets along socket rows & through-hole component legs
  const filletGeo = new THREE.SphereGeometry(0.024, 10, 8);
  const filletCoords: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const py = -0.08 + i * 0.085;
    filletCoords.push([-0.95, py], [-0.45, py]);
  }
  filletCoords.push([-0.28, -0.37], [0.2, -0.37], [-0.28, -0.59], [0.2, -0.59], [0.72, -0.56], [0.96, -0.56]);
  const solderFillets = new THREE.InstancedMesh(filletGeo, goldMat, filletCoords.length);
  const tmpSolderObj = new THREE.Object3D();
  filletCoords.forEach(([fx, fy], idx) => {
    tmpSolderObj.position.set(fx, fy, 0.046);
    tmpSolderObj.scale.set(1, 1, 0.55);
    tmpSolderObj.updateMatrix();
    solderFillets.setMatrixAt(idx, tmpSolderObj.matrix);
  });
  solderFillets.instanceMatrix.needsUpdate = true;
  solderFillets.computeBoundingSphere();
  thtProceduralGroup.add(solderFillets);

  for (const hx of [-0.95, -0.45]) {
    const socket = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.84, 0.12, 2, 0.01), darkHeaderMat);
    socket.position.set(hx, 0.26, 0.09);
    thtProceduralGroup.add(socket);
  }

  // Tactile Cancel Button (GPIO0) + WS2812B NeoPixel RGB Status Diode (GPIO48) mounted on THT carrier
  const tactileBtnBase = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.24, 0.07, 2, 0.01), shieldMat);
  tactileBtnBase.position.set(0.14, -0.84, 0.075);
  thtProceduralGroup.add(tactileBtnBase);
  const tactileBtnCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.072, 0.06, 20).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.38, metalness: 0.15 })
  );
  tactileBtnCap.position.set(0.14, -0.84, 0.12);
  thtProceduralGroup.add(tactileBtnCap);

  const thtEspGroup = new THREE.Group();
  const smTex = createPcbSilkscreenTexture('ESP32-S3 SUPERMINI', '#0b1018', '#1f2937', maxAnisotropy);
  texturesToDispose.push(smTex);
  thtEspGroup.add(
    new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 0.94, 0.055, 4, 0.018),
      new THREE.MeshStandardMaterial({ map: smTex, roughness: 0.45, metalness: 0.2 })
    )
  );
  const smShield = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.08, 3, 0.018), shieldMat);
  smShield.position.set(0, 0.14, 0.065);
  thtEspGroup.add(smShield);
  const smUsb = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.18, 0.09, 3, 0.025), shieldMat);
  smUsb.position.set(0, -0.41, 0.06);
  thtEspGroup.add(smUsb);
  // Ceramic BLE/Wi-Fi chip antenna + NeoPixel status LED on SuperMini
  const smCeramicAnt = new THREE.Mesh(
    new RoundedBoxGeometry(0.18, 0.08, 0.04, 2, 0.01),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.1 })
  );
  smCeramicAnt.position.set(0, 0.41, 0.045);
  thtEspGroup.add(smCeramicAnt);
  const smNeopixel = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.075, 0.03),
    new THREE.MeshBasicMaterial({ color: 0x2dd4bf })
  );
  smNeopixel.position.set(-0.18, -0.22, 0.042);
  thtEspGroup.add(smNeopixel);

  const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 10).rotateX(Math.PI / 2);
  const smPins = new THREE.InstancedMesh(pinGeo, goldMat, 18);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 9; i++) {
    const py = -0.34 + i * 0.085;
    dummy.position.set(-0.25, py, -0.075);
    dummy.updateMatrix();
    smPins.setMatrixAt(i * 2, dummy.matrix);
    dummy.position.set(0.25, py, -0.075);
    dummy.updateMatrix();
    smPins.setMatrixAt(i * 2 + 1, dummy.matrix);
  }
  smPins.instanceMatrix.needsUpdate = true;
  smPins.computeBoundingSphere();
  thtEspGroup.add(smPins);

  const thtEspBase = new THREE.Vector3(-0.7, 0.26, 0.22);
  thtEspGroup.position.copy(thtEspBase);
  thtProceduralGroup.add(thtEspGroup);
  modules.push({
    id: 'esp32',
    revision: 'tht',
    group: thtEspGroup,
    basePos: thtEspBase.clone(),
    explodeOffset: new THREE.Vector3(0, 0.05, 0.65),
  });

  const thtLoraGroup = new THREE.Group();
  const thtRa02Fallback = createProceduralRa02Fallback(
    'RA-02 433MHz',
    shieldMat,
    goldMat,
    maxAnisotropy,
    texturesToDispose
  );
  thtLoraGroup.add(thtRa02Fallback);
  mountRealRa02IntoGroup(thtLoraGroup, thtRa02Fallback, 0.94, Math.PI / 2, 0, () => isDisposed);

  const thtCoilPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 72; i++) {
    const t = i / 72;
    const ang = t * Math.PI * 12;
    thtCoilPts.push(
      new THREE.Vector3(0.32 + Math.cos(ang) * 0.072, 0.44 + t * 0.68, 0.07 + Math.sin(ang) * 0.072)
    );
  }
  thtLoraGroup.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(thtCoilPts), 120, 0.015, 10, false),
      goldMat
    )
  );
  const thtLoraBase = new THREE.Vector3(0.68, 0.34, 0.16);
  thtLoraGroup.position.copy(thtLoraBase);
  thtProceduralGroup.add(thtLoraGroup);
  modules.push({
    id: 'lora',
    revision: 'tht',
    group: thtLoraGroup,
    basePos: thtLoraBase.clone(),
    explodeOffset: new THREE.Vector3(0.15, 0.12, 0.72),
  });

  const thtDividerGroup = new THREE.Group();
  const r1 = createAxialThtResistor([0x78350f, 0x111827, 0xfacc15, 0xf59e0b], goldMat);
  r1.position.set(0, 0.11, 0);
  thtDividerGroup.add(r1);
  const r2 = createAxialThtResistor([0x78350f, 0x111827, 0xfacc15, 0xf59e0b], goldMat);
  r2.position.set(0, -0.11, 0);
  thtDividerGroup.add(r2);

  const thtDividerBase = new THREE.Vector3(-0.04, -0.48, 0.14);
  thtDividerGroup.position.copy(thtDividerBase);
  thtProceduralGroup.add(thtDividerGroup);
  modules.push({
    id: 'divider',
    revision: 'tht',
    group: thtDividerGroup,
    basePos: thtDividerBase.clone(),
    explodeOffset: new THREE.Vector3(0, -0.1, 0.62),
  });

  const thtBuzzerGroup = new THREE.Group();
  const buzzerProfile = [
    new THREE.Vector2(0, -0.11),
    new THREE.Vector2(0.28, -0.11),
    new THREE.Vector2(0.3, -0.08),
    new THREE.Vector2(0.3, 0.08),
    new THREE.Vector2(0.26, 0.12),
    new THREE.Vector2(0.15, 0.12),
    new THREE.Vector2(0.14, 0.07),
    new THREE.Vector2(0, 0.07),
  ];
  const buzzerShellGeo = new THREE.LatheGeometry(buzzerProfile, 44).rotateX(Math.PI / 2);
  thtBuzzerGroup.add(
    new THREE.Mesh(
      buzzerShellGeo,
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.62, metalness: 0.18 })
    )
  );
  const bzRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.022, 16, 44),
    new THREE.MeshPhysicalMaterial({ color: 0xfb7185, roughness: 0.25, metalness: 0.3, clearcoat: 0.8 })
  );
  bzRing.position.z = 0.115;
  thtBuzzerGroup.add(bzRing);
  const bzDisc = new THREE.Mesh(new THREE.CircleGeometry(0.13, 32), goldMat);
  bzDisc.position.z = 0.085;
  thtBuzzerGroup.add(bzDisc);

  const thtBuzzerBase = new THREE.Vector3(0.84, -0.56, 0.15);
  thtBuzzerGroup.position.copy(thtBuzzerBase);
  thtProceduralGroup.add(thtBuzzerGroup);
  modules.push({
    id: 'buzzer',
    revision: 'tht',
    group: thtBuzzerGroup,
    basePos: thtBuzzerBase.clone(),
    explodeOffset: new THREE.Vector3(0.18, -0.15, 0.65),
  });

  const thtBatGroup = new THREE.Group();
  const thtPouch = new THREE.Mesh(
    new RoundedBoxGeometry(0.96, 0.56, 0.18, 6, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xaab9cc, roughness: 0.24, metalness: 0.88 })
  );
  thtBatGroup.add(thtPouch);
  const thtKapton = new THREE.Mesh(
    new RoundedBoxGeometry(0.98, 0.14, 0.2, 4, 0.02),
    new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.24, metalness: 0.2, clearcoat: 0.75 })
  );
  thtKapton.position.y = 0.21;
  thtBatGroup.add(thtKapton);
  const thtJstHeader = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.14, 0.14, 3, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42, metalness: 0.06 })
  );
  thtJstHeader.position.set(0.0, 0.34, 0.06);
  thtBatGroup.add(thtJstHeader);

  const thtBatBase = new THREE.Vector3(-0.78, -0.96, 0.02);
  thtBatGroup.position.copy(thtBatBase);
  thtProceduralGroup.add(thtBatGroup);
  modules.push({
    id: 'battery',
    revision: 'tht',
    group: thtBatGroup,
    basePos: thtBatBase.clone(),
    explodeOffset: new THREE.Vector3(-0.18, -0.28, 0.38),
  });

  // =========================================================================
  // DESIGN 02: ASTRA CUSTOM SMD PCB (REAL CONVERTED STEP->GLB + KICAD SILK)
  // =========================================================================
  const smdGroup = new THREE.Group();
  smdGroup.position.set(1.42, 0.06, 0.0);
  smdGroup.visible = false;
  root.add(smdGroup);

  const smdFlipPivot = new THREE.Group();
  smdGroup.add(smdFlipPivot);

  const realSmdTex = createRealSmdPcbTextureSet(maxAnisotropy);
  texturesToDispose.push(realSmdTex.topMap, realSmdTex.bottomMap);

  const smdFallbackGroup = new THREE.Group();
  smdFlipPivot.add(smdFallbackGroup);

  const smdCore = new THREE.Mesh(
    new RoundedBoxGeometry(3.15, 2.4, 0.105, 4, 0.018),
    new THREE.MeshStandardMaterial({ color: 0x354229, roughness: 0.44, metalness: 0.24 })
  );
  smdFallbackGroup.add(smdCore);

  // Subtle silkscreen copper decals mounted flush with real 42x32mm board faces
  const smdTopFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.12, 2.38),
    new THREE.MeshStandardMaterial({
      map: realSmdTex.topMap,
      roughness: 0.36,
      metalness: 0.22,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    })
  );
  smdTopFace.position.z = 0.062;
  smdFlipPivot.add(smdTopFace);

  const smdBottomFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.12, 2.38),
    new THREE.MeshStandardMaterial({
      map: realSmdTex.bottomMap,
      roughness: 0.36,
      metalness: 0.22,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    })
  );
  smdBottomFace.rotation.y = Math.PI;
  smdBottomFace.position.z = -0.064;
  smdFlipPivot.add(smdBottomFace);

  // Mount Astra's real 79-mesh converted 3D CAD GLB directly onto smdFlipPivot
  const astraCadHolder = new THREE.Group();
  smdFlipPivot.add(astraCadHolder);

  // Invisible/subtle anchor nodes so BOM selection halo & explode slider work cleanly over the CAD board
  const createAnchorNode = (
    id: string,
    pos: THREE.Vector3,
    explode: THREE.Vector3,
    mesh?: THREE.Object3D
  ) => {
    const g = new THREE.Group();
    if (mesh) g.add(mesh);
    g.position.copy(pos);
    smdFlipPivot.add(g);
    modules.push({
      id,
      revision: 'smd',
      group: g,
      basePos: pos.clone(),
      explodeOffset: explode,
    });
    return g;
  };

  // ESP32-S3, Battery monitor, and LoRa anchors (animated with real CAD parts once loaded!)
  createAnchorNode('esp32', new THREE.Vector3(-0.36, 0.26, 0.08), new THREE.Vector3(0, 0.05, 0.42));
  createAnchorNode('divider', new THREE.Vector3(0.25, 0.07, 0.08), new THREE.Vector3(0.05, 0.05, 0.5));
  const loraSmdGroup = createAnchorNode(
    'lora',
    new THREE.Vector3(0.75, 0.32, -0.14),
    new THREE.Vector3(0.08, 0.06, -0.62)
  );

  // 9650 Hand-Soldered SMD Buzzer at bottom-right pad
  const smdBzMeshGroup = new THREE.Group();
  const bzBox = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.68, 0.24, 4, 0.025), qfnEpoxyMat);
  smdBzMeshGroup.add(bzBox);
  const bzPort = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.8 })
  );
  bzPort.position.set(0.05, 0.05, 0.124);
  smdBzMeshGroup.add(bzPort);
  createAnchorNode(
    'buzzer',
    new THREE.Vector3(1.06, -0.61, 0.16),
    new THREE.Vector3(0.14, -0.1, 0.58),
    smdBzMeshGroup
  );

  // Docked 3.7V LiPo Pouch below Astra's JST-SH battery port
  const smdBatMeshGroup = new THREE.Group();
  const smdPouch = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.54, 0.16, 5, 0.045),
    new THREE.MeshStandardMaterial({ color: 0xaab9cc, roughness: 0.24, metalness: 0.88 })
  );
  smdPouch.position.set(0.0, -0.45, 0.02);
  smdBatMeshGroup.add(smdPouch);
  createAnchorNode(
    'battery',
    new THREE.Vector3(-0.47, -0.84, 0.02),
    new THREE.Vector3(0, -0.32, 0.35),
    smdBatMeshGroup
  );

  mountHardwareBoardGlb(astraCadHolder, smdFallbackGroup, HARDWARE_GLB_SLOTS.astraSmd, {
    targetWidth: 3.15,
    envMapIntensity: 1.55,
    isDisposed: () => isDisposed,
    onMounted: (mountedRoot) => {
      // Align CAD board Z flush with our silkscreen planes & wire bottom Ra-02 into lora explode node
      const pcb = mountedRoot.getObjectByName('RAMS_JLC_S3_PCB');
      if (pcb) {
        const b = new THREE.Box3().setFromObject(pcb);
        const c = new THREE.Vector3();
        b.getCenter(c);
        mountedRoot.position.z -= c.z;
      }
      const loraCad = mountedRoot.getObjectByName('LoRa_Module_RA-02_AiThinker');
      if (loraCad) {
        loraCad.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(loraCad);
        const c = new THREE.Vector3();
        b.getCenter(c);
        loraSmdGroup.position.copy(c);
        const loraMod = modules.find((m) => m.id === 'lora' && m.revision === 'smd');
        if (loraMod) loraMod.basePos.copy(c);
        loraSmdGroup.attach(loraCad);
      }
    },
  });

  return {
    root,
    thtGroup,
    smdGroup,
    smdFlipPivot,
    modules,
    bleArcMat,
    aiCoreMesh,
    aiRingA,
    aiRingB,
    focusHalo,
    loadCustomThtGlb,
    dispose: () => {
      isDisposed = true;
      texturesToDispose.forEach((t) => t.dispose());
      bleArcMat.dispose();
      focusHaloMat.dispose();
    },
  };
}

/**
 * Upgraded Roadside Base Station with Monocrystalline Solar Panel, NEMA Enclosure & Real antenna.glb.
 */
export function createBaseStationGroup(shadowTex: THREE.Texture): {
  group: THREE.Group;
  beaconDome: THREE.Mesh;
} {
  const group = new THREE.Group();
  addContactShadow(group, shadowTex, 1.15, 1.15);

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x2c3748,
    roughness: 0.88,
    metalness: 0.06,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xb0bed0,
    roughness: 0.24,
    metalness: 0.88,
  });
  const cabinetMat = new THREE.MeshStandardMaterial({
    color: 0x1a2332,
    roughness: 0.44,
    metalness: 0.45,
  });

  const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.56, 0.38, 1.56, 4, 0.05), concreteMat);
  plinth.position.y = 0.19;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Corner yellow roadside safety bollards around plinth
  const bollardGeo = new THREE.CylinderGeometry(0.055, 0.06, 0.85, 14);
  const bollardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.36, metalness: 0.35 });
  for (const [bx, bz] of [
    [-0.92, 0.92],
    [0.92, 0.92],
    [-0.92, -0.92],
    [0.92, -0.92],
  ]) {
    const bollard = new THREE.Mesh(bollardGeo, bollardMat);
    bollard.position.set(bx, 0.42, bz);
    group.add(bollard);
  }

  // Mast base flange collar + anchor bolts
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.07, 16), steelMat);
  flange.position.y = 0.41;
  group.add(flange);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.125, 4.85, 32), steelMat);
  mast.position.y = 2.78;
  mast.castShadow = true;
  group.add(mast);

  const cabinet = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.96, 0.52, 4, 0.06), cabinetMat);
  cabinet.position.set(0, 2.25, 0.25);
  cabinet.castShadow = true;
  group.add(cabinet);

  // NEMA cabinet hinged bezel, latches, and waterproof cable glands
  const doorBezel = new THREE.Mesh(
    new RoundedBoxGeometry(0.7, 0.84, 0.04, 3, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x243146, roughness: 0.38, metalness: 0.52 })
  );
  doorBezel.position.set(0, 2.25, 0.5);
  group.add(doorBezel);

  for (const ly of [2.05, 2.45]) {
    const latch = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.1, 0.05, 2, 0.01), steelMat);
    latch.position.set(0.32, ly, 0.53);
    group.add(latch);
  }

  for (const gx of [-0.16, 0.16]) {
    const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.12, 12), steelMat);
    gland.position.set(gx, 1.72, 0.26);
    group.add(gland);
  }

  // LoRa activity status bar on enclosure
  const cabinetLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.04, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  cabinetLed.position.set(0, 2.58, 0.528);
  group.add(cabinetLed);

  // Tilted Solar Panel Array + aluminum support frame & rear bracket struts
  const solarTex = createSolarPanelTexture(4);
  const solarGroup = new THREE.Group();
  solarGroup.position.set(0, 3.88, 0.38);
  solarGroup.rotation.x = -0.58;

  const solarFrame = new THREE.Mesh(
    new RoundedBoxGeometry(1.46, 1.04, 0.06, 3, 0.015),
    steelMat
  );
  solarGroup.add(solarFrame);

  const solarPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.94, 0.068),
    new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.18, metalness: 0.35 })
  );
  solarPanel.castShadow = true;
  solarGroup.add(solarPanel);
  group.add(solarGroup);

  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 10), steelMat);
  strut.position.set(0, 3.64, 0.22);
  strut.rotation.x = 0.72;
  group.add(strut);

  // Top cross-arm + lightning arrestor
  const topArm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.06), steelMat);
  topArm.position.set(0, 5.02, 0);
  group.add(topArm);

  const omniProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.06, 0),
    new THREE.Vector2(0.045, 0.22),
    new THREE.Vector2(0.036, 1.55),
    new THREE.Vector2(0.015, 1.72),
    new THREE.Vector2(0, 1.74),
  ];
  const omni = new THREE.Mesh(new THREE.LatheGeometry(omniProfile, 28), steelMat);
  omni.position.y = 5.18;
  group.add(omni);

  loadGlbTemplate('/assets/models/antenna.glb')
    .then((tpl) => {
      const realAnt = normalizeGlbGroup(tpl, {
        targetSize: 2.3,
        axis: 'height',
        castShadow: true,
        envMapIntensity: 1.4,
      });
      realAnt.position.y = 5.06;
      omni.visible = false;
      group.add(realAnt);
    })
    .catch(() => {});

  const beaconDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 28, 20),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  beaconDome.position.set(0, 5.16, 0);
  group.add(beaconDome);

  return { group, beaconDome };
}

/**
 * Lattice Steel Cellular Deadzone Tower with Diagonal Cross-Bracing, Ground Shelter & Warning Beacon.
 */
export function createCellTowerGroup(): {
  group: THREE.Group;
  statusRing: THREE.Mesh;
} {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.48,
    metalness: 0.72,
  });
  const radomeMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4ef,
    roughness: 0.35,
    metalness: 0.15,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.94, 0.44, 24), steelMat);
  base.position.y = 0.22;
  group.add(base);

  // Ground equipment shelter cabinet next to tower footing
  const shelter = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.74, 0.44, 3, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 })
  );
  shelter.position.set(0.68, 0.56, 0.18);
  group.add(shelter);

  // 3 tapered lattice legs + horizontal & diagonal cross-bracing
  const legGeo = new THREE.CylinderGeometry(0.045, 0.075, 7.6, 10);
  const legPositions: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const lx = Math.cos(ang);
    const lz = Math.sin(ang);
    legPositions.push([lx, lz]);
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(lx * 0.28, 4.1, lz * 0.28);
    leg.rotation.z = lx * 0.042;
    leg.rotation.x = -lz * 0.042;
    group.add(leg);
  }
  for (let level = 0; level < 5; level++) {
    const y = 1.2 + level * 1.4;
    const r = 0.44 - level * 0.055;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 24), steelMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    group.add(ring);

    if (level < 4) {
      const nextY = y + 1.4;
      const nextR = 0.44 - (level + 1) * 0.055;
      for (let i = 0; i < 3; i++) {
        const [x1, z1] = legPositions[i];
        const [x2, z2] = legPositions[(i + 1) % 3];
        const p1 = new THREE.Vector3(x1 * r, y, z1 * r);
        const p2 = new THREE.Vector3(x2 * nextR, nextY, z2 * nextR);
        const len = p1.distanceTo(p2);
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, len, 6), steelMat);
        strut.position.copy(p1).lerp(p2, 0.5);
        strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        group.add(strut);
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const panel = new THREE.Mesh(new RoundedBoxGeometry(0.3, 1.22, 0.14, 3, 0.03), radomeMat);
    panel.position.set(Math.cos(ang) * 0.48, 7.2, Math.sin(ang) * 0.48);
    panel.rotation.y = -ang + Math.PI / 2;
    group.add(panel);
  }

  // Microwave backhaul drum
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24).rotateX(Math.PI / 2),
    radomeMat
  );
  drum.position.set(0.38, 6.2, 0.15);
  group.add(drum);

  const statusRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.66, 0.048, 16, 48),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  statusRing.rotation.x = Math.PI / 2;
  statusRing.position.y = 7.95;
  group.add(statusRing);

  return { group, statusRing };
}

export function createMortalityBarsGroup(): {
  group: THREE.Group;
  bar2011: THREE.Mesh;
  bar2021: THREE.Mesh;
  motoSlice: THREE.Mesh;
} {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new RoundedBoxGeometry(6.4, 0.24, 2.3, 4, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x161d2b, roughness: 0.68, metalness: 0.32 })
  );
  plinth.position.y = 0.12;
  group.add(plinth);

  const bar2011Geo = new RoundedBoxGeometry(1.18, 1.0, 1.18, 4, 0.08).translate(0, 0.5, 0);
  const bar2011 = new THREE.Mesh(
    bar2011Geo,
    new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.35, clearcoat: 0.6 })
  );
  bar2011.position.set(-1.65, 0.24, 0);
  bar2011.scale.y = 3.2;
  group.add(bar2011);

  const bar2021Geo = new RoundedBoxGeometry(1.18, 1.0, 1.18, 4, 0.08).translate(0, 0.5, 0);
  const bar2021 = new THREE.Mesh(
    bar2021Geo,
    new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.45, clearcoat: 0.7 })
  );
  bar2021.position.set(0.2, 0.24, 0);
  bar2021.scale.y = 4.45;
  group.add(bar2021);

  const motoGeo = new RoundedBoxGeometry(1.18, 1.0, 1.18, 4, 0.08).translate(0, 0.5, 0);
  const motoSlice = new THREE.Mesh(
    motoGeo,
    new THREE.MeshPhysicalMaterial({ color: 0xfb7185, roughness: 0.24, metalness: 0.4, clearcoat: 0.7 })
  );
  motoSlice.position.set(2.05, 0.24, 0);
  motoSlice.scale.y = 2.4;
  group.add(motoSlice);

  return { group, bar2011, bar2021, motoSlice };
}

/**
 * Builds a high-detail organic multi-tier mountain conifer geometry with irregular needle whorls
 * and baked ambient-occlusion vertex colors (deep shadow inside whorls, bright moonlit tips).
 */
function buildDetailedPineCanopyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const tierCount = 6;

  for (let t = 0; t < tierCount; t++) {
    const frac = t / (tierCount - 1);
    const yBase = 0.65 + frac * 4.35;
    const radius = THREE.MathUtils.lerp(1.62, 0.42, Math.pow(frac, 0.85));
    const height = THREE.MathUtils.lerp(1.75, 1.05, frac);

    const cone = new THREE.ConeGeometry(radius, height, 14, 3);
    cone.translate(0, yBase + height * 0.42, 0);
    cone.rotateY(t * 0.68);

    const pos = cone.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const r = Math.hypot(vx, vz);
      const angle = Math.atan2(vz, vx);
      // Scalloped bough tips for natural coniferous silhouette instead of stiff pyramid
      const boughWave = Math.sin(angle * 7 + t * 1.4) * 0.16 + Math.cos(angle * 3 - t) * 0.09;
      if (r > 0.05) {
        pos.setX(i, vx * (1 + boughWave));
        pos.setZ(i, vz * (1 + boughWave));
        pos.setY(i, vy - r * 0.14); // realistic gravity bough droop
      }
      const ao = THREE.MathUtils.clamp((r / Math.max(0.2, radius)) * 0.55 + frac * 0.45, 0.15, 1.0);
      cols[i * 3] = THREE.MathUtils.lerp(0.04, 0.14, ao);
      cols[i * 3 + 1] = THREE.MathUtils.lerp(0.11, 0.29, ao);
      cols[i * 3 + 2] = THREE.MathUtils.lerp(0.08, 0.18, ao);
    }
    cone.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    cone.computeVertexNormals();
    parts.push(cone);
  }

  return BufferGeometryUtils.mergeGeometries(parts);
}

/**
 * Rich Realistic Highway Corridor Environment:
 * - Real GLB Streetlights (/assets/models/streetlight.glb) with architectural slate finish & volumetric cones + smooth scroll belt
 * - Weathered Concrete Jersey Barriers + Galvanized Steel W-Beam Guardrails + Red/Amber Reflective Chevrons
 * - Curve Warning Signs + Cat-Eye Road Studs + Scrolling Center Dashes
 * - Mixed Mountain Forest: Layered Multi-Tier Botanical Pines + Real pine_1/pine_2 GLBs + Scrub Bushes + Cliff Boulders + Valley Lights
 */
export function createHighwayInfrastructure(
  scene: THREE.Scene,
  lowDetail = false
): {
  conesGroup: THREE.Group;
  updateRoadScroll: (scrollZ: number) => void;
} {
  const dummy = new THREE.Object3D();
  const concreteTex = createConcreteTexture(4);

  // Coherent 24.0 m repeating roadside belt (5 tiles spanning z = +36 .. -84)
  // Both left and right shoulders (barriers, steel rail posts, reflectors, streetlights, bushes, near pines)
  // scroll together in 1:1 lockstep with road dashes and asphalt texture.
  const tilePeriod = 24.0;
  const tileCount = 5;
  const startZ = 36.0;
  const corridorBelt = new THREE.Group();
  scene.add(corridorBelt);

  // 1. Segmented Concrete Jersey Barriers + Galvanized W-Beam Top Rail Posts + Reflectors (Both Sides)
  const barrierShape = new THREE.Shape();
  barrierShape.moveTo(-0.28, 0);
  barrierShape.lineTo(0.28, 0);
  barrierShape.lineTo(0.14, 0.22);
  barrierShape.lineTo(0.09, 0.78);
  barrierShape.lineTo(-0.09, 0.78);
  barrierShape.lineTo(-0.14, 0.22);
  barrierShape.closePath();

  const barrierGeo = new THREE.ExtrudeGeometry(barrierShape, {
    depth: 3.1,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 3,
  });
  barrierGeo.center();
  const barrierMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    color: 0x8a95a8,
    roughness: 0.88,
    metalness: 0.06,
  });

  const blocksPerTile = 6; // 6 * 4.0m = 24.0m exact
  const blockStep = tilePeriod / blocksPerTile;
  const barrierCount = tileCount * blocksPerTile * 2;
  const barriers = new THREE.InstancedMesh(barrierGeo, barrierMat, barrierCount);
  barriers.receiveShadow = true;

  const railPostGeo = new THREE.BoxGeometry(0.1, 0.96, 0.1);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x7a889b,
    roughness: 0.36,
    metalness: 0.84,
  });
  const railPosts = new THREE.InstancedMesh(railPostGeo, railMat, barrierCount);

  const reflGeo = new THREE.BoxGeometry(0.045, 0.14, 0.22);
  const reflMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const barrierReflectors = new THREE.InstancedMesh(reflGeo, reflMat, barrierCount);

  let bIdx = 0;
  for (let t = 0; t < tileCount; t++) {
    for (let k = 0; k < blocksPerTile; k++) {
      const z = startZ - t * tilePeriod - k * blockStep;
      for (const sx of [-5.65, 5.65]) {
        dummy.position.set(sx, 0.39, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        barriers.setMatrixAt(bIdx, dummy.matrix);

        dummy.position.set(sx > 0 ? 5.82 : -5.82, 0.48, z - blockStep * 0.5);
        dummy.updateMatrix();
        railPosts.setMatrixAt(bIdx, dummy.matrix);

        dummy.position.set(sx > 0 ? 5.33 : -5.33, 0.86, z);
        dummy.updateMatrix();
        barrierReflectors.setMatrixAt(bIdx, dummy.matrix);
        bIdx++;
      }
    }
  }
  barriers.instanceMatrix.needsUpdate = true;
  railPosts.instanceMatrix.needsUpdate = true;
  barrierReflectors.instanceMatrix.needsUpdate = true;
  barriers.computeBoundingSphere();
  railPosts.computeBoundingSphere();
  barrierReflectors.computeBoundingSphere();
  corridorBelt.add(barriers);
  corridorBelt.add(railPosts);
  corridorBelt.add(barrierReflectors);

  // Continuous galvanized steel top rail framing the highway horizon
  const railGeo = new THREE.BoxGeometry(0.11, 0.18, 160);
  for (const sx of [-5.42, 5.42]) {
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(sx, 0.86, -30);
    scene.add(rail);
  }

  // Symmetrical Shoulder Delineator Posts every 24m on BOTH left & right shoulders
  const delinPostGeo = new THREE.CylinderGeometry(0.04, 0.045, 1.32, 10);
  const delinTabGeo = new THREE.BoxGeometry(0.14, 0.34, 0.045);
  const delinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.78, roughness: 0.32 });
  const delinAmberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x92400e,
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });
  const delinPosts = new THREE.InstancedMesh(delinPostGeo, delinMat, tileCount * 2);
  const delinTabs = new THREE.InstancedMesh(delinTabGeo, delinAmberMat, tileCount * 2);
  let dIdx = 0;
  for (let t = 0; t < tileCount; t++) {
    const zBase = startZ - t * tilePeriod - 12.0;
    for (const side of [-1, 1]) {
      dummy.position.set(side * 5.98, 0.66, zBase);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      delinPosts.setMatrixAt(dIdx, dummy.matrix);

      dummy.position.set(side * 5.95, 1.18, zBase);
      dummy.rotation.set(0, side * -0.15, 0);
      dummy.updateMatrix();
      delinTabs.setMatrixAt(dIdx, dummy.matrix);
      dIdx++;
    }
  }
  delinPosts.instanceMatrix.needsUpdate = true;
  delinTabs.instanceMatrix.needsUpdate = true;
  delinPosts.computeBoundingSphere();
  delinTabs.computeBoundingSphere();
  corridorBelt.add(delinPosts);
  corridorBelt.add(delinTabs);

  // 2. Scrolling Center Dashes & Retroreflective Highway Cat-Eye Studs (exact 4.0m spacing = 1/6 of 24m)
  const studPeriod = 4.0;
  const studCount = 36;
  const dashGeo = new THREE.BoxGeometry(0.16, 0.02, 1.56);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.34, metalness: 0.14 });
  const scrollingDashes = new THREE.InstancedMesh(dashGeo, dashMat, studCount);

  const studGeo = new THREE.BoxGeometry(0.11, 0.028, 0.14);
  const centerStudMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const edgeStudMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
  const centerStuds = new THREE.InstancedMesh(studGeo, centerStudMat, studCount);
  const edgeStuds = new THREE.InstancedMesh(studGeo, edgeStudMat, studCount * 2);

  const layoutDashesAndStuds = (offsetZ: number) => {
    const modShift = ((offsetZ % studPeriod) + studPeriod) % studPeriod;
    for (let i = 0; i < studCount; i++) {
      const z = startZ - i * studPeriod + modShift;
      dummy.position.set(0, 0.014, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      scrollingDashes.setMatrixAt(i, dummy.matrix);

      dummy.position.set(0, 0.02, z + 2.0);
      dummy.updateMatrix();
      centerStuds.setMatrixAt(i, dummy.matrix);

      dummy.position.set(-4.6, 0.02, z);
      dummy.updateMatrix();
      edgeStuds.setMatrixAt(i * 2, dummy.matrix);

      dummy.position.set(4.6, 0.02, z);
      dummy.updateMatrix();
      edgeStuds.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    scrollingDashes.instanceMatrix.needsUpdate = true;
    centerStuds.instanceMatrix.needsUpdate = true;
    edgeStuds.instanceMatrix.needsUpdate = true;
  };
  layoutDashesAndStuds(0);
  scrollingDashes.computeBoundingSphere();
  centerStuds.computeBoundingSphere();
  edgeStuds.computeBoundingSphere();
  scene.add(scrollingDashes);
  scene.add(centerStuds);
  scene.add(edgeStuds);

  // 3. Paired Alternating Left & Right Streetlights inside corridorBelt + Concrete Anchor Footings
  const lightsPerTileSide = 2; // every 12m per side, staggered 6m across shoulders
  const lightSpacing = 12.0;
  const totalLights = tileCount * lightsPerTileSide * 2;
  const lightPlacements: { x: number; z: number; yaw: number; coneX: number }[] = [];
  for (let t = 0; t < tileCount; t++) {
    for (let l = 0; l < lightsPerTileSide; l++) {
      const zLeft = startZ - t * tilePeriod - l * lightSpacing - 3.0;
      const zRight = startZ - t * tilePeriod - l * lightSpacing - 9.0;
      lightPlacements.push({ x: -6.15, z: zLeft, yaw: 0, coneX: -4.45 });
      lightPlacements.push({ x: 6.15, z: zRight, yaw: Math.PI, coneX: 4.45 });
    }
  }

  const poleFallbackGroup = new THREE.Group();
  corridorBelt.add(poleFallbackGroup);

  const fallbackPoleGeo = new THREE.CylinderGeometry(0.06, 0.095, 7.2, 14);
  const fallbackPoleMat = new THREE.MeshStandardMaterial({ color: 0x3b485e, roughness: 0.36, metalness: 0.78 });
  const pedestalGeo = new THREE.CylinderGeometry(0.22, 0.27, 0.42, 8);
  const pedestals = new THREE.InstancedMesh(pedestalGeo, barrierMat, totalLights);
  const coneGeo = new THREE.ConeGeometry(3.4, 6.8, 24, 1, true).translate(0, -3.4, 0);
  const coneMat = createVolumetricLightConeMaterial(0xffcf88, 0.065);
  const poolGeo = new THREE.CircleGeometry(2.1, 20).rotateX(-Math.PI / 2);
  const poolMat = new THREE.MeshBasicMaterial({
    color: 0xffd18c,
    transparent: true,
    opacity: 0.075,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lampPools = new THREE.InstancedMesh(poolGeo, poolMat, totalLights);

  lightPlacements.forEach((lp, idx) => {
    const poleMesh = new THREE.Mesh(fallbackPoleGeo, fallbackPoleMat);
    poleMesh.position.set(lp.x, 3.6, lp.z);
    poleFallbackGroup.add(poleMesh);

    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.set(lp.coneX, 6.75, lp.z);
    corridorBelt.add(lightCone);

    dummy.position.set(lp.x, 0.21, lp.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    pedestals.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(lp.coneX, 0.022, lp.z);
    dummy.updateMatrix();
    lampPools.setMatrixAt(idx, dummy.matrix);
  });
  pedestals.instanceMatrix.needsUpdate = true;
  lampPools.instanceMatrix.needsUpdate = true;
  pedestals.computeBoundingSphere();
  lampPools.computeBoundingSphere();
  corridorBelt.add(pedestals);
  corridorBelt.add(lampPools);

  const steelPoleMat = new THREE.MeshStandardMaterial({
    color: 0x3b485e,
    roughness: 0.34,
    metalness: 0.82,
  });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffe0a3 });
  const lampGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffedd5,
    roughness: 0.12,
    transmission: 0.55,
    clearcoat: 1.0,
  });

  loadGlbTemplate('/assets/models/streetlight.glb')
    .then((tpl) => {
      const normalized = normalizeGlbGroup(tpl, {
        targetSize: 7.4,
        axis: 'height',
        rotateY: Math.PI / 2,
        castShadow: true,
        receiveShadow: true,
        envMapIntensity: 1.35,
      });
      normalized.updateMatrixWorld(true);

      const parts: THREE.Mesh[] = [];
      normalized.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          parts.push(obj as THREE.Mesh);
        }
      });

      for (const part of parts) {
        const bakedGeo = part.geometry.clone();
        bakedGeo.applyMatrix4(part.matrixWorld);
        const origMats = Array.isArray(part.material) ? part.material : [part.material];
        const restyledMats = origMats.map((m) => {
          const n = (m?.name || '').toLowerCase();
          if (n.includes('light')) return lampGlowMat;
          if (n.includes('glass')) return lampGlassMat;
          return steelPoleMat;
        });

        const inst = new THREE.InstancedMesh(
          bakedGeo,
          Array.isArray(part.material) ? restyledMats : restyledMats[0],
          totalLights
        );
        lightPlacements.forEach((lp, i) => {
          dummy.position.set(lp.x, 0.22, lp.z);
          dummy.rotation.set(0, lp.yaw, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        });
        inst.instanceMatrix.needsUpdate = true;
        inst.computeBoundingSphere();
        corridorBelt.add(inst);
      }

      poleFallbackGroup.visible = false;
    })
    .catch(() => {});

  // 4. Seeded Roadside Flora & Far Mountain Cordillera Forest
  let seed = 7331;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // A) Tiled Near-Corridor Conifers (within corridorBelt so both shoulders rush past seamlessly)
  const canopyGeo = buildDetailedPineCanopyGeometry();
  const canopyMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.02,
    envMapIntensity: 0.3,
  });
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.28, 4.6, 10).translate(0, 1.25, 0);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x2b1d15,
    roughness: 0.96,
    metalness: 0.0,
    envMapIntensity: 0.2,
  });
  const toneTmp = new THREE.Color();
  const foliageTints = [0x8db69e, 0x76a28d, 0xa2c6b0, 0x6c9681];

  const beltPinesPerTile = lowDetail ? 6 : 12;
  const beltPinePattern: {
    x: number;
    zOff: number;
    sc: number;
    sy: number;
    rotY: number;
    tintIdx: number;
  }[] = [];
  for (let p = 0; p < beltPinesPerTile; p++) {
    const side = p % 2 === 0 ? -1 : 1;
    const x = side * (9.8 + rand() * 3.8);
    const zOff = rand() * tilePeriod;
    const sc = 0.88 + rand() * 0.65;
    beltPinePattern.push({
      x,
      zOff,
      sc,
      sy: sc * (0.9 + rand() * 0.35),
      rotY: rand() * Math.PI * 2,
      tintIdx: p % foliageTints.length,
    });
  }

  const beltPineCount = beltPinesPerTile * tileCount;
  const beltCanopies = new THREE.InstancedMesh(canopyGeo, canopyMat, beltPineCount);
  const beltTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, beltPineCount);
  let bpIdx = 0;
  for (let t = 0; t < tileCount; t++) {
    for (const pat of beltPinePattern) {
      const z = startZ - t * tilePeriod - pat.zOff;
      const y = terrainHeightAt(pat.x, z) - 0.56;
      dummy.position.set(pat.x, y, z);
      dummy.rotation.set(0, pat.rotY, 0);
      dummy.scale.set(pat.sc, pat.sy, pat.sc);
      dummy.updateMatrix();
      beltCanopies.setMatrixAt(bpIdx, dummy.matrix);
      beltTrunks.setMatrixAt(bpIdx, dummy.matrix);
      toneTmp.setHex(foliageTints[pat.tintIdx]);
      beltCanopies.setColorAt(bpIdx, toneTmp);
      bpIdx++;
    }
  }
  beltCanopies.instanceMatrix.needsUpdate = true;
  beltTrunks.instanceMatrix.needsUpdate = true;
  if (beltCanopies.instanceColor) beltCanopies.instanceColor.needsUpdate = true;
  beltCanopies.computeBoundingSphere();
  beltTrunks.computeBoundingSphere();
  corridorBelt.add(beltCanopies);
  corridorBelt.add(beltTrunks);

  // B) Deep Mountain Ridge Forest (x outside 18..42, clear of the [13.8..17.8] tower pads)
  const farPineCount = lowDetail ? 28 : 76;
  const farCanopies = new THREE.InstancedMesh(canopyGeo, canopyMat, farPineCount);
  const farTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, farPineCount);
  for (let i = 0; i < farPineCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (18.2 + rand() * 24.0);
    const z = 34 - rand() * 124;
    const y = terrainHeightAt(x, z) - 0.52;
    const sc = 0.95 + rand() * 0.95;

    dummy.position.set(x, y, z);
    dummy.rotation.set((rand() - 0.5) * 0.04, rand() * Math.PI * 2, (rand() - 0.5) * 0.04);
    dummy.scale.set(sc, sc * (0.9 + rand() * 0.42), sc);
    dummy.updateMatrix();
    farCanopies.setMatrixAt(i, dummy.matrix);
    farTrunks.setMatrixAt(i, dummy.matrix);

    toneTmp.setHex(foliageTints[i % foliageTints.length]);
    farCanopies.setColorAt(i, toneTmp);
  }
  farCanopies.instanceMatrix.needsUpdate = true;
  farTrunks.instanceMatrix.needsUpdate = true;
  if (farCanopies.instanceColor) farCanopies.instanceColor.needsUpdate = true;
  farCanopies.computeBoundingSphere();
  farTrunks.computeBoundingSphere();
  scene.add(farCanopies);
  scene.add(farTrunks);

  // C) Normalized GLB pine_1 / pine_2 on outer mountain slopes
  const glbTreeCount = lowDetail ? 18 : 54;
  const glbTransforms: { pos: THREE.Vector3; rotY: number; sx: number; sy: number; sz: number }[] = [];
  for (let i = 0; i < glbTreeCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (18.5 + rand() * 20.0);
    const z = 30 - rand() * 118;
    const y = terrainHeightAt(x, z) - 0.65;
    const sc = 0.95 + rand() * 0.7;
    glbTransforms.push({
      pos: new THREE.Vector3(x, y, z),
      rotY: rand() * Math.PI * 2,
      sx: sc,
      sy: sc * (0.95 + rand() * 0.3),
      sz: sc,
    });
  }

  Promise.all([
    loadGlbTemplate('/assets/models/pine_1.glb'),
    loadGlbTemplate('/assets/models/pine_2.glb'),
  ])
    .then(([pine1Tpl, pine2Tpl]) => {
      const mountSpecies = (tpl: THREE.Group, subset: typeof glbTransforms) => {
        const normalized = normalizeGlbGroup(tpl, {
          targetSize: 6.4,
          axis: 'height',
          castShadow: false,
          receiveShadow: true,
          envMapIntensity: 0.32,
        });
        normalized.updateMatrixWorld(true);
        const subMeshes: THREE.Mesh[] = [];
        normalized.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) subMeshes.push(obj as THREE.Mesh);
        });
        for (const mesh of subMeshes) {
          const bakedGeo = mesh.geometry.clone();
          bakedGeo.applyMatrix4(mesh.matrixWorld);
          const inst = new THREE.InstancedMesh(bakedGeo, mesh.material, subset.length);
          subset.forEach((t, idx) => {
            dummy.position.copy(t.pos);
            dummy.rotation.set(0, t.rotY, 0);
            dummy.scale.set(t.sx, t.sy, t.sz);
            dummy.updateMatrix();
            inst.setMatrixAt(idx, dummy.matrix);
          });
          inst.instanceMatrix.needsUpdate = true;
          inst.computeBoundingSphere();
          scene.add(inst);
        }
      };

      const half = Math.floor(glbTransforms.length / 2);
      mountSpecies(pine1Tpl, glbTransforms.slice(0, half));
      mountSpecies(pine2Tpl, glbTransforms.slice(half));
    })
    .catch(() => {});

  // D) Tiled Roadside Scrub Bushes & Shoulder Boulders inside corridorBelt (both shoulders scroll cleanly)
  const bushGeo = new THREE.IcosahedronGeometry(0.68, 2);
  const bushMat = new THREE.MeshStandardMaterial({
    color: 0x112e22,
    roughness: 0.94,
    metalness: 0.0,
    envMapIntensity: 0.25,
  });
  const bushesPerTile = lowDetail ? 6 : 14;
  const bushPattern: { x: number; zOff: number; rx: number; ry: number; rz: number; sx: number; sy: number; sz: number }[] = [];
  for (let p = 0; p < bushesPerTile; p++) {
    const side = p % 2 === 0 ? -1 : 1;
    bushPattern.push({
      x: side * (6.75 + rand() * 4.2),
      zOff: rand() * tilePeriod,
      rx: (rand() - 0.5) * 0.25,
      ry: rand() * Math.PI * 2,
      rz: (rand() - 0.5) * 0.25,
      sx: 0.8 + rand() * 1.1,
      sy: 0.55 + rand() * 0.45,
      sz: 0.8 + rand() * 1.05,
    });
  }
  const bushes = new THREE.InstancedMesh(bushGeo, bushMat, bushesPerTile * tileCount);
  let bushIdx = 0;
  for (let t = 0; t < tileCount; t++) {
    for (const pat of bushPattern) {
      const z = startZ - t * tilePeriod - pat.zOff;
      const y = terrainHeightAt(pat.x, z) + 0.14;
      dummy.position.set(pat.x, y, z);
      dummy.rotation.set(pat.rx, pat.ry, pat.rz);
      dummy.scale.set(pat.sx, pat.sy, pat.sz);
      dummy.updateMatrix();
      bushes.setMatrixAt(bushIdx++, dummy.matrix);
    }
  }
  bushes.instanceMatrix.needsUpdate = true;
  bushes.computeBoundingSphere();
  corridorBelt.add(bushes);

  const rockGeo = new THREE.DodecahedronGeometry(0.92, 1);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x1f2834,
    roughness: 0.93,
    metalness: 0.04,
    envMapIntensity: 0.25,
  });
  const rocksPerTile = lowDetail ? 4 : 10;
  const rockPattern: { x: number; zOff: number; rx: number; ry: number; rz: number; sx: number; sy: number; sz: number }[] = [];
  for (let p = 0; p < rocksPerTile; p++) {
    const side = p % 2 === 0 ? -1 : 1;
    rockPattern.push({
      x: side * (7.9 + rand() * 5.0),
      zOff: rand() * tilePeriod,
      rx: rand() * 2,
      ry: rand() * 3,
      rz: rand() * 2,
      sx: 0.72 + rand() * 1.15,
      sy: 0.55 + rand() * 0.75,
      sz: 0.72 + rand() * 1.1,
    });
  }
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rocksPerTile * tileCount);
  let rockIdx = 0;
  for (let t = 0; t < tileCount; t++) {
    for (const pat of rockPattern) {
      const z = startZ - t * tilePeriod - pat.zOff;
      const y = terrainHeightAt(pat.x, z) - 0.22;
      dummy.position.set(pat.x, y, z);
      dummy.rotation.set(pat.rx, pat.ry, pat.rz);
      dummy.scale.set(pat.sx, pat.sy, pat.sz);
      dummy.updateMatrix();
      rocks.setMatrixAt(rockIdx++, dummy.matrix);
    }
  }
  rocks.instanceMatrix.needsUpdate = true;
  rocks.computeBoundingSphere();
  corridorBelt.add(rocks);

  // E) Distant Valley Barangay / Town Warm Horizon Pinpoint Lights along -Z far vista
  const townGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
  const townMat = new THREE.MeshBasicMaterial({ color: 0xffd089 });
  const townCount = 54;
  const townLights = new THREE.InstancedMesh(townGeo, townMat, townCount);
  for (let i = 0; i < townCount; i++) {
    const x = (rand() - 0.5) * 84;
    const z = -66 - rand() * 32;
    const y = 0.6 + rand() * 3.8;
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    townLights.setMatrixAt(i, dummy.matrix);
  }
  townLights.instanceMatrix.needsUpdate = true;
  townLights.computeBoundingSphere();
  scene.add(townLights);

  // 5. Real Retroreflective Traffic Cones along Beat 06 roadside shoulder
  const conesGroup = new THREE.Group();
  conesGroup.visible = false;
  scene.add(conesGroup);

  loadGlbTemplate('/assets/models/traffic_cone.glb')
    .then((coneTpl) => {
      const coneGroupRaw = coneTpl.getObjectByName('Cone Retroreflection') ?? coneTpl;
      const cleanRoot = new THREE.Group();
      cleanRoot.add(coneGroupRaw.clone(true));
      for (const [cx, cy, cz] of [
        [-4.15, 0, -4.1],
        [-4.35, 0, -6.0],
        [-4.1, 0, -7.9],
      ] as [number, number, number][]) {
        const cone = normalizeGlbGroup(cleanRoot, {
          targetSize: 0.78,
          axis: 'height',
          castShadow: true,
          receiveShadow: true,
          envMapIntensity: 1.35,
        });
        cone.position.set(cx, cy, cz);
        conesGroup.add(cone);
      }
    })
    .catch(() => {});

  return {
    conesGroup,
    updateRoadScroll: (scrollZ: number) => {
      layoutDashesAndStuds(scrollZ);
      const beltMod = ((scrollZ % tilePeriod) + tilePeriod) % tilePeriod;
      corridorBelt.position.z = beltMod;
    },
  };
}
