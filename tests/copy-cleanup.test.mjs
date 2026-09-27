import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCopy } from '../copy-cleanup.mjs';

test('removes em dashes from visitor-facing copy', () => {
  assert.equal(sanitizeCopy('Green Lantern Corps — Official DC Character'), 'Green Lantern Corps: Official DC Character');
  assert.equal(sanitizeCopy('Trust is earned—even when the ring chose you.'), 'Trust is earned: even when the ring chose you.');
  assert.doesNotMatch(sanitizeCopy('A — B — C'), /—/);
});

test('replaces faux system separators and AI-sounding presentation copy', () => {
  assert.equal(sanitizeCopy('Sector 2814 // Earth uplink'), 'Sector 2814 · Earth');
  assert.equal(sanitizeCopy('A cinematic field archive of Green Lantern history.'), 'A field guide to Green Lantern history.');
  assert.equal(sanitizeCopy('Construct lab // local simulation'), 'Construct lab');
});

test('removes common filler phrases without altering normal lore copy', () => {
  const cleaned = sanitizeCopy('An immersive, dynamic experience that seamlessly elevates the archive.');
  assert.doesNotMatch(cleaned, /immersive|dynamic|seamlessly|elevates?/i);
  assert.equal(sanitizeCopy('The Green Lantern Corps patrols 3,600 sectors.'), 'The Green Lantern Corps patrols 3,600 sectors.');
});
