import test from 'node:test'; import assert from 'node:assert/strict'; import {readFile} from 'node:fs/promises';
const app=(await readFile(new URL('../expansion.mjs',import.meta.url),'utf8'))+(await readFile(new URL('../expansion-render.mjs',import.meta.url),'utf8')); const css=await readFile(new URL('../expansion.css',import.meta.url),'utf8');
test('archive exposes dual modes and responsive filter rail',()=>{assert.match(app,/data-x-mode="earth"/);assert.match(app,/data-x-mode="cosmic"/);assert.match(css,/\.x-archive-filter-rail/);assert.match(css,/\.x-archive-filter-rail\.is-open/);});
test('dossier includes gallery relationship continuity and event layers',()=>{assert.match(app,/x-rel-network/);assert.match(app,/x-gallery/);assert.match(app,/CONTINUITY \/ SOURCE NOTES/);assert.match(app,/EVENT NODES/);});
test('timeline uses buttons and deep-link state',()=>{assert.match(app,/data-x-event/);assert.match(app,/history\.replaceState/);assert.match(app,/data-x-year/);});
test('image error fallback and keyboard focus styling exist',()=>{assert.match(app,/addEventListener\('error'/);assert.match(css,/:focus-visible/);assert.match(css,/prefers-reduced-motion:reduce/);});
