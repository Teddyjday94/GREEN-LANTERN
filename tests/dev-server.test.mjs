import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('development server exposes built assets and uses the SPA shell for routes', async (t) => {
  const serve = await import('../scripts/serve.mjs').catch(() => ({}));
  assert.equal(typeof serve.createStaticServer, 'function');

  const root = await mkdtemp(path.join(tmpdir(), 'green-lantern-server-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'vendor'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), '<main>Oa archive</main>');
  await writeFile(path.join(root, 'vendor', 'three.module.js'), 'export const scene = true;');

  const server = serve.createStaticServer({ root });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const { port } = server.address();

  const asset = await fetch(`http://127.0.0.1:${port}/vendor/three.module.js`);
  assert.equal(asset.status, 200);
  assert.match(await asset.text(), /scene = true/);

  const route = await fetch(`http://127.0.0.1:${port}/corps`);
  assert.equal(route.status, 200);
  assert.match(await route.text(), /Oa archive/);
});
