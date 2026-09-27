import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const noSlop = await readFile(new URL('../no-slop.css', import.meta.url), 'utf8');
const expansion = await readFile(new URL('../expansion.mjs', import.meta.url), 'utf8');
const polishJs = await readFile(new URL('../polish.mjs', import.meta.url), 'utf8');

test('critical display text has explicit wrapping and safer line-height overrides', () => {
  assert.match(noSlop, /\.x-dossier-title h1[^}]*overflow-wrap:/);
  assert.match(noSlop, /\.x-page-hero h1[^}]*line-height:\.9/);
  assert.match(noSlop, /\.x-card-body h3[^}]*line-height:1/);
});

test('grid children can shrink instead of forcing horizontal overflow', () => {
  assert.match(noSlop, /\.x-archive-layout>\*[^}]*min-width:0/);
  assert.match(noSlop, /\.x-dossier-layout>\*[^}]*min-width:0/);
  assert.match(noSlop, /\.x-timeline-body>\*[^}]*min-width:0/);
});

test('mobile typography and timeline layout have explicit narrow-screen rules', () => {
  assert.match(noSlop, /@media\(max-width:760px\)/);
  assert.match(noSlop, /\.x-dossier-title h1[^}]*font-size:clamp\(50px,16vw,92px\)/);
  assert.match(noSlop, /\.x-timeline-detail[^}]*position:relative/);
});

test('presentation copy avoids implementation-language and faux-system labels', () => {
  assert.doesNotMatch(expansion, /locally rendered WebGL|CLASSIC SIGNET STUDY|Cosmic personnel layer|Cosmic archive \/\/ off-world Lanterns/);
  assert.doesNotMatch(polishJs, /Corps identifiers \/\/ emotional spectrum/);
});

test('decorative scanline clutter is disabled in the final polish layer', () => {
  assert.match(noSlop, /\.x-card-scan,\.x-scanline\{display:none/);
});
