export function getRingQualityProfile({width=1440,devicePixelRatio=1,reducedMotion=false}={}) {
  const mobile = width < 720;
  return {
    pixelRatio: Math.min(devicePixelRatio || 1, mobile ? 1.35 : 1.8),
    particleCount: reducedMotion ? 0 : mobile ? 44 : 96,
    idleRotation: reducedMotion ? 0 : mobile ? 0.0014 : 0.0024,
    scrollMotion: !reducedMotion,
  };
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
    const THREE = await import('/vendor/three.module.min.js');
    if (signal?.aborted) return null;
    const profile=getRingQualityProfile({width:container.clientWidth||innerWidth,devicePixelRatio:globalThis.devicePixelRatio||1,reducedMotion});
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,0.1,100);
    camera.position.set(0.2,0.25,7.1);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(profile.pixelRatio);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    renderer.domElement.className='ring-webgl';
    renderer.domElement.setAttribute('aria-hidden','true');
    container.append(renderer.domElement);

    const group=new THREE.Group(); scene.add(group);
    group.rotation.x=-0.12; group.rotation.z=-0.08;

    const metal=new THREE.MeshStandardMaterial({color:0x0c7d43,metalness:0.88,roughness:0.28});
    const dark=new THREE.MeshStandardMaterial({color:0x031b11,metalness:0.72,roughness:0.42});
    const glow=new THREE.MeshStandardMaterial({color:0x80ffb3,emissive:0x25ff78,emissiveIntensity:2.3,metalness:0.15,roughness:0.18,transparent:true,opacity:0.95});

    const band=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.38,28,110),metal); band.rotation.x=Math.PI/2; group.add(band);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(1.58,0.12,18,110),dark); inner.rotation.x=Math.PI/2; group.add(inner);

    const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(1.06,1.2,0.58,72),metal); shoulder.rotation.x=Math.PI/2; shoulder.position.z=1.55; group.add(shoulder);
    const face=new THREE.Mesh(new THREE.CylinderGeometry(0.92,0.92,0.30,72),dark); face.rotation.x=Math.PI/2; face.position.z=1.92; group.add(face);
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.74,0.74,0.12,72),glow); core.rotation.x=Math.PI/2; core.position.z=2.12; group.add(core);

    const emblem=new THREE.Group(); emblem.position.z=2.22;
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.43,0.085,18,64),dark); emblem.add(rim);
    const barGeo=new THREE.BoxGeometry(1.05,0.16,0.15);
    const bar1=new THREE.Mesh(barGeo,dark); bar1.position.y=0.56; emblem.add(bar1);
    const bar2=new THREE.Mesh(barGeo,dark); bar2.position.y=-0.56; emblem.add(bar2);
    group.add(emblem);

    const key=new THREE.PointLight(0x72ffac,80,18,2); key.position.set(3,4,5); scene.add(key);
    const fill=new THREE.PointLight(0x1aff71,45,14,2); fill.position.set(-4,-1,4); scene.add(fill);
    const rimLight=new THREE.DirectionalLight(0xffffff,1.9); rimLight.position.set(-2,3,5); scene.add(rimLight);
    scene.add(new THREE.AmbientLight(0x0f3824,1.2));

    let particles=null;
    if (profile.particleCount) {
      const pts=new Float32Array(profile.particleCount*3);
      for(let i=0;i<profile.particleCount;i++) { const a=Math.random()*Math.PI*2, r=1.2+Math.random()*1.8; pts[i*3]=Math.cos(a)*r; pts[i*3+1]=(Math.random()-.5)*2.8; pts[i*3+2]=1.5+(Math.random()-.5)*1.3; }
      const geom=new THREE.BufferGeometry(); geom.setAttribute('position',new THREE.BufferAttribute(pts,3));
      particles=new THREE.Points(geom,new THREE.PointsMaterial({color:0x62ff9c,size:0.035,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false})); scene.add(particles);
    }

    let targetX=0,targetY=0,scrollY=0,pulseBoost=0,raf=0,first=true;
    const pointer=(e)=>{ const rect=container.getBoundingClientRect(); targetY=((e.clientX-rect.left)/rect.width-.5)*0.32; targetX=((e.clientY-rect.top)/rect.height-.5)*0.2; };
    const scroll=()=>{ if(profile.scrollMotion) scrollY=Math.min(1,Math.max(0,scrollY=globalThis.scrollY/(globalThis.innerHeight||800))); };
    const resize=()=>{ const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight); camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false); };
    container.addEventListener('pointermove',pointer,{passive:true}); globalThis.addEventListener?.('scroll',scroll,{passive:true}); globalThis.addEventListener?.('resize',resize,{passive:true}); resize();

    const tick=(t)=>{
      if(signal?.aborted) return destroy();
      group.rotation.y += profile.idleRotation;
      group.rotation.x += (targetX-group.rotation.x)*0.035;
      group.rotation.z += ((-0.08+targetY)-group.rotation.z)*0.035;
      camera.position.z=7.1-(profile.scrollMotion?scrollY*0.65:0);
      pulseBoost*=0.93; glow.emissiveIntensity=2.2+pulseBoost;
      if(particles){ particles.rotation.z=t*0.00008; particles.material.opacity=0.36+Math.min(0.5,pulseBoost*0.08); }
      renderer.render(scene,camera);
      if(first){ first=false; container.classList.add('ring-live'); }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    function pulse(){ if(!reducedMotion) pulseBoost=5.5; }
    function destroy(){ cancelAnimationFrame(raf); container.removeEventListener('pointermove',pointer); globalThis.removeEventListener?.('scroll',scroll); globalThis.removeEventListener?.('resize',resize); renderer.dispose(); renderer.domElement.remove(); scene.traverse((o)=>{o.geometry?.dispose?.(); if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach((m)=>m.dispose?.());}}); container.classList.remove('ring-live'); }
    return {pulse,destroy};
  } catch (error) {
    console.warn('Power ring WebGL scene unavailable; retaining fallback.',error);
    container.classList.add('ring-failed');
    return null;
  }
}
