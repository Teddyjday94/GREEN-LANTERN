# Green Lantern UI / Oa Polish — Design Specification

**Status:** Approved by user on 2026-09-27.

## Goal
Improve organization and visual hierarchy without rewriting the working archive. Add a tactile ring-face charge interaction, rebuild the Oa Central Power Battery around a luminous core, and introduce recognizable Corps/emotional-spectrum symbols as navigation and visual identity.

## Visual direction
- Keep the existing dark Oan tactical interface, but make spacing, panels, headings, archive grids, dossier sections and timeline surfaces more consistent.
- Remove intentional card staggering where it makes the archive feel less organized.
- Use green light primarily to show active/interactive elements.
- Preserve the existing cinematic starfield, research-heavy content and responsive behavior.

## Power ring interaction
- The WebGL ring face is keyboard and pointer activatable.
- Clicking the front emblem/core triggers a strong emerald emissive pulse, a short concentric ripple and a brief front-facing light burst.
- The effect does not prevent touch scrolling.
- Reduced-motion keeps a short visible light response without particle emphasis or long ripple animation.

## Central Power Battery
- Replace the generic Oa planet/core placeholder in `.oa-scene` with a lantern-shaped Central Power Battery composition.
- The design uses official DC lore/reference as inspiration: a massive Oan battery in Sector 0 whose central energy illuminates Oa and powers the Corps.
- The visual is built around a bright circular core, metallic green shell, overhead handle, plinth, floor rings and central light column.
- Existing Oa information-node buttons remain intact and above the battery art.

## Corps symbol system
Show a nine-mark visual spectrum: Green/Willpower, Yellow/Fear, Red/Rage, Blue/Hope, Orange/Avarice, Indigo/Compassion, Violet/Love, Black/Death and White/Life. Marks are original simplified inline SVG interpretations for this fan archive and are not bundled external image files.

The Green Lantern mark also appears as a recurring UI accent and in the Central Power Battery core.

## Accessibility / performance
- Keyboard activation for the ring.
- Corps controls are real buttons with labels.
- `prefers-reduced-motion` reduces new animations.
- Ring canvas uses `touch-action: pan-y` and no preventDefault on touch/pointer input.
- New work remains additive (`polish.mjs`/`polish.css`) so existing routes and archive rendering remain stable.
