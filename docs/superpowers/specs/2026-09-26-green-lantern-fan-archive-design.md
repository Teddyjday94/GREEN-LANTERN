# Green Lantern Fan Archive — Design Specification

## Product goal
Create an unofficial, noncommercial Green Lantern fan experience that feels like entering the Green Lantern Corps archive on Oa: cinematic, 3D, scroll-driven, deeply researched, searchable, and usable on desktop and mobile.

## Experience
- Opening sequence: dark space, rotating power ring, ring-charge sequence, emerald flash, starfield acceleration, transition into a Corps archive interface.
- Homepage: continuous scroll journey from Earth / Sector 2814 through Earth Lanterns, Oa, Corps structure, Emotional Spectrum, villains, major events, and cosmic Lanterns.
- Dedicated routes: Earth Lantern archive, individual Lantern profiles, Corps & Oa, universe/sectors, Emotional Spectrum, timeline, villains, cosmic Lanterns, reading guide, and sources/credits.
- Visual language: deep black space, emerald hard-light, glass/holographic panels, volumetric glow, starfields, nebulae, subtle scan-lines, parallax and depth.
- Avoid generic numbered-card layouts, emojis, AI-looking filler, and excessive visual noise.

## Core content
Initial Earth Lantern deep-data set:
- Hal Jordan
- John Stewart
- Guy Gardner
- Kyle Rayner
- Simon Baz
- Jessica Cruz
- Sojourner “Jo” Mullein
- Alan Scott
- Jade / Jennie-Lynn Hayden
- Keli Quintela / Teen Lantern

Clearly distinguish Green Lantern Corps continuity, Golden Age/magical Green Lantern legacy, Teen Lantern, White Lantern, and other status/power-source differences.

Each dossier should support: real name, aliases, first appearance, creators, affiliations, Corps/ring status, sector, abilities, construct style where documented, major relationships, notable story arcs, timeline entries, recommended reading, gallery/source metadata, and citations.

Additional knowledge areas:
- Oa, Guardians, Central Power Battery, Corps organization and sectors.
- Emotional Spectrum: will, fear, rage, hope, love, avarice, compassion; black/white handled separately.
- Major villains: Sinestro, Parallax, Atrocitus, Black Hand, Nekron, Krona, Hector Hammond, plus expandable data model.
- Major events / reading timeline including Emerald Twilight, Rebirth, Sinestro Corps War, Blackest Night, Brightest Day, War of the Green Lanterns, Lights Out, Godhead, Far Sector, and later eras.
- Alien Lantern archive including Kilowog, Abin Sur, Tomar-Re, Salaak, Mogo, Ch’p, B’dg, Soranik Natu, and expandable entries.

## Interactivity
- Search and filtering over Lanterns and archive content.
- 3D Oa / Central Power Battery scene with selectable information nodes.
- Interactive universe / sector visualization highlighting Sector 2814 and selected notable sectors.
- Emotional Spectrum scroll sequence that alters lighting, particles, accent system and ambient effects per spectrum segment.
- Construct Lab: pointer/touch trail, press-and-hold charge, generated hard-light geometry, release/dissolve animation.
- Animated timeline with linked character/event context.

## Architecture
Use a React 19 + TypeScript + Vite 8 application. Use React Router for dedicated routes, local typed data modules for content, React Three Fiber v9 + Three.js for 3D, Drei for helpers, and GSAP + ScrollTrigger for scroll choreography. Keep data independent of the UI so it can later migrate to Supabase without redesigning routes/components.

No database is required for v1. Use static local data for speed, deployability, auditability, and search-engine-friendly content generation where possible.

## Performance and accessibility
- Lazy-load 3D scenes and heavyweight imagery.
- Cap device pixel ratio and reduce particles/geometry on small/mobile devices.
- Pause or reduce offscreen animation work.
- Respect prefers-reduced-motion with an intentional static/low-motion presentation.
- Maintain keyboard navigation, semantic headings, visible focus, readable contrast, alt text and non-3D fallbacks.
- Preserve native scrolling; do not introduce scroll-jacking.

## Image/copyright treatment
This is an unofficial fan project. Use web-sourced artwork selectively, favoring official promotional/press imagery and reliable sources, and record source/credit metadata for each external image. Do not present DC artwork as owned by the site. Include a clear footer disclaimer that Green Lantern/DC-related names, characters, logos and artwork belong to their respective rights holders and that the project is not affiliated with or endorsed by DC or Warner Bros. Discovery.

## Research quality
Prefer official DC sources for canon statements and publication information. Where primary sources are insufficient, use reputable secondary references and label continuity/current-status uncertainty rather than flattening conflicting eras into one “current” fact.

## Success criteria
- Feels cinematic and distinctly Green Lantern within the first 10 seconds.
- Searchable Earth Lantern archive is useful even with animations disabled.
- Desktop and mobile both remain fluid and readable.
- Every researched claim in character/event data has traceable source metadata.
- Site is deployable to Vercel without paid infrastructure.
