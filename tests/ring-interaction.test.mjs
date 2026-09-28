import test from 'node:test';
import assert from 'node:assert/strict';
import { Texture } from 'three';
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

test('ring visual targets preserve each model material baseline after release', () => {
  assert.equal(typeof ringScene.getRingVisualTargets, 'function');
  const profile = ringScene.getRingHoldProfile({ reducedMotion: false });

  assert.deepEqual(
    ringScene.getRingVisualTargets({ held: false, pulseBoost: 0, holdProfile: profile, idleEmissive: 2.3 }),
    { emissive: 2.3, light: 0 },
  );
  assert.ok(
    ringScene.getRingVisualTargets({ held: true, pulseBoost: 0, holdProfile: profile, idleEmissive: 2.3 }).emissive > 2.3,
  );
});

test('uploaded ring textures are disposed and released as a group', () => {
  assert.equal(typeof ringScene.disposeRingTextures, 'function');
  const textures = [new Texture(), new Texture()];
  let disposeEvents = 0;
  textures.forEach((texture) => texture.addEventListener('dispose', () => { disposeEvents += 1; }));

  ringScene.disposeRingTextures(textures);

  assert.equal(disposeEvents, 2);
  assert.equal(textures.length, 0);
});

test('texture load failures wait for slower requests before cleanup begins', async () => {
  assert.equal(typeof ringScene.settleRingTextureLoads, 'function');
  let slowerRequestFinished = false;
  const slowerRequest = new Promise((resolve) => setTimeout(() => {
    slowerRequestFinished = true;
    resolve('loaded texture');
  }, 5));

  await assert.rejects(
    ringScene.settleRingTextureLoads([Promise.reject(new Error('texture failed')), slowerRequest]),
    /texture failed/,
  );
  assert.equal(slowerRequestFinished, true);
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
