import * as T from 'three';

const steel = new T.MeshStandardMaterial({color:0x30444e, metalness:.68, roughness:.35});
const masonry = new T.MeshStandardMaterial({color:0x25343e, metalness:.16, roughness:.73});
const concrete = new T.MeshStandardMaterial({color:0x838e91, roughness:.79});
const line = new T.MeshStandardMaterial({color:0xadb4ad, roughness:.52});
const brass = new T.MeshStandardMaterial({color:0xcda850, roughness:.52});
const lit = hex => new T.MeshBasicMaterial({color:hex,toneMapped:false});
function bar(root,m,x,y,z,w,h,d) {
  const n = new T.Mesh(new T.BoxGeometry(w,h,d),m);
  n.position.set(x,y,z); n.receiveShadow=true; root.add(n); return n;
}
function lightPool(root,x,z,w,h,color,strength) {
  const g=new T.PlaneGeometry(w,h);
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{tint:{value:new T.Color(color)},power:{value:strength}},
    vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 v;uniform vec3 tint;uniform float power;void main(){
      vec2 p=(v-.5)*2.;float n=fract(sin(dot(floor(v*vec2(59.,220.)),vec2(12.98,78.23)))*42758.5);
      float rip=.48+.52*pow(.5+.5*cos(v.y*350.+sin(v.x*25.)*2.+n*1.8),2.);
      gl_FragColor=vec4(tint,exp(-3.5*p.x*p.x-2.3*p.y*p.y)*rip*power);
      #include <colorspace_fragment>
    }`});
  const n=new T.Mesh(g,m); n.rotation.x=-Math.PI/2;n.position.set(x,.011,z);root.add(n);
}
export function street(scene, surface, normal) {
  for(const map of [surface,normal]){map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(24,24);map.anisotropy=4;}
  surface.colorSpace=T.SRGBColorSpace;
  const road=new T.Mesh(new T.PlaneGeometry(80,80),new T.MeshStandardMaterial({
    map:surface,normalMap:normal,normalScale:new T.Vector2(.39,.39),color:0x4a5058,metalness:.11,roughness:.41,envMapIntensity:.65}));
  road.rotation.x=-Math.PI/2;road.receiveShadow=true;scene.add(road);
  for(let i=-10;i<=10;i++)if(Math.abs(i)>1)bar(scene,brass,i*3.6,.003,0,1.69,.009,.085);
  for(const side of [-1,1])for(const sign of [-1,1]){
    bar(scene,line,sign*20,.004,side*4.22,33,.008,.08);
    bar(scene,concrete,sign*20,.07,side*5.95,33,.14,3.18);
    for(let j=0;j<12;j++) {
      const t=sign*(4.6+2.65*j);
      bar(scene,steel,t,.142,side*5.9,.019,.004,3.03);
      bar(scene,concrete,t,.08,side*4.31,2.6,.17,.19);
    }
  }
  const crossing=new T.Group();scene.add(crossing);
  for(let j=-4;j<=4;j++)bar(crossing,line,0,.008,j*.91,2,.009,.43);
  // Shop windows and awnings break up the panorama at street level. Reflections share their positions and colours.
  for(const [x,z,h,warm] of [[-15.8,-9.3,3.5,true],[13.2,-10.2,3.8,false]]){
    bar(scene,masonry,x,h/2,z,5.48,h,2.6);
    const col=warm?0xe5a363:0x69c8cf;
    const glass=new T.MeshStandardMaterial({color:warm?0x8d6952:0x36616b,emissive:warm?0xc48547:0x448f9b,emissiveIntensity:.45,metalness:.55,roughness:.19});
    bar(scene,glass,x,1.56,z+1.31,4.81,2.51,.05);
    const mullion=steel;
    for(let k=-2;k<=2;k++)bar(scene,mullion,x+k*1.15,1.53,z+1.35,.056,2.62,.065);
    bar(scene,mullion,x,2.16,z+1.37,4.83,.045,.07);
    for(let row=0;row<4;row++)bar(scene,mullion,x,1.97+row*.115,z+1.36,4.64,.018,.038);
    bar(scene,steel,x,3.04,z+1.49,5.6,.19,.69);
    bar(scene,lit(col),x,2.946,z+1.81,4.87,.046,.048);
    lightPool(scene,x,-4.9,3.8,8.1,col,.23);
  }
  const lamp=lit(0xffe2aa);
  for(const x of [-13,-6,8,16]){
    bar(scene,steel,x,2.5,-4.95,.083,5,.09);
    bar(scene,steel,x,5,-4.45,.095,.085,1.08);
    bar(scene,lamp,x,4.94,-3.99,.28,.043,.47);
    lightPool(scene,x,-3.3,4.8,9,0xf8bb7a,.28);
  }
  const key=new T.DirectionalLight(0xffe0b8,3.35);key.position.set(1,8,4);key.castShadow=true;
  Object.assign(key.shadow.camera,{left:-12,right:12,top:10,bottom:-10,near:.3,far:28});
  key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.007;key.shadow.bias=-.0002;scene.add(key);
  const rim=new T.DirectionalLight(0x8de3ef,2.9);rim.position.set(-4,4,-4);scene.add(rim);
  scene.add(new T.HemisphereLight(0xd0e2f2,0x756458,.86));
  return crossing;
}

export function reflections(vehicle,halfWidth,front) {
  for(const side of [-1,1]) lightPool(vehicle,side*halfWidth,front+1.8,.82,4.8,0xffdcac,.46);
}
