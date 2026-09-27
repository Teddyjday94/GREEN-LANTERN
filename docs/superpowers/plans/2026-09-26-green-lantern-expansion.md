# Green Lantern Archive Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing Green Lantern Corps Archive with a source-audited character database, complete priority artwork, a locally served Three.js power-ring scene, richer dossiers/search/UI, and an interactive deep-linkable timeline without rewriting the working vanilla site.

**Architecture:** Preserve the existing static ES-module SPA and Vercel build. Add `three@0.186.1` as the only runtime package, copy its browser module into `dist/vendor/` at build time, and lazy-load a focused `ring-scene.mjs` module from the homepage. Move timeline state/grouping into a pure `timeline.mjs` module so behavior is unit-testable; keep route rendering/orchestration in `app.mjs` and research/content in `data.mjs`.

**Tech Stack:** Vanilla ES modules, CSS, Canvas, Three.js 0.186.1, Node built-in test runner, Vercel static deployment.

**Spec:** `docs/superpowers/specs/2026-09-26-green-lantern-expansion-design.md`

## Global Constraints

- Preserve the current dependency-light SPA, source registry, accessibility fallbacks, routing model, and unofficial/noncommercial disclaimer.
- Prefer official DC pages and `static.dc.com` imagery; every external artwork item must include `url`, `sourceUrl`, `alt`, `credit`, and `role`.
- Do not use random search-engine/fan-art imagery when an official source is available.
- Record disputed first appearances/continuity as notes; do not flatten conflicting sources into false certainty.
- Archive modes are `earth` (Sector 2814 / Earth & Legacy) and `cosmic` (Green Lantern Corps / Cosmic Archive).
- Initial Earth/legacy roster: Hal Jordan, John Stewart, Guy Gardner, Kyle Rayner, Simon Baz, Jessica Cruz, Jo Mullein, Alan Scott, Jade, Keli Quintela.
- Initial cosmic roster: Kilowog, Abin Sur, Tomar-Re, Mogo, Ch’p, Salaak, Arisia Rrab, Soranik Natu.
- Kyle Rayner must have real sourced official artwork in cards and dossier view.
- Three.js must be lazy-loaded from a local built asset; no runtime CDN dependency.
- WebGL failure must preserve a polished CSS/static ring fallback.
- Reduced motion must substantially disable rotation, particles, scroll-linked camera motion, and scanning transitions.
- Touch interactions must never trap normal page scrolling.
- Vercel remains `npm run build` → `dist` with SPA fallback to `/index.html`; do not reintroduce `cleanUrls`.
- Existing deep routes must remain valid.

## Review Focus

1. **WebGL unavailable / import failure:** homepage must keep the CSS fallback visible and usable; Task 6 adds a fallback-state test.
2. **External artwork blocked or broken:** cards/dossiers must continue with an intentional fallback and gallery must skip failed items; Tasks 2 and 5 add data/runtime resilience tests.
3. **Sparse or malformed optional character fields:** search/filter/render helpers must tolerate empty arrays/notes without throwing; Tasks 2 and 3 add sparse-record tests.
4. **Invalid timeline deep link (`?event=` or hash):** timeline must safely select the nearest/default event without breaking route rendering; Task 7 adds parser/state tests.
5. **Small touch viewport / reduced motion:** archive drawer, timeline, ring and construct lab must not trap scroll or rely on hover; Tasks 4, 6, 7 and 9 add static and behavior checks.

---

## File Structure

**Modify**
- `package.json` — pin Three.js and include new modules in syntax checking.
- `scripts/build.mjs` — copy new modules and local Three.js browser build into `dist/vendor/`.
- `data.mjs` — researched sources, richer Lantern schema, priority artwork, event/villain cross-links.
- `search.mjs` — search new fields and archive/sector/species/status filters.
- `app.mjs` — render archive modes, improved dossiers, relationship/gallery UI, ring/timeline integration, homepage progression.
- `styles.css` — Oan UI expansion, sticky filters, dossiers, timeline, ring canvas/fallback, responsive and reduced-motion states.
- `tests/data.test.mjs` — schema, roster, artwork, source/cross-link integrity.
- `tests/search.test.mjs` — new search vocabulary and filter combinations.
- `tests/resilience.test.mjs` — ring fallback, touch/reduced-motion/image fallback checks.
- `tests/structure.test.mjs` — build/module/vendor structure assertions.

**Create**
- `ring-scene.mjs` — isolated Three.js power-ring lifecycle and quality policy.
- `timeline.mjs` — pure timeline grouping, selection and deep-link state helpers.
- `tests/ring-scene.test.mjs` — quality/fallback policy tests that do not require WebGL.
- `tests/timeline.test.mjs` — timeline grouping and invalid/deep-link selection tests.

---

### Task 1: Local Three.js Build Plumbing

**Files:**
- Modify: `package.json`
- Modify: `scripts/build.mjs`
- Modify: `tests/structure.test.mjs`

**Interfaces:**
- Produces: browser import target `/vendor/three.module.min.js`; build copies `ring-scene.mjs` and `timeline.mjs` once those files exist.
- Consumes: existing `npm run build` and `dist/` contract.

- [ ] **Step 1: Write failing structure tests** asserting `package.json.dependencies.three === "0.186.1"`, `scripts/build.mjs` references `node_modules/three/build/three.module.min.js`, and build output path is `vendor/three.module.min.js`.
- [ ] **Step 2: Run `npm test -- tests/structure.test.mjs`** and verify the new assertions fail because Three.js/vendor copy is absent.
- [ ] **Step 3: Add exact dependency and build copy logic.** `package.json` gains `"three": "0.186.1"`; build creates `dist/vendor/`, copies `node_modules/three/build/three.module.min.js`, and includes `ring-scene.mjs`/`timeline.mjs` in the static module copy list when implemented.
- [ ] **Step 4: Run `npm install`, `npm test`, and `npm run build`.** Expected: tests green and `dist/vendor/three.module.min.js` exists.
- [ ] **Step 5: Commit** `build: vendor Three.js for ring scene`.

### Task 2: Source-Audited Lantern and Event Data Model

**Files:**
- Modify: `data.mjs`
- Modify: `tests/data.test.mjs`

**Interfaces:**
- Produces Lantern records with: `slug`, `name`, `aliases: string[]`, `realName`, `species`, `homeworld`, `sector`, `archive`, `era`, `status`, `ringType`, `firstAppearance`, `firstAppearanceNotes`, `creators`, `affiliations`, `abilities`, `constructStyle`, `stories`, `majorEvents`, `relationships`, `recommendedReading`, `continuityNotes`, `sourceIds`, `artwork: Artwork[]`.
- `Artwork = { url, sourceUrl, alt, credit, role }` where role is `portrait | hero | gallery`.
- `relationships = { allies: string[], mentors: string[], predecessors: string[], successors: string[], rivals: string[] }` using Lantern/villain slugs where possible.
- Expands events with `id`, `year`, `dateLabel`, `eraId`, `title`, `summary`, `characterSlugs`, `villainSlugs`, `consequences`, `recommendedReading`, `sourceIds`.

- [ ] **Step 1: Extend data tests** to require all 18 initial Lanterns, unique slugs, valid `archive` values, required structured fields, resolvable source IDs, and artwork metadata integrity.
- [ ] **Step 2: Add failing priority-artwork assertions** requiring non-empty official artwork arrays for Kyle Rayner, Alan Scott, Jade, Keli Quintela, Kilowog, Abin Sur, Tomar-Re, Mogo, Ch’p, Salaak, Arisia Rrab and Soranik Natu; specifically assert Kyle has a `portrait` or `hero` item.
- [ ] **Step 3: Add failing event-integrity assertions** requiring unique event IDs, allowed `eraId` values, chronological nondecreasing years, and every `characterSlugs`/`villainSlugs` reference to resolve.
- [ ] **Step 4: Research and migrate `data.mjs`.** Use the spec’s official reference set plus official DC pages needed for the priority roster; migrate single `artwork` objects to arrays; add continuity notes where sources disagree rather than guessing.
- [ ] **Step 5: Run `npm test -- tests/data.test.mjs` then full `npm test`.** Expected: all schema, artwork, source and cross-link tests pass.
- [ ] **Step 6: Commit** `feat: expand sourced Lantern archive data`.

### Task 3: Search and Faceted Filtering

**Files:**
- Modify: `search.mjs`
- Modify: `tests/search.test.mjs`

**Interfaces:**
- Keep: `normalizeSearchText(value = '') -> string`.
- Update: `searchLanterns(records, query = '', filters = {}) -> Lantern[]`.
- `filters` supports `archives`, `eras`, `statuses`, `sectors`, `species`, `affiliations` arrays.
- Search haystack includes aliases, species, homeworld, sector, ringType, constructStyle, stories, majorEvents, flattened relationships, recommendedReading, continuityNotes, affiliations and abilities.

- [ ] **Step 1: Write failing vocabulary tests** for `Sector 2814`, `White Lantern`, `Xudar`, `Honor Guard`, `architect`, `Far Sector`, `Emerald Twilight`, `Torchbearer`, `Korugar`, and `training`.
- [ ] **Step 2: Write failing combined-filter tests** for earth/cosmic mode plus sector/status/species, including an empty/sparse record that must not throw.
- [ ] **Step 3: Run `npm test -- tests/search.test.mjs`** and verify failures are caused by fields/filters not yet indexed.
- [ ] **Step 4: Expand `searchLanterns`** by flattening the structured fields and applying each optional filter only when the filter array is non-empty.
- [ ] **Step 5: Run the search tests and full suite.** Expected: all pass.
- [ ] **Step 6: Commit** `feat: expand Lantern search and filters`.

### Task 4: Dual-Mode Archive UI and Responsive Filter Rail

**Files:**
- Modify: `app.mjs`
- Modify: `styles.css`
- Modify: `tests/resilience.test.mjs`

**Interfaces:**
- Consumes Task 2 Lantern schema and Task 3 `searchLanterns` filters.
- Produces UI state fields: `archiveMode`, `query`, `era`, `status`, `sector`, `species`.
- Desktop: sticky `.archive-filter-rail`; mobile: button-controlled `.archive-filter-sheet`.

- [ ] **Step 1: Add static resilience assertions** for archive mode controls, sticky desktop rail class, mobile filter-sheet class, keyboard-visible focus states, and mobile sheet scroll behavior.
- [ ] **Step 2: Run resilience tests** and verify these selectors/controls are absent.
- [ ] **Step 3: Update `archivePage()`** to render explicit `Sector 2814 / Earth & Legacy` and `Green Lantern Corps / Cosmic Archive` modes plus facet controls generated from data rather than hard-coded character positions.
- [ ] **Step 4: Update archive runtime wiring** so free-text and all filters compose through `searchLanterns`; show clear active-filter state and a no-results state.
- [ ] **Step 5: Add CSS** for sticky Oan rail, asymmetric portrait cards, mobile filter sheet and portrait bleed without reducing text contrast.
- [ ] **Step 6: Run full tests and `npm run typecheck`.** Expected: green.
- [ ] **Step 7: Commit** `feat: redesign Lantern archive controls`.

### Task 5: Rich Character Dossiers, Galleries and Relationship Network

**Files:**
- Modify: `app.mjs`
- Modify: `styles.css`
- Modify: `tests/resilience.test.mjs`

**Interfaces:**
- Consumes `artwork[]`, structured `relationships`, `recommendedReading`, `continuityNotes`, `ringType`, `species`, `homeworld`, `majorEvents`.
- Produces `artworkMarkup(record, options)` behavior that selects primary art by role and supports a secondary gallery.
- Relationship links resolve Lantern slugs to internal dossier routes and villain slugs to labeled villain context when no dedicated route exists.

- [ ] **Step 1: Add failing resilience/static assertions** for primary-art selection, gallery markup, continuity-note section, relationship network/list fallback, and image-error removal/fallback handling.
- [ ] **Step 2: Run the focused test** and confirm the old single-art dossier fails the new expectations.
- [ ] **Step 3: Replace dossier hero/content layout** with layered portrait art, scanning overlay, metadata hierarchy, construct/power-source panel, event nodes, recommended reading, continuity notes and source trail.
- [ ] **Step 4: Add compact relationship constellation UI** using semantic links/labels; collapse to a readable list below the mobile breakpoint.
- [ ] **Step 5: Add optional secondary artwork gallery** that lazy-loads only on dossier pages and keeps failed images from leaving broken-image chrome.
- [ ] **Step 6: Verify Kyle Rayner card + dossier resolve official artwork** through the same generic artwork pipeline, not a Kyle-specific special case.
- [ ] **Step 7: Run tests/typecheck and commit** `feat: enrich Lantern dossiers`.

### Task 6: Real 3D Power Ring Scene

**Files:**
- Create: `ring-scene.mjs`
- Create: `tests/ring-scene.test.mjs`
- Modify: `app.mjs`
- Modify: `styles.css`
- Modify: `tests/resilience.test.mjs`

**Interfaces:**
- `getRingQualityProfile({ width, devicePixelRatio, reducedMotion }) -> { pixelRatio, particleCount, idleRotation, scrollMotion }`.
- `supportsWebGL() -> boolean` must fail safely when `document`/WebGL is unavailable.
- `mountPowerRing({ container, reducedMotion, signal }) -> Promise<{ pulse(): void, destroy(): void } | null>` dynamically imports `./vendor/three.module.min.js`; returns `null` on unsupported/failed WebGL and leaves fallback intact.
- `app.mjs` calls `mountPowerRing` only on the homepage after the shell is interactive and aborts/destroys on route cleanup.

- [ ] **Step 1: Write failing pure tests** for desktop/mobile pixel-ratio caps, reduced-motion zero/near-zero rotation/particles, and SSR/no-document WebGL safety.
- [ ] **Step 2: Run `npm test -- tests/ring-scene.test.mjs`** and verify missing module/function failures.
- [ ] **Step 3: Implement quality policy and WebGL guard** without creating a renderer at module import time.
- [ ] **Step 4: Implement `mountPowerRing`.** Build a wearable thick band, raised signet, recessed glyph detail, metallic emerald material, darker grooves, emissive core, scene lights and bounded particle system. Preserve the existing CSS ring beneath the canvas until first successful render.
- [ ] **Step 5: Wire interaction.** Idle rotation, subtle pointer/touch parallax, scroll-linked camera approach/retreat, and `pulse()` on boot completion; all disabled/reduced per quality profile.
- [ ] **Step 6: Add resilience assertion** that app code handles a `null` ring scene and CSS contains a visible `.ring-fallback` state.
- [ ] **Step 7: Run ring tests, full tests, typecheck and build.** Expected: local Three module copied and all green.
- [ ] **Step 8: Commit** `feat: add interactive Three.js power ring`.

### Task 7: Interactive Timeline Engine and Chronometer UI

**Files:**
- Create: `timeline.mjs`
- Create: `tests/timeline.test.mjs`
- Modify: `app.mjs`
- Modify: `styles.css`

**Interfaces:**
- `groupEventsByEra(events) -> Array<{ eraId, events }>` preserving chronology.
- `getTimelineAnchors(events) -> number[]` returns unique sorted years.
- `resolveTimelineSelection(events, rawEventId) -> Event` returns matching event or first chronological event.
- `timelineHref(eventId) -> string` returns `/timeline?event=<encoded-id>`.
- Timeline event selection updates route history without full navigation and remains keyboard-operable.

- [ ] **Step 1: Write failing tests** for required anchor years, multiple events in one year, era grouping, valid deep-link resolution, invalid/missing event fallback, and URL encoding.
- [ ] **Step 2: Run timeline tests** and verify module/functions are missing.
- [ ] **Step 3: Implement pure timeline helpers.** No DOM/global dependencies.
- [ ] **Step 4: Replace stacked-card `timelinePage()`** with desktop horizontal chronometer + pinned year/era rail and vertical mobile equivalent; selected event opens an in-place dossier with art (when available), characters, consequences, reading and sources.
- [ ] **Step 5: Wire deep-link state** from `?event=`; clicking/keyboard selection updates history and active state without breaking `/timeline` refresh.
- [ ] **Step 6: Add era-tint styling** via CSS custom properties while keeping readable neutral content panels; reduced-motion disables animated rail transitions.
- [ ] **Step 7: Run timeline tests, full tests and typecheck; commit** `feat: rebuild Green Lantern timeline`.

### Task 8: Homepage, Oa and Villain/Event Cross-Link UI Pass

**Files:**
- Modify: `app.mjs`
- Modify: `styles.css`
- Modify: `data.mjs`
- Modify: `tests/data.test.mjs`

**Interfaces:**
- Consumes archive modes, event IDs, character/villain cross-links and ring lifecycle.
- Homepage order is exactly: boot → 3D ring → Earth archive → featured Earth Lanterns → Oa → cosmic archive → sectors → spectrum → timeline → villains/conflicts → reading/sources.

- [ ] **Step 1: Add data assertions** that priority villains (Sinestro, Parallax, Atrocitus, Black Hand, Nekron, Krona, Hector Hammond) expose event cross-links where sourced and that referenced event IDs exist.
- [ ] **Step 2: Run data tests** to observe missing cross-links.
- [ ] **Step 3: Fill sourced villain/event links** and update homepage sections to include a cosmic Corps preview and illustrated current-event/timeline preview.
- [ ] **Step 4: Refine Oa and sector surfaces** with restrained grid/node connections and stronger hierarchy; reuse existing construct lab and preserve touch arming behavior.
- [ ] **Step 5: Tighten global UI**: reduce empty gaps, add asymmetric panel compositions, use glow only for interactive/active states, remove any remaining generic card-grid feel where it harms hierarchy.
- [ ] **Step 6: Run tests/typecheck and commit** `feat: deepen Oan archive presentation`.

### Task 9: Accessibility, Performance and Failure-State Hardening

**Files:**
- Modify: `app.mjs`
- Modify: `styles.css`
- Modify: `ring-scene.mjs`
- Modify: `tests/resilience.test.mjs`
- Modify: `tests/ring-scene.test.mjs`

**Interfaces:**
- All interactive controls remain keyboard reachable.
- Images use informative alt text from data; decorative imagery has empty alt/ARIA-hidden.
- Reduced motion affects reveals, scanning, ring motion, particles and timeline transitions.

- [ ] **Step 1: Extend resilience tests** for focus-visible styling, archive/timeline button semantics, reduced-motion selectors for new scanning/timeline/ring classes, and scroll-safe touch behavior.
- [ ] **Step 2: Add ring quality test** for low-width/high-DPR device capping pixel ratio and particle count.
- [ ] **Step 3: Implement missing accessibility/performance guards**: lazy secondary galleries, bounded DPR, cleanup listeners/animation frames on route exit, no hover-only information, CSS fallback on WebGL failure.
- [ ] **Step 4: Run `npm test`, `npm run typecheck`, and `npm run build`.** Expected: all green and no syntax/build errors.
- [ ] **Step 5: Commit** `fix: harden expanded archive experience`.

### Task 10: Production Verification and Vercel Deployment

**Files:**
- Modify only if verification reveals a root-cause defect; do not bundle opportunistic changes.

**Interfaces:**
- Production contract: Vercel READY; homepage and representative deep routes return HTTP 200.

- [ ] **Step 1: Fresh local verification:** run `npm test`, `npm run typecheck`, `npm run build`; record counts/results.
- [ ] **Step 2: Inspect `dist/`** and verify `ring-scene.mjs`, `timeline.mjs`, `vendor/three.module.min.js`, CSS/JS/data, sitemap and existing route support are emitted.
- [ ] **Step 3: Visual/runtime QA** at desktop and phone widths for `/`, `/lanterns`, `/lanterns/kyle-rayner`, `/timeline`, `/corps`; check normal and reduced-motion states, keyboard use, filter sheet, timeline selection and WebGL fallback path. If automated browser rendering is unavailable, explicitly record that limitation and use the strongest available static/runtime checks rather than claiming a visual pass.
- [ ] **Step 4: Commit any root-cause QA fixes through RED → GREEN** and rerun the complete suite/build.
- [ ] **Step 5: Push/deploy only after the user-selected integration method allows it.** Confirm Vercel deployment reaches `READY`.
- [ ] **Step 6: Fetch production URLs** for `/`, `/lanterns`, `/lanterns/kyle-rayner`, `/timeline`, `/corps`; expected HTTP 200 with correct SPA shell/assets.
- [ ] **Step 7: Check production runtime/build logs** for console-breaking/server errors and verify no regression to the prior `cleanUrls` conflict.
- [ ] **Step 8: Final report** lists implemented roster/artwork coverage, 3D/fallback behavior, test/build evidence, deployment URL/status, and any documented source/image limitations.

---

## Self-Review Notes

- **Spec coverage:** All requirements map to Tasks 1–10: research/data audit (2), art completeness (2/5), search/filtering (3/4), dossiers/relationships (5), real ring (1/6), timeline (2/7), homepage/Oa/villains (8), accessibility/performance (9), Vercel verification (10).
- **Interface consistency:** `archive` is the mode field; `status` carries semantic status keys; artwork is always an array after Task 2; timeline cross-links use event IDs and character/villain slugs.
- **Dependency choice:** Pin `three@0.186.1` (current npm release at planning time) and serve its browser module locally from the build output; no CDN runtime dependency.
- **YAGNI:** No React/Vite migration, CMS, Supabase database, custom 3D asset file format, or new backend is introduced.
- **Risk containment:** Ring and timeline complexity live in focused modules with pure-testable policies/helpers; existing routing and Vercel configuration remain intact.
