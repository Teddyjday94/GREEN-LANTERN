import test from 'node:test';
import assert from 'node:assert/strict';
import { corpsSymbols, symbolSVG } from '../corps-symbols.mjs';
import { batteryMarkup, spectrumRailMarkup } from '../polish-ui.mjs';

const required = ['green','yellow','red','blue','orange','indigo','violet','black','white'];

test('corps symbol registry contains all nine primary spectrum identities', () => {
  assert.deepEqual(corpsSymbols.map(x => x.id), required);
  assert.equal(new Set(corpsSymbols.map(x => x.color)).size, 9);
  required.forEach(id => assert.match(symbolSVG(id), /<svg[\s\S]*data-corps=/));
});

test('central battery markup is built around an architectural reactor and Corps emblem', () => {
  const html = batteryMarkup({ compact:false });
  assert.match(html, /x-central-battery/);
  assert.match(html, /x-battery-crown/);
  assert.match(html, /x-battery-reactor/);
  assert.match(html, /x-battery-glass/);
  assert.match(html, /x-battery-energy-column/);
  assert.match(html, /x-battery-emblem-housing/);
  assert.match(html, /data-corps="green"/);
  assert.match(html, /Central Power Battery/);
});

test('spectrum rail renders every Corps as an accessible labeled control', () => {
  const html = spectrumRailMarkup();
  required.forEach(id => assert.match(html, new RegExp(`data-corps="${id}"`)));
  assert.match(html, /aria-label="Emotional spectrum Corps symbols"/);
});
