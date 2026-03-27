# Hero Background Noise Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hero section's invasive "SWAP" ghost watermark and orb cluster with a noise texture + single amber gradient wash.

**Architecture:** Pure JSX change to the `Hero` component in `HomePage.tsx`. Remove two decorative element groups, add two new absolutely-positioned `aria-hidden` divs (noise layer + gradient layer). No new CSS classes — inline styles only, matching the existing pattern.

**Tech Stack:** React, Tailwind CSS 4, inline SVG data URI for noise

---

### Task 1: Remove SWAP watermark and orbs, add noise + gradient layers

**Files:**
- Modify: `src/pages/HomePage.tsx` (Hero component, lines ~203–228)

**Step 1: Remove the ghost watermark div**

In the `Hero` component, delete this block entirely (the `{/* Ghost watermark */}` comment and its `<div>`):

```tsx
{/* Ghost watermark */}
<div
  aria-hidden="true"
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-transparent whitespace-nowrap pointer-events-none select-none leading-none tracking-[-0.05em] z-0"
  style={{
    fontSize: 'clamp(14rem, 28vw, 28rem)',
    WebkitTextStroke: '1px var(--border-med)',
    transition: '-webkit-text-stroke-color 0.35s',
  }}
>
  SWAP
</div>
```

**Step 2: Remove the orbs block**

Delete this block entirely (the `{/* Orbs */}` comment and its `.map()`):

```tsx
{/* Orbs */}
{[
  { cls: '-top-20 -right-20',                       style: { width: 500, height: 500, background: 'radial-gradient(circle, var(--orb-amber) 0%, transparent 70%)' } },
  { cls: 'bottom-10 -left-[120px]',                 style: { width: 400, height: 400, background: 'radial-gradient(circle, var(--orb-sage) 0%, transparent 70%)' } },
  { cls: 'top-[40%] left-1/2 -translate-x-1/2',    style: { width: 260, height: 260, background: 'radial-gradient(circle, var(--orb-rose) 0%, transparent 70%)' } },
].map((orb, i) => (
  <div
    key={i}
    aria-hidden="true"
    className={`absolute rounded-full blur-[70px] pointer-events-none z-0 ${orb.cls}`}
    style={orb.style}
  />
))}
```

**Step 3: Add noise layer and gradient wash in their place**

Insert the following two divs where the removed blocks were (before the `{/* Hero content */}` comment):

```tsx
{/* Noise layer */}
<div
  aria-hidden="true"
  className="absolute inset-0 pointer-events-none z-0"
  style={{
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
    opacity: 0.9,
  }}
/>

{/* Gradient wash */}
<div
  aria-hidden="true"
  className="absolute inset-0 pointer-events-none z-0"
  style={{
    background: 'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(232, 150, 10, 0.10) 0%, transparent 70%)',
  }}
/>
```

**Step 4: Verify visually**

Start the dev server:
```bash
npm run dev
```

Open http://localhost:5173. Check:
- No "SWAP" text visible in hero background
- No blurred orb blobs
- Subtle grain texture visible across the hero
- Warm amber tint in the top-right corner, fading to transparent
- Both light and dark theme look correct (toggle with the theme switcher)
- Hero content (headline, search, CTAs, stats bar) is unaffected

**Step 5: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: replace hero SWAP watermark and orbs with noise + gradient wash"
```
