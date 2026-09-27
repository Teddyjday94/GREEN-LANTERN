import test from 'node:test';
import assert from 'node:assert/strict';
import { lanterns, sources, spectrum, events } from '../data.mjs';

test('required Earth Lantern roster is present with unique slugs', () => {
  const required = ['hal-jordan','john-stewart','guy-gardner','kyle-rayner','simon-baz','jessica-cruz','jo-mullein','alan-scott','jade','keli-quintela'];
  const slugs = lanterns.map((l) => l.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  required.forEach((slug) => assert.ok(slugs.includes(slug), `missing ${slug}`));
});

test('all citations resolve and artwork is credited', () => {
  const ids = new Set(Object.keys(sources));
  lanterns.forEach((lantern) => {
    lantern.sourceIds.forEach((id) => assert.ok(ids.has(id), `${lantern.slug} missing source ${id}`));
    if (lantern.artwork) {
      assert.ok(lantern.artwork.url);
      assert.ok(lantern.artwork.sourceUrl);
      assert.ok(lantern.artwork.credit);
      assert.ok(lantern.artwork.alt);
    }
  });
});

test('spectrum order preserves seven emotions and separates black/white', () => {
  assert.deepEqual(spectrum.filter((s) => s.kind === 'emotion').map((s) => s.id), ['rage','avarice','fear','will','hope','compassion','love']);
  assert.deepEqual(spectrum.filter((s) => s.kind !== 'emotion').map((s) => s.id), ['death','life']);
});

test('events are chronological', () => {
  const years = events.map((event) => event.year);
  assert.deepEqual(years, [...years].sort((a,b) => a-b));
});
