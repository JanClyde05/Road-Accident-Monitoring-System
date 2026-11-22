import * as T from 'three';

// The cross-section is an editorial cue sampled from the actor's triangles.
// It never extends beyond the actor or depicts a sensing radius.
export function contactScan(root, longitudinal) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert(),
    transform = new T.Matrix4();
  const faces = [],
    a = new T.Vector3(),
    b = new T.Vector3(),
    c = new T.Vector3(),
    p = new T.Vector3(),
    n = new T.Vector3();
  let total = 0,
    low = Infinity,
    high = -Infinity;
  root.traverseVisible((node) => {
    if (!node.isMesh || !node.material.isMeshStandardMaterial) return;
    transform.multiplyMatrices(inverse, node.matrixWorld);
    const pos = node.geometry.attributes.position,
      indices = node.geometry.index;
    const count = indices ? indices.count : pos.count;
    for (let j = 0; j + 2 < count; j += 3) {
      const read = (v, i) =>
        v.fromBufferAttribute(pos, indices ? indices.getX(i) : i).applyMatrix4(transform);
      read(a, j);
      read(b, j + 1);
      read(c, j + 2);
      b.sub(a);
      c.sub(a);
      n.crossVectors(b, c);
      const area = n.length() / 2;
      if (area < 1e-8) continue;
      total += area;
      n.normalize();
      faces.push({ end: total, origin: a.clone(), u: b.clone(), v: c.clone(), normal: n.clone() });
    }
  });
  const count = longitudinal ? 9200 : 4600,
    points = new Float32Array(count * 3),
    field = new Float32Array(count);
  let fi = 0,
    seed = 17931;
  const sample = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < count; i++) {
    const position = ((i + sample()) * total) / count;
    while (fi < faces.length - 1 && faces[fi].end < position) fi++;
    const f = faces[fi];
    let u = sample(),
      v = sample();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    p.copy(f.origin).addScaledVector(f.u, u).addScaledVector(f.v, v).addScaledVector(f.normal, 0.004);
    p.toArray(points, i * 3);
    const d = longitudinal ? -p.z + 0.12 * p.y : p.y + 0.16 * p.z;
    low = Math.min(low, d);
    high = Math.max(high, d);
    field[i] = d;
  }
  for (let i = 0; i < count; i++) field[i] = (field[i] - low) / (high - low);
  const shape = new T.BufferGeometry()
    .setAttribute('position', new T.BufferAttribute(points, 3))
    .setAttribute('scanCoordinate', new T.BufferAttribute(field, 1));
  const material = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    uniforms: { front: { value: 0 }, density: { value: Math.min(devicePixelRatio || 1, 1.55) } },
    vertexShader: `attribute float scanCoordinate;uniform float front,density;varying float delta;
      void main(){delta=front-scanCoordinate;vec4 mv=modelViewMatrix*vec4(position,1.);
      gl_Position=projectionMatrix*mv;gl_PointSize=density*clamp(6./max(1.,-mv.z),1.25,2.4);}`,
    fragmentShader: `varying float delta;void main(){
      float edge=1.-smoothstep(.018,.105,abs(delta));
      float tail=smoothstep(0.,.045,delta)*(1.-smoothstep(.06,.24,delta));
      float dotMask=1.-smoothstep(.27,.50,length(gl_PointCoord-.5));
      float opacity=(edge*.91+tail*.25)*dotMask;if(opacity<.02)discard;
      vec3 color=mix(vec3(.14,.78,.78),vec3(.95,.74,.38),edge*edge);
      gl_FragColor=vec4(color,opacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  });
  const cloud = new T.Points(shape, material);
  cloud.renderOrder = 4;
  root.add(cloud);
  return cloud;
}
