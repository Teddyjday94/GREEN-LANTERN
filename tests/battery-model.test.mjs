import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BufferGeometry, Mesh, MeshStandardMaterial, Scene } from 'three';

const batteryScene=await import('../battery-scene.mjs').catch(()=>({}));

test('battery motion becomes static when reduced motion is requested',()=>{
  assert.equal(typeof batteryScene.getBatteryMotionProfile,'function');
  const full=batteryScene.getBatteryMotionProfile({reducedMotion:false});
  const reduced=batteryScene.getBatteryMotionProfile({reducedMotion:true});
  assert.ok(full.idleTurn>0);
  assert.equal(reduced.idleTurn,0);
  assert.equal(reduced.animatedGlow,false);
});

test('battery material treatment preserves distinct green and black body surfaces',()=>{
  assert.equal(typeof batteryScene.getBatteryMaterialProfile,'function');
  const green=batteryScene.getBatteryMaterialProfile('Plastic_-_Matte_(Green)');
  const black=batteryScene.getBatteryMaterialProfile('Plastic_-_Glossy_(Black)');
  assert.notEqual(green.color,black.color);
  assert.ok(green.emissiveIntensity>black.emissiveIntensity);
});

test('battery model height fits inside the camera view with breathing room',()=>{
  assert.equal(typeof batteryScene.getBatteryFitProfile,'function');
  for(const compact of [false,true]) {
    const fit=batteryScene.getBatteryFitProfile({compact});
    const visibleHeight=2*Math.tan((fit.fov*Math.PI/180)/2)*fit.cameraZ;
    assert.ok(fit.modelHeight<=visibleHeight*0.9);
  }
});

test('supplied battery mesh is present with real geometry',async()=>{
  const model=await readFile(new URL('../assets/battery/green-lantern-power-battery.obj',import.meta.url),'utf8').catch(()=> '');
  assert.match(model,/^v\s+[-\d]/m);
  assert.match(model,/^f\s+\d/m);
  assert.ok(model.length>500_000);
});

test('battery resource cleanup releases WebGL, geometry and material allocations',()=>{
  assert.equal(typeof batteryScene.disposeBatteryResources,'function');
  const scene=new Scene();
  const geometry=new BufferGeometry();
  const material=new MeshStandardMaterial();
  scene.add(new Mesh(geometry,material));
  let geometryDisposed=0,materialDisposed=0,rendererDisposed=0,canvasRemoved=0;
  geometry.addEventListener('dispose',()=>{geometryDisposed+=1;});
  material.addEventListener('dispose',()=>{materialDisposed+=1;});
  const renderer={dispose(){rendererDisposed+=1;},domElement:{remove(){canvasRemoved+=1;}}};

  batteryScene.disposeBatteryResources({renderer,scene,materials:new Set([material])});

  assert.deepEqual({geometryDisposed,materialDisposed,rendererDisposed,canvasRemoved},{geometryDisposed:1,materialDisposed:1,rendererDisposed:1,canvasRemoved:1});
});

test('battery oath activation restarts and plays the supplied clip',async()=>{
  assert.equal(typeof batteryScene.createBatteryAudioController,'function');
  const calls=[];
  const audio={currentTime:9,play(){calls.push(['play',this.currentTime]);return Promise.resolve();},pause(){calls.push(['pause']);}};
  const controller=batteryScene.createBatteryAudioController({audio});

  await controller.activate();
  assert.deepEqual(calls,[['play',0]]);
  controller.destroy();
  assert.deepEqual(calls,[['play',0],['pause']]);
  assert.equal(audio.currentTime,0);
});

test('battery energized state follows oath playback and clears when the clip ends',async()=>{
  assert.equal(typeof batteryScene.createBatteryAudioController,'function');
  class TestAudio extends EventTarget {
    currentTime=7;
    play(){ return Promise.resolve(); }
    pause(){ this.dispatchEvent(new Event('pause')); }
  }
  const audio=new TestAudio();
  const activeStates=[];
  const controller=batteryScene.createBatteryAudioController({
    audio,
    onActiveChange:(active)=>activeStates.push(active),
  });

  await controller.activate();
  assert.deepEqual(activeStates,[true]);
  audio.dispatchEvent(new Event('ended'));
  assert.deepEqual(activeStates,[true,false]);

  await controller.activate();
  controller.destroy();
  assert.deepEqual(activeStates,[true,false,true,false]);
  assert.equal(audio.currentTime,0);
});

test('battery oath binding works without WebGL and ignores keyboard auto-repeat',async()=>{
  assert.equal(typeof batteryScene.bindBatteryAudio,'function');
  const target=new EventTarget();
  const calls=[];
  const audio={currentTime:4,play(){calls.push(['play',this.currentTime]);return Promise.resolve();},pause(){calls.push(['pause']);}};
  const binding=batteryScene.bindBatteryAudio({target,audio});
  const key=(repeat=false)=>Object.assign(new Event('keydown',{cancelable:true}),{key:'Enter',repeat});

  target.dispatchEvent(key(false));
  target.dispatchEvent(key(true));
  await Promise.resolve();
  assert.deepEqual(calls,[['play',0]]);
  binding.destroy();
  target.dispatchEvent(new Event('click'));
  assert.deepEqual(calls,[['play',0],['pause']]);
});

test('supplied oath audio is included as a non-empty site asset',async()=>{
  const audio=await readFile(new URL('../assets/audio/in-brightest-day-oath.mp3',import.meta.url)).catch(()=>Buffer.alloc(0));
  assert.ok(audio.length>100_000);
});
