import test from 'node:test';
import assert from 'node:assert/strict';
import { corpsSymbols, symbolSVG } from '../corps-symbols.mjs';
import { batteryMarkup, ringHostMarkup, spectrumRailMarkup } from '../polish-ui.mjs';

const required = ['green','yellow','red','blue','orange','indigo','violet','black','white'];

test('corps symbol registry contains all nine primary spectrum identities', () => {
  assert.deepEqual(corpsSymbols.map(x => x.id), required);
  assert.equal(new Set(corpsSymbols.map(x => x.color)).size, 9);
  required.forEach(id => assert.match(symbolSVG(id), /<svg[\s\S]*data-corps=/));
});

test('central battery markup contains only the uploaded interactive model', () => {
  const html = batteryMarkup({ compact:false });
  assert.match(html, /x-central-battery/);
  assert.match(html, /x-battery-model/);
  assert.doesNotMatch(html, /x-battery-fallback|x-battery-reactor|data-corps="green"/);
  assert.match(html, /role="button"/);
  assert.match(html, /Central Power Battery/);
});

test('home ring host never renders the retired CSS ring', () => {
  const html = ringHostMarkup();
  assert.match(html, /id="hero-visual"/);
  assert.doesNotMatch(html, /id="power-ring"|class="power-ring"|ring-face|ring-band/);
});

test('spectrum rail renders every Corps as an accessible labeled control', () => {
  const html = spectrumRailMarkup();
  required.forEach(id => assert.match(html, new RegExp(`data-corps="${id}"`)));
  assert.match(html, /aria-label="Emotional spectrum Corps symbols"/);
});
