# Design: Move Stats Section to Footer

**Date:** 2026-02-27
**Status:** Approved

## Summary

Remove the animated stats band from the homepage hero and relocate it to the top of the footer's dark section, so it appears on every page of the app.

## Context

The stats section currently lives embedded inside the `.hero-mesh` hero banner on `HomePage.tsx`. It shows 4 count-up animated stats (Skills Available, Skills Wanted, Total Listings, Categories) sourced from `useSkills()`. The user wants this to appear globally — not just on the home page.

## Design Decision

**Placement:** Inside `Footer.tsx`, at the top of the `bg-slate-900` dark section, immediately after the wave SVG divider and before the existing CTA/links content.

**Rationale:** The footer renders on every page via `RootLayout`. Adding stats here requires no new layout layers and keeps all footer-related content self-contained.

## Visual Treatment

- Horizontal row of 4 stats, each with a large bold number and a small label
- Numbers in `text-teal-400` (brand green `#43c1a6`) — consistent with brand identity
- Labels in `slate-500`, uppercase, small tracking
- Stats separated by subtle vertical dividers (`border-slate-800`)
- Row sits in its own padded band with a `border-b border-slate-800` below it
- Count-up animation retained — triggers on IntersectionObserver when footer enters viewport

## Files Changed

| File | Change |
|------|--------|
| `src/pages/HomePage.tsx` | Remove stats block (lines 308–319), `STATS_CONFIG`, `AnimatedStat`, `TargetIcon`, `ListIcon`, `GridIcon`, `useCountUp` import |
| `src/components/layout/Footer.tsx` | Add stats row with `useSkills()`, `useCountUp`, `AnimatedStat` component |
| `src/index.css` | Remove `.hero-stat`, `.hero-stat:hover`, `.hero-stats-divider` classes |

## Data Flow

`Footer.tsx` gains its own `useSkills()` call. Since `HomePage` no longer needs stats, there is no duplicate fetching. The stats hook runs on every page render as part of the global layout.

## Out of Scope

- No changes to the count-up animation logic (`useCountUp.ts`)
- No changes to `RootLayout.tsx`
- No changes to stat values or labels
