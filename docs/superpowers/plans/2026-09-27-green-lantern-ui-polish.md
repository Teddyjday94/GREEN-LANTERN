# Green Lantern UI / Oa Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and TDD task-by-task.

**Goal:** Add organized UI hierarchy, a clickable glowing ring face, a Central Power Battery built around a central emerald light, and a nine-Corps symbol system without regressing the existing archive.

**Architecture:** Keep the current SPA and expansion layer. Add `corps-symbols.mjs`, `polish-ui.mjs`, `polish.mjs` and `polish.css`; update `ring-scene.mjs` for hit-tested activation; wire new assets into `index.html`, the build copy list and `typecheck`.

**Spec:** `docs/superpowers/specs/2026-09-27-green-lantern-ui-polish-design.md`

## Tasks
1. RED/GREEN test Corps registry, Central Battery markup and spectrum rail.
2. RED/GREEN test ring click profile and reduced-motion behavior.
3. RED/GREEN test index/build/typecheck wiring and polish runtime selectors.
4. Add organized layout polish, Central Battery replacement, spectrum controls and Green Lantern mark.
5. Add Three.js raycast activation, emissive pulse/ripple and keyboard activation to the ring face.
6. Run focused tests and syntax checks; deploy feature branch to Vercel preview.
7. Verify representative routes and production merge only after branch review/integration choice.
