import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
dracoLoader.preload();

const sharedGltfLoader = new GLTFLoader();
sharedGltfLoader.setDRACOLoader(dracoLoader);

const gltfCache = new Map<string, Promise<THREE.Group>>();

export function loadGlbTemplate(url: string): Promise<THREE.Group> {
  let cached = gltfCache.get(url);
  if (!cached) {
    cached = new Promise((resolve, reject) => {
      sharedGltfLoader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (err) => reject(err)
      );
    });
    gltfCache.set(url, cached);
  }
  return cached;
}

/**
 * Loads an external or converted PCB .glb file, scales it cleanly to targetWidth
 * centered at [0, 0, 0] with its top plane facing +Z, and replaces fallbackGroup once ready.
 */
export function mountHardwareBoardGlb(
  container: THREE.Group,
  fallbackGroup: THREE.Group | null,
  glbUrl: string,
  options: {
    targetWidth: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    envMapIntensity?: number;
    isDisposed?: () => boolean;
    onMounted?: (mountedRoot: THREE.Group) => void;
  }
) {
  loadGlbTemplate(glbUrl)
    .then((template) => {
      if (options.isDisposed?.()) return;
      const clone = template.clone(true);
      if (options.rotateX) clone.rotation.x = options.rotateX;
      if (options.rotateY) clone.rotation.y = options.rotateY;
      if (options.rotateZ) clone.rotation.z = options.rotateZ;
      clone.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxWidth = Math.max(size.x, size.y, 0.0001);
      const scale = options.targetWidth / maxWidth;
      clone.scale.multiplyScalar(scale);
      clone.updateMatrixWorld(true);

      const scaledBox = new THREE.Box3().setFromObject(clone);
      scaledBox.getCenter(center);
      clone.position.sub(center);

      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.castShadow = true;
          m.receiveShadow = true;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => {
            if (mat && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              (mat as THREE.MeshStandardMaterial).envMapIntensity =
                options.envMapIntensity ?? 1.45;
            }
          });
        }
      });

      if (fallbackGroup) fallbackGroup.visible = false;
      container.add(clone);
      options.onMounted?.(clone);
    })
    .catch(() => {
      // Keep procedural fallback visible if GLB is unavailable
    });
}

/**
 * Normalizes a GLB scene clone to a target bounding dimension (height or length),
 * centers X and Z at 0, and seats min.y flush on y = 0.
 */
export function normalizeGlbGroup(
  rawScene: THREE.Group,
  options: {
    targetSize: number;
    axis: 'maxXZ' | 'height' | 'zLength';
    rotateY?: number;
    rotateX?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    envMapIntensity?: number;
  }
): THREE.Group {
  const wrapper = new THREE.Group();
  let hasSkinned = false;
  rawScene.traverse((obj) => {
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
      hasSkinned = true;
    }
  });
  const clone = (hasSkinned ? SkeletonUtils.clone(rawScene) : rawScene.clone(true)) as THREE.Group;

  if (options.rotateX) clone.rotation.x = options.rotateX;
  if (options.rotateY) clone.rotation.y = options.rotateY;
  clone.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);

  let basis = size.y;
  if (options.axis === 'maxXZ') basis = Math.max(size.x, size.z, 0.0001);
  else if (options.axis === 'zLength') basis = Math.max(size.z, 0.0001);
  else basis = Math.max(size.y, 0.0001);

  const scale = options.targetSize / basis;
  clone.scale.multiplyScalar(scale);
  clone.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(clone);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);

  clone.position.x -= center.x;
  clone.position.z -= center.z;
  clone.position.y -= scaledBox.min.y;

  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = options.castShadow ?? true;
      mesh.receiveShadow = options.receiveShadow ?? true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          (m as THREE.MeshStandardMaterial).envMapIntensity = options.envMapIntensity ?? 1.25;
        }
      });
    }
  });

  wrapper.add(clone);
  return wrapper;
}

export interface RiderBoneRefs {
  neck?: THREE.Object3D;
  head?: THREE.Object3D;
  spine2?: THREE.Object3D;
}

/**
 * Poses Mixamo Xbot rig (rider.glb) into an authentic forward-leaning sportbike crouch,
 * dresses the suit in matte carbon-slate armor, mounts helmet.glb onto the head bone,
 * straps the RAMS wearable pod onto Spine2, and returns bone refs for live breathing/scanning animation.
 */
export function buildArticulatedRiderOnBike(
  riderTemplate: THREE.Group,
  helmetTemplate: THREE.Group | null,
  wearablePod: THREE.Group
): { rider: THREE.Group; bones: RiderBoneRefs } {
  const rider = normalizeGlbGroup(riderTemplate, {
    targetSize: 1.72,
    axis: 'height',
    rotateY: Math.PI,
    castShadow: true,
    receiveShadow: true,
    envMapIntensity: 1.2,
  });

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x161f2e,
    roughness: 0.62,
    metalness: 0.24,
  });
  const armorTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f766e,
    roughness: 0.24,
    metalness: 0.55,
    clearcoat: 0.85,
  });

  rider.traverse((obj) => {
    if ((obj as THREE.SkinnedMesh).isMesh) {
      const m = obj as THREE.Mesh;
      const name = (m.name || '').toLowerCase();
      m.material = name.includes('joint') ? armorTrimMat : suitMat;
      m.castShadow = true;
      m.frustumCulled = false;
    }
  });

  const bone = (name: string) =>
    rider.getObjectByName(`mixamorig${name}`) ?? rider.getObjectByName(`mixamorig:${name}`);

  const hips = bone('Hips');
  if (hips) {
    hips.rotation.x = 0.24;
  }
  const spine = bone('Spine');
  if (spine) spine.rotation.x = 0.24;
  const spine1 = bone('Spine1');
  if (spine1) spine1.rotation.x = 0.24;
  const spine2 = bone('Spine2');
  if (spine2) {
    spine2.rotation.x = 0.16;
    wearablePod.position.set(0, 10, -15);
    wearablePod.rotation.set(0.06, Math.PI, 0);
    wearablePod.scale.setScalar(100);
    spine2.add(wearablePod);
  }

  const neck = bone('Neck');
  if (neck) neck.rotation.x = -0.34;
  const head = bone('Head');
  if (head) {
    head.rotation.x = -0.32;
    if (helmetTemplate) {
      const helm = normalizeGlbGroup(helmetTemplate, {
        targetSize: 30,
        axis: 'height',
        rotateY: 0,
        castShadow: true,
        envMapIntensity: 1.6,
      });
      helm.position.set(0, -4.5, 2.2);
      head.add(helm);
    }
  }

  const lSh = bone('LeftShoulder');
  if (lSh) lSh.rotation.set(0, -0.18, 0);
  const lArm = bone('LeftArm');
  if (lArm) lArm.rotation.set(0.0, -1.08, 0.42);
  const lFore = bone('LeftForeArm');
  if (lFore) lFore.rotation.set(0.0, -0.22, -0.18);

  const rSh = bone('RightShoulder');
  if (rSh) rSh.rotation.set(0, 0.18, 0);
  const rArm = bone('RightArm');
  if (rArm) rArm.rotation.set(0.0, 1.08, -0.42);
  const rFore = bone('RightForeArm');
  if (rFore) rFore.rotation.set(0.0, 0.22, 0.18);

  const lUpLeg = bone('LeftUpLeg');
  if (lUpLeg) lUpLeg.rotation.set(-1.52, 0.08, 0.28);
  const lLeg = bone('LeftLeg');
  if (lLeg) lLeg.rotation.set(1.88, 0, 0);
  const lFoot = bone('LeftFoot');
  if (lFoot) lFoot.rotation.set(0.32, 0, 0);

  const rUpLeg = bone('RightUpLeg');
  if (rUpLeg) rUpLeg.rotation.set(-1.52, -0.08, -0.28);
  const rLeg = bone('RightLeg');
  if (rLeg) rLeg.rotation.set(1.88, 0, 0);
  const rFoot = bone('RightFoot');
  if (rFoot) rFoot.rotation.set(0.32, 0, 0);

  rider.position.set(0, -0.26, 0.3);
  return {
    rider,
    bones: { neck, head, spine2 },
  };
}
