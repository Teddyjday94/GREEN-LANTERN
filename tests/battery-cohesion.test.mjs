import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { batteryMarkup } from '../polish-ui.mjs';

const root = new URL('../', import.meta.url);
const read = (name) => readFile(new URL(name, root), 'utf8');

test('battery markup reads as one connected lantern body', () => {
  const html = batteryMarkup();
  for (const token of [
    'x-battery-frame',
    'x-battery-arch',
    'x-battery-side-rail',
    'x-battery-chamber',
    'x-battery-foot',
    'x-battery-front-badge'
  ]) assert.match(html, new RegExp(token));
});

test('battery cohesion layer favors a single silhouette and restrained floor light', async () => {
  const css = await read('battery-cohesion.css');
  for (const token of [
    '.x-battery-frame',
    '.x-battery-arch',
    '.x-battery-side-rail',
    '.x-battery-chamber',
    '.x-battery-foot',
    '.x-battery-front-badge'
  ]) assert.match(css, new RegExp(token.replace('.', '\\.')));
  assert.match(css, /\.x-battery-floor-rings[^}]*opacity:\s*\.2/);
  assert.match(css, /@media\(max-width:680px\)/);
});
