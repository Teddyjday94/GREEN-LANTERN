import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const app = await readFile(new URL('../app.mjs', import.meta.url), 'utf8');

test('reduced motion has an explicit low-motion presentation', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.reveal\s*\{\s*opacity:1;\s*transform:none/);
});

test('mobile construct canvas is scroll-safe until explicitly armed', () => {
  assert.match(css, /touch-action:pan-y/);
  assert.match(app, /touchEnabled\?'none':'pan-y'/);
});

test('external artwork has a runtime fallback path', () => {
  assert.match(app, /addEventListener\('error'/);
  assert.match(css, /image-failed img/);
});

test('mobile navigation breakpoint and toggle are present', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(html, /id="nav-toggle"/);
});
