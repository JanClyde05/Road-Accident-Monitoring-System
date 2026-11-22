import * as T from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const dark=new T.MeshStandardMaterial({color:0x18242b,roughness:.26,metalness:.52});
const cyan=new T.MeshBasicMaterial({color:0x79efe1});
function object(parent,geo,mat,pos){const o=new T.Mesh(geo,mat);o.position.set(...pos);parent.add(o);return o;}
const v=(x,y,z)=>new T.Vector3(x,y,z);
const lerp=T.MathUtils.lerp;

export function person(gltf,helmet=false){
  const root=clone(gltf.scene), joints={};
  root.traverse(o=>{if(o.isBone) joints[o.name]=o;if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
  const player=new T.AnimationMixer(root);
  const clips=Object.fromEntries(['walk','idle'].map(name=>[name,player.clipAction(T.AnimationClip.findByName(gltf.animations,name))]));
  const chest=joints.chest;
  const badge=object(chest,new RoundedBoxGeometry(.084,.103,.028,2,.009),dark,[.045,.068,.143]);
  object(badge,new T.BoxGeometry(.016,.007,.001),cyan,[.019,.032,.0145]);
  const phone=object(root,new RoundedBoxGeometry(.077,.158,.011,2,.008),dark,[0,0,0]);
  object(phone,new T.PlaneGeometry(.069,.141),new T.MeshBasicMaterial({color:0x326475}),[0,0,.0061]);
  for(let i=0;i<3;i++)object(phone,new T.PlaneGeometry(.048-i*.007,i?.004:.019),i?new T.MeshBasicMaterial({color:0xaad1d4}):cyan,[0,.031-i*.022,.0064]);
  if(helmet){
    const shell=object(joints.head,new T.SphereGeometry(1,32,18),new T.MeshStandardMaterial({color:0x393f45,metalness:.64,roughness:.2}),[0,.095,.017]);
    shell.scale.set(.134,.156,.145);
    const visor=object(joints.head,new T.SphereGeometry(1,24,15),new T.MeshStandardMaterial({color:0x1b3941,metalness:.84,roughness:.12}),[0,.097,.099]);
    visor.scale.set(.128,.068,.08);
  }
  const temp=new T.Vector3(), d=new T.Vector3(), turn=new T.Quaternion();
  function aim(bone,child,target) {
    const b=joints[bone],c=joints[child];root.updateMatrixWorld(true);
    b.parent.worldToLocal(temp.copy(target));d.copy(c.position).applyQuaternion(b.quaternion).normalize();
    temp.sub(b.position).normalize();turn.setFromUnitVectors(d,temp);b.quaternion.premultiply(turn);
  }
  function pose(mode,time,progress=0) {
    // Solve in the local actor frame. Skin, clothes and fingers move together.
    const at=root.position.clone(),q=root.quaternion.clone();root.position.set(0,0,0);root.quaternion.identity();
    for(const [name,a] of Object.entries(clips)){a.play();a.enabled=name===(mode==='walk'?'walk':'idle');}
    player.setTime(Math.max(0,time));
    if(mode==='pair'||mode==='ride'||mode==='brace'){
      const seated=mode==='ride',f=mode==='brace',raised=seated?1:progress;
      if(seated){
        joints.hips.position.y=.87;joints.spine.rotateX(.2);
      }
      joints.neck.rotateX(!seated&&!f?.2*raised:0);
      for(const [suffix,s] of [['L',1],['R',-1]]){
        if(seated){
          aim('thigh_'+suffix,'calf_'+suffix,v(s*.22,.58,.25));
          aim('calf_'+suffix,'foot_'+suffix,v(s*.21,.28,-.04));
        }
        const elbow=seated?v(s*.27,1.12,.26):f?v(s*(.23+.15*raised),1.19,.18):v(s*.23,1.07+.13*raised,.1);
        const hand=seated?v(s*.31,1.04,.49):f?v(s*(.32+.22*raised),.96,.28+.18*raised):v(s*.075,1.055+.28*raised,.24+.07*raised);
        aim('upperarm_'+suffix,'forearm_'+suffix,elbow);
        aim('forearm_'+suffix,'hand_'+suffix,hand);
      }
    }
    root.updateMatrixWorld(true);phone.visible=mode==='pair';
    if(phone.visible){joints.hand_R.getWorldPosition(phone.position);phone.position.add(v(.013,.05,.014));phone.rotation.set(-.35,Math.PI-.2,.025);}
    root.position.copy(at);root.quaternion.copy(q);root.updateMatrixWorld(true);
  }
  return {root,pose,phone,badge};
}

export function crushable(root,sideImpact=false) {
  root.updateMatrixWorld(true);
  const chunks=[],p=v(0,0,0),changed=v(0,0,0),inverse=new T.Matrix4();
  root.traverse(mesh=>{
    if(!mesh.isMesh || /wheel|tire|steer|dashboard|caliper|leather|bays/i.test(mesh.name+' '+mesh.parent.name))return;
    const geometry=mesh.geometry.clone();mesh.geometry=geometry;
    const original=geometry.attributes.position, target=new Float32Array(original.count*3);
    let active=false;inverse.copy(mesh.matrixWorld).invert();
    for(let i=0;i<original.count;i++){
      p.fromBufferAttribute(original,i).applyMatrix4(mesh.matrixWorld);
      const nose=T.MathUtils.smoothstep(p.z,.85,2.35),side=T.MathUtils.smoothstep(-p.x,.50,.96);
      const length=sideImpact?side*(1-T.MathUtils.smoothstep(Math.abs(p.z-.45),.18,1.58)):nose*(.63+.37*T.MathUtils.smoothstep(p.x,-1,.8));
      changed.copy(p);
      if(length>.0001){
        active=true;
        if(sideImpact){changed.x+=.32*length;changed.y+=.046*Math.sin(p.z*11)*length;}
        else {changed.z-=.58*length;changed.y+=(.14+.085*Math.cos(p.z*12+p.x*3.))*length*T.MathUtils.smoothstep(p.y,.42,.81);changed.x+=Math.sign(p.x)*.048*length;}
      }
      changed.applyMatrix4(inverse).toArray(target,i*3);
    }
    if(active){geometry.morphAttributes.position=[new T.Float32BufferAttribute(target,3)];mesh.updateMorphTargets();chunks.push(mesh);}
  });
  return n=>{for(const o of chunks)o.morphTargetInfluences[0]=n;};
}

export function splinters(scene) {
  const count=24,geometry=new T.TetrahedronGeometry(1),
    debris=new T.InstancedMesh(geometry,new T.MeshStandardMaterial({color:0x859d9e,roughness:.28,metalness:.6}),count);
  debris.frustumCulled=false;scene.add(debris);
  const dummy=new T.Object3D();
  return function show(visible,time){
    debris.visible=visible&&time>0;if(!debris.visible)return;
    for(let i=0;i<count;i++){
      const seed=(Math.sin(i*45.19+.8)*4812.44)%1, angle=i*2.399+.3, rad=.8+Math.abs(seed)*1.4;
      const vx=Math.cos(angle)*rad+.7,vz=Math.sin(angle)*rad,vy=.8+Math.abs(seed)*1.4,y0=.54;
      const landing=(vy+Math.sqrt(vy*vy+2*9.81*y0))/9.81;
      const since=Math.max(0,time-landing), travel=Math.min(time,landing)+.32*(1-Math.exp(-since*3.5));
      const rise=since?Math.max(0,1.3*since-4.905*since*since):Math.max(0,y0+vy*time-4.905*time*time);
      dummy.position.set(-.36+vx*travel,.013+rise,.97+vz*travel);
      dummy.rotation.set(angle+Math.min(time,landing+.28)*7,angle*.3,.07+Math.min(time,landing+.28)*10);
      const s=.022+.039*Math.abs(seed);dummy.scale.set(s*1.75,s*.45,s);dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix);
    }
    debris.instanceMatrix.needsUpdate=true;
  };
}
