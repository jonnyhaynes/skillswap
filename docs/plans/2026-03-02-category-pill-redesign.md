# Category Pill Redesign

**Date:** 2026-03-02
**Status:** Approved

## Problem

`SkillBadge` uses hardcoded Tailwind classes (`bg-pink-100`, `text-pink-700`, etc.) that are light-mode-only. This breaks dark theme on the Swap listing, Swap detail, and Skill detail pages. The rest of the app (`.ss-tag`, `Badge.tsx`, `.ss-category-card`) uses the CSS variable / design token system correctly.

## Approach

Match the `.ss-tag` visual language: monospace, uppercase, 2px border-radius, semi-transparent `rgba(hex, 0.14)` background, `hex` text, `rgba(hex, 0.22)` border — all derived from a single mid-saturation hex per category. This is inherently theme-agnostic since low-opacity tints work on both dark and light backgrounds.

## Visual Design

```
╔══════════════════════════════════════╗
║  🎨 ARTS & CRAFTS                    ║
╚══════════════════════════════════════╝
```

- Font: monospace, uppercase, `letter-spacing: 0.1em`
- Border-radius: 2px (sharp, matching `.ss-tag`)
- Background: `rgba(color, 0.14)`
- Text: `color` (full hex)
- Border: `1px solid rgba(color, 0.22)`

### Sizes

| Size | Font    | Padding          | Used on          |
|------|---------|------------------|------------------|
| sm   | 0.6rem  | 0.25rem 0.5rem   | Swap listing     |
| md   | 0.7rem  | 0.3rem 0.6rem    | Swap & Skill detail |

## Files to Change

### 1. `src/data/categories.ts`

Replace `bgColor: string`, `textColor: string`, `borderColor: string` with `color: string` (single mid-saturation hex).

Category hex values (mid-saturation, legible on both `#0C0B10` dark and `#F4EDE0` light backgrounds):

| Category      | Hex       |
|---------------|-----------|
| Arts & Crafts | `#C2609A` |
| Business      | `#6B7FA8` |
| Cooking       | `#D4722A` |
| DIY & Repairs | `#C49A2A` |
| Fitness       | `#C25050` |
| Gardening     | `#5A9E6A` |
| Languages     | `#4A9E6E` |
| Music         | `#8A60C2` |
| Photography   | `#7060C2` |
| Technology    | `#4A80C2` |
| Tutoring      | `#3A9EAE` |
| Other         | `#8A8A8A` |

### 2. `src/components/skills/SkillBadge.tsx`

Rewrite render logic:
- Remove Tailwind color classes (`info.bgColor`, `info.textColor`)
- Use inline `style` to build background/text/border from `info.color`
- Apply new class pattern matching `.ss-tag` (mono, uppercase, 2px radius)
- Keep `sm`/`md` size prop with updated values

## Non-Goals

- No changes to pages — all already use `<SkillBadge />`
- No changes to `.ss-tag`, `Badge.tsx`, or category card components
- No new CSS classes in `index.css`
