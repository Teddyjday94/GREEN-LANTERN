import test from 'node:test'; import assert from 'node:assert/strict';
import * as ringScene from '../ring-scene.mjs';
const {getRingQualityProfile,supportsWebGL}=ringScene;
test('desktop and mobile quality profiles cap DPR and particles',()=>{ const d=getRingQualityProfile({width:1400,devicePixelRatio:3}); const m=getRingQualityProfile({width:420,devicePixelRatio:4}); assert.equal(d.pixelRatio,1.8); assert.equal(m.pixelRatio,1.35); assert.ok(m.particleCount<d.particleCount); });
test('reduced motion disables animation-heavy behavior',()=>{ const p=getRingQualityProfile({width:1200,devicePixelRatio:2,reducedMotion:true}); assert.equal(p.particleCount,0); assert.equal(p.idleRotation,0); assert.equal(p.scrollMotion,false); });
test('supportsWebGL is safe without document',()=>assert.equal(supportsWebGL(),false));
test('pointer travel exposes the ring face with substantially wider pitch and yaw',()=>{
  assert.equal(typeof ringScene.getRingRotationTarget,'function');
  const center=ringScene.getRingRotationTarget({normalizedX:0,normalizedY:0});
  const right=ringScene.getRingRotationTarget({normalizedX:1,normalizedY:0});
  const down=ringScene.getRingRotationTarget({normalizedX:0,normalizedY:1});
  assert.ok(Math.abs(center.x)>=0.4,'resting pitch should present the ring face');
  assert.ok(Math.abs(right.y-center.y)>=0.8,'horizontal travel should produce clear yaw');
  assert.ok(Math.abs(down.x-center.x)>=0.5,'vertical travel should produce clear pitch');
});
test('reduced motion keeps the face-forward ring pose static during pointer travel',()=>{
  const center=ringScene.getRingRotationTarget({normalizedX:0,normalizedY:0,reducedMotion:true});
  const edge=ringScene.getRingRotationTarget({normalizedX:1,normalizedY:1,reducedMotion:true});
  assert.deepEqual(edge,center);
});
