# Google Analytics 4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GA4 page view tracking to SkillSwap, firing on every React Router navigation.

**Architecture:** A `gtag.js` script tag in `index.html` initialises GA4 with auto page views disabled. A thin `src/lib/analytics.ts` helper (matching the Bugsnag pattern) exports `trackPageView`. `RootLayout` calls it on every `pathname` change via `useEffect`.

**Tech Stack:** Google Analytics 4 (`gtag.js`), React Router v7, TypeScript, Vite env vars

---

### Task 1: Add gtag script tags to `index.html`

**Files:**
- Modify: `index.html`

**Step 1: Add the GA4 script tags**

In `index.html`, add these two `<script>` tags inside `<head>`, after the existing `<script src="https://challenges.cloudflare.com/turnstile/...">` tag:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1C6673LV7H"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-1C6673LV7H', { send_page_view: false });
</script>
```

`send_page_view: false` disables GA's default page view event — we'll fire it manually on route changes so SPA navigation is tracked correctly.

**Step 2: Verify the script loads in the browser**

Start the dev server (`npm run dev`) and open the browser devtools Network tab. Filter by `gtag`. You should see a request to `googletagmanager.com/gtag/js`. Also check the Console — no errors expected.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add gtag.js script to index.html for GA4"
```

---

### Task 2: Create `src/lib/analytics.ts`

**Files:**
- Create: `src/lib/analytics.ts`

**Step 1: Create the file**

```typescript
// Extend the Window interface so TypeScript knows about gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

/**
 * Track a page view. No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackPageView(path: string): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    send_to: measurementId,
  })
}
```

**Step 2: Verify TypeScript is happy**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

**Step 3: Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat: add analytics.ts helper with trackPageView"
```

---

### Task 3: Wire page view tracking into `RootLayout`

**Files:**
- Modify: `src/components/layout/RootLayout.tsx`

**Step 1: Add the import and useEffect**

In `RootLayout.tsx`:

1. Add `useEffect` to the React Router imports line:
```typescript
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
```
becomes:
```typescript
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
```

2. Add the `trackPageView` import after the existing imports:
```typescript
import { trackPageView } from '@/lib/analytics'
```

3. Inside the `RootLayout` function body, after the `const { pathname }` line, add:
```typescript
useEffect(() => {
  trackPageView(pathname)
}, [pathname])
```

The full updated function top should look like:
```typescript
export function RootLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return (
    // ... rest unchanged
  )
}
```

**Step 2: Verify in dev**

Start dev server and navigate between pages (e.g. Home → Browse → a profile). In the browser devtools Network tab, filter by `collect` — you should see a POST to `google-analytics.com/g/collect` for each navigation.

**Step 3: Commit**

```bash
git add src/components/layout/RootLayout.tsx
git commit -m "feat: fire GA4 page_view on every route change"
```

---

### Task 4: Add env vars

**Files:**
- Modify: `.env.local`
- Modify: `.env.example`

**Step 1: Add to `.env.local`**

Append to the end of `.env.local`:
```
# Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-1C6673LV7H
```

**Step 2: Add placeholder to `.env.example`**

Append to the end of `.env.example`:
```
# Google Analytics 4
VITE_GA_MEASUREMENT_ID=your-ga4-measurement-id
```

**Step 3: Verify tracking fires in dev**

Restart the dev server (env vars require a restart). Navigate a few pages. Check Network tab — `google-analytics.com/g/collect` requests should appear.

Alternatively, install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension and verify events appear in the GA4 DebugView at `https://analytics.google.com` → Admin → DebugView.

**Step 4: Commit**

```bash
git add .env.example
git commit -m "feat: add VITE_GA_MEASUREMENT_ID env var"
```

Note: `.env.local` is gitignored — do not commit it.
