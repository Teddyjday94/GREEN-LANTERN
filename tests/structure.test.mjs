import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('html contains accessible hero and app mount', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /Green Lantern Corps Archive/i);
  assert.match(html, /id="app"/);
  assert.match(html, /Skip to content/i);
});
