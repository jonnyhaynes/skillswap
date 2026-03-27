# Design: Footer Redesign

**Date:** 2026-02-27
**Status:** Approved

## Summary

Redesign `Footer.tsx` to use a balanced 4-column grid, move stats into a "Community" column with subtle treatment, remove the full-width CTA banner in favour of an inline CTA in the brand column, and remove icon components no longer needed after the stat band is eliminated.

## Layout

True 4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), replacing the current lopsided layout where Brand spans 2 columns:

| Col 1: Brand | Col 2: Explore | Col 3: Legal | Col 4: Community |
|---|---|---|---|
| Logo + tagline | Browse Skills | Terms of Service | 11 Skills Available |
| Social icons | Post a Skill | Privacy Policy | 8 Skills Wanted |
| "Get started →" (logged-out only) | | Contact Us | 19 Total Listings |
| | | | 12 Categories |

## Stats ("Community" column)

- Column heading: `"Community"` — same style as `"Explore"` / `"Legal"` (`text-sm font-semibold text-white mb-3`)
- Each stat: stacked pair — number in `text-xl font-bold text-white font-display tabular-nums`, label in `text-xs text-slate-400`
- No icons (removed — too much emphasis at this scale)
- Count-up animation retained via `useCountUp` — fires on IntersectionObserver, subtle at small size
- Loading state: `—` dash

## CTA

- Remove the full-width CTA banner block entirely
- For logged-out users: a small `"Get started →"` link in the brand column, below social icons, styled as `text-sm font-semibold text-teal-400 hover:text-teal-300`

## Removed

- `FooterStat` component (replaced by inline `CommunityStat`)
- `TargetIcon`, `SearchIcon`, `ListIcon`, `GridIcon` icon components (no longer needed)
- `STATS_CONFIG` with `icon` property (replaced with icon-free config)
- Full-width stats band JSX
- Full-width CTA banner JSX

## Kept

- Wave SVG divider at top
- Topographic pattern overlay
- Social icons (Bluesky, Facebook, Instagram, LinkedIn)
- Copyright bar
- `useSkills` + `useCountUp` hooks
- `stat-pop` CSS animation class

## Files Changed

| File | Change |
|------|--------|
| `src/components/layout/Footer.tsx` | Full rewrite of structure, components, and JSX |
