import test from 'node:test';
import assert from 'node:assert/strict';
import { lanterns } from '../data.mjs';
import { normalizeSearchText, searchLanterns } from '../search.mjs';

test('normalizes case and diacritics', () => {
  assert.equal(normalizeSearchText('  JÉSSICA CRUZ '), 'jessica cruz');
});

test('search matches names aliases stories and affiliations', () => {
  assert.equal(searchLanterns(lanterns, 'torchbearer', {}).at(0)?.slug, 'kyle-rayner');
  assert.equal(searchLanterns(lanterns, 'far sector', {}).at(0)?.slug, 'jo-mullein');
  assert.ok(searchLanterns(lanterns, 'justice league', {}).some((r) => r.slug === 'john-stewart'));
});

test('combined filters narrow results and zero results are safe', () => {
  const filtered = searchLanterns(lanterns, '', { eras: ['modern'], statuses: ['corps'] });
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((r) => r.era === 'modern' && r.status === 'corps'));
  assert.deepEqual(searchLanterns(lanterns, 'zzzz-no-match', {}), []);
});
