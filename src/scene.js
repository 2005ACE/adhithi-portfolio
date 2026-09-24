import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const views={
  full:{camera:[0,.25,4.8],target:[0,.05,0],label:'FULL ANATOMY'},
  chest:{camera:[0,.72,3.3],target:[0,.65,0],label:'RIB CAGE / MOTIVATION'},
  neural:{camera:[0,1.38,2.7],target:[0,1.38,0],label:'SKULL + SPINE / SYSTEMS'},
  hand:{camera:[1.08,.28,2.85],target:[.58,.25,0],label:'HAND / BUILDING'},
  spine:{camera:[.18,.45,3],target:[0,.35,0],label:'SPINE / FOUNDATION'},
  skull:{camera:[0,1.52,2.45],target:[0,1.52,0],label:'SKULL / INSPECTION'},
  contact:{camera:[0,.25,4.8],target:[0,.05,0],label:'FULL ANATOMY / CONNECTION'}
};

export async function initAnatomyStage(){
  const canvas=document.querySelector('#anatomy-canvas');
  const stage=document.querySelector('.anatomy-stage');
  const fallback=document.querySelector('.skeleton-fallback');
  const status=document.querySelector('.load-status');
  const region=document.querySelector('[data-region]');
  const motionButton=document.querySelector('.motion-toggle');
  const motionLabel=document.querySelector('[data-motion-label]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){document.documentElement.classList.add('reduced-motion');status.textContent='Static anatomy';motionButton.hidden=true;return}

  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'})}catch(error){document.documentElement.classList.add('no-webgl');status.textContent='Static anatomy';throw error}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(25,1,.01,100);
  camera.position.set(...views.full.camera);
  const target=new THREE.Vector3(...views.full.target);
  const nextCamera=new THREE.Vector3(...views.full.camera);
  const nextTarget=target.clone();
  scene.add(new THREE.HemisphereLight(0xd8f5f7,0x101317,2.1));
  const key=new THREE.DirectionalLight(0xe9fbff,4.2);key.position.set(2.5,3.5,4);scene.add(key);
  const rim=new THREE.PointLight(0x65c0ce,28,8);rim.position.set(-2,1,1.5);scene.add(rim);

  const draco=new DRACOLoader();draco.setDecoderPath('/draco/');
  const loader=new GLTFLoader();loader.setDRACOLoader(draco);
  const gltf=await loader.loadAsync('/models/overview-skeleton.glb');
  draco.dispose();
  const source=gltf.scene;source.updateMatrixWorld(true);
  const model=new THREE.Group();model.add(source);
  const meshes=[];source.traverse((node)=>{if(node.isMesh){const nodeIndex=gltf.parser.associations.get(node)?.nodes;node.name=nodeIndex==null?node.name:gltf.parser.json.nodes[nodeIndex]?.name||node.name;meshes.push(node)}});
  const mirrored=new THREE.Group();
  meshes.filter((mesh)=>/\.r\.?$/i.test(mesh.name.trim())).forEach((mesh)=>{const clone=mesh.clone();clone.geometry=mesh.geometry;mesh.updateWorldMatrix(true,false);clone.matrix.copy(mesh.matrixWorld).premultiply(new THREE.Matrix4().makeScale(-1,1,1));clone.matrix.decompose(clone.position,clone.quaternion,clone.scale);mirrored.add(clone)});
  model.add(mirrored);
  const box=new THREE.Box3().setFromObject(model);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());
  model.position.sub(center);model.position.y+=.05;model.scale.setScalar(2.25/size.y);
  const material=new THREE.MeshPhysicalMaterial({color:0xd8e6e3,roughness:.42,metalness:.06,transmission:.2,thickness:.3,transparent:true,opacity:.92,clearcoat:.35,clearcoatRoughness:.35,emissive:0x0b262c,emissiveIntensity:.22});
  model.traverse((child)=>{if(child.isMesh){child.material=material;child.castShadow=false;child.receiveShadow=false}});
  scene.add(model);
  fallback.classList.add('is-hidden');canvas.classList.add('is-ready');status.textContent='Anatomy online';setTimeout(()=>status.classList.add('is-hidden'),1400);

  let paused=false;let stageVisible=true;let last=performance.now();
  motionButton.addEventListener('click',()=>{paused=!paused;motionButton.setAttribute('aria-pressed',String(paused));motionLabel.textContent=paused?'Resume motion':'Pause motion';if(!paused)animate(performance.now())});
  addEventListener('anatomy-view',(event)=>{const view=views[event.detail]||views.full;nextCamera.set(...view.camera);nextTarget.set(...view.target);region.textContent=view.label;document.querySelector('.stage-frame').dataset.focus=event.detail});
  const visibilityObserver=new IntersectionObserver(([entry])=>{stageVisible=entry.isIntersecting;if(stageVisible&&!paused)animate(performance.now())},{threshold:.01});visibilityObserver.observe(stage);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&stageVisible&&!paused)animate(performance.now())});
  const resize=()=>{const rect=canvas.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()};
  new ResizeObserver(resize).observe(canvas);resize();

  function animate(now){if(paused||!stageVisible||document.hidden)return;requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;camera.position.lerp(nextCamera,1-Math.pow(.002,dt));target.lerp(nextTarget,1-Math.pow(.002,dt));camera.lookAt(target);model.rotation.y=.065*Math.sin(now*.00022);rim.position.x=-2+Math.sin(now*.00018)*.55;renderer.render(scene,camera)}
  animate(performance.now());
}
