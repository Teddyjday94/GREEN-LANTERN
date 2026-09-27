import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../router.mjs';

test('resolves core routes and lantern dossiers', () => {
  assert.deepEqual(resolveRoute('/'), { name: 'home' });
  assert.deepEqual(resolveRoute('/lanterns'), { name: 'lanterns' });
  assert.deepEqual(resolveRoute('/lanterns/hal-jordan'), { name: 'lantern', slug: 'hal-jordan' });
  assert.deepEqual(resolveRoute('/not-real'), { name: 'not-found' });
});
