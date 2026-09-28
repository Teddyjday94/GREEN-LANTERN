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

export async function mountPowerBattery({container,reducedMotion=false,compact=false,signal}={}) {
  if(!container || signal?.aborted) return null;
  const host=container.querySelector('.x-battery-model');
  const shell=container.querySelector('.x-central-battery');
  if(!host || !shell) return null;
  try {
    const [THREE,{OBJLoader}]=await Promise.all([
      import('/vendor/three.module.js'),
      import('/vendor/loaders/OBJLoader.js'),
    ]);
    if(signal?.aborted) return null;
    const profile=getBatteryMotionProfile({reducedMotion,compact});
    const scene=new THREE.Scene();
    const fit=getBatteryFitProfile({compact});
    const camera=new THREE.PerspectiveCamera(fit.fov,1,0.1,30);
    camera.position.set(0.15,0.2,fit.cameraZ);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,compact?1.25:1.6));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    renderer.domElement.className='battery-webgl';
    host.append(renderer.domElement);

    const object=await new OBJLoader().loadAsync('/assets/battery/green-lantern-power-battery.obj');
    if(signal?.aborted) {
      object.traverse((node)=>node.geometry?.dispose?.());
      renderer.dispose(); renderer.domElement.remove(); return null;
    }
    const materials=new Map();
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
      node.castShadow=false;
      node.receiveShadow=false;
    });
    object.rotation.x=-Math.PI/2;
    const group=new THREE.Group(); group.add(object); scene.add(group);
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

    let pointerYaw=0,raf=0,first=true;
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
      cancelAnimationFrame(raf);
      container.removeEventListener('pointermove',pointer);
      globalThis.removeEventListener?.('resize',resize);
      scene.traverse((node)=>node.geometry?.dispose?.());
      materials.forEach((material)=>material.dispose());
      renderer.dispose(); renderer.domElement.remove();
      shell.classList.remove('is-model-loaded');
    }
    return {destroy};
  } catch(error) {
    console.warn('Uploaded Central Power Battery model unavailable; retaining illustrated fallback.',error);
    shell.classList.add('is-model-fallback');
    return null;
  }
}
