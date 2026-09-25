import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const labels={full:'Complete figure',chest:'Rib cage',neural:'Neural pathway',outline:'Complete outline',spine:'Vertebral column',skull:'Skull',contact:'Neural connection'};
const regions={
  chest:/rib|costal|sternum|clavicle|scapula/i,
  hand:/(metacarpal|phalanx.*finger|radius|ulna|scaphoid|capitate|hamate|lunate|pisiform|trapezium|trapezoid)/i,
  spine:/vertebra|sacrum|coccyx/i,
  skull:/frontal|parietal|temporal|occipital|sphenoid|ethmoid|maxilla|mandible|zygomatic|nasal|lacrimal|palatine|vomer|tooth|incisor|molar|premolar|canine/i
};

export async function initAnatomyStage(){
  const canvas=document.querySelector('#anatomy-canvas');const stage=document.querySelector('.anatomy-stage');const fallback=document.querySelector('.skeleton-fallback');const status=document.querySelector('.load-status');const motionButton=document.querySelector('.motion-toggle');const motionLabel=document.querySelector('[data-motion-label]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'})}catch(error){document.documentElement.classList.add('no-webgl');status.textContent='Static anatomy';throw error}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(24,1,.01,100);camera.position.set(0,.02,9.2);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xaecbd0,0x090b0d,1.05));
  const key=new THREE.DirectionalLight(0xd5e5e6,2.1);key.position.set(2.8,3.5,4);scene.add(key);
  const rim=new THREE.PointLight(0x78abb5,11,8);rim.position.set(-2.2,.7,1.6);scene.add(rim);
  const draco=new DRACOLoader().setDecoderPath('/draco/');const loader=new GLTFLoader().setDRACOLoader(draco);
  const gltf=await loader.loadAsync('/models/overview-skeleton.glb');draco.dispose();
  const source=gltf.scene;source.updateMatrixWorld(true);const model=new THREE.Group();model.add(source);
  const meshes=[];source.traverse((node)=>{if(node.isMesh){const nodeIndex=gltf.parser.associations.get(node)?.nodes;node.name=nodeIndex==null?node.name:gltf.parser.json.nodes[nodeIndex]?.name||node.name;meshes.push(node)}});
  const mirrored=new THREE.Group();meshes.filter((mesh)=>/\.r\.?$/i.test(mesh.name.trim())).forEach((mesh)=>{const clone=mesh.clone();clone.name=mesh.name.replace(/\.r\.?$/i,'.l');clone.geometry=mesh.geometry;mesh.updateWorldMatrix(true,false);clone.matrix.copy(mesh.matrixWorld).premultiply(new THREE.Matrix4().makeScale(-1,1,1));clone.matrix.decompose(clone.position,clone.quaternion,clone.scale);mirrored.add(clone);meshes.push(clone)});model.add(mirrored);
  const box=new THREE.Box3().setFromObject(model);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());model.position.sub(center);model.scale.setScalar(2.28/size.y);const baseY=model.position.y;
  const visibleHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;const modelHeight=size.y*model.scale.y;const introOffset=-Math.min(visibleHeight*.05,Math.max(0,(visibleHeight-modelHeight)/2-.03));
  meshes.forEach((mesh)=>{mesh.material=new THREE.MeshPhysicalMaterial({color:0x8e989b,roughness:.47,metalness:.3,transmission:.05,transparent:true,opacity:.7,clearcoat:.12,emissive:0x071014,emissiveIntensity:.12});mesh.userData.level=.25;mesh.userData.target=.25});

  const overlay=createOverlay(center,size);model.add(overlay.group);scene.add(model);
  canvas.classList.add('is-ready');fallback.classList.add('is-hidden');status.textContent='Anatomy online';setTimeout(()=>status.classList.add('is-hidden'),1000);
  canvas.dataset.sceneReady='true';canvas.dataset.activeView='full';canvas.dataset.rotation='0';canvas.dataset.modelCount=String(meshes.length);

  let currentView='full';let travelProgress=0;let paused=reduce;let stageVisible=true;let raf=0;let last=performance.now();
  if(reduce){document.documentElement.classList.add('reduced-motion');motionButton.setAttribute('aria-pressed','true');motionLabel.textContent='Motion reduced'}
  function applyView(view){currentView=view;canvas.dataset.activeView=view;const matcher=regions[view];meshes.forEach((mesh)=>{const regional=matcher?.test(mesh.name);let target=.1;if(view==='outline')target=.9;else if(view==='full'||view==='contact')target=.25;else if(view==='neural')target=.12;else if(regional)target=1;mesh.userData.target=target});overlay.setView(view,reduce)}
  addEventListener('anatomy-view',(event)=>applyView(event.detail));applyView(document.body.dataset.view||'full');
  addEventListener('anatomy-progress',(event)=>{travelProgress=reduce?(event.detail<.5?0:1):Math.max(0,Math.min(1,event.detail))});
  motionButton.addEventListener('click',()=>{paused=!paused;motionButton.setAttribute('aria-pressed',String(paused));motionLabel.textContent=paused?'Resume motion':'Pause motion';if(!paused)start()});
  new IntersectionObserver(([entry])=>{stageVisible=entry.isIntersecting;if(stageVisible&&!paused)start()},{threshold:.01}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&stageVisible&&!paused)start()});
  const resize=()=>{const rect=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);camera.aspect=Math.max(1,rect.width)/Math.max(1,rect.height);camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(canvas);resize();

  function start(){if(raf||paused||!stageVisible||document.hidden)return;last=performance.now();raf=requestAnimationFrame(animate)}
  function animate(now){raf=0;if(paused||!stageVisible||document.hidden)return;const dt=Math.min((now-last)/1000,.05);last=now;const blend=reduce?1:1-Math.exp(-dt/0.22);for(const mesh of meshes){mesh.userData.level+=(mesh.userData.target-mesh.userData.level)*blend;const level=mesh.userData.level;mesh.material.color.setRGB(.46+level*.16,.5+level*.2,.52+level*.23);mesh.material.emissive.set(level>.4?0x12343b:0x071014);mesh.material.emissiveIntensity=.08+level*.5;mesh.material.opacity=.1+level*.5}model.position.x=THREE.MathUtils.lerp(2.1,0,travelProgress);model.position.y=baseY+THREE.MathUtils.lerp(introOffset,0,travelProgress);const idle=reduce?0:.075*Math.sin(now*.0002);model.rotation.y=idle+THREE.MathUtils.lerp(-.12,0,travelProgress);overlay.update(now,currentView,reduce);canvas.dataset.rotation=model.rotation.y.toFixed(5);canvas.dataset.travelProgress=travelProgress.toFixed(3);canvas.dataset.verticalOffset=(model.position.y-baseY).toFixed(3);renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  if(reduce){renderer.render(scene,camera)}else start();
}

function createOverlay(center,size){
  const group=new THREE.Group();group.visible=false;const cyan=new THREE.LineBasicMaterial({color:0x76c2ce,transparent:true,opacity:0,depthTest:false});const signalMaterial=new THREE.MeshBasicMaterial({color:0xb9edf2,transparent:true,opacity:0,depthTest:false});
  const spinePoints=[];for(let i=0;i<9;i++){const y=center.y-size.y*.31+i*size.y*.075;spinePoints.push(new THREE.Vector3(center.x,y,center.z+size.z*.55));if(i>1&&i<8){const side=i%2?1:-1;spinePoints.push(new THREE.Vector3(center.x+side*size.x*(.12+i*.012),y+size.y*.025,center.z+size.z*.55));spinePoints.push(new THREE.Vector3(center.x,y,center.z+size.z*.55))}}
  const neural=new THREE.Line(new THREE.BufferGeometry().setFromPoints(spinePoints),cyan);group.add(neural);
  const endA=new THREE.Mesh(new THREE.SphereGeometry(size.y*.012,12,12),signalMaterial);const endB=endA.clone();endA.position.set(center.x-size.x*.14,center.y+size.y*.22,center.z+size.z*.56);endB.position.set(center.x+size.x*.14,center.y+size.y*.27,center.z+size.z*.56);group.add(endA,endB);
  const signal=new THREE.Mesh(new THREE.SphereGeometry(size.y*.009,10,10),signalMaterial);group.add(signal);
  let opacity=0,target=0,view='full';
  return{group,setView(next,reduced){view=next;target=next==='neural'||next==='contact'?1:0;if(reduced)opacity=target},update(now,current,reduced){const dt=.016;opacity+=(target-opacity)*(reduced?1:1-Math.exp(-dt/.28));group.visible=opacity>.01;cyan.opacity=opacity*(view==='neural'?.72:.3);signalMaterial.opacity=opacity*.85;if(view==='contact'){const t=(Math.sin(now*.0015)+1)/2;signal.position.lerpVectors(endA.position,endB.position,t)}else signal.position.copy(endA.position)}}
}
