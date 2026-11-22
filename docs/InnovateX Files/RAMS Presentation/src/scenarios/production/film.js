import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { street, reflections } from './street.js';
import { person, crushable, splinters } from './subjects.js';

const s=(n,a,b)=>T.MathUtils.smoothstep(n,a,b),mix=T.MathUtils.lerp;
const A=new URL('./assets/',import.meta.url).href;
const names=['family-sedan','suv','sport-motorcycle','casual-walker'];
const lens=new T.Vector3(),look=new T.Vector3(),point=new T.Vector3();
function path(t,hit,rest,from,impact,to) {
  if(t<hit)return mix(from,impact,t/hit);
  const f=T.MathUtils.clamp((t-hit)/(rest-hit),0,1);
  return mix(impact,to,1-(1-f)**2);
}
function wheels(model,names,axis){
  const parts=names.map(k=>model.getObjectByName(k)).filter(Boolean).map(w=>[w,w.quaternion.clone()]);
  const turn=new T.Quaternion(),dir=new T.Vector3(...axis);
  return angle=>{turn.setFromAxisAngle(dir,angle);for(const [o,rest] of parts)o.quaternion.copy(rest).multiply(turn);};
}
function label(ctx,at,camera,caption,w,h,offset) {
  at.getWorldPosition(point).project(camera);
  const x=(point.x*.5+.5)*w,y=(.5-point.y*.5)*h;
  const tx=Math.min(w-132,Math.max(12,x+offset)),ty=Math.min(h-28,Math.max(25,y-36));
  ctx.strokeStyle='#a6e8e2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.fillStyle='#072026df';ctx.fillRect(tx-4,ty-19,caption==='PHONE'?55:88,22);
  ctx.fillStyle='#c5eee9';ctx.font='12px monospace';ctx.fillText(caption,tx,ty-4);
}
export async function makeFilm(width=896,height=384) {
  const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setSize(width,height,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;
  const camera=new T.PerspectiveCamera(32,width/height,.08,120),scene=new T.Scene();
  const ktx=new KTX2Loader().setTranscoderPath('/node_modules/three/examples/jsm/libs/basis/').setWorkerLimit(2).detectSupport(renderer);
  const loader=new GLTFLoader().setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder);
  const maps=new T.TextureLoader();
  const [saloon,utility,cycle,ped,hdri,surface,normal,city]=await Promise.all([
    ...names.map(name=>loader.loadAsync(A+name+'.glb')),
    new HDRLoader().setDataType(T.FloatType).loadAsync(A+'shanghai_bund.hdr'),maps.loadAsync(A+'surface.jpg'),maps.loadAsync(A+'surface-norm.jpg'),maps.loadAsync(A+'city.jpg')]);
  // The city exposure contains streetlamps above 26,000. Compress the peaks before the PMREM convolution.
  const data=hdri.image.data;
  for(let i=0;i<data.length;i+=4){const factor=1/(1+Math.max(data[i],data[i+1],data[i+2])/12);for(let c=0;c<3;c++)data[i+c]*=factor;}
  hdri.needsUpdate=true;hdri.mapping=T.EquirectangularReflectionMapping;scene.environment=hdri;
  city.mapping=T.EquirectangularReflectionMapping;city.colorSpace=T.SRGBColorSpace;scene.background=city;
  scene.backgroundRotation.y=.95;scene.environmentRotation.y=-.75;scene.environmentIntensity=.84;
  scene.backgroundIntensity=.70;
  scene.fog=new T.FogExp2(0x1c2d39,.017);
  const crossing=street(scene,surface,normal),sedan=saloon.scene,suv=utility.scene,bike=cycle.scene;
  const ride=person(ped,true),walker=person(ped);
  for(const root of [sedan,suv,bike]){
    root.traverse(o=>{
      if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
      for(const m of [].concat(o.material)){
        const name=m.name.toLowerCase();
        if(name.includes('paint')&&!name.includes('rim')){m.roughness=.22;m.metalness=.64;}
        if(/light_front|headlamp|lamp_housing/.test(name)){m.emissive.setHex(0xfbe0af);m.emissiveIntensity=1.15;}
      }
    });
  }
  const crush=crushable(sedan),dent=crushable(suv,true),debris=splinters(scene);
  reflections(sedan,.69,2.2);reflections(suv,.75,2.12);reflections(bike,.12,.76);
  scene.add(sedan,suv,bike,ride.root,walker.root);
  const turnSedan=wheels(sedan,['wheel_FL','wheel_FR','wheel_RL','wheel_RR'],[1,0,0]);
  const turnSuv=wheels(suv,['wheel_FL','wheel_FR','wheel_RL','wheel_RR'],[1,0,0]);
  const turnBike=wheels(bike,['wheel_F','wheel_R'],[1,0,0]);
  const image=document.createElement('canvas');image.width=width;image.height=height;
  const ctx=image.getContext('2d');document.body.append(image);
  const bandGeo=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(3*49),3));
  const band=new T.Line(bandGeo,new T.LineBasicMaterial({color:0x76e1d9}));band.frustumCulled=false;scene.add(band);
  const ble=new T.QuadraticBezierCurve3(),v=new T.Vector3();
  function render(id,t) {
    const pair=id==='pairing', car=id==='car',motor=id==='motorcycle',foot=id==='pedestrian',fall=id==='fall';
    sedan.visible=car||foot;suv.visible=car;bike.visible=motor||pair;ride.root.visible=motor;walker.root.visible=foot||pair||fall;
    crossing.visible=foot;band.visible=pair&&t>.31&&t<.86;
    const blemish=car?s(t,.495,.54):0;crush(blemish);dent(blemish);
    debris(car,(t-.50)*5.8);
    if(pair){
      walker.root.position.set(2.18,.01,3.49);walker.root.rotation.set(0,-.26,0);
      walker.pose('pair',t*2.2,s(t,.09,.45));bike.position.set(.15,0,3.27);bike.rotation.set(0,1.55,-.08,'YXZ');
      turnBike(0);
      const push=s(t,.12,.62),side=mix(-.66,-1.3,push);
      look.set(2.15,1.00+push*.29,3.57);lens.set(look.x+Math.sin(side)*mix(3.75,1.60,push),look.y+.22+push*.11,look.z+Math.cos(side)*mix(3.75,1.60,push));
      if(band.visible){walker.phone.getWorldPosition(ble.v0);walker.badge.getWorldPosition(ble.v2);ble.v1.copy(ble.v0).lerp(ble.v2,.5);ble.v1.y+=.12;
        for(let i=0;i<49;i++){ble.getPoint(i/48,v);bandGeo.attributes.position.setXYZ(i,v.x,v.y,v.z);}bandGeo.attributes.position.needsUpdate=true;bandGeo.setDrawRange(0,Math.round(49*s(t,.31,.50)));}
    } else if(car){
      const x=path(t,.5,.76,-9.5,-2.83,-1.97),z=path(t,.5,.8,-7.8,.74,1.64),sep=s(t,.5,.78);
      sedan.position.set(x,.012,1.50+.26*sep);sedan.rotation.set(.046*Math.sin(sep*Math.PI),Math.PI/2-.19*sep,.012*Math.sin(sep*Math.PI),'YXZ');
      suv.position.set(.36+1.14*sep,.01,z);suv.rotation.set(0,.25*sep,.048*Math.sin(sep*Math.PI),'YXZ');
      turnSedan(-(x+9.5)/.33);turnSuv(-(z+7.8)/.355);
      const push=s(t,.16,.60),release=s(t,.70,1);
      look.set(mix(x,-.66,.72),.74,mix(z,1.47,.64));
      lens.set(look.x+mix(6.6,3.52,push)+release*.59, mix(2.72,1.85,push)+release*.29,look.z+mix(9.35,6.72,push));
    } else if(motor){
      const x=path(t,.50,.88,-6.7,-.5,2.65),lean=s(t,.43,.65),sep=s(t,.53,.84);
      bike.position.set(x,.025+.34*lean,1.55-.51*lean);bike.rotation.set(0,Math.PI*.5+.31*lean,1.32*lean,'YXZ');
      turnBike(-(x+6.7)/.31);ride.pose('ride',t*2,sep);
      ride.root.position.set(x+.90*sep,.015+.27*lean,1.55+.69*sep);
      ride.root.rotation.set(.08+.10*sep,Math.PI*.5+.51*sep,1.48*lean,'YXZ');
      look.set(x+.22*sep,.87-.41*lean,1.54);const push=s(t,.15,.71);
      lens.set(look.x+mix(2.96,2.31,push),mix(1.26,1.90,push),look.z+mix(5.65,4.85,push));
    } else if(foot){
      const x=path(t,.5,.78,-9.6,-2.55,-1.91),z=path(t,.50,.70,3.8,1.45,1.21),slip=s(t,.5,.74);
      sedan.position.set(x,.009,1.45);sedan.rotation.set(0,Math.PI/2,0);turnSedan(-(x+9.6)/.33);
      walker.pose(t<.5?'walk':'brace',Math.min(t,.50)*6,slip);
      walker.root.position.set(-.13+1.54*slip,.01+.20*slip+.21*Math.sin(Math.PI*slip),z-.31*slip);
      walker.root.rotation.set(.08*slip,Math.PI-.13,1.44*slip,'YXZ');
      const push=s(t,.11,.62);look.set(mix(x*.23,-.51,push),.79-.16*slip,1.49);
      lens.set(look.x+mix(5.1,3.91,push),mix(2.70,2.03,push),look.z+mix(8.37,6.83,push));
    } else {
      const x=path(t,.44,.77,-2.7,-.33,.51),slip=s(t,.45,.71),settle=s(t,.68,.88);
      walker.pose(t<.44?'walk':'brace',Math.min(t,.44)*6.3,slip);
      walker.root.position.set(x,.01+.17*slip+.075*Math.sin(settle*Math.PI),2.5+.20*slip);
      walker.root.rotation.set(.19*slip,1.32,-1.49*slip,'YXZ');
      const push=s(t,.13,.68);look.set(x+.28*slip,.98-.58*slip,2.48);
      lens.set(look.x+mix(1.67,1.04,push),mix(1.37,.98,push),look.z+mix(4.71,4.17,push));
    }
    camera.position.copy(lens);camera.lookAt(look);camera.updateMatrixWorld();renderer.render(scene,camera);
    ctx.drawImage(renderer.domElement,0,0);if(pair){if(t<.56)label(ctx,walker.phone,camera,'PHONE',width,height,36);if(t>.41)label(ctx,walker.badge,camera,'WEARABLE',width,height,-114);}
    return image;
  }
  return {render,renderer};
}
