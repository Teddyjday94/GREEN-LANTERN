import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (name) => readFile(new URL(name, root), 'utf8');

test('index loads the additive polish stylesheet and runtime after expansion', async () => {
  const html = await read('index.html');
  assert.match(html, /polish\.css/);
  assert.match(html, /polish\.mjs/);
  assert.ok(html.indexOf('/polish.mjs') > html.indexOf('/expansion.mjs'));
});

test('build emits polish runtime, styles, symbols and battery helpers', async () => {
  const build = await read('scripts/build.mjs');
  for (const file of ['polish.mjs','polish.css','polish-ui.mjs','corps-symbols.mjs']) assert.match(build, new RegExp(file.replace('.', '\\.')));
});

test('polish runtime upgrades Oa, spectrum and organization without deleting Oa controls', async () => {
  const runtime = await read('polish.mjs');
  assert.match(runtime, /enhanceBatteryScene/);
  assert.match(runtime, /querySelectorAll\('\.oa-node'\)/);
  assert.match(runtime, /spectrumRailMarkup/);
  assert.match(runtime, /x-ui-organized/);
});

test('polish CSS includes battery light, ring face ripple and scroll-safe touch behavior', async () => {
  const css = await read('polish.css');
  assert.match(css, /\.x-battery-core/);
  assert.match(css, /\.ring-face-activated/);
  assert.match(css, /touch-action:\s*pan-y/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('typecheck covers every new polish module', async () => {
  const pkg = JSON.parse(await read('package.json'));
  for (const file of ['corps-symbols.mjs','polish-ui.mjs','polish.mjs']) assert.match(pkg.scripts.typecheck, new RegExp(file.replace('.', '\\.')));
});
