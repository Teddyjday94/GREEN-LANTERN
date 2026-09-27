import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('build vendors pinned Three.js module and its core dependency', () => {
  assert.equal(pkg.dependencies?.three, '0.186.1');
  assert.match(build, /node_modules\/three\/build\/three\.module\.js/);
  assert.match(build, /vendor\/three\.module\.js/);
  assert.match(build, /node_modules\/three\/build\/three\.core\.js/);
  assert.match(build, /vendor\/three\.core\.js/);
  for (const file of ['expansion-sources.mjs','expansion-earth.mjs','expansion-cosmic.mjs','expansion-events.mjs','expansion-data.mjs','expansion-search.mjs','timeline.mjs','ring-scene.mjs','expansion-render.mjs','expansion.mjs','expansion.css']) {
    assert.match(build, new RegExp(file.replace('.', '\\.')));
  }
});

test('page loads expansion CSS and module after base assets', () => {
  assert.match(html, /styles\.css[\s\S]*expansion\.css/);
  assert.match(html, /app\.mjs[\s\S]*expansion\.mjs/);
});
