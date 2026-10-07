import * as THREE from './assets/vendor/three.module.js';
const host=document.getElementById('hand-visual');
try {
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.setClearColor(0,0);host.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-label','立体双手：自然弯曲的十根手指、指甲和关节');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,9,10.8);camera.zoom=1.2;camera.lookAt(0,.3,-.25);
 scene.add(new THREE.HemisphereLight(0xfff8ed,0x76564a,2.6));const lamp=new THREE.DirectionalLight(0xfff3e4,3.2);lamp.position.set(-5,9,5);lamp.castShadow=true;lamp.shadow.mapSize.set(1024,1024);Object.assign(lamp.shadow.camera,{left:-9,right:9,top:9,bottom:-9});lamp.shadow.bias=-.001;scene.add(lamp);const fill=new THREE.DirectionalLight(0xffffff,1.2);fill.position.set(6,4,-6);scene.add(fill);
 const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=256;const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#e6b092';ctx.fillRect(0,0,256,256);for(let n=0;n<8000;n++){ctx.fillStyle=n%2?'rgba(120,69,48,.024)':'rgba(255,234,213,.1)';ctx.fillRect(Math.random()*256,Math.random()*256,1.2,1.2);}const texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;
 const skin=new THREE.MeshStandardMaterial({map:texture,color:0xffe1d2,roughness:.73}),nail=new THREE.MeshPhysicalMaterial({color:0xf1d1c5,roughness:.34,clearcoat:.25}),crease=new THREE.MeshStandardMaterial({color:0xad7664,transparent:true,opacity:.2,roughness:1});
 function ellipsoid(parent,x,y,z,sx,sy,sz,material=skin){const m=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function bone(parent,start,end,r1,r2){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),delta=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,delta.length(),24),skin);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());m.castShadow=m.receiveShadow=true;parent.add(m);ellipsoid(parent,...start,r1,r1,r1);ellipsoid(parent,...end,r2,r2,r2);return m;}
 const fingerModels=new Map(),labels=[];
 function makeFinger(hand,id,x,len,spread=0,thumb=false){const group=new THREE.Group();group.position.set(x,.55,thumb?.65:-.55);group.rotation.y=spread;hand.add(group);group.userData.homeRotation=0;group.userData.homeX=x;group.userData.homeZ=group.position.z;
  const r=thumb?.28:.22,points=thumb?[[0,0,0],[0,.38,-.62],[0,.43,-1.13],[0,.18,-1.51]]:[[0,0,0],[0,.61,-len*.42],[0,.57,-len*.76],[0,.21,-len]];
  for(let n=0;n<3;n++)bone(group,points[n],points[n+1],r*(1-n*.11),r*(.91-n*.11));
  const tip=points[3],nailMesh=ellipsoid(group,tip[0],tip[1]+r*.59,tip[2]+.13,r*.7,.043,.25,nail);nailMesh.rotation.x=.42;
  for(let n=1;n<3;n++){const p=points[n];for(let k=0;k<2;k++){const c=new THREE.Mesh(new THREE.TorusGeometry(r*.83,.009,4,18,Math.PI*.78),crease);c.rotation.set(-Math.PI/2,0,Math.PI*.11);c.position.set(p[0],p[1]+r*.9,p[2]+k*.06);group.add(c);}}
  // A ring near the fingertip marks the suggested finger without painting skin.
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.29,.032,8,32),new THREE.MeshBasicMaterial({color:0xe93846,transparent:true,opacity:.88}));ring.rotation.x=Math.PI/2;ring.position.set(tip[0],.065,tip[2]);ring.visible=false;group.add(ring);group.userData.ring=ring;fingerModels.set(id,group);
 }
 function hand(side){const g=new THREE.Group();g.position.x=side==='L'?-2.3:2.3;g.rotation.y=side==='L'?-.06:.06;scene.add(g);
  ellipsoid(g,0,.38,.32,1.04,.38,1.12);ellipsoid(g,side==='L'?.61:-.61,.4,.63,.54,.4,.67);bone(g,[0,.2,1],[0,.1,2.1],.66,.54);
  const coordinates=side==='L'?[[-.82,1.55,'LP'],[-.3,2.03,'LR'],[.25,2.23,'LM'],[.79,1.98,'LI']]:[[-.79,1.98,'RI'],[-.25,2.23,'RM'],[.3,2.03,'RR'],[.82,1.55,'RP']];
  for(const [x,len,id]of coordinates)makeFinger(g,id,x,len,x*.065);
  makeFinger(g,side==='L'?'THL':'THR',side==='L'?.88:-.88,1.4,side==='L'?-.93:.93,true);
  // Tendons on the back of the hand give volume between the knuckles and wrist.
  for(const x of [-.63,-.2,.25,.64]){const points=[new THREE.Vector3(x*.4,.7,1.1),new THREE.Vector3(x*.75,.74,.35),new THREE.Vector3(x,.69,-.43)];const tendon=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,.022,5,false),skin);g.add(tendon);}
  const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.59,.66,.45,28),new THREE.MeshStandardMaterial({color:side==='L'?0x5eada3:0x6e9aa8,roughness:.9}));cuff.rotation.x=Math.PI/2;cuff.position.set(0,.06,2.1);g.add(cuff);return g;
 }
 hand('L');hand('R');
 const table=new THREE.Mesh(new THREE.BoxGeometry(9,.13,6.6),new THREE.MeshStandardMaterial({color:0xe4ece7,roughness:.84}));table.position.set(0,-.14,-.15);table.receiveShadow=true;scene.add(table);
 const keyMat=new THREE.MeshStandardMaterial({color:0x69807e,roughness:.5});for(let row=0;row<3;row++)for(let col=0;col<12;col++){const k=new THREE.Mesh(new THREE.BoxGeometry(.59,.13,.53),keyMat);k.position.set((col-5.5)*.68,-.005,-2.6+row*.65);k.receiveShadow=true;scene.add(k);}
 const pulses=new Map();let nextId=null;
 const resize=()=>{const w=host.clientWidth||220,h=host.clientHeight||125;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(host);resize();
 function render(t){requestAnimationFrame(render);if(document.hidden||host.closest('[hidden]')||host.getBoundingClientRect().width===0)return;for(const [id,g]of fingerModels){const pulse=pulses.get(id),age=pulse==null?1:(performance.now()-pulse.time)/420,amount=age<1?Math.sin(age*Math.PI):0;g.position.x=g.userData.homeX+(pulse?.x||0)*amount;g.position.z=g.userData.homeZ+(pulse?.z||0)*amount;g.rotation.x=age<1?-Math.sin(age*Math.PI)*.18:0;g.position.y=.55-(age<1?Math.sin(age*Math.PI)*.16:0);if(age>=1)pulses.delete(id);g.userData.ring.visible=id===nextId;}renderer.render(scene,camera);}requestAnimationFrame(render);
 window.RealHands={setTarget(id){nextId=id;},press(id,char='',numpad=false){let x=0,z=0;const c=String(char).toLowerCase(),home={LP:0,LR:1,LM:2,LI:3,RI:6,RM:7,RR:8,RP:9}[id];if(numpad){z='789'.includes(c)?-.52:'123'.includes(c)?.52:0;}else{const rows=['1234567890','qwertyuiop','asdfghjkl;','zxcvbnm,./'];for(let r=0;r<rows.length;r++){const col=rows[r].indexOf(c);if(c.length===1&&col>=0){z=(r-2)*.46;x=home==null?0:Math.max(-.5,Math.min(.5,(col-home)*.54));break;}}}pulses.set(id,{time:performance.now(),x,z});},renderer,scene,fingerModels};window.dispatchEvent(new Event('hands-ready'));
}catch(error){host.innerHTML='<p class="hands-fallback">此浏览器暂时不能显示立体双手。请根据下方手指名称练习。</p>';console.warn('3D hands unavailable:',error.message);}
