# Green Lantern Archive Expansion — Design Specification

**Status:** User-approved design direction; implementation planning not yet started.

## Goal

Expand the existing Green Lantern Corps Archive into a deeper, more polished, research-driven fan experience without rewriting the working site. The upgrade must improve character coverage, image completeness, power-ring fidelity, timeline presentation, archive UX, and the sense that the user is navigating an Oan tactical database.

## Product Direction

Preserve the current dependency-light architecture, routing model, visual identity, Vercel deployment, source registry, and accessibility fallbacks. Add real 3D only where it materially improves the experience, primarily the hero power ring and selected spatial effects.

The preferred implementation approach is a targeted Three.js enhancement layered onto the current vanilla JavaScript/CSS site. The archive should remain fast, maintainable, and easy to extend with more characters and story eras.

## Research and Source Rules

1. Prefer official DC character pages, DC editorial/features, DC comic/graphic-novel pages, and DC Shop references for baseline facts and visual reference.
2. Prefer `static.dc.com` or other official DC-hosted promotional/editorial imagery where a stable image URL is available.
3. Each externally displayed character image must retain source URL, alt text, and a concise rights/credit note in the data model.
4. Do not scrape or hotlink random fan-art/search-engine images when an official source is available.
5. If official sources disagree on a first appearance, role, continuity label, or status, record the disagreement as a continuity/source note instead of silently choosing a single answer.
6. Keep the site visibly unofficial and noncommercial, with the existing rights disclaimer preserved.

### Initial Official Reference Set

- Green Lantern Corps overview: https://www.dc.com/characters/green-lantern-corps
- Kyle Rayner / Torchbearer editorial: https://www.dc.com/blog/2026/03/30/to-bear-the-torch-why-kyle-rayner-is-the-strongest-lantern-of-all
- Kyle Rayner archive profile reference: https://www.dc.com/blog/2025/02/12/what-your-favorite-green-lantern-says-about-you
- Kyle Rayner collection: https://www.dc.com/graphic-novels/green-lantern-1990/green-lantern-kyle-rayner-vol-1
- Emerald Twilight / New Dawn: https://www.dc.com/graphic-novels/green-lantern-1990/green-lantern-emerald-twilight/new-dawn
- Alien Lantern overview: https://www.dc.com/blog/2026/09/03/off-world-warriors-five-essential-alien-green-lanterns
- Alan Scott: https://www.dc.com/characters/alan-scott
- Jessica Cruz: https://www.dc.com/characters/jessica-cruz
- Simon Baz: https://www.dc.com/characters/simon-baz
- Official Green Lantern power-ring physical reference: https://shop.dc.com/products/lanterns-green-lantern-power-ring

## Power Ring 3D Experience

Replace the current CSS-only hero ring with a real WebGL/Three.js ring scene.

### Geometry

- Thick wearable ring band rather than a flat torus.
- Raised circular/signature face with a recognizable Green Lantern glyph.
- Recessed emblem detailing and a luminous core.
- Slight beveling and asymmetry so the object reads like manufactured metal rather than a perfect primitive.
- Reference the classic comic signet silhouette while using licensed physical ring proportions/material cues only as reference, not as a direct copied model.

### Materials and Lighting

- Metallic emerald-green outer material with moderate roughness.
- Darker recessed grooves and inner band.
- Translucent/emissive green center.
- Soft HDR-like highlight behavior created with scene lighting, not a flat CSS glow.
- Animated energy bloom/pulse around the signet.
- Hard-light particle leakage during charge/pulse moments.

### Interaction

- Slow idle rotation.
- Pointer/touch parallax: ring subtly turns toward input.
- Scroll-linked camera approach/retreat on the homepage.
- Brief energy-charge pulse when the boot sequence reaches 100%.
- No input behavior may interfere with normal page scrolling on touch devices.
- Honor `prefers-reduced-motion`; reduced-motion mode shows the ring nearly static with minimal emissive animation.

### Performance

- Lazy-load Three.js and the ring scene after the page shell is interactive.
- Limit device pixel ratio and particle counts on mobile/low-power devices.
- If WebGL fails, fall back to a polished static/CSS ring visualization rather than leaving an empty hero.

## Character Archive Expansion

### Archive Modes

The Lantern archive becomes two connected modes:

1. **Sector 2814 / Earth & Legacy**
2. **Green Lantern Corps / Cosmic Archive**

The distinction must be explicit so Alan Scott, Jade, Keli Quintela, and other legacy/allied entries are not presented as ordinary Sector 2814 Corps recruits when that is inaccurate.

### Initial Earth / Legacy Roster

- Hal Jordan
- John Stewart
- Guy Gardner
- Kyle Rayner
- Simon Baz
- Jessica Cruz
- Jo Mullein
- Alan Scott
- Jade / Jennie-Lynn Hayden
- Keli Quintela / Teen Lantern

### Initial Cosmic Corps Roster

- Kilowog
- Abin Sur
- Tomar-Re
- Mogo
- Ch’p
- Salaak
- Arisia Rrab
- Soranik Natu

The schema must remain extensible for later additions without UI rewrites.

### Required Character Fields

Each archive record should support:

- slug
- name
- aliases
- real name
- species
- homeworld
- sector / assignment
- era
- Corps/legacy status
- ring/power source type
- first appearance
- creators
- affiliations
- abilities
- construct philosophy/style
- major stories
- major events
- allies / mentors / predecessors / successors / rivals
- recommended reading
- continuity notes
- source IDs
- artwork array (not only one image)

### Artwork Completeness

The implementation must remove generic character placeholders for the major roster wherever a usable official image can be sourced.

Priority missing/imperfect imagery:

- Kyle Rayner
- Alan Scott
- Jade
- Keli Quintela
- Kilowog
- Abin Sur
- Tomar-Re
- Mogo
- Ch’p
- Salaak
- Arisia
- Soranik Natu

Kyle Rayner is the first required fix because the current record has no `artwork` object.

### Dossier Presentation

Character dossiers should feel like layered Oan records rather than plain text pages:

- large portrait / hero art
- identity and sector/status hierarchy
- scanning-line opening animation
- structured metadata panel
- construct profile
- affiliations and power source
- story/event nodes
- relationship network/constellation
- recommended reading
- continuity notes
- source trail
- optional secondary gallery when more than one official image is available

## Search and Filtering

Search must continue to support free-text queries and expand to cover the new structured fields.

Examples that should resolve meaningfully:

- `Sector 2814`
- `White Lantern`
- `Xudar`
- `Honor Guard`
- `architect`
- `Far Sector`
- `Emerald Twilight`
- `Torchbearer`
- `Korugar`
- `training`

Filters should include at minimum:

- Earth / Cosmic archive mode
- era
- status
- sector
- species or origin type where useful

Desktop should use a sticky Oan-style filter rail. Mobile should use a compact filter drawer/sheet.

## Timeline Redesign

Replace the current stacked-card timeline with an interactive chronological system.

### Primary Navigation Years / Anchors

Initial anchors:

- 1940
- 1959
- 1968
- 1971
- 1994
- 2005
- 2007
- 2009
- 2011
- 2012
- 2014
- 2016
- 2019
- 2023
- 2025
- 2026

The data should allow multiple events per year.

### Era Grouping

1. **Golden Age / Mystical Green Lantern** — Alan Scott and the pre-Corps Green Lantern tradition.
2. **Sector 2814 Enters the Corps Era** — Abin Sur, Hal Jordan, Oa, Sinestro.
3. **Earth Lantern Expansion** — Guy Gardner and John Stewart.
4. **Emerald Twilight / Torchbearer Era** — Corps collapse, Kyle Rayner, Ion, reconstruction.
5. **Rebirth / War Era** — Hal’s return, Sinestro Corps War, Blackest Night, Brightest Day, War of the Green Lanterns.
6. **Modern Lanterns** — Simon Baz, Jessica Cruz, Jo Mullein, Keli Quintela, recent Corps status quos.

### Timeline Interaction

- Horizontal desktop chronometer with a pinned year/era rail.
- Vertical/mobile version preserving the same hierarchy.
- Selecting a year/event opens an illustrated event dossier in place.
- Event dossiers show date, era, summary, involved characters, consequences, recommended reading, and sources.
- Background/starfield tone should shift subtly by era without making text harder to read.
- Timeline state should be deep-linkable when practical, e.g. query/hash or route state.

## Homepage and UI Upgrade

### Homepage Progression

1. Corps boot sequence
2. Real 3D power ring
3. Sector 2814 / Earth archive introduction
4. Featured Earth Lanterns
5. Oa / Corps systems
6. Cosmic Corps archive
7. Sector map
8. Emotional Spectrum
9. Interactive timeline
10. Villains / major conflicts
11. Reading paths and source registry

### Visual System Changes

- Stronger Oan tactical/archive visual language.
- More asymmetrical layouts and depth.
- Character portraits can bleed outside panel boundaries where safe.
- Reduce large unused black gaps.
- Use green illumination to indicate interactivity, not as decoration everywhere.
- Add restrained scanning lines, holographic separators, vector grid lines, and luminous node connections.
- Preserve high text contrast and readability.
- Avoid generic dashboard cards and numbered-feature blocks.
- No emoji UI.

### Status Labels

Support semantic badges such as:

- ACTIVE CORPS
- FORMER CORPS
- HONOR GUARD
- LEGACY
- ALLIED
- DECEASED / HISTORICAL where relevant and properly sourced

These labels must be data-driven, not hard-coded by card position.

## Relationship Network

Dossiers should support a compact relationship visualization. It must be informative, not decorative.

Examples:

- Hal Jordan ↔ Abin Sur / Sinestro / Carol Ferris / John Stewart
- John Stewart ↔ Katma Tui / Kilowog / Hal / Guy
- Kyle Rayner ↔ Ganthet / Jade / Hal / Guy
- Soranik Natu ↔ Sinestro / Korugar / Corps

On mobile, the visualization can collapse to a readable relationship list.

## Villains and Event Cross-Linking

Existing villain records should become cross-linked to timeline events and Lantern dossiers where the data supports it. The first pass should prioritize Sinestro, Parallax, Atrocitus, Black Hand, Nekron, Krona, and Hector Hammond.

## Data Quality Audit

Before visual expansion, audit the current dataset for source mismatches and continuity ambiguity. Examples already visible include first-appearance differences between existing local data and some current DC character/editorial pages. The archive should distinguish:

- first cameo / first appearance
- first appearance under a specific identity
- publication cover date vs release date
- pre-Crisis / post-Crisis / current continuity differences

Do not claim a disputed item as universally settled when the sources do not support that certainty.

## Accessibility

- Preserve keyboard navigation and skip link.
- Every informative image needs meaningful alt text.
- Decorative artwork must use empty alt/ARIA-hidden as appropriate.
- All timeline and archive controls must be usable without a pointer.
- Maintain reduced-motion behavior across WebGL, scroll animation, timeline transitions, and page reveals.
- Mobile controls must never trap scroll.

## Performance

- Keep the site mostly static/data-driven.
- Lazy-load noncritical images and WebGL code.
- Use responsive image dimensions where practical.
- Avoid loading full-resolution artwork for cards when smaller official derivatives exist.
- Defer secondary galleries until dossier view.
- Keep the initial hero interactive even if external artwork hosts are slow or blocked.

## Vercel / Routing Constraints

Preserve the fixed production setup:

- build command: `npm run build`
- output directory: `dist`
- SPA fallback to `/index.html`
- current deep routes must continue to return 200 after deployment

The expansion must not reintroduce the prior `cleanUrls` rewrite conflict.

## Verification Requirements

Implementation is complete only when all of the following are verified:

1. Existing automated tests remain green and new data/search/timeline tests pass.
2. `npm run typecheck` passes.
3. `npm run build` passes and emits the expected `dist` assets/routes.
4. Every priority character has artwork or an explicitly documented source limitation.
5. Kyle Rayner displays real sourced artwork in cards and dossier view.
6. WebGL ring loads on supported browsers and the fallback appears when WebGL is unavailable.
7. Reduced-motion behavior is checked.
8. Desktop and mobile archive/filter/timeline states are visually checked.
9. Vercel deploy reaches READY and the homepage plus representative deep routes return HTTP 200.
10. No console-breaking errors remain on the main page, Lantern archive, Kyle dossier, timeline, and Oa/Corps page.
