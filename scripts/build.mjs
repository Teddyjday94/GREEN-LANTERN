import { rm, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { lanterns } from '../data.mjs';
const dist = new URL('../dist/', import.meta.url);
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for (const file of ['index.html','styles.css','app.mjs','data.mjs','search.mjs','router.mjs','vercel.json']) {
  await copyFile(new URL(`../${file}`,import.meta.url),new URL(file,dist));
}
const rawSite = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4173');
const site = rawSite.replace(/\/$/,'');
const routes = ['','lanterns','corps','universe','spectrum','timeline','villains','reading','sources',...lanterns.map(l=>`lanterns/${l.slug}`)];
await writeFile(new URL('robots.txt',dist),`User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
await writeFile(new URL('sitemap.xml',dist),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${site}/${r}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${routes.length} routable archive locations to dist/ for ${site}`);
