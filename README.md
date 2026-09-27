# Green Lantern Corps Archive

An unofficial, noncommercial Green Lantern fan archive with a cinematic space interface, searchable Earth Lantern dossiers, Oa/Corps systems, sector map, Emotional Spectrum, timeline, villain archive, reading paths and source registry.

## Run locally

No package installation is required in this build.

```bash
npm run dev
```

Then open `http://localhost:4173`.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Deploy to Vercel

Deploy the project root as a static site. `vercel.json` rewrites deep links back to `index.html` so routes such as `/lanterns/john-stewart` work on refresh. The build script uses `VERCEL_PROJECT_PRODUCTION_URL` for sitemap URLs when available, or you can set `SITE_URL` explicitly.

## Content / rights note

This is an unofficial fan project. Green Lantern, DC, related characters, logos and externally linked artwork remain property of their respective rights holders. Research source URLs and artwork source metadata are stored in `data.mjs` and surfaced in the UI.

## Architecture note

The approved design initially targeted React/Vite/R3F/GSAP. The execution environment could not resolve the npm registry (`EAI_AGAIN`), so this delivery uses dependency-free ES modules, CSS 3D, SVG and Canvas while preserving the approved routes, data model, research traceability, animation direction, accessibility fallbacks and Vercel portability. This keeps the site runnable now and leaves the content model straightforward to migrate to React later if desired.
