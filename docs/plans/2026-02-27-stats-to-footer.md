# Stats Section → Footer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the animated stats band from the homepage hero and render it at the top of the dark footer section so it appears on every page.

**Architecture:** Move `STATS_CONFIG`, `AnimatedStat`, and the stat icons from `HomePage.tsx` into `Footer.tsx`. Footer gains its own `useSkills()` call to source live data. The count-up animation is unchanged — it fires via IntersectionObserver when the footer scrolls into view. The stats row is inserted at the top of the `bg-slate-900` dark section, before the existing CTA/links, separated by a `border-b border-slate-800` rule.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, `useSkills` hook (Supabase), `useCountUp` hook (IntersectionObserver + rAF animation)

---

### Task 1: Remove stats from HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Step 1: Remove stat icons and config**

Delete lines 10–77 (the four icon components `TargetIcon`, `SearchIcon`, `ListIcon`, `GridIcon` and `STATS_CONFIG`).

> `SearchIcon` is also used by the hero search bar — keep it. Only delete `TargetIcon`, `ListIcon`, `GridIcon`, and `STATS_CONFIG`.

After deletion, `TargetIcon`, `ListIcon`, and `GridIcon` should no longer exist in the file. `SearchIcon` remains.

**Step 2: Remove AnimatedStat component**

Delete the entire `AnimatedStat` function (lines 79–99):

```tsx
// DELETE THIS ENTIRE BLOCK:
function AnimatedStat({ value, label, icon: Icon }: { value: number | string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const numericValue = typeof value === 'number' ? value : 0
  const isLoading = typeof value === 'string'
  const { count, ref, finished } = useCountUp(numericValue)

  return (
    <div ref={ref} className="hero-stat group flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl transition-all duration-300">
      {/* Icon */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.12] flex items-center justify-center shrink-0 ring-1 ring-white/[0.08] group-hover:bg-white/[0.18] transition-colors">
        <Icon className="w-5 h-5 text-white/90" />
      </div>
      {/* Text */}
      <div className="min-w-0">
        <div className={`text-2xl sm:text-3xl font-extrabold text-white font-display tabular-nums leading-none tracking-tight${finished ? ' stat-pop' : ''}`}>
          {isLoading ? '...' : count}
        </div>
        <div className="text-[11px] sm:text-xs text-white/60 font-medium mt-1 tracking-wide uppercase">{label}</div>
      </div>
    </div>
  )
}
```

**Step 3: Remove the stats rendering block from the hero**

Delete the stats block at the bottom of the hero (inside the `.hero-mesh` div), approximately lines 308–319:

```tsx
// DELETE THIS ENTIRE BLOCK:
{/* Stats — integrated into the banner */}
<div className="relative z-10 px-4 sm:px-8 pb-6 sm:pb-8 pt-4">
  <div className="mx-auto max-w-4xl">
    <div className="hero-stats-divider mb-6" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {STATS_CONFIG.map((stat) => (
        <AnimatedStat key={stat.label} value={statValues[stat.key]} label={stat.label} icon={stat.icon} />
      ))}
    </div>
  </div>
</div>
```

**Step 4: Remove stat-related state and imports from HomePage**

Remove:
- `import { useCountUp } from '@/hooks/useCountUp'` (line 6)
- The `statValues` object and `offeredCount`/`wantedCount` variables (lines 193–201):

```tsx
// DELETE THESE LINES:
const offeredCount = listings.filter((l) => l.listingType === 'offered').length
const wantedCount = listings.filter((l) => l.listingType === 'wanted').length

const statValues: Record<string, number | string> = {
  offered: loading ? '...' : offeredCount,
  wanted: loading ? '...' : wantedCount,
  total: loading ? '...' : listings.length,
  categories: 12,
}
```

Also remove the `loading` destructure from `useSkills()` if it's no longer used elsewhere in the file. Check — `loading` is only used in `statValues`, so update:
```tsx
// Before:
const { listings, loading } = useSkills()
// After:
const { listings } = useSkills()
```

**Step 5: Verify the page still compiles and renders**

Run: `npm run build`
Expected: No TypeScript errors. Hero renders without stats.

**Step 6: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: remove stats section from homepage hero"
```

---

### Task 2: Add stats to Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Step 1: Add imports**

Add these imports at the top of `Footer.tsx`:

```tsx
import { useSkills } from '@/hooks/useSkills'
import { useCountUp } from '@/hooks/useCountUp'
```

**Step 2: Add icon components**

Add these three small SVG icon components just above the `Footer` function (replacing the ones deleted from HomePage):

```tsx
function TargetIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M9 5h11M9 12h11M9 19h11M5 5h.01M5 12h.01M5 19h.01" />
    </svg>
  )
}

function GridIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
```

**Step 3: Add STATS_CONFIG constant**

Add after the icon components:

```tsx
const STATS_CONFIG = [
  { label: 'Skills Available', key: 'offered' as const, icon: TargetIcon },
  { label: 'Skills Wanted', key: 'wanted' as const, icon: SearchIcon },
  { label: 'Total Listings', key: 'total' as const, icon: ListIcon },
  { label: 'Categories', key: 'categories' as const, icon: GridIcon },
]
```

**Step 4: Add FooterStat component**

Add after `STATS_CONFIG`. This is a restyled version for the dark footer — no glass cards, just clean numbers and labels with a subtle divider layout:

```tsx
function FooterStat({
  value,
  label,
  icon: Icon,
  isLast,
}: {
  value: number | string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isLast: boolean
}) {
  const numericValue = typeof value === 'number' ? value : 0
  const isLoading = typeof value === 'string'
  const { count, ref, finished } = useCountUp(numericValue)

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-1.5 py-6 px-4 flex-1${!isLast ? ' border-r border-slate-800' : ''}`}
    >
      <Icon className="w-4 h-4 text-teal-500 mb-1" />
      <div
        className={`text-3xl sm:text-4xl font-extrabold text-white font-display tabular-nums leading-none tracking-tight${finished ? ' stat-pop' : ''}`}
      >
        {isLoading ? '—' : count}
      </div>
      <div className="text-[11px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">
        {label}
      </div>
    </div>
  )
}
```

**Step 5: Add useSkills data in the Footer function**

Inside the `Footer` component function body, add after `const { currentUser } = useAuth()`:

```tsx
const { listings, loading } = useSkills()
const offeredCount = listings.filter((l) => l.listingType === 'offered').length
const wantedCount = listings.filter((l) => l.listingType === 'wanted').length

const statValues: Record<string, number | string> = {
  offered: loading ? '...' : offeredCount,
  wanted: loading ? '...' : wantedCount,
  total: loading ? '...' : listings.length,
  categories: 12,
}
```

**Step 6: Add the stats band to the footer JSX**

Inside the `<div className="bg-slate-900 text-slate-300 relative overflow-hidden pb-16 md:pb-0">` element, add the stats band as the first child, before the `{/* CTA Banner */}` block:

```tsx
{/* Stats band */}
<div className="border-b border-slate-800">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex divide-x-0">
      {STATS_CONFIG.map((stat, index) => (
        <FooterStat
          key={stat.label}
          value={statValues[stat.key]}
          label={stat.label}
          icon={stat.icon}
          isLast={index === STATS_CONFIG.length - 1}
        />
      ))}
    </div>
  </div>
</div>
```

**Step 7: Verify build**

Run: `npm run build`
Expected: No TypeScript errors.

**Step 8: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: add live stats band to footer"
```

---

### Task 3: Clean up unused CSS

**Files:**
- Modify: `src/index.css`

**Step 1: Remove hero-stat CSS classes**

Find and delete the following blocks from `src/index.css`:

```css
/* DELETE: */
/* Hero stats integrated into banner */
.hero-stat {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hero-stat:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.14);
}

.hero-stats-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.15) 80%,
    transparent
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no unused CSS warnings.

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "chore: remove unused hero-stat CSS classes"
```

---

### Task 4: Visual QA

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Check home page**

Navigate to `/`. Verify:
- Hero banner no longer shows any stats row or divider line at the bottom
- Hero ends cleanly with the CTA buttons
- Page scrolls down to "How it Works" and "Latest Skills" sections

**Step 3: Check the footer on the home page**

Scroll to the bottom. Verify:
- After the wave SVG, the dark footer section opens with a row of 4 stat numbers
- Each stat has: teal icon, large white number, small uppercase label
- Vertical dividers separate each stat (except the last)
- Numbers animate up from 0 when the footer first enters the viewport
- Below the stats band: CTA (for logged-out users) or links (for logged-in users)

**Step 4: Check the footer on another page**

Navigate to `/browse`. Scroll to the bottom. Verify:
- Stats band appears identically in the footer
- Numbers animate again if you hard-refresh (IntersectionObserver per page load)

**Step 5: Check responsive layout**

Resize browser to mobile width (375px). Verify:
- All 4 stats fit in a single row (they're `flex-1` so they share space)
- Numbers are legible and not truncated
- If too cramped on mobile, consider a 2×2 grid — update `FooterStat` parent to `grid grid-cols-2 sm:grid-cols-4` and remove the border-right divider logic, replacing with `divide-y divide-x divide-slate-800` on the grid

**Step 6: Final commit (if any responsive fixes were needed)**

```bash
git add src/components/layout/Footer.tsx
git commit -m "fix: improve footer stats responsive layout"
```
