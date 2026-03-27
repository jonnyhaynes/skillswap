# Category Pill Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the theme-broken `SkillBadge` component with one that matches the app's `.ss-tag` design language — monospace, uppercase, 2px radius, semi-transparent coloured background — using a single hex value per category.

**Architecture:** Replace three Tailwind class fields (`bgColor`, `textColor`, `borderColor`) and the unused `barColor` field on `CategoryInfo` with a single `color: string` (hex). Rewrite `SkillBadge` to derive `background`, `color`, and `border` via inline styles using `rgba()`. Migrate the three call-sites in `ReviewCard` and `ProfilePage` that apply `bgColor`/`textColor` directly to a `Badge` over to `<SkillBadge />` instead.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite

---

### Task 1: Update `categories.ts` — swap colour fields for a single hex

**Files:**
- Modify: `src/data/categories.ts`

**Step 1: Replace the `CategoryInfo` interface fields**

In `src/data/categories.ts`, replace lines 7–10:

```ts
// BEFORE
  bgColor: string;
  textColor: string;
  borderColor: string;
  barColor: string;
```

with:

```ts
// AFTER
  color: string;
```

**Step 2: Replace all 12 category entries**

Replace the entire `CATEGORIES` array with the following. Hex values are mid-saturation so they read legibly as text on both the dark background (`#0C0B10`) and the light background (`#F4EDE0`).

```ts
export const CATEGORIES: CategoryInfo[] = [
  { id: 'arts-crafts',  label: 'Arts & Crafts', emoji: '\u{1F3A8}', color: '#C2609A' },
  { id: 'business',     label: 'Business',       emoji: '\u{1F4BC}', color: '#6B7FA8' },
  { id: 'cooking',      label: 'Cooking',         emoji: '\u{1F373}', color: '#D4722A' },
  { id: 'diy-repairs',  label: 'DIY & Repairs',   emoji: '\u{1F527}', color: '#C49A2A' },
  { id: 'fitness',      label: 'Fitness',          emoji: '\u{1F4AA}', color: '#C25050' },
  { id: 'gardening',    label: 'Gardening',        emoji: '\u{1F331}', color: '#5A9E6A' },
  { id: 'languages',    label: 'Languages',        emoji: '\u{1F30D}', color: '#4A9E6E' },
  { id: 'music',        label: 'Music',            emoji: '\u{1F3B5}', color: '#8A60C2' },
  { id: 'photography',  label: 'Photography',      emoji: '\u{1F4F7}', color: '#7060C2' },
  { id: 'technology',   label: 'Technology',       emoji: '\u{1F4BB}', color: '#4A80C2' },
  { id: 'tutoring',     label: 'Tutoring',         emoji: '\u{1F4DA}', color: '#3A9EAE' },
  { id: 'other',        label: 'Other',            emoji: '\u{2728}',  color: '#8A8A8A' },
];
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: errors only from the files that still reference `bgColor`/`textColor` (we'll fix those in subsequent tasks). There should be no errors in `categories.ts` itself.

**Step 4: Commit**

```bash
git add src/data/categories.ts
git commit -m "refactor: replace per-category Tailwind colour classes with single hex value"
```

---

### Task 2: Rewrite `SkillBadge` — new `.ss-tag`-style appearance

**Files:**
- Modify: `src/components/skills/SkillBadge.tsx`

**Step 1: Helper function to build inline styles from a hex colour**

The pattern used by `.ss-tag` in `index.css`:
- background: `rgba(r, g, b, 0.14)`
- color: the full hex
- border: `1px solid rgba(r, g, b, 0.22)`

Write a small helper to convert `#RRGGBB` → `rgba(r, g, b, alpha)`:

```ts
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
```

**Step 2: Replace the entire file content**

```tsx
import type { SkillCategory } from '@/types';
import { getCategoryInfo } from '@/data/categories';

interface SkillBadgeProps {
  category: SkillCategory;
  size?: 'sm' | 'md';
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function SkillBadge({ category, size = 'sm' }: SkillBadgeProps) {
  const info = getCategoryInfo(category);
  const sizeClass = size === 'md'
    ? 'text-[0.7rem] px-[0.6rem] py-[0.3rem]'
    : 'text-[0.6rem] px-[0.5rem] py-[0.25rem]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tracking-[0.1em] uppercase rounded-[2px] shrink-0 ${sizeClass}`}
      style={{
        background: hexToRgba(info.color, 0.14),
        color: info.color,
        border: `1px solid ${hexToRgba(info.color, 0.22)}`,
      }}
    >
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
}
```

Note: `cn` import removed — no longer needed.

**Step 3: Verify TypeScript compiles (this file)**

Run: `npx tsc --noEmit 2>&1 | grep SkillBadge`

Expected: no output (no errors in this file).

**Step 4: Commit**

```bash
git add src/components/skills/SkillBadge.tsx
git commit -m "feat: redesign SkillBadge to match ss-tag style — theme-aware hex colours"
```

---

### Task 3: Migrate `ReviewCard` from `Badge` to `SkillBadge`

**Files:**
- Modify: `src/components/reviews/ReviewCard.tsx`

**Context:** Line 44 currently renders:
```tsx
<Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
  {categoryInfo.emoji} {categoryInfo.label}
</Badge>
```

This needs to become a `<SkillBadge />`.

**Step 1: Check existing imports at the top of the file**

Read the import block (lines 1–10). It will include an import for `getCategoryInfo` and likely for `Badge`.

**Step 2: Replace the import block**

Remove the `Badge` import (it's no longer needed in this file for the category display).
Add an import for `SkillBadge`:

```ts
import { SkillBadge } from '@/components/skills/SkillBadge';
```

**Step 3: Replace the Badge usage (line 44)**

```tsx
// BEFORE
<Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
  {categoryInfo.emoji} {categoryInfo.label}
</Badge>

// AFTER
<SkillBadge category={review.skillCategory} size="sm" />
```

Note: `categoryInfo` may now be unused in this file. Remove the `const categoryInfo = getCategoryInfo(...)` line and the `getCategoryInfo` import if they're no longer needed anywhere else in the file.

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep ReviewCard`

Expected: no output.

**Step 5: Commit**

```bash
git add src/components/reviews/ReviewCard.tsx
git commit -m "refactor: use SkillBadge in ReviewCard instead of raw Badge with colour classes"
```

---

### Task 4: Migrate `ProfilePage` from `Badge` to `SkillBadge`

**Files:**
- Modify: `src/pages/ProfilePage.tsx`

**Context:** Lines 103 and 130 both render:
```tsx
<Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
  {categoryInfo.emoji} {categoryInfo.label}
</Badge>
```

**Step 1: Add `SkillBadge` import**

Add to the import block near the other component imports:

```ts
import { SkillBadge } from '@/components/skills/SkillBadge';
```

**Step 2: Replace both `Badge` usages**

For each occurrence (lines ~103 and ~130):

```tsx
// BEFORE
const categoryInfo = getCategoryInfo(listing.category)
// ...
<Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
  {categoryInfo.emoji} {categoryInfo.label}
</Badge>

// AFTER
<SkillBadge category={listing.category} size="sm" />
```

Remove the `const categoryInfo = getCategoryInfo(listing.category)` line from each `map` callback since it's no longer needed.

**Step 3: Check if `getCategoryInfo` and `Badge` are still used elsewhere in this file**

If neither is used anywhere else after the changes, remove those imports.

**Step 4: Verify TypeScript compiles clean**

Run: `npx tsc --noEmit`

Expected: no errors at all.

**Step 5: Commit**

```bash
git add src/pages/ProfilePage.tsx
git commit -m "refactor: use SkillBadge in ProfilePage instead of raw Badge with colour classes"
```

---

### Task 5: Visual verification

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Check dark theme (default)**

Open the app in a browser. Navigate to:
- `/swaps` — Swap listing cards should show category pills in the new style
- `/swaps/<any-id>` — Swap detail page; both offered/requested skill sections
- `/skills/<any-id>` — Skill detail page; category pill next to offering/seeking tag
- Any profile page — Skills Offered / Skills Wanted lists in sidebar

Verify each pill shows: correct emoji + uppercase label, coloured text, semi-transparent tinted background, thin coloured border, no rounded-full shape.

**Step 3: Switch to light theme**

Toggle to light mode. Verify all category pills remain legible — coloured text on light background, no washed-out or invisible labels.

**Step 4: Commit if any tweaks were needed**

If hex values needed adjustment for contrast, commit those changes:

```bash
git add src/data/categories.ts
git commit -m "fix: adjust category hex colours for light theme contrast"
```
