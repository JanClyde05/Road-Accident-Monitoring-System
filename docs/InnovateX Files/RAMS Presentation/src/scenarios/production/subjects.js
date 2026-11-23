import * as T from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const dark = new T.MeshStandardMaterial({ color: 0x18242b, roughness: 0.26, metalness: 0.52 });
const cyan = new T.MeshBasicMaterial({ color: 0x79efe1 });
function object(parent, geo, mat, pos) {
  const o = new T.Mesh(geo, mat);
  o.position.set(...pos);
  parent.add(o);
  return o;
}
const v = (x, y, z) => new T.Vector3(x, y, z);
const lerp = T.MathUtils.lerp;

export function person(gltf, helmet = false) {
  const root = clone(gltf.scene),
    joints = {};
  root.traverse((o) => {
    if (o.isBone) joints[o.name] = o;
    if (o.isMesh) {
      o.castShadow = true;
      o.frustumCulled = false;
    }
  });
  const player = new T.AnimationMixer(root);
  const clips = Object.fromEntries(
    ['walk', 'idle'].map((name) => [
      name,
      player.clipAction(T.AnimationClip.findByName(gltf.animations, name)),
    ]),
  );
  const chest = joints.chest;
  const badge = object(
    chest,
    new RoundedBoxGeometry(0.084, 0.103, 0.028, 2, 0.009),
    dark,
    [0.045, 0.068, 0.118],
  );
  object(badge, new T.BoxGeometry(0.016, 0.007, 0.001), cyan, [0.019, 0.032, 0.0145]);
  const phone = object(root, new RoundedBoxGeometry(0.077, 0.158, 0.011, 2, 0.008), dark, [0, 0, 0]);
  object(
    phone,
    new T.PlaneGeometry(0.069, 0.141),
    new T.MeshBasicMaterial({ color: 0x326475 }),
    [0, 0, 0.0061],
  );
  for (let i = 0; i < 3; i++)
    object(
      phone,
      new T.PlaneGeometry(0.048 - i * 0.007, i ? 0.004 : 0.019),
      i ? new T.MeshBasicMaterial({ color: 0xaad1d4 }) : cyan,
      [0, 0.031 - i * 0.022, 0.0064],
    );
  if (helmet) {
    const shell = object(
      joints.head,
      new T.SphereGeometry(1, 32, 18),
      new T.MeshStandardMaterial({ color: 0x393f45, metalness: 0.64, roughness: 0.2 }),
      [0, 0.14, 0.003],
    );
    shell.scale.set(0.166, 0.16, 0.149);
    const visor = object(
      joints.head,
      new T.SphereGeometry(1, 24, 15),
      new T.MeshStandardMaterial({ color: 0x1b3941, metalness: 0.84, roughness: 0.12 }),
      [0, 0.108, 0.079],
    );
    visor.scale.set(0.163, 0.066, 0.095);
  }
  const temp = new T.Vector3(),
    d = new T.Vector3(),
    turn = new T.Quaternion();
  function aim(bone, child, target) {
    const b = joints[bone],
      c = joints[child];
    root.updateMatrixWorld(true);
    b.parent.worldToLocal(temp.copy(target));
    d.copy(c.position).applyQuaternion(b.quaternion).normalize();
    temp.sub(b.position).normalize();
    turn.setFromUnitVectors(d, temp);
    b.quaternion.premultiply(turn);
  }
  function pose(mode, time, progress = 0) {
    // Solve in the local actor frame. Skin, clothes and fingers move together.
    const at = root.position.clone(),
      q = root.quaternion.clone();
    root.position.set(0, 0, 0);
    root.quaternion.identity();
    for (const [name, a] of Object.entries(clips)) {
      a.play();
      a.enabled = name === (mode === 'walk' ? 'walk' : 'idle');
    }
    player.setTime(Math.max(0, time));
    if (mode === 'pair' || mode === 'ride' || mode === 'brace') {
      const seated = mode === 'ride',
        f = mode === 'brace',
        raised = seated ? 1 : progress;
      if (seated) {
        joints.hips.position.y = 0.87;
        joints.spine.rotateX(0.2);
      }
      joints.neck.rotateX(!seated && !f ? 0.2 * raised : 0);
      for (const [suffix, s] of [
        ['L', 1],
        ['R', -1],
      ]) {
        if (seated) {
          aim('thigh_' + suffix, 'calf_' + suffix, v(s * 0.22, 0.58, 0.25));
          aim('calf_' + suffix, 'foot_' + suffix, v(s * 0.21, 0.28, -0.04));
        }
        const elbow = seated
          ? v(s * 0.27, 1.12, 0.26)
          : f
            ? v(s * (0.23 + 0.15 * raised), 1.19, 0.18)
            : v(s * 0.23, 1.07 + 0.13 * raised, 0.1);
        const hand = seated
          ? v(s * 0.31, 1.04, 0.49)
          : f
            ? v(s * (0.32 + 0.22 * raised), 0.96, 0.28 + 0.18 * raised)
            : v(s * 0.075, 1.055 + 0.28 * raised, 0.24 + 0.07 * raised);
        aim('upperarm_' + suffix, 'forearm_' + suffix, elbow);
        aim('forearm_' + suffix, 'hand_' + suffix, hand);
      }
    }
    root.updateMatrixWorld(true);
    phone.visible = mode === 'pair';
    if (phone.visible) {
      joints.hand_R.getWorldPosition(phone.position);
      phone.position.add(v(0.013, 0.05, 0.014));
      phone.rotation.set(-0.35, Math.PI - 0.2, 0.025);
    }
    root.position.copy(at);
    root.quaternion.copy(q);
    root.updateMatrixWorld(true);
  }
  return { root, pose, phone, badge };
}

export function crushable(root, sideImpact = false) {
  root.updateMatrixWorld(true);
  const chunks = [],
    p = v(0, 0, 0),
    changed = v(0, 0, 0),
    inverse = new T.Matrix4();
  root.traverse((mesh) => {
    if (
      !mesh.isMesh ||
      /wheel|tire|steer|dashboard|caliper|leather|bays/i.test(mesh.name + ' ' + mesh.parent.name)
    )
      return;
    const geometry = mesh.geometry.clone();
    mesh.geometry = geometry;
    const original = geometry.attributes.position,
      target = new Float32Array(original.count * 3);
    let active = false;
    inverse.copy(mesh.matrixWorld).invert();
    for (let i = 0; i < original.count; i++) {
      p.fromBufferAttribute(original, i).applyMatrix4(mesh.matrixWorld);
      const nose = T.MathUtils.smoothstep(p.z, 0.85, 2.35),
        side = T.MathUtils.smoothstep(-p.x, 0.5, 0.96);
      const length = sideImpact
        ? side * (1 - T.MathUtils.smoothstep(Math.abs(p.z - 0.45), 0.18, 1.58))
        : nose * (0.63 + 0.37 * T.MathUtils.smoothstep(p.x, -1, 0.8));
      changed.copy(p);
      if (length > 0.0001) {
        active = true;
        if (sideImpact) {
          changed.x += 0.32 * length;
          changed.y += 0.046 * Math.sin(p.z * 11) * length;
        } else {
          changed.z -= 0.58 * length;
          changed.y +=
            (0.14 + 0.085 * Math.cos(p.z * 12 + p.x * 3)) *
            length *
            T.MathUtils.smoothstep(p.y, 0.42, 0.81);
          changed.x += Math.sign(p.x) * 0.048 * length;
        }
      }
      changed.applyMatrix4(inverse).toArray(target, i * 3);
    }
    if (active) {
      geometry.morphAttributes.position = [new T.Float32BufferAttribute(target, 3)];
      mesh.updateMorphTargets();
      chunks.push(mesh);
    }
  });
  return (n) => {
    for (const o of chunks) o.morphTargetInfluences[0] = n;
  };
}

export function splinters(scene) {
  const count = 24,
    geometry = new T.TetrahedronGeometry(1),
    debris = new T.InstancedMesh(
      geometry,
      new T.MeshStandardMaterial({ color: 0x859d9e, roughness: 0.28, metalness: 0.6 }),
      count,
    );
  debris.frustumCulled = false;
  scene.add(debris);
  const dummy = new T.Object3D();
  return function show(visible, time) {
    debris.visible = visible && time > 0;
    if (!debris.visible) return;
    for (let i = 0; i < count; i++) {
      const seed = (Math.sin(i * 45.19 + 0.8) * 4812.44) % 1,
        angle = i * 2.399 + 0.3,
        rad = 0.8 + Math.abs(seed) * 1.4;
      const vx = Math.cos(angle) * rad + 0.7,
        vz = Math.sin(angle) * rad,
        vy = 0.8 + Math.abs(seed) * 1.4,
        y0 = 0.54;
      const landing = (vy + Math.sqrt(vy * vy + 2 * 9.81 * y0)) / 9.81;
      const since = Math.max(0, time - landing),
        travel = Math.min(time, landing) + 0.32 * (1 - Math.exp(-since * 3.5));
      const rise = since
        ? Math.max(0, 1.3 * since - 4.905 * since * since)
        : Math.max(0, y0 + vy * time - 4.905 * time * time);
      dummy.position.set(-0.36 + vx * travel, 0.013 + rise, 0.97 + vz * travel);
      dummy.rotation.set(
        angle + Math.min(time, landing + 0.28) * 7,
        angle * 0.3,
        0.07 + Math.min(time, landing + 0.28) * 10,
      );
      const s = 0.022 + 0.039 * Math.abs(seed);
      dummy.scale.set(s * 1.75, s * 0.45, s);
      dummy.updateMatrix();
      debris.setMatrixAt(i, dummy.matrix);
    }
    debris.instanceMatrix.needsUpdate = true;
  };
}
