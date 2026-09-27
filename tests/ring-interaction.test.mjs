import test from 'node:test';
import assert from 'node:assert/strict';
import { getRingClickProfile } from '../ring-scene.mjs';

test('ring face click produces a strong emissive pulse in full motion mode', () => {
  const profile = getRingClickProfile({ reducedMotion:false });
  assert.ok(profile.emissiveBoost >= 7);
  assert.ok(profile.rippleDuration >= 500);
  assert.equal(profile.particleBurst, true);
});

test('ring face click remains visible but restrained with reduced motion', () => {
  const profile = getRingClickProfile({ reducedMotion:true });
  assert.ok(profile.emissiveBoost > 0);
  assert.equal(profile.particleBurst, false);
  assert.ok(profile.rippleDuration <= 250);
});
