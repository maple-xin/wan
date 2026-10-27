import * as T from './vendor/three.module.min.js';
import {HOUSES,PLOTS,CROPS,RECIPES,OBSTACLES} from './core.js';

// All visible forms are 3D. Small ink/paper details share materials and get batched.
const C={ink:0x322b43,cream:0xffefd2,paper:0xfff7e7,orange:0xe89842,peach:0xf6b876,
 plum:0x574365,lavender:0x9d86ae,sage:0x8ea894,wood:0x9f7253,roof:0x59445f};
const sphere=new T.SphereGeometry(1,14,10),box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,14),cone=new T.ConeGeometry(1,1,14);
let seed=1287;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const paper=document.createElement('canvas');paper.width=paper.height=128;const p=paper.getContext('2d');p.fillStyle='#faf4e9';p.fillRect(0,0,128,128);
for(let i=0;i<1800;i++){p.fillStyle=`rgba(94,66,79,${rnd()*.07})`;p.fillRect(rnd()*128,rnd()*128,1+rnd()*3,.5+rnd());}
const grain=new T.CanvasTexture(paper);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;
const mats=new Map();
function mat(color,glow=false){const key=`${color}-${glow}`;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,map:glow?null:grain,roughness:1,metalness:0,emissive:glow?color:0,emissiveIntensity:glow?.5:0}));return mats.get(key);}
const ink=mat(C.ink),cream=mat(C.cream),orange=mat(C.orange),glow=mat(0xffcd79,true),dark=mat(0x1f2634);
function mesh(parent,g,m,x=0,y=0,z=0,sx=1,sy=sx,sz=sx){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
const ball=(g,m,x,y,z,sx,sy=sx,sz=sx)=>mesh(g,sphere,m,x,y,z,sx,sy,sz);
const block=(g,m,x,y,z,sx,sy,sz)=>mesh(g,box,m,x,y,z,sx,sy,sz);
function tube(g,points,r,m){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));return mesh(g,new T.TubeGeometry(curve,12,r,6,false),m);}
function tri(g,m,x,y,z,s=.2,flip=false){const shape=new T.Shape();shape.moveTo(-s,-s*.6);shape.lineTo(s,-s*.6);shape.lineTo(0,s);shape.closePath();const o=mesh(g,new T.ShapeGeometry(shape),m,x,y,z);if(flip)o.rotation.z=Math.PI;return o;}
function blob(g,x,z,r=1){const o=mesh(g,new T.CircleGeometry(r,24),new T.MeshBasicMaterial({color:0x32243c,transparent:true,opacity:.12,depthWrite:false}),x,.022,z);o.rotation.x=-Math.PI/2;return o;}
function plaque(parent,text,x,y,z,w=3,h=.6,bg='#fff0d2',fg='#493750'){
 const c=document.createElement('canvas');c.width=512;c.height=112;const q=c.getContext('2d');q.fillStyle=bg;q.beginPath();q.roundRect(3,3,506,106,20);q.fill();q.strokeStyle='#9e7e77';q.lineWidth=4;q.stroke();q.fillStyle=fg;q.font='38px PostHand, sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText(text,256,57,475);
 const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,transparent:true,side:T.DoubleSide}));o.position.set(x,y,z);parent.add(o);return o;
}
function pumpkin(parent,x,y,z,scale=1,face=true){
 const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
 const geo=new T.SphereGeometry(.47,20,13),v=geo.attributes.position;
 for(let i=0;i<v.count;i++){const a=Math.atan2(v.getZ(i),v.getX(i)),f=1+.065*Math.cos(a*8);v.setXYZ(i,v.getX(i)*f,v.getY(i)*.87,v.getZ(i)*f);}geo.computeVertexNormals();mesh(g,geo,orange,0,.43,0);
 tube(g,[[0,.79,0],[.02,.98,0],[.12,1.02,.03]],.055,mat(0x697c52));
 if(face){tri(g,glow,-.16,.5,.416,.105);tri(g,glow,.16,.5,.416,.105);tri(g,glow,0,.37,.463,.065);tube(g,[[-.24,.29,.36],[-.12,.19,.415],[0,.18,.444],[.12,.21,.42],[.24,.29,.36]],.035,dark);}
 return g;
}
function hat(g,y=1.8,scale=1,color=C.plum){
 const h=new T.Group();h.position.y=y;h.scale.setScalar(scale);g.add(h);
 const brim=mesh(h,cylinder,mat(color),0,0,0,.64,.055,.53);brim.rotation.z=-.09;
 const geo=new T.ConeGeometry(.43,.98,16,4),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const f=(pos.getY(i)+.49)/.98;pos.setX(i,pos.getX(i)+.3*f*f);pos.setZ(i,pos.getZ(i)-.1*f*f);}geo.computeVertexNormals();mesh(h,geo,mat(color),0,.47,0);
 mesh(h,cylinder,mat(0xab7952),0,.13,0,.39,.16,.39);block(h,mat(0xedb45c),0,.14,.385,.21,.16,.035);block(h,mat(color),0,.14,.411,.11,.075,.02);
 return h;
}
function ermine(){
 const root=new T.Group(),body=new T.Group();root.add(body);
 ball(body,mat(0x554565),0,.78,0,.38,.56,.29);mesh(body,new T.CylinderGeometry(.29,.42,.38,16),mat(0x554565),0,.44,0);
 ball(body,cream,0,1.4,.04,.43,.4,.36);ball(body,cream,0,1.29,.35,.29,.19,.24);ball(body,mat(0xd8a2a3),0,1.36,.57,.055,.04,.035);
 for(const side of [-1,1]){ball(body,cream,side*.29,1.68,.02,.14,.2,.085);ball(body,mat(0xe5b7ad),side*.29,1.69,.09,.075,.12,.02);ball(body,dark,side*.185,1.46,.36,.052,.071,.031);ball(body,mat(0xffffff),side*.17,1.49,.384,.017);ball(body,mat(0xedc4b4),side*.27,1.33,.36,.07,.025,.012);}
 hat(body,1.76,.9);mesh(body,new T.TorusGeometry(.28,.085,7,22),mat(0xe8b14c),0,1.09,0).rotation.x=Math.PI/2;
 block(body,mat(0xe8b14c),.14,.9,.294,.17,.42,.055).rotation.z=-.11;
 for(let i=0;i<3;i++)ball(body,mat(0xddb36b),-.035,.53+i*.17,.286,.037);
 const limbs=[];
 for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.34,.98,0);body.add(arm);ball(arm,mat(0x554565),side*.065,-.2,0,.145,.29,.14);ball(arm,cream,side*.09,-.42,.045,.13,.14,.115);limbs.push(arm);}
 for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.19,.24,0);root.add(leg);ball(leg,cream,0,-.1,.065,.16,.16,.25);limbs.push(leg);}
 const tail=new T.Group();tail.position.set(0,.38,-.16);body.add(tail);tube(tail,[[0,0,0],[.18,.06,-.38],[.33,.33,-.65],[.42,.72,-.55]],.11,cream);tube(tail,[[.42,.72,-.55],[.46,.91,-.46]],.113,dark);
 tube(body,[[-.28,1.03,.1],[.24,.67,.3],[.38,.47,.22]],.045,mat(0xba8a56));const bag=block(body,mat(0x9b644a),.36,.46,.17,.34,.29,.19);bag.rotation.z=-.09;block(body,mat(0xc48b59),.36,.55,.279,.32,.1,.025);block(body,mat(0xe7bb7d),.36,.48,.285,.06,.07,.02);
 pumpkin(body,-.48,.28,.14,.48,false);
 const rigid=new T.Group();for(const child of [...body.children])if(!limbs.includes(child)&&child!==tail)rigid.add(child);body.add(rigid);mergeStatic(rigid);for(const limb of limbs)mergeStatic(limb);mergeStatic(tail);
 return {root,body,limbs,tail};
}
function host(kind){
 const g=new T.Group();
 if(kind==='ghost'){
  const geo=new T.SphereGeometry(.52,20,15),p=geo.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i);if(y<0)y=-.25+.045*Math.sin(Math.atan2(p.getZ(i),p.getX(i))*7);p.setY(i,y);}geo.computeVertexNormals();mesh(g,geo,mat(0xffe9cd),0,.83,0,1,1.2,1);
  for(const s of [-1,1]){ball(g,dark,s*.18,.91,.45,.055,.09,.03);ball(g,mat(0xe8aa98),s*.29,.77,.43,.07,.028,.015);}ball(g,dark,0,.7,.49,.06,.035,.015);
 }else if(kind==='bat'){
  ball(g,mat(0x736076),0,.7,0,.4,.52,.28);ball(g,mat(0x97778b),0,1.17,0,.36,.31,.27);
  for(const s of [-1,1]){tri(g,mat(C.plum),s*.25,1.46,0,.19);ball(g,cream,s*.15,1.21,.245,.1,.11,.035);ball(g,dark,s*.15,1.21,.28,.041);const sh=new T.Shape();sh.moveTo(s*.2,.9);sh.bezierCurveTo(s*.9,1.4,s*1.1,1.05,s*1,.5);sh.quadraticCurveTo(s*.7,.75,s*.55,.3);sh.quadraticCurveTo(s*.38,.6,s*.2,.3);mesh(g,new T.ExtrudeGeometry(sh,{depth:.055,bevelEnabled:false}),mat(0x63516e));}
 }else if(kind==='moon'){
  ball(g,mat(0x9aab92),0,.58,0,.43,.58,.33);ball(g,cream,0,1.19,0,.48,.44,.35);
  for(const s of [-1,1]){ball(g,mat(0xdbc9a5),s*.2,1.2,.28,.19,.2,.1);ball(g,dark,s*.2,1.22,.36,.07);ball(g,mat(0xffffff),s*.18,1.25,.42,.019);}tri(g,mat(0xd6a34a),0,1.02,.43,.095,true);hat(g,1.53,.76,0x4b6d62);
 }else{
  ball(g,mat(0xa9b6a5),0,.65,0,.38,.53,.28);ball(g,cream,0,1.15,0,.42,.38,.32);for(const s of [-1,1]){ball(g,cream,s*.19,1.66,0,.12,.4,.11);ball(g,mat(0xe2b39e),s*.19,1.68,.09,.065,.28,.02);ball(g,dark,s*.14,1.2,.3,.048,.07,.025);}block(g,mat(0xe6bb7b),0,.72,.3,.35,.28,.045);
 }mergeStatic(g);return g;
}
function roof(g,width,depth,height,color){
 const sh=new T.Shape();sh.moveTo(-width/2,0);sh.lineTo(width/2,0);sh.lineTo(.17,height);sh.closePath();const geom=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:1,steps:1});mesh(g,geom,mat(color),0,2.55,-depth/2);
 const top=2.55+height;for(let side=-1;side<=1;side+=2){tube(g,[[side*width/2,2.55,depth/2+.09],[.17,top,depth/2+.09]],.075,mat(0xd1ac8b));for(let row=1;row<=3;row++){const yy=2.55+height*row/4,xx=(width/2)*(1-row/4);tube(g,[[side*xx,yy,-depth/2],[side*xx,yy,depth/2]],.022,mat(0x44364e));}}
}
function cottage(parent,h){
 const g=new T.Group();g.position.set(h.x,0,h.z);parent.add(g);const color={post:0xc68e6b,bakery:0x8eaaa0,neighbors:0x95839e,decor:0xa17d8d}[h.id]||0xa79085;
 const w=4.45,d=3.5;block(g,mat(0x817078),0,.18,0,4.8,.36,3.95);block(g,mat(color),0,1.4,0,w,2.45,d);
 // Hand-laid siding and cream timber are actual shallow relief, not a blank box.
 for(let i=0;i<8;i++)block(g,mat(0xa58377),0,.45+i*.27,d/2+.012,w,.024,.027);
 for(const side of [-1,1])block(g,mat(0xe3c6a1),side*(w/2-.12),1.39,d/2+.05,.14,2.5,.12);
 roof(g,5.05,4.1,1.77,h.id==='bakery'?0x536b66:0x5b4968);
 const chimney=block(g,mat(0x997766),-1.25,4.1,-.5,.53,1.1,.57);chimney.rotation.z=-.12;block(g,mat(0xd1ac86),-1.2,4.65,-.5,.72,.14,.75);
 // Wide readable windows, shutters, panes, flower/leaf boxes.
 for(const side of [-1,1]){const x=side*1.36;block(g,mat(0xf1d7a8),x,1.63,d/2+.055,1.15,1.24,.12);block(g,glow,x,1.63,d/2+.132,.91,1.02,.025);block(g,mat(0x725a63),x,1.63,d/2+.16,.055,1.05,.04);block(g,mat(0x725a63),x,1.63,d/2+.16,.94,.055,.04);for(const s of [-1,1]){const shutter=block(g,mat(0x70857a),x+s*.72,1.63,d/2+.08,.25,1.15,.09);shutter.rotation.y=s*.2;for(let n=0;n<5;n++)block(g,mat(0x9aaa8b),x+s*.72,1.24+n*.17,d/2+.14,.23,.025,.025);}block(g,mat(0x835d4e),x,.88,d/2+.2,1.35,.26,.38);for(let i=0;i<4;i++)ball(g,mat(i%2?C.orange:0xb39280),x-.45+i*.3,1.03,d/2+.2,.16,.16,.15);}
 block(g,mat(0xe5c79d),0,1.2,1.85,1.25,2.2,.2);block(g,ink,0,1.2,1.97,1.03,1.98,.06);block(g,mat(0xbaa28e),0,.35,2.1,1.45,.18,.68);
 plaque(g,h.name||h.id,0,2.85,2.28,3.7,.6);pumpkin(g,-1.1,.1,2.18,.78);pumpkin(g,1.03,.1,2.17,.5);
 for(let i=0;i<3;i++)block(g,mat(0xc5a282),0,.08,2.65+i*.5,1.15,.12,.42);
 if(h.id==='post'){ball(g,mat(0xd5a45f),0,3.48,2.12,.4,.4,.07);for(let i=0;i<6;i++)ball(g,mat(0x645061),Math.sin(i*2.4)*.25,3.48+Math.cos(i*2.4)*.25,2.19,.045,.045,.02);}
 else if(h.id==='bakery'){const m=mesh(g,new T.TorusGeometry(.32,.065,8,32,Math.PI*1.65),glow,0,3.48,2.15);m.rotation.z=-.8;}
 else if(h.id==='neighbors'){const m=host('ghost');m.position.set(0,3.05,2.1);m.scale.setScalar(.5);g.add(m);}
 else{const m=host('bat');m.position.set(0,3.04,2.1);m.scale.setScalar(.5);g.add(m);}
 for(let i=0;i<5;i++){const pos=-2+i;const globe=ball(g,mat(i%2?0xdba060:0xc8a1be,true),pos,2.62+Math.sin(i)*.1,1.98,.075);globe.castShadow=false;}
 // Diagonal little bunting, bat rosettes, and hand-painted doorstep make each facade specific.
 for(let i=0;i<5;i++){const sh=new T.Shape();sh.moveTo(-.14,.12);sh.lineTo(.14,.12);sh.lineTo(0,-.18);sh.closePath();mesh(g,new T.ShapeGeometry(sh),mat(i%2?C.orange:0x8d749c),-1.65+i*.82,2.48-Math.cos(i)*.12,2.0);}
 return g;
}
function oak(parent,x,z,size=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(size);parent.add(g);tube(g,[[0,0,0],[.04,1.1,0],[-.18,2.45,0],[.1,3.25,.02]],.18,mat(0x765451));
 for(let i=0;i<4;i++){const side=i%2?-1:1,y=1.2+i*.4;tube(g,[[0,y,0],[side*.6,y+.7,.05],[side*.94,y+.8,.04]],.085,mat(0x765451));}
 for(let i=0;i<7;i++){const a=i*2.4;ball(g,mat([0xb57559,0x9d665e,0xc08b65,0x8b6a86][i%4]),Math.sin(a)*.75,2.5+(i%3)*.38,Math.cos(a)*.55,.8,.65,.7);}blob(g,0,0,.85);return g;}
function lamp(parent,x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);mesh(g,cylinder,mat(0x655a65),0,.12,0,.28,.24,.28);mesh(g,cylinder,ink,0,1.4,0,.07,2.6,.07);tube(g,[[0,2.65,0],[.15,3.02,0],[.5,2.95,0],[.5,2.7,0]],.055,ink);block(g,mat(0xecb967,true),.5,2.4,0,.35,.5,.3);for(const a of [-1,1])for(const b of [-1,1])block(g,ink,.5+a*.18,2.4,b*.15,.035,.57,.035);mesh(g,cone,ink,.5,2.76,0,.31,.25,.31);block(g,ink,.5,2.1,0,.44,.08,.37);return g;}
function mergeStatic(group){
 group.updateMatrixWorld(true);const toLocal=new T.Matrix4().copy(group.matrixWorld).invert(),batches=new Map();
 group.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const k=o.material.uuid;if(!batches.has(k))batches.set(k,{mat:o.material,parts:[],count:0});const b=batches.get(k),geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(new T.Matrix4().multiplyMatrices(toLocal,o.matrixWorld));b.parts.push(geo);b.count+=geo.attributes.position.count;});
 group.clear();for(const b of batches.values()){const geo=new T.BufferGeometry();for(const [key,size]of [['position',3],['normal',3],['uv',2]]){const values=new Float32Array(b.count*size);let offset=0;for(const part of b.parts){const attr=part.getAttribute(key);if(attr)values.set(attr.array,offset);offset+=part.attributes.position.count*size;}geo.setAttribute(key,new T.BufferAttribute(values,size));}geo.computeBoundingSphere();const o=new T.Mesh(geo,b.mat);o.castShadow=true;o.receiveShadow=true;group.add(o);for(const part of b.parts)part.dispose();}
}

export function createWorld(canvas){
 const scene=new T.Scene();scene.background=new T.Color(0x51485f);scene.fog=new T.Fog(0x51485f,35,83);
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const camera=new T.PerspectiveCamera(40,1,.1,150),pickables=[],staticWorld=new T.Group();scene.add(staticWorld);
 scene.add(new T.HemisphereLight(0xf5dbc7,0x665578,1.65));const sun=new T.DirectionalLight(0xffd5a2,1.8);sun.position.set(-10,22,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-21;sun.shadow.camera.right=21;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;sun.shadow.normalBias=.04;sun.shadow.bias=-.0003;scene.add(sun);scene.add(sun.target);
 const fill=new T.DirectionalLight(0xbcb5df,.7);fill.position.set(12,10,-10);scene.add(fill);
 // Rounded storybook diorama ground and distinct warm flagstone lanes.
 const sh=new T.Shape();sh.moveTo(-12.8,-14);sh.lineTo(12.8,-14);sh.quadraticCurveTo(14,-14,14,-12.8);sh.lineTo(14,12.8);sh.quadraticCurveTo(14,14,12.8,14);sh.lineTo(-12.8,14);sh.quadraticCurveTo(-14,14,-14,12.8);sh.lineTo(-14,-12.8);sh.quadraticCurveTo(-14,-14,-12.8,-14);
 const ground=new T.ExtrudeGeometry(sh,{depth:.5,bevelEnabled:true,bevelSegments:3,bevelSize:.3,bevelThickness:.2,steps:1});const island=mesh(staticWorld,ground,mat(0x685975));island.rotation.x=-Math.PI/2;island.position.y=-.8;
 block(staticWorld,mat(0xa98b80),0,-.015,1,3.2,.08,24);for(const z of [5.2,-4])block(staticWorld,mat(0xa98b80),0,0,z,24,.08,2.2);
 // Flagstones are individually irregular but batched with the world.
 for(let i=0;i<24;i++)for(let j=0;j<3;j++){const s=block(staticWorld,mat([0xc9ac8b,0xd3b596,0xb49a8d][(i+j)%3]),(j-1)*.9+(rnd()-.5)*.08,.05,-10.2+i*.92,.79,.08,.79);s.rotation.y=(rnd()-.5)*.14;}
 for(const z of [5.2,-4])for(let i=0;i<25;i++)for(let j=0;j<2;j++){const s=block(staticWorld,mat([0xc9ac8b,0xd3b596,0xb49a8d][(i+j)%3]),-11+i*.92,.055,z+(j-.5)*.92,.82,.08,.81);s.rotation.y=(rnd()-.5)*.12;}
 const houseViews=[];for(const h of HOUSES){const g=new T.Group();scene.add(g);cottage(g,h);mergeStatic(g);for(const o of g.children)o.material=o.material.clone();g.userData.pick={panel:{post:'letters',bakery:'bakery',neighbors:'team',decor:'decor'}[h.id]};pickables.push(g);houseViews.push({g,h,opacity:1,bounds:new T.Box3(new T.Vector3(h.x-2.6,0,h.z-2.2),new T.Vector3(h.x+2.6,4.8,h.z+2.2))});}
 // All solid tree trunks come from core obstacles, keeping visible and physical space aligned.
 const treeObs=OBSTACLES.filter(o=>o.kind==='tree');
 const trees=treeObs.length?treeObs:[{x:-12,z:9},{x:12,z:9},{x:-12,z:-11},{x:12,z:-11}];
 for(const [i,o]of trees.entries())oak(staticWorld,o.x,o.z,.75+(i%3)*.15);
 for(const [x,z]of [[-3,9],[3,9],[-3,-9],[3,-9],[-11,1],[11,1]])lamp(staticWorld,x,z,.7);
 for(let i=0;i<40;i++){const a=i*.71,x=Math.sin(a)*(11.5+(i%3)*.3),z=Math.cos(a)*(11.5+(i%2)*.5);if(Math.abs(x)<3&&z>9)continue;pumpkin(staticWorld,x,.03,z,.35+(i%4)*.12,i%3===0);}
 // Low pickets stop at the entrance; boundary collisions are at the same outer edge.
 for(let side=-1;side<=1;side+=2){for(let i=0;i<21;i++){const z=-12+i*1.15;const o=block(staticWorld,mat(0x77676f),side*14,.58,z,.12,1.05,.18);o.rotation.x=(i%3-1)*.04;}for(const y of [.34,.74])block(staticWorld,mat(0x655966),side*14,y,0,.1,.09,26);}
 for(let i=0;i<22;i++){const x=-12.3+i*1.17;block(staticWorld,mat(0x77676f),x,.58,-14,.16,1.05,.12);}for(const y of [.34,.74])block(staticWorld,mat(0x655966),0,y,-14,26,.09,.1);
 // A paper moon and stars keep the diorama backdrop quiet.
 
 const moon=ball(staticWorld,mat(0xf7dfad,true),-12,16,-25,2.3);moon.castShadow=false;
 for(let i=0;i<35;i++){const o=ball(staticWorld,mat(0xe4cfa5,true),-24+rnd()*48,10+rnd()*11,-29-rnd()*7,.025+rnd()*.04);o.castShadow=false;}
 // Readable overhead garlands with orange/purple pennants.
 for(const z of [9,-1,-10]){tube(staticWorld,[[-11,3.7,z],[0,3.05,z],[11,3.7,z]],.018,ink);for(let i=0;i<15;i++){const x=-10+i*1.4;tri(staticWorld,mat(i%2?0xd6a16c:0x8a779a),x,3.25+.35*Math.abs(x)/10,z,.16,true);}}
 mergeStatic(staticWorld);
 const hero=ermine();scene.add(hero.root);const heroShadow=blob(scene,0,0,.48);
 const houses=new Map();for(const h of HOUSES){const g=new T.Group();g.position.set(h.x,0,h.z);scene.add(g);const doorPivot=new T.Group();doorPivot.position.set(-.48,.25,1.99);g.add(doorPivot);const door=block(doorPivot,mat(h.id==='bakery'?0x516e66:0x64516e),.48,.99,0,.96,1.98,.08);for(let i=0;i<4;i++)block(doorPivot,mat(0x473c50),.15+i*.2,.98,.05,.022,1.75,.015);ball(doorPivot,mat(0xe8ba69),.83,1,.09,.062);mergeStatic(doorPivot);const hostRoot=host(h.id==='post'?'cookie':h.id==='bakery'?'moon':h.id==='neighbors'?'ghost':'bat');hostRoot.position.set(0,.18,2.05);hostRoot.visible=false;g.add(hostRoot);const step=mesh(g,new T.TorusGeometry(.78,.035,6,40),mat(0xe7bc74,true),0,.11,2.4);step.rotation.x=-Math.PI/2;houses.set(h.id,{root:g,door:doorPivot,host:hostRoot,step});}
 const plots=[];
 function cropModel(type){const g=new T.Group();if(type==='pumpkin'){for(let i=0;i<3;i++){const x=(i-1)*.46,z=(i%2-.5)*.45;pumpkin(g,x,.04,z,.52,false);for(const side of [-1,1]){const leaf=ball(g,mat(0x78915d),x+side*.25,.25,z,.27,.035,.14);leaf.rotation.z=side*.2;}}}else{for(let i=0;i<8;i++){const x=(i%4-1.5)*.32,z=(Math.floor(i/4)-.5)*.5;mesh(g,cylinder,mat(0xb89a53),x,.5,z,.025,1,.025);for(let j=0;j<3;j++)for(const side of [-1,1]){const ear=ball(g,mat(0xe6c47b),x+side*.055,.67+j*.12,z,.065,.13,.045);ear.rotation.z=-side*.45;}}}mergeStatic(g);return g;}
 for(const def of PLOTS){const g=new T.Group();g.position.set(def.x,.06,def.z);scene.add(g);g.userData.pick={panel:'garden',plot:def.id};pickables.push(g);const bed=new T.Group();g.add(bed);block(bed,mat(0x705042),0,.07,0,1.95,.15,1.65);for(const x of [-1,1])block(bed,mat(0xb18a64),x*.98,.16,0,.09,.25,1.78);for(const z of [-1,1])block(bed,mat(0xb18a64),0,.16,z*.85,2.05,.25,.09);mergeStatic(bed);const crops={};for(const type of ['pumpkin','wheat']){const plant=cropModel(type);g.add(plant);plant.visible=false;crops[type]=plant;}const ready=mesh(g,new T.TorusGeometry(.85,.035,6,32),mat(0xc7d695,true),0,.23,0);ready.rotation.x=-Math.PI/2;ready.visible=false;plots.push({id:def.id,root:g,crops,ready});}
 const team=[];for(const id of ['farmer','baker']){const g=host(id==='farmer'?'moon':'cookie');const paws=[];for(const side of [-1,1]){const paw=new T.Group();paw.position.set(side*.4,.8,.05);g.add(paw);ball(paw,cream,side*.04,-.15,.05,.12,.24,.11);paws.push(paw);}scene.add(g);const shadow=blob(scene,0,0,.45);team.push({id,root:g,paws,shadow});}
 const decorSites=[[-10.4,8.6],[0,7],[10.5,8.5]],decorViews=[];
 for(let i=0;i<3;i++){const g=new T.Group();g.position.set(...[decorSites[i][0],0,decorSites[i][1]]);scene.add(g);if(i===0){for(let k=0;k<5;k++)pumpkin(g,(k%3-1)*.65,.03,Math.floor(k/3)*.65,.55+(k%2)*.15,true);lamp(g,-1.3,.3,.7);}else if(i===1){block(g,mat(0xaf835a),0,.73,0,1.8,.14,1.25);for(const x of [-.65,.65])for(const z of [-.4,.4])block(g,mat(0x876248),x,.35,z,.12,.7,.12);block(g,mat(0xe4b078),0,.82,0,1.85,.04,1.3);for(let k=0;k<5;k++)block(g,cream,(k-2)*.35,.85,0,.1,.015,1.32);for(const x of [-.5,.4]){mesh(g,cylinder,mat(0xd2a56d),x,.95,0,.13,.22,.13);ball(g,mat(0xffdb8a),x,1.07,0,.11,.01,.11);}}else{lamp(g,-.8,0,.8);lamp(g,.8,0,.8);tube(g,[[-1.5,2.1,0],[0,1.8,0],[1.5,2.1,0]],.03,mat(0xbd9862));for(let j=0;j<5;j++)tri(g,mat(j%2?0xe2b264:0xb197bb),-.9+j*.45,1.8,0,.17,true);}mergeStatic(g);g.visible=false;decorViews.push(g);}
 const post=new T.Group();post.position.set(-5.7,0,6.8);scene.add(post);mesh(post,cylinder,mat(0x746157),0,.64,0,.1,1.28,.1);block(post,mat(0x68516c),0,1.35,0,.98,.79,.7);block(post,mat(0xddb586),0,1.41,.36,.7,.11,.025);plaque(post,'PUMPKIN POST',0,1.88,.4,2.3,.4);pumpkin(post,0,1.7,0,.66,true);tube(post,[[-.42,1.63,.37],[0,1.3,.4],[.42,1.63,.37]],.022,mat(C.cream));const flag=block(post,mat(C.orange),.65,1.75,0,.32,.31,.05);flag.rotation.z=.05;
 const mailboxRing=mesh(scene,new T.TorusGeometry(1.1,.045,6,48),mat(0xd9bd81,true),-7,.12,6.4);mailboxRing.rotation.x=-Math.PI/2;
 // Cheap instanced drifting autumn leaves, never used as colliders.
 const leafGeo=new T.SphereGeometry(.06,4,3),leaves=new T.InstancedMesh(leafGeo,mat(0xc88b65),60),dummy=new T.Object3D();scene.add(leaves);
 const drops=new Map(),effects=[],targetRing=mesh(scene,new T.TorusGeometry(.65,.028,6,40),mat(0xf3cb8f,true));targetRing.rotation.x=-Math.PI/2;targetRing.visible=false;
 let sceneFocus=null,azimuth=.2,distance=21,zoomUser=0,visualTime=0,camTarget=new T.Vector3(0,0,1),lastX=0,lastZ=9.8,stride=0;
 const desired=new T.Vector3(),look=new T.Vector3(),occlusionRay=new T.Ray(),occlusionHit=new T.Vector3(),heroEye=new T.Vector3();
 function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,w<800||matchMedia('(pointer:coarse)').matches?1.25:1.75));renderer.setSize(w,h,false);camera.aspect=w/h;if(sceneFocus&&w/h<1.2)camera.setViewOffset(w,h,0,h*.2,w,h);else camera.clearViewOffset();camera.updateProjectionMatrix();}
 function feedback(event){if(!['harvest','cook','collect','ship','shipped','decorate','hire','party'].includes(event.type))return;const h=HOUSES.find(h=>h.id===(event.house||event.id));const origin=h?{x:h.x,z:h.z+2.2}:event.x!==undefined?event:{x:lastX,z:lastZ};for(let i=0;i<(event.type==='party'?24:8);i++){const o=ball(scene,mat(i%2?0xeac06b:0xbfa8c9,true),origin.x,.9,origin.z,.05,.08,.045);effects.push({o,life:0,vx:Math.cos(i*2.4)*(.6+rnd()),vz:Math.sin(i*2.4)*(.6+rnd()),vy:2+rnd()*2});}}
 function update(s,dt,events=[],target=null){
  visualTime+=dt;for(const e of events)feedback(e);const time=s.time||0,moving=Math.hypot((s.x??0)-lastX,(s.z??9.8)-lastZ)>.0003&&s.phase==='play';stride+=moving?dt*11:0;
  hero.root.position.set(s.x||0,0,s.z??9.8);hero.root.rotation.y=s.yaw||0;hero.body.position.y=moving?Math.sin(stride*2)*.035:Math.sin(visualTime*2)*.012;
  hero.limbs[2].rotation.x=moving?Math.sin(stride)*.48:0;hero.limbs[3].rotation.x=moving?-Math.sin(stride)*.48:0;hero.limbs[0].rotation.x=moving?-Math.sin(stride)*.35:0;hero.limbs[1].rotation.x=moving?Math.sin(stride)*.35:0;hero.tail.rotation.y=Math.sin(visualTime*3)*.13;
  const activity=s.activity;
  if(activity){const k=activity.kind,progress=activity.progress||0;if(['plant','harvest'].includes(k)){hero.body.position.y=-.21;hero.body.rotation.x=-.35;for(const arm of hero.limbs.slice(0,2))arm.rotation.x=-.8+Math.sin(progress*10)*.15;}else if(['cook','craft','collect'].includes(k)){hero.body.rotation.x=-.1;hero.limbs[0].rotation.x=-.75+Math.sin(progress*12)*.2;hero.limbs[1].rotation.x=-.75-Math.sin(progress*12)*.2;}else{hero.body.rotation.x=-.06;hero.limbs[1].rotation.x=-1+Math.sin(progress*8)*.1;}}else hero.body.rotation.x=0;
  hero.root.visible=true;heroShadow.position.set(s.x,.023,s.z);lastX=s.x;lastZ=s.z;
  for(const h of HOUSES){const v=houses.get(h.id),near=Math.hypot(s.x-h.door.x,s.z-h.door.z)<1.8,active=!!activity&&near;v.door.rotation.y=T.MathUtils.damp(v.door.rotation.y,active?-1.15:0,5,dt);v.host.visible=h.id==='neighbors'||active;v.host.position.y=.2+Math.sin(visualTime*2+h.x)*.025;v.step.material=mat(near?0xe7bc74:0xbda8c4,true);}
  for(const v of plots){const plot=s.plots?.find(p=>p.id===v.id),crop=plot?.crop;for(const id of ['pumpkin','wheat']){v.crops[id].visible=id===crop;if(id===crop){const duration=CROPS[id]?.duration||CROPS[id]?.time||8,remaining=Math.max(0,plot.readyAt-s.time);v.crops[id].scale.setScalar(.2+.8*(1-Math.min(1,remaining/duration)));}}v.ready.visible=!!crop&&plot.readyAt<=s.time;v.ready.scale.setScalar(1+Math.sin(visualTime*3)*.04);}
  for(const v of team){v.root.visible=!!s.helpers?.[v.id];v.shadow.visible=v.root.visible;if(!v.root.visible)continue;const task=(s.helperTasks||[]).find(t=>t.id===v.id),home=s.helperPos?.[v.id]||(v.id==='farmer'?{x:-3.8,z:1.5}:{x:8.5,z:6.6}),x=task?.x??home.x,z=task?.z??home.z,working=task?.stage==='work';if(task?.path?.length){const next=task.path[0];v.root.rotation.y=Math.atan2(next.x-x,next.z-z);}v.root.position.set(x,working?-.08:task?Math.sin(visualTime*9)*.025:0,z);if(working&&v.id==='baker')v.root.rotation.y=Math.PI;v.root.rotation.x=working?-.2:0;v.shadow.position.set(x,.023,z);for(let j=0;j<2;j++)v.paws[j].rotation.x=task?Math.sin(visualTime*(working?12:8)+j*Math.PI)*(working?.6:.25):0;}
  decorViews.forEach((v,i)=>v.visible=(s.decor||[]).includes(i));
  for(let i=0;i<60;i++){const a=i*2.4;dummy.position.set(Math.sin(a)*13+Math.sin(visualTime*.25+i)*.5,.1+((i*.7-visualTime*.35)%4+4)%4,Math.cos(a)*12+Math.cos(visualTime*.2+i)*.5);dummy.rotation.set(visualTime+i,0,i);dummy.scale.set(1,.2,2);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}leaves.instanceMatrix.needsUpdate=true;
  for(let i=effects.length-1;i>=0;i--){const f=effects[i];f.life+=dt;f.vy-=dt*5;f.o.position.x+=f.vx*dt;f.o.position.z+=f.vz*dt;f.o.position.y+=f.vy*dt;f.o.scale.multiplyScalar(1-dt*.65);if(f.life>1.1){scene.remove(f.o);effects.splice(i,1);}}
  let mark;if(target?.kind==='plot')mark=PLOTS.find(p=>p.id===target.id||p.id===target.plot);else if(target?.kind==='site')mark=HOUSES.find(h=>h.id===target.id||h.id===target.site)?.door;
  if(mark){targetRing.visible=true;targetRing.position.set(mark.x,.26,mark.z);targetRing.scale.setScalar(1+Math.sin(visualTime*4)*.04);}else targetRing.visible=false;
  mailboxRing.visible=(s.orders||[]).some(o=>Object.entries(o.needs||{}).every(([id,n])=>(s.inventory?.[id]||0)>=n));mailboxRing.scale.setScalar(1+Math.sin(visualTime*3)*.05);flag.rotation.z=(s.delivered||0)>=6?Math.sin(visualTime*3)*.3:.05;
  const overview=s.phase==='title',mobile=camera.aspect<.9,wantDistance=overview?(mobile?41:33):sceneFocus?(mobile?21:20):mobile?23:20;
  distance=T.MathUtils.damp(distance,wantDistance+zoomUser,4,dt);const follow=overview?new T.Vector3(0,.4,1):sceneFocus?new T.Vector3(sceneFocus.x,.4,sceneFocus.z):new T.Vector3(s.x,.6,s.z-1.6);camTarget.lerp(follow,1-Math.exp(-dt*4));
  desired.set(camTarget.x+Math.sin(azimuth)*distance*.7,camTarget.y+distance*.83,camTarget.z+Math.cos(azimuth)*distance*.86);camera.position.copy(desired);look.copy(camTarget);camera.lookAt(look);
  heroEye.set(s.x,1.2,s.z);occlusionRay.set(heroEye,desired.clone().sub(heroEye).normalize());for(const v of houseViews){const hit=!overview&&occlusionRay.intersectBox(v.bounds,occlusionHit)&&occlusionHit.distanceTo(heroEye)<desired.distanceTo(heroEye);v.opacity=T.MathUtils.damp(v.opacity,hit?.22:1,7,dt);for(const o of v.g.children){o.material.transparent=v.opacity<.99;o.material.opacity=v.opacity;o.material.depthWrite=v.opacity>.98;}}
  renderer.render(scene,camera);
 }
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();function pick(clientX,clientY){const r=canvas.getBoundingClientRect();pointer.set((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);for(const hit of raycaster.intersectObjects(pickables,true)){let node=hit.object;while(node){if(node.userData.pick)return node.userData.pick;node=node.parent;}}return null;}
 resize();const ro=new ResizeObserver(resize);ro.observe(canvas);
 return {update,resize,pick,focus(panel,plot){if(!panel)sceneFocus=null;else if(panel==='garden')sceneFocus={x:0,z:-.9};else{const h=HOUSES.find(h=>h.id===({letters:'post',team:'neighbors'}[panel]||panel));sceneFocus=h?{x:h.x,z:h.z+1}:null;}resize();},camera,renderer,scene,hero,look:delta=>{azimuth+=delta;},zoom:delta=>{zoomUser=T.MathUtils.clamp(zoomUser-delta*1.5,-6,12);},home:()=>{azimuth=.2;zoomUser=0;},get yaw(){return azimuth;},get diagnostics(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,dpr:renderer.getPixelRatio(),shadows:1,postPasses:0};},dispose:()=>{ro.disconnect();renderer.dispose();}};
}
