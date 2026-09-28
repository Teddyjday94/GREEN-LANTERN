export function getRingQualityProfile({width=1440,devicePixelRatio=1,reducedMotion=false}={}) {
  const mobile = width < 720;
  return {
    pixelRatio: Math.min(devicePixelRatio || 1, mobile ? 1.35 : 1.8),
    particleCount: reducedMotion ? 0 : mobile ? 44 : 96,
    idleRotation: reducedMotion ? 0 : mobile ? 0.0014 : 0.0024,
    scrollMotion: !reducedMotion,
  };
}

export function getRingClickProfile({reducedMotion=false}={}) {
  return reducedMotion
    ? { emissiveBoost:2.4, rippleDuration:180, particleBurst:false }
    : { emissiveBoost:8.5, rippleDuration:720, particleBurst:true };
}

export function getRingHoldProfile({reducedMotion=false}={}) {
  return reducedMotion
    ? { idleEmissive:0.2, heldEmissive:3, heldLight:28, animateEffects:false }
    : { idleEmissive:0.15, heldEmissive:4.2, heldLight:62, animateEffects:true };
}

export function createRingHoldController({onChange=()=>{}}={}) {
  let held=false;
  const setHeld=(next)=>{
    const value=Boolean(next);
    if(value===held) return held;
    held=value;
    onChange(held);
    return held;
  };
  return {
    get held(){ return held; },
    begin(){ return setHeld(true); },
    end(){ return setHeld(false); }
  };
}

export function getRingVisualTargets({held=false,pulseBoost=0,holdProfile,idleEmissive=0}={}) {
  const heldEmissive=Math.max(holdProfile?.heldEmissive ?? idleEmissive,idleEmissive+1.9);
  return {
    emissive:(held ? heldEmissive : idleEmissive)+pulseBoost,
    light:held ? (holdProfile?.heldLight ?? 0) : Math.min(holdProfile?.heldLight ?? 0,pulseBoost*10),
  };
}

export function disposeRingTextures(textures=[]) {
  textures.forEach((texture)=>texture.dispose());
  textures.length=0;
}

export async function settleRingTextureLoads(textureLoads=[]) {
  const results=await Promise.allSettled(textureLoads);
  const failure=results.find((result)=>result.status==='rejected');
  if(failure) throw failure.reason;
  return results.map((result)=>result.value);
}

export function supportsWebGL() {
  try {
    if (typeof document === 'undefined') return false;
    const canvas=document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch { return false; }
}

export async function mountPowerRing({container,reducedMotion=false,signal}={}) {
  if (!container || !supportsWebGL() || signal?.aborted) return null;
  try {
    const THREE = await import('/vendor/three.module.js');
    if (signal?.aborted) return null;
    const profile=getRingQualityProfile({width:container.clientWidth||innerWidth,devicePixelRatio:globalThis.devicePixelRatio||1,reducedMotion});
    const clickProfile=getRingClickProfile({reducedMotion});
    const holdProfile=getRingHoldProfile({reducedMotion});
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,0.1,100);
    camera.position.set(0.2,0.25,7.1);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(profile.pixelRatio);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    renderer.domElement.className='ring-webgl';
    renderer.domElement.setAttribute('aria-label','Interactive Green Lantern power ring. Press and hold to charge it.');
    renderer.domElement.setAttribute('role','button');
    renderer.domElement.tabIndex=0;
    container.append(renderer.domElement);

    const group=new THREE.Group(); scene.add(group);
    group.rotation.x=-0.12; group.rotation.y=0.58; group.rotation.z=-0.08;
    const fallback=new THREE.Group(); group.add(fallback);

    const metal=new THREE.MeshStandardMaterial({color:0x0c7d43,metalness:0.88,roughness:0.28});
    const dark=new THREE.MeshStandardMaterial({color:0x031b11,metalness:0.72,roughness:0.42});
    const glow=new THREE.MeshStandardMaterial({color:0x80ffb3,emissive:0x25ff78,emissiveIntensity:2.3,metalness:0.15,roughness:0.18,transparent:true,opacity:0.95});

    const band=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.38,28,110),metal); band.rotation.x=Math.PI/2; fallback.add(band);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(1.58,0.12,18,110),dark); inner.rotation.x=Math.PI/2; fallback.add(inner);

    const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(1.06,1.2,0.58,72),metal); shoulder.rotation.x=Math.PI/2; shoulder.position.z=1.55; fallback.add(shoulder);
    const face=new THREE.Mesh(new THREE.CylinderGeometry(0.92,0.92,0.30,72),dark); face.rotation.x=Math.PI/2; face.position.z=1.92; fallback.add(face);
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.74,0.74,0.12,72),glow); core.rotation.x=Math.PI/2; core.position.z=2.12; fallback.add(core);

    const emblem=new THREE.Group(); emblem.position.z=2.22;
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.43,0.085,18,64),dark); emblem.add(rim);
    const barGeo=new THREE.BoxGeometry(1.05,0.16,0.15);
    const bar1=new THREE.Mesh(barGeo,dark); bar1.position.y=0.56; emblem.add(bar1);
    const bar2=new THREE.Mesh(barGeo,dark); bar2.position.y=-0.56; emblem.add(bar2);
    fallback.add(emblem);

    const pulseDiscMaterial=new THREE.MeshBasicMaterial({color:0x80ffad,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    const pulseDisc=new THREE.Mesh(new THREE.RingGeometry(0.76,0.82,72),pulseDiscMaterial); pulseDisc.position.z=2.31; group.add(pulseDisc);

    const key=new THREE.PointLight(0x72ffac,80,18,2); key.position.set(3,4,5); scene.add(key);
    const fill=new THREE.PointLight(0x1aff71,45,14,2); fill.position.set(-4,-1,4); scene.add(fill);
    const rimLight=new THREE.DirectionalLight(0xffffff,1.9); rimLight.position.set(-2,3,5); scene.add(rimLight);
    const faceLight=new THREE.PointLight(0x5cff94,0,8,2); faceLight.position.set(0,0,4.5); scene.add(faceLight);
    scene.add(new THREE.AmbientLight(0x0f3824,1.2));

    let hitTargets=[band,inner,shoulder,face,core,rim,bar1,bar2];
    const emissiveMaterials=[{material:glow,idleEmissive:glow.emissiveIntensity}];
    const loadedTextures=[];
    try {
      const [{ColladaLoader},maps]=await Promise.all([
        import('/vendor/loaders/ColladaLoader.js'),
        settleRingTextureLoads([
          ['/assets/ring/textures/albedo.jpg',true],
          ['/assets/ring/textures/roughness.jpg',false],
          ['/assets/ring/textures/metallic.jpg',false],
          ['/assets/ring/textures/normal.png',false],
          ['/assets/ring/textures/ao.jpg',false],
          ['/assets/ring/textures/emissive.jpg',true]
        ].map(([url,color])=>new Promise((resolve,reject)=>new THREE.TextureLoader().load(url,(texture)=>{
          texture.flipY=false;
          if(color) texture.colorSpace=THREE.SRGBColorSpace;
          loadedTextures.push(texture);
          resolve(texture);
        },undefined,reject))))
      ]);
      if(signal?.aborted) {
        disposeRingTextures(loadedTextures);
        renderer.dispose();
        renderer.domElement.remove();
        return null;
      }
      const collada=await new ColladaLoader().loadAsync('/assets/ring/model.dae');
      if(signal?.aborted) {
        disposeRingTextures(loadedTextures);
        renderer.dispose();
        renderer.domElement.remove();
        return null;
      }
      const uploaded=collada.scene;
      const [map,roughnessMap,metalnessMap,normalMap,aoMap,emissiveMap]=maps;
      const uploadedMaterial=new THREE.MeshStandardMaterial({
        map,roughnessMap,metalnessMap,normalMap,aoMap,emissiveMap,
        color:0xffffff,emissive:0x36ff78,emissiveIntensity:holdProfile.idleEmissive,
        metalness:0.86,roughness:0.34
      });
      const uploadedMeshes=[];
      uploaded.traverse((node)=>{
        if(!node.isMesh) return;
        if(node.geometry.attributes.uv && !node.geometry.attributes.uv2) node.geometry.setAttribute('uv2',node.geometry.attributes.uv.clone());
        node.material=uploadedMaterial;
        uploadedMeshes.push(node);
      });
      const initialBox=new THREE.Box3().setFromObject(uploaded);
      const size=initialBox.getSize(new THREE.Vector3());
      const targetSize=(container.clientWidth||innerWidth)<720?3:3.65;
      const scale=targetSize/Math.max(size.x,size.y,size.z,1);
      uploaded.scale.setScalar(scale);
      const fittedBox=new THREE.Box3().setFromObject(uploaded);
      uploaded.position.sub(fittedBox.getCenter(new THREE.Vector3()));
      group.add(uploaded);
      fallback.visible=false;
      hitTargets=uploadedMeshes;
      emissiveMaterials.push({material:uploadedMaterial,idleEmissive:holdProfile.idleEmissive});
      container.classList.add('ring-model-loaded');
    } catch(error) {
      disposeRingTextures(loadedTextures);
      console.warn('Uploaded ring model unavailable; retaining procedural fallback.',error);
      container.classList.add('ring-model-fallback');
    }

    let particles=null;
    if (profile.particleCount) {
      const pts=new Float32Array(profile.particleCount*3);
      for(let i=0;i<profile.particleCount;i++) { const a=Math.random()*Math.PI*2, r=1.2+Math.random()*1.8; pts[i*3]=Math.cos(a)*r; pts[i*3+1]=(Math.random()-.5)*2.8; pts[i*3+2]=1.5+(Math.random()-.5)*1.3; }
      const geom=new THREE.BufferGeometry(); geom.setAttribute('position',new THREE.BufferAttribute(pts,3));
      particles=new THREE.Points(geom,new THREE.PointsMaterial({color:0x62ff9c,size:0.035,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false})); scene.add(particles);
    }

    const raycaster=new THREE.Raycaster();
    const pointerNdc=new THREE.Vector2();
    let targetX=0,targetY=0,scrollY=0,pulseBoost=0,pulseStart=0,raf=0,first=true;
    const pointer=(e)=>{ const rect=container.getBoundingClientRect(); targetY=((e.clientX-rect.left)/rect.width-.5)*0.32; targetX=((e.clientY-rect.top)/rect.height-.5)*0.2; };
    const activateFace=()=>{ pulseBoost=Math.max(pulseBoost,clickProfile.emissiveBoost); pulseStart=performance.now(); container.classList.remove('ring-face-activated'); void container.offsetWidth; container.classList.add('ring-face-activated'); setTimeout(()=>container.classList.remove('ring-face-activated'),clickProfile.rippleDuration); };
    const hold=createRingHoldController({onChange:(held)=>{
      container.classList.toggle('ring-held',held);
      renderer.domElement.setAttribute('aria-pressed',String(held));
    }});
    renderer.domElement.setAttribute('aria-pressed','false');
    const hitRing=(e)=>{ const rect=renderer.domElement.getBoundingClientRect(); pointerNdc.x=((e.clientX-rect.left)/rect.width)*2-1; pointerNdc.y=-((e.clientY-rect.top)/rect.height)*2+1; raycaster.setFromCamera(pointerNdc,camera); return raycaster.intersectObjects(hitTargets,false).length>0; };
    let activePointerId=null,keyboardHeld=false;
    const press=(e)=>{ if(activePointerId!==null || keyboardHeld || !hitRing(e)) return; activePointerId=e.pointerId; renderer.domElement.setPointerCapture?.(e.pointerId); hold.begin(); };
    const release=(e)=>{ if(e?.pointerId!==activePointerId) return; const pointerId=activePointerId; activePointerId=null; hold.end(); if(renderer.domElement.hasPointerCapture?.(pointerId)) renderer.domElement.releasePointerCapture(pointerId); };
    const leave=(e)=>{ if(activePointerId!==null && e?.pointerId!==undefined && e.pointerId!==activePointerId) return; activePointerId=null; keyboardHeld=false; hold.end(); };
    const keyDown=(e)=>{ if((e.key==='Enter'||e.key===' ') && activePointerId===null){ e.preventDefault(); keyboardHeld=true; hold.begin(); } };
    const keyUp=(e)=>{ if((e.key==='Enter'||e.key===' ') && keyboardHeld){ e.preventDefault(); keyboardHeld=false; hold.end(); } };
    const scroll=()=>{ if(profile.scrollMotion) scrollY=Math.min(1,Math.max(0,globalThis.scrollY/(globalThis.innerHeight||800))); };
    const resize=()=>{ const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight); camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false); };
    container.addEventListener('pointermove',pointer,{passive:true});
    renderer.domElement.addEventListener('pointerdown',press,{passive:true});
    renderer.domElement.addEventListener('pointerup',release,{passive:true});
    renderer.domElement.addEventListener('pointercancel',release,{passive:true});
    renderer.domElement.addEventListener('lostpointercapture',leave);
    renderer.domElement.addEventListener('pointerleave',leave);
    renderer.domElement.addEventListener('keydown',keyDown);
    renderer.domElement.addEventListener('keyup',keyUp);
    renderer.domElement.addEventListener('blur',leave);
    globalThis.addEventListener?.('scroll',scroll,{passive:true}); globalThis.addEventListener?.('resize',resize,{passive:true}); resize();

    const tick=(t)=>{
      if(signal?.aborted) return destroy();
      group.rotation.y += profile.idleRotation;
      group.rotation.x += (targetX-group.rotation.x)*0.035;
      group.rotation.z += ((-0.08+targetY)-group.rotation.z)*0.035;
      camera.position.z=7.1-(profile.scrollMotion?scrollY*0.65:0);
      pulseBoost*=reducedMotion?0.84:0.91;
      const held=hold.held;
      emissiveMaterials.forEach(({material,idleEmissive})=>{
        const {emissive}=getRingVisualTargets({held,pulseBoost,holdProfile,idleEmissive});
        material.emissiveIntensity+=(emissive-material.emissiveIntensity)*0.18;
      });
      const {light:targetLight}=getRingVisualTargets({held,pulseBoost,holdProfile});
      faceLight.intensity+=(targetLight-faceLight.intensity)*0.2;
      const pulseAge=pulseStart ? Math.min(1,(performance.now()-pulseStart)/clickProfile.rippleDuration) : 1;
      pulseDisc.scale.setScalar(1+pulseAge*1.2); pulseDiscMaterial.opacity=pulseStart ? Math.sin(pulseAge*Math.PI)*0.8 : 0;
      if(particles){ particles.rotation.z=t*0.00008; particles.material.opacity=0.36+Math.min(0.6,pulseBoost*0.07); particles.material.size=0.035+(clickProfile.particleBurst?Math.min(0.055,pulseBoost*0.004):0); }
      renderer.render(scene,camera);
      if(first){ first=false; container.classList.add('ring-live'); }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    function pulse(){ pulseBoost=Math.max(pulseBoost,5.5); }
    function destroy(){
      cancelAnimationFrame(raf); hold.end(); container.removeEventListener('pointermove',pointer);
      renderer.domElement.removeEventListener('pointerdown',press); renderer.domElement.removeEventListener('pointerup',release); renderer.domElement.removeEventListener('pointercancel',release); renderer.domElement.removeEventListener('lostpointercapture',leave); renderer.domElement.removeEventListener('pointerleave',leave); renderer.domElement.removeEventListener('keydown',keyDown); renderer.domElement.removeEventListener('keyup',keyUp); renderer.domElement.removeEventListener('blur',leave);
      globalThis.removeEventListener?.('scroll',scroll); globalThis.removeEventListener?.('resize',resize); disposeRingTextures(loadedTextures); renderer.dispose(); renderer.domElement.remove(); scene.traverse((o)=>{o.geometry?.dispose?.(); if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach((m)=>m.dispose?.());}}); container.classList.remove('ring-live','ring-held','ring-face-activated','ring-model-loaded','ring-model-fallback');
    }
    return {pulse,destroy,activateFace,beginHold:()=>hold.begin(),endHold:()=>hold.end()};
  } catch (error) {
    console.warn('Power ring WebGL scene unavailable; retaining fallback.',error);
    container.classList.add('ring-failed');
    return null;
  }
}
