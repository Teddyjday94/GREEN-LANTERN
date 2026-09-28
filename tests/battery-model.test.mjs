import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
