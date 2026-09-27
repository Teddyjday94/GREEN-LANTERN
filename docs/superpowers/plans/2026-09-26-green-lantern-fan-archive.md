# Green Lantern Fan Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, animation-rich Green Lantern fan archive with cinematic 3D scenes, a searchable Earth Lantern database, lore sections, timelines, source tracking, and responsive/accessibility fallbacks.

**Architecture:** React 19 + TypeScript + Vite 8 single-page application with React Router routes, typed local content modules, R3F/Three.js for isolated 3D scenes, and GSAP ScrollTrigger for scroll choreography. Content and source metadata stay independent of presentation so the archive can later move to Supabase without changing route contracts.

**Tech Stack:** React 19, TypeScript, Vite 8.x, React Router, Three.js, @react-three/fiber v9, @react-three/drei, GSAP + ScrollTrigger, Vitest, Testing Library, Playwright, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-26-green-lantern-fan-archive-design.md`

## Global Constraints
- Unofficial, noncommercial fan experience; never imply affiliation with DC or Warner Bros. Discovery.
- Keep researched claims traceable to source metadata; prefer official DC sources where available.
- Use local typed data in v1; no paid infrastructure or required database.
- Preserve native scrolling; no scroll-jacking.
- Respect `prefers-reduced-motion` and provide non-3D fallbacks.
- Lazy-load heavy 3D/media assets and reduce rendering complexity on small/mobile devices.
- Avoid generic numbered-card layouts, emojis, and AI-looking filler.
- Use externally sourced images selectively and store source/credit metadata.

## Review Focus
- WebGL unavailable or context lost: core content remains readable and navigable without a blank hero.
- Reduced-motion enabled: no forced camera flight, pinned scrub sequence, or motion-dependent information loss.
- Empty/no-match archive search: helpful empty state, preserved filters, no runtime errors.
- Mobile/touch input: Construct Lab works without hover and never traps page scroll.
- Missing/broken external artwork: layout retains aspect ratio, accessible alt text, credit/source link, and fallback treatment.

---

## File Structure

### App shell and routing
- `src/main.tsx` — application bootstrap.
- `src/app/App.tsx` — router + global providers.
- `src/app/routes.tsx` — route definitions and lazy route loading.
- `src/app/RouteErrorBoundary.tsx` — route-level error UI.
- `src/styles/tokens.css` — design tokens and spectrum variables.
- `src/styles/global.css` — reset, typography, global layout and accessibility states.

### Data and research
- `src/data/types.ts` — shared typed schema for Lanterns, events, villains, sources and artwork.
- `src/data/lanterns.ts` — Earth + selected cosmic Lantern records.
- `src/data/villains.ts` — villain records.
- `src/data/events.ts` — event/timeline records.
- `src/data/spectrum.ts` — Emotional Spectrum metadata.
- `src/data/sources.ts` — source registry keyed by stable IDs.
- `src/data/search.ts` — normalized search/filter helpers.

### Shared UI
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/components/ui/HardLightPanel.tsx`
- `src/components/ui/SourceLinks.tsx`
- `src/components/ui/Artwork.tsx`
- `src/components/ui/MotionGate.tsx`

### 3D and effects
- `src/components/three/SceneBoundary.tsx` — lazy WebGL boundary/fallback.
- `src/components/three/RingIntroScene.tsx`
- `src/components/three/OaScene.tsx`
- `src/components/three/SectorMapScene.tsx`
- `src/components/three/ConstructLabScene.tsx`
- `src/components/effects/Starfield.tsx`
- `src/components/effects/ScrollChoreography.tsx`

### Archive and routes
- `src/features/archive/ArchiveSearch.tsx`
- `src/features/archive/LanternCard.tsx`
- `src/features/archive/LanternDossier.tsx`
- `src/features/timeline/Timeline.tsx`
- `src/features/spectrum/SpectrumJourney.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/LanternArchivePage.tsx`
- `src/pages/LanternProfilePage.tsx`
- `src/pages/CorpsPage.tsx`
- `src/pages/UniversePage.tsx`
- `src/pages/SpectrumPage.tsx`
- `src/pages/TimelinePage.tsx`
- `src/pages/VillainsPage.tsx`
- `src/pages/ReadingPage.tsx`
- `src/pages/SourcesPage.tsx`

### Tests
- `src/data/__tests__/search.test.ts`
- `src/data/__tests__/integrity.test.ts`
- `src/features/archive/__tests__/ArchiveSearch.test.tsx`
- `src/components/ui/__tests__/MotionGate.test.tsx`
- `tests/e2e/home.spec.ts`
- `tests/e2e/archive.spec.ts`
- `tests/e2e/mobile.spec.ts`
- `tests/e2e/reduced-motion.spec.ts`

---

### Task 1: Foundation, routing and test harness

**Files:** create `package.json`, Vite/TS/ESLint/Vitest/Playwright configs, `src/main.tsx`, `src/app/App.tsx`, `src/app/routes.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, and one route smoke test.

**Interfaces:**
- Produces `App(): JSX.Element` and route paths `/`, `/lanterns`, `/lanterns/:slug`, `/corps`, `/universe`, `/spectrum`, `/timeline`, `/villains`, `/reading`, `/sources`.

- [ ] Write a failing routing smoke test asserting the home page and `/lanterns` route mount.
- [ ] Run the test and verify failure before app/bootstrap files exist.
- [ ] Scaffold React 19 + TypeScript on Vite 8.x; install Router, R3F v9, Drei, Three, GSAP, Vitest, Testing Library and Playwright.
- [ ] Implement lazy route definitions and global CSS/token foundation.
- [ ] Run unit tests, typecheck and production build; expect all to pass.
- [ ] Commit `chore: scaffold green lantern archive`.

### Task 2: Typed canon/research data layer

**Files:** create `src/data/types.ts`, `sources.ts`, `lanterns.ts`, `villains.ts`, `events.ts`, `spectrum.ts`, `src/data/__tests__/integrity.test.ts`.

**Interfaces:**
- Produces `LanternRecord`, `VillainRecord`, `EventRecord`, `SpectrumRecord`, `SourceRecord`, `ArtworkRef`.
- Produces exported arrays `lanterns`, `villains`, `events`, `spectrum`, and map `sourcesById`.

- [ ] Write failing integrity tests: unique slugs/IDs, every citation ID resolves, every external artwork item has alt text + source URL + credit text, required Earth Lantern slugs exist.
- [ ] Run tests and verify failure.
- [ ] Implement schemas and source registry; seed the approved Earth roster and initial villain/event/cosmic records with source IDs.
- [ ] Run integrity tests and typecheck; expect pass.
- [ ] Commit `feat: add sourced lantern lore data`.

### Task 3: Search and filtering engine

**Files:** create `src/data/search.ts`, `src/data/__tests__/search.test.ts`.

**Interfaces:**
- `normalizeSearchText(value: string): string`
- `searchLanterns(records: LanternRecord[], query: string, filters: LanternFilters): LanternRecord[]`
- `LanternFilters = { affiliations?: string[]; eras?: string[]; statuses?: string[] }`

- [ ] Write failing tests for name/alias/story/affiliation matching, case/diacritic normalization, combined filters, and zero results.
- [ ] Verify failures.
- [ ] Implement deterministic normalized search with no external search service.
- [ ] Run tests; expect pass.
- [ ] Commit `feat: add archive search engine`.

### Task 4: Core shell, artwork safety and motion preferences

**Files:** create layout/UI files listed above plus `MotionGate.test.tsx`.

**Interfaces:**
- `MotionGate({ animated, reduced }: { animated: ReactNode; reduced: ReactNode }): JSX.Element`
- `Artwork({ artwork, loading? }: { artwork: ArtworkRef; loading?: 'lazy' | 'eager' }): JSX.Element`
- `SourceLinks({ sourceIds }: { sourceIds: string[] }): JSX.Element`

- [ ] Write failing tests for reduced-motion branch, missing artwork fallback, and source link rendering.
- [ ] Implement semantic header/nav/footer, disclaimer, focus styles, artwork fallback and credit treatment.
- [ ] Run component tests + axe-friendly semantic smoke check; expect pass.
- [ ] Commit `feat: build accessible corps interface shell`.

### Task 5: Earth Lantern archive and dossier routes

**Files:** create archive feature files and `LanternArchivePage.tsx`, `LanternProfilePage.tsx`, `ArchiveSearch.test.tsx`.

**Interfaces:**
- `ArchiveSearch({ records }: { records: LanternRecord[] }): JSX.Element`
- `LanternDossier({ lantern }: { lantern: LanternRecord }): JSX.Element`

- [ ] Write failing tests for query/filter updates, no-results state, profile routing, and source display.
- [ ] Implement responsive searchable archive with non-generic asymmetric cards and deep dossier layout.
- [ ] Add route loader/lookup behavior for unknown slugs with friendly 404 state.
- [ ] Run tests and e2e archive navigation; expect pass.
- [ ] Commit `feat: add earth lantern archive dossiers`.

### Task 6: Cinematic home + ring intro

**Files:** create `HomePage.tsx`, `SceneBoundary.tsx`, `RingIntroScene.tsx`, `Starfield.tsx`, `ScrollChoreography.tsx`, home e2e test.

**Interfaces:**
- `SceneBoundary({ children, fallback }: PropsWithChildren<{ fallback: ReactNode }>): JSX.Element`
- `RingIntroScene({ progress }: { progress: number }): JSX.Element`
- `useHomeScrollProgress(): { intro: number; sector: number; oa: number }`

- [ ] Write failing e2e assertions for accessible hero copy, working “Enter Archive” navigation, and non-WebGL fallback.
- [ ] Implement ring/charge hero with original procedural geometry/materials; no dependence on copyrighted 3D assets.
- [ ] Add GSAP ScrollTrigger choreography while preserving native scroll; register/cleanup triggers correctly.
- [ ] Add lazy scene loading, DPR cap and viewport-aware rendering.
- [ ] Run desktop/mobile home e2e and production build; expect pass.
- [ ] Commit `feat: add cinematic ring intro`.

### Task 7: Oa, sector map and Corps pages

**Files:** create `OaScene.tsx`, `SectorMapScene.tsx`, `CorpsPage.tsx`, `UniversePage.tsx`.

**Interfaces:**
- `OaScene({ activeNode, onNodeSelect }: { activeNode?: string; onNodeSelect(id: string): void }): JSX.Element`
- `SectorMapScene({ selectedSector, onSectorSelect }: { selectedSector?: string; onSectorSelect(id: string): void }): JSX.Element`

- [ ] Write interaction tests/e2e for keyboard-accessible companion controls to 3D nodes and Sector 2814 selection.
- [ ] Implement stylized original Central Power Battery/Oa geometry and labeled HTML information controls.
- [ ] Implement sector visualization with Sector 2814 plus selected lore nodes; keep labels usable without 3D.
- [ ] Verify touch, keyboard, WebGL fallback and resize behavior.
- [ ] Commit `feat: add oa and sector exploration`.

### Task 8: Emotional Spectrum and timeline experiences

**Files:** create `SpectrumJourney.tsx`, `SpectrumPage.tsx`, `Timeline.tsx`, `TimelinePage.tsx`.

**Interfaces:**
- `SpectrumJourney({ records }: { records: SpectrumRecord[] }): JSX.Element`
- `Timeline({ events }: { events: EventRecord[] }): JSX.Element`

- [ ] Write tests for semantic spectrum order, black/white separate treatment, event chronology and event-to-source links.
- [ ] Implement CSS token transitions and particle/lighting hooks per spectrum record, with reduced-motion static panels.
- [ ] Implement cinematic timeline with year/era grouping and linked characters/readings.
- [ ] Run unit/e2e tests; expect pass.
- [ ] Commit `feat: add spectrum journey and event timeline`.

### Task 9: Construct Lab and villain/reading/source pages

**Files:** create `ConstructLabScene.tsx`, `VillainsPage.tsx`, `ReadingPage.tsx`, `SourcesPage.tsx`.

**Interfaces:**
- `ConstructLabScene({ reducedMotion }: { reducedMotion: boolean }): JSX.Element`
- Pointer/touch state machine: `idle -> drawing -> charging -> released -> dissolving`.

- [ ] Write tests for non-canvas control copy, touch-safe activation, Escape/reset, and source listing completeness.
- [ ] Implement Construct Lab with capped particles/geometry and no gesture that blocks normal page scroll.
- [ ] Implement villain, reading and source/credit pages from typed data.
- [ ] Run mobile and keyboard e2e; expect pass.
- [ ] Commit `feat: complete archive lore experiences`.

### Task 10: Performance, SEO, resilience and final visual QA

**Files:** modify app/pages/components/config as needed; create `public/robots.txt`, metadata helpers, final e2e suites.

**Interfaces:** no new public data contracts; harden existing ones.

- [ ] Add e2e tests for reduced motion, WebGL-disabled fallback, broken image fallback, unknown Lantern slug, and 360px mobile navigation.
- [ ] Add per-route titles/descriptions, Open Graph defaults, canonical strategy, robots/sitemap generation appropriate for an unofficial fan archive.
- [ ] Audit bundles and defer 3D chunks; ensure archive/content routes do not require Three.js before interaction.
- [ ] Verify image lazy loading, layout stability, keyboard traversal, focus visibility and color contrast.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, and full Playwright suite.
- [ ] Perform final browser visual review at desktop, tablet and phone widths; fix console/runtime errors and obvious jank.
- [ ] Commit `chore: harden green lantern fan archive for production`.

## Completion Gate
The implementation is complete only when tests/typecheck/build pass, the archive remains usable with WebGL and motion disabled, source/credit metadata is visible and traceable, mobile/touch navigation works, and the Vercel production build has no blocking console/runtime errors.
