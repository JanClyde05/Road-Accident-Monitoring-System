import * as T from 'three';

const TAU = 2 * Math.PI;
function hash(a, b = 0) {
  const n = Math.sin(a * 93.41 + b * 79.31) * 24129.73;
  return n - Math.floor(n);
}
const terrainHeight = (angle, radius) => {
  const x = Math.cos(angle) * radius,
    z = Math.sin(angle) * radius;
  const shoulder = T.MathUtils.smoothstep(Math.min(Math.abs(z) - 4.4, Math.abs(x) - 3.4), 0, 5);
  return (
    -0.13 +
    shoulder *
      T.MathUtils.smoothstep(radius, 12, 41) *
      (2.4 +
        1.9 * Math.sin(angle * 6 + radius * 0.08) +
        2.6 * (0.5 + 0.5 * Math.sin(angle * 9 + radius * 0.12)) ** 2 +
        1.9 * Math.sin(radius * 0.24 + angle * 3) ** 2)
  );
};

export function backdrop(root) {
  const points = [],
    colors = [],
    positions = [],
    faces = [],
    vertexColors = [],
    color = new T.Color();
  const sections = 160,
    rings = 29;
  for (let j = 0; j < rings; j++) {
    const r = 12 + j * 1.44;
    for (let i = 0; i < sections; i++) {
      const a = (TAU * i) / sections,
        x = Math.cos(a) * r,
        z = Math.sin(a) * r,
        h = terrainHeight(a, r);
      positions.push(x, h, z);
      color.setHSL(
        0.515,
        0.24 + hash(i, j) * 0.1,
        0.115 + h * 0.012 + hash(i, j) * 0.023,
        T.SRGBColorSpace,
      );
      vertexColors.push(color.r, color.g, color.b);
      if (h > 0.3)
        for (let q = 0; q < 3; q++) {
          const aj = a + (hash(i * q + 2, j + q) * TAU) / sections,
            rr = r + hash(i + q, j + 21) * 1.42,
            hh = terrainHeight(aj, rr);
          points.push(Math.cos(aj) * rr, hh + 0.035, Math.sin(aj) * rr);
          color.setHSL(0.49, 0.28, 0.31 + 0.18 * hash(i + j, q), T.SRGBColorSpace);
          colors.push(color.r, color.g, color.b);
        }
      if (j < rings - 1) {
        const a0 = j * sections + i,
          b0 = j * sections + ((i + 1) % sections);
        faces.push(a0, b0 + sections, b0, a0, a0 + sections, b0 + sections);
      }
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new T.Float32BufferAttribute(vertexColors, 3));
  geo.setIndex(faces);
  geo.computeVertexNormals();
  const hill = new T.Mesh(
    geo,
    new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: T.DoubleSide }),
  );
  root.add(hill);
  const treeMaterial = new T.MeshStandardMaterial({
    color: '#1f4546',
    roughness: 1,
    flatShading: true,
  });
  const leaves = [],
    stems = [];
  for (let j = 0; j < 320; j++) {
    const a = hash(j, 7) * TAU,
      r = 10 + hash(j, 81) * 32,
      x = Math.cos(a) * r,
      z = Math.sin(a) * r;
    if (Math.abs(x) < 4.8 || Math.abs(z) < 6.3) continue;
    const y = terrainHeight(a, r),
      h = 1.0 + hash(j, 39) * 2.4;
    stems.push([x, y + 0.34 * h, z, h * 0.041, h * 0.74, h * 0.041]);
    for (let q = 0; q < 4; q++) {
      const theta = (TAU * q) / 3 + hash(j, 2),
        offset = q === 3 ? 0 : 0.15 * h;
      const dx = Math.cos(theta) * offset,
        dz = Math.sin(theta) * offset,
        hh = q === 3 ? 0.88 : 0.67;
      leaves.push([x + dx, y + h * hh, z + dz, 0.34 * h, 0.34 * h, 0.32 * h]);
      for (let k = 0; k < 15; k++) {
        const lat = hash(j + k, q + 3) * Math.PI,
          lon = hash(j, k + q) * TAU;
        points.push(
          x + dx + 0.34 * h * Math.sin(lat) * Math.cos(lon),
          y + h * hh + 0.34 * h * Math.cos(lat),
          z + dz + 0.32 * h * Math.sin(lat) * Math.sin(lon),
        );
        color.setHSL(0.48, 0.3, 0.27 + 0.22 * hash(j, k), T.SRGBColorSpace);
        colors.push(color.r, color.g, color.b);
      }
    }
  }
  function instances(items, geometry, material) {
    const m = new T.InstancedMesh(geometry, material, items.length),
      dummy = new T.Object3D();
    items.forEach(([x, y, z, w, h, d], i) => {
      dummy.position.set(x, y, z);
      dummy.scale.set(w, h, d);
      dummy.rotation.y = hash(i, 4) * TAU;
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    root.add(m);
  }
  instances(leaves, new T.IcosahedronGeometry(1, 0), treeMaterial);
  instances(
    stems,
    new T.CylinderGeometry(0.8, 1, 1, 6),
    new T.MeshStandardMaterial({ color: '#30464a', roughness: 1 }),
  );
  const returns = new T.BufferGeometry();
  returns.setAttribute('position', new T.Float32BufferAttribute(points, 3));
  returns.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  root.add(
    new T.Points(
      returns,
      new T.PointsMaterial({
        vertexColors: true,
        size: 0.045,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    ),
  );
  const sky = new T.Mesh(
    new T.SphereGeometry(74, 36, 24),
    new T.ShaderMaterial({
      side: T.BackSide,
      depthWrite: false,
      vertexShader:
        'varying vec3 ray;void main(){ray=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: `varying vec3 ray;void main(){vec3 d=normalize(ray);float v=smoothstep(-0.025,0.44,d.y);
      vec3 c=mix(vec3(.029,.076,.097),vec3(.006,.016,.031),v);
      float warm=exp(-7.5*distance(d,normalize(vec3(-.74,.09,-.67))));
      c+=vec3(.26,.12,.048)*warm;gl_FragColor=vec4(c,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
    }),
  );
  sky.renderOrder = -5;
  root.add(sky);
}

export function pavement() {
  const mat = new T.MeshStandardMaterial({ color: '#27363c', roughness: 0.52, metalness: 0.33 });
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader =
      'varying vec3 roadWorld;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nroadWorld=(modelMatrix*vec4(position,1.)).xyz;',
      );
    shader.fragmentShader =
      'varying vec3 roadWorld;\nfloat grain(vec2 v){return fract(sin(dot(v,vec2(27.13,71.89)))*4356.21);}\n' +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
      vec2 p=roadWorld.xz; float n=grain(floor(p*63.0)); float distant=1.-smoothstep(.035,.20,length(fwidth(p)));
      float wet=.5+.5*sin(p.x*.71+sin(p.y*1.24)+.3*sin(p.x*4.9+p.y*2.));
      float stripe=.52+.48*cos(p.y*38.+1.8*sin(p.x*3.2)+n*.8);
      diffuseColor.rgb*=.84+.20*wet+distant*(n-.47)*.35;
      float gleam=exp(-.36*abs(p.x+4.4+.18*p.y))*exp(-.19*abs(p.y+1.8))*(.2+stripe*.8);
      diffuseColor.rgb+=vec3(.041,.038,.030)*gleam*wet;
    `,
      );
  };
  return mat;
}

function glowTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d'),
    g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, color);
  g.addColorStop(0.22, color + '83');
  g.addColorStop(0.6, color + '26');
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
export function lamps(root, cars, bike) {
  const glows = [glowTexture('#ffd195'), glowTexture('#9de6e8')];
  function surfaceGlow(group, x, y, z, w, d, opacity = 1, map = glows[0]) {
    const m = new T.Mesh(
      new T.PlaneGeometry(w, d),
      new T.MeshBasicMaterial({
        map,
        transparent: true,
        opacity,
        blending: T.AdditiveBlending,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    group.add(m);
  }
  for (const x of [-9, 8]) {
    const sprite = new T.Sprite(
      new T.SpriteMaterial({
        map: glows[0],
        transparent: true,
        blending: T.AdditiveBlending,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    sprite.position.set(x, 3.84, -4.27);
    sprite.scale.set(0.72, 0.52, 1);
    root.add(sprite);
    surfaceGlow(root, x, 0.022, -3.62, 3.3, 4.8, 0.21);
  }
  for (const c of cars) for (const s of [-1, 1]) surfaceGlow(c, s * 0.59, 0.029, 3.25, 1.0, 4.3, 0.32);
  surfaceGlow(bike, 0, 0.017, 1.85, 0.59, 2.5, 0.35);
  return glows;
}
