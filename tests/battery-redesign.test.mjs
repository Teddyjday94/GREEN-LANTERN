import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { batteryMarkup } from '../polish-ui.mjs';

const root = new URL('../', import.meta.url);
const read = (name) => readFile(new URL(name, root), 'utf8');

test('Central Power Battery markup exposes architectural reactor layers', () => {
  const html = batteryMarkup();
  for (const token of [
    'x-battery-crown',
    'x-battery-reactor',
    'x-battery-glass',
    'x-battery-energy-column',
    'x-battery-emblem-housing',
    'x-battery-base-reactor',
    'x-battery-floor-rings'
  ]) assert.match(html, new RegExp(token));
});

test('Central Power Battery keeps the Green Lantern emblem on the front housing', () => {
  const html = batteryMarkup();
  assert.match(html, /x-battery-emblem-housing/);
  assert.match(html, /x-corps-symbol/);
  assert.match(html, /Central Power Battery/);
});

test('battery styling provides glass depth, central illumination and mobile treatment', async () => {
  const css = await read('battery-redesign.css');
  for (const token of [
    '.x-battery-reactor',
    '.x-battery-glass',
    '.x-battery-energy-column',
    '.x-battery-emblem-housing',
    '.x-battery-floor-rings'
  ]) assert.match(css, new RegExp(token.replace('.', '\\.')));
  assert.match(css, /backdrop-filter|filter:/);
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('battery redesign stylesheet is loaded after the general polish layers and emitted by the build', async () => {
  const [html, build] = await Promise.all([read('index.html'), read('scripts/build.mjs')]);
  assert.match(html, /battery-redesign\.css/);
  assert.ok(html.indexOf('/battery-redesign.css') > html.indexOf('/no-slop.css'));
  assert.match(build, /battery-redesign\.css/);
});
