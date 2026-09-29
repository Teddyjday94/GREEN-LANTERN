export function getBatteryMotionProfile({reducedMotion=false,compact=false}={}) {
  return {
    idleTurn:reducedMotion?0:(compact?0.00012:0.00018),
    pointerYaw:reducedMotion?0:(compact?0.12:0.18),
    animatedGlow:!reducedMotion,
  };
}

export function getBatteryMaterialProfile(name='') {
  const normalized=name.toLowerCase();
  if(normalized.includes('steel')) return {color:0x7c9289,emissive:0x06120d,emissiveIntensity:0.02,metalness:0.92,roughness:0.24};
  if(normalized.includes('black')) return {color:0x03100a,emissive:0x010503,emissiveIntensity:0.01,metalness:0.68,roughness:normalized.includes('glossy')?0.18:0.38};
  return {color:0x0b7a43,emissive:0x0b5b32,emissiveIntensity:0.2,metalness:0.56,roughness:0.3};
}

export function getBatteryFitProfile({compact=false}={}) {
  return {fov:30,cameraZ:7.4,modelHeight:compact?3.15:3.45};
}

export function createBatteryAudioController({audio,onActiveChange=()=>{}}={}) {
  let destroyed=false,active=false,activationId=0;
  const setActive=(next)=>{
    const value=Boolean(next);
    if(value===active) return;
    active=value;
    onActiveChange(active);
  };
  const deactivate=()=>setActive(false);
  audio?.addEventListener?.('ended',deactivate);
  audio?.addEventListener?.('pause',deactivate);
  audio?.addEventListener?.('error',deactivate);
  return {
    async activate(){
      if(destroyed || !audio) return false;
      const requestId=++activationId;
      audio.currentTime=0;
      try {
        await audio.play();
        if(destroyed || requestId!==activationId) return false;
        setActive(true);
        return true;
      }
      catch {
        if(requestId===activationId) setActive(false);
        return false;
      }
    },
    destroy(){
      if(destroyed) return;
      destroyed=true;
      activationId+=1;
      audio?.removeEventListener?.('ended',deactivate);
      audio?.removeEventListener?.('pause',deactivate);
      audio?.removeEventListener?.('error',deactivate);
      setActive(false);
      audio?.pause?.();
      if(audio) audio.currentTime=0;
    },
  };
}

export function bindBatteryAudio({target,audio,onActiveChange}={}) {
  const controller=createBatteryAudioController({audio,onActiveChange});
  const activate=()=>{ void controller.activate(); };
  const keyActivate=(event)=>{
    if(event.repeat || (event.key!=='Enter' && event.key!==' ')) return;
    event.preventDefault();
    activate();
  };
  target?.addEventListener?.('click',activate);
  target?.addEventListener?.('keydown',keyActivate);
  return {
    destroy(){
      target?.removeEventListener?.('click',activate);
      target?.removeEventListener?.('keydown',keyActivate);
      controller.destroy();
    },
  };
}

export function disposeBatteryResources({renderer,scene,materials}={}) {
  scene?.traverse((node)=>node.geometry?.dispose?.());
  materials?.forEach((material)=>material.dispose?.());
  renderer?.dispose?.();
  renderer?.domElement?.remove?.();
}

export async function mountPowerBattery({container,reducedMotion=false,compact=false,signal}={}) {
  if(!container || signal?.aborted) return null;
  const host=container.querySelector('.x-battery-model');
  const shell=container.querySelector('.x-central-battery');
  if(!host || !shell) return null;
  const audioBinding=bindBatteryAudio({
    target:shell,
    audio:shell.querySelector('.x-battery-oath'),
    onActiveChange:(active)=>shell.classList.toggle('is-oath-active',active),
  });
  let renderer=null,scene=null;
  const materials=new Map();
  try {
    const [THREE,{OBJLoader}]=await Promise.all([
      import('/vendor/three.module.js'),
      import('/vendor/loaders/OBJLoader.js'),
    ]);
    if(signal?.aborted) { audioBinding.destroy(); return null; }
    const profile=getBatteryMotionProfile({reducedMotion,compact});
    scene=new THREE.Scene();
    const fit=getBatteryFitProfile({compact});
    const camera=new THREE.PerspectiveCamera(fit.fov,1,0.1,30);
    camera.position.set(0.15,0.2,fit.cameraZ);
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,compact?1.25:1.6));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    renderer.domElement.className='battery-webgl';
    host.append(renderer.domElement);

    const object=await new OBJLoader().loadAsync('/assets/battery/green-lantern-power-battery.obj');
    if(signal?.aborted) {
      object.traverse((node)=>{
        node.geometry?.dispose?.();
        const nodeMaterials=Array.isArray(node.material)?node.material:[node.material];
        nodeMaterials.forEach((material)=>material?.dispose?.());
      });
      disposeBatteryResources({renderer,scene,materials});
      audioBinding.destroy();
      return null;
    }
    const group=new THREE.Group(); group.add(object); scene.add(group);
    const getMaterial=(name)=>{
      if(materials.has(name)) return materials.get(name);
      const material=new THREE.MeshStandardMaterial(getBatteryMaterialProfile(name));
      materials.set(name,material);
      return material;
    };
    object.traverse((node)=>{
      if(!node.isMesh) return;
      const originals=Array.isArray(node.material)?node.material:[node.material];
      node.material=originals.map((material)=>getMaterial(material?.name||''));
      if(node.material.length===1) node.material=node.material[0];
      originals.forEach((material)=>material?.dispose?.());
      node.castShadow=false;
      node.receiveShadow=false;
    });
    object.rotation.x=-Math.PI/2;
    const initialBox=new THREE.Box3().setFromObject(object);
    const size=initialBox.getSize(new THREE.Vector3());
    const scale=fit.modelHeight/Math.max(size.x,size.y,size.z,1);
    object.scale.setScalar(scale);
    const fittedBox=new THREE.Box3().setFromObject(object);
    object.position.sub(fittedBox.getCenter(new THREE.Vector3()));
    object.position.y-=0.1;

    scene.add(new THREE.HemisphereLight(0xbaffd0,0x010503,2.5));
    const key=new THREE.DirectionalLight(0xc8ffda,5.2); key.position.set(3,4,5); scene.add(key);
    const edge=new THREE.DirectionalLight(0x20ff78,4); edge.position.set(-4,1,2); scene.add(edge);
    const core=new THREE.PointLight(0x3dff8a,profile.animatedGlow?32:22,10,2); core.position.set(0,0.25,2.8); scene.add(core);
    const floor=new THREE.PointLight(0x0cff63,18,8,2); floor.position.set(0,-2.4,1.4); scene.add(floor);

    let pointerYaw=0,raf=0,first=true,destroyed=false;
    const pointer=(event)=>{
      const rect=container.getBoundingClientRect();
      const normalized=Math.max(-1,Math.min(1,((event.clientX-rect.left)/rect.width-.5)*2));
      pointerYaw=normalized*profile.pointerYaw;
    };
    const resize=()=>{
      const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
      camera.aspect=width/height; camera.updateProjectionMatrix(); renderer.setSize(width,height,false);
    };
    container.addEventListener('pointermove',pointer,{passive:true});
    globalThis.addEventListener?.('resize',resize,{passive:true});
    resize();
    const tick=(time)=>{
      if(signal?.aborted) return destroy();
      const ambient=profile.idleTurn?Math.sin(time*profile.idleTurn)*0.08:0;
      group.rotation.y+=(pointerYaw+ambient-group.rotation.y)*0.035;
      if(profile.animatedGlow) core.intensity=28+Math.sin(time*0.0015)*4;
      renderer.render(scene,camera);
      if(first){first=false;shell.classList.add('is-model-loaded');}
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    function destroy(){
      if(destroyed) return;
      destroyed=true;
      cancelAnimationFrame(raf);
      container.removeEventListener('pointermove',pointer);
      audioBinding.destroy();
      globalThis.removeEventListener?.('resize',resize);
      disposeBatteryResources({renderer,scene,materials});
      shell.classList.remove('is-model-loaded','is-oath-active');
    }
    return {destroy};
  } catch(error) {
    disposeBatteryResources({renderer,scene,materials});
    console.warn('Uploaded Central Power Battery model unavailable; retaining the ambient Oa scene.',error);
    shell.classList.add('is-model-unavailable');
    return {destroy(){ audioBinding.destroy(); shell.classList.remove('is-model-unavailable','is-oath-active'); }};
  }
}
