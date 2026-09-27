import test from 'node:test'; import assert from 'node:assert/strict';
import {getRingQualityProfile,supportsWebGL} from '../ring-scene.mjs';
test('desktop and mobile quality profiles cap DPR and particles',()=>{ const d=getRingQualityProfile({width:1400,devicePixelRatio:3}); const m=getRingQualityProfile({width:420,devicePixelRatio:4}); assert.equal(d.pixelRatio,1.8); assert.equal(m.pixelRatio,1.35); assert.ok(m.particleCount<d.particleCount); });
test('reduced motion disables animation-heavy behavior',()=>{ const p=getRingQualityProfile({width:1200,devicePixelRatio:2,reducedMotion:true}); assert.equal(p.particleCount,0); assert.equal(p.idleRotation,0); assert.equal(p.scrollMotion,false); });
test('supportsWebGL is safe without document',()=>assert.equal(supportsWebGL(),false));
