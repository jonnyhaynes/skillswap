# Google Analytics 4 — Design

**Date:** 2026-02-20
**Measurement ID:** `G-1C6673LV7H`

## Overview

Add GA4 page view tracking to SkillSwap. Because it's a React SPA, GA's automatic page view detection doesn't capture route changes — so we manage page view events manually, firing on every React Router navigation.

## Approach

Mirrors the existing Bugsnag pattern: a thin `src/lib/analytics.ts` helper, initialised via a script tag in `index.html`, with page view tracking triggered from `RootLayout`.

## Changes

### 1. `index.html`
Add two `<script>` tags in `<head>`:
- Async loader: `https://www.googletagmanager.com/gtag/js?id=G-1C6673LV7H`
- Inline init: calls `gtag('js', new Date())` and `gtag('config', ..., { send_page_view: false })`

`send_page_view: false` disables GA's default page view so we control it manually.

### 2. `src/lib/analytics.ts`
- Reads `VITE_GA_MEASUREMENT_ID` from `import.meta.env`
- Exports `trackPageView(path: string)` — calls `window.gtag('event', 'page_view', { page_path: path })`
- No-op guard when env var is absent (safe in dev/test without the var set)
- `declare global` block for `window.gtag` TypeScript typing

### 3. `src/components/layout/RootLayout.tsx`
- Add `useEffect` watching `pathname` (already available via `useLocation`)
- Calls `trackPageView(pathname)` on each route change

### 4. Environment variables
- Add `VITE_GA_MEASUREMENT_ID=G-1C6673LV7H` to `.env.local`
- Add `VITE_GA_MEASUREMENT_ID=` (blank) to `.env.example`

## Out of scope
- Custom event tracking (clicks, form submissions, etc.) — can be added later via `trackPageView`'s sibling exports
- GA4 goals/conversions configuration — done in the GA dashboard
