import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { batteryMarkup } from '../polish-ui.mjs';

const root = new URL('../', import.meta.url);
const read = (name) => readFile(new URL(name, root), 'utf8');

test('battery markup never emits the retired illustrated lantern body', () => {
  const html = batteryMarkup();
  assert.match(html, /x-battery-model/);
  assert.doesNotMatch(html, /x-battery-frame|x-battery-fallback|x-battery-front-badge/);
});

test('battery cohesion layer keeps the uploaded model hidden until ready and keyboard focus visible', async () => {
  const css = await read('battery-cohesion.css');
  assert.match(css, /\.x-battery-model[^}]*opacity:\s*0/);
  assert.match(css, /\.x-central-battery\.is-model-loaded \.x-battery-model\{opacity:1\}/);
  assert.match(css, /\.x-central-battery:focus-visible/);
  assert.match(css, /@media\(max-width:680px\)/);
});
