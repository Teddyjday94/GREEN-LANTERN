import test from 'node:test';
import assert from 'node:assert/strict';
import * as ringScene from '../ring-scene.mjs';

const { getRingClickProfile } = ringScene;

test('press-and-hold keeps the ring charged until release and ignores duplicate transitions', () => {
  assert.equal(typeof ringScene.createRingHoldController, 'function');
  const transitions = [];
  const hold = ringScene.createRingHoldController({ onChange: (held) => transitions.push(held) });

  assert.equal(hold.held, false);
  hold.begin();
  hold.begin();
  assert.equal(hold.held, true);
  hold.end();
  hold.end();

  assert.equal(hold.held, false);
  assert.deepEqual(transitions, [true, false]);
});

test('reduced-motion hold profile keeps a visible steady glow without animated effects', () => {
  assert.equal(typeof ringScene.getRingHoldProfile, 'function');
  const full = ringScene.getRingHoldProfile({ reducedMotion: false });
  const reduced = ringScene.getRingHoldProfile({ reducedMotion: true });

  assert.ok(full.heldEmissive > full.idleEmissive);
  assert.ok(reduced.heldEmissive > reduced.idleEmissive);
  assert.equal(full.animateEffects, true);
  assert.equal(reduced.animateEffects, false);
});

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
