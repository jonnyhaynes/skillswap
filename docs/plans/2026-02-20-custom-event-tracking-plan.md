# Custom Event Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three GA4 custom events — `sign_up`, `swap_requested`, and `search` — to track the most important user actions in SkillSwap.

**Architecture:** Three typed helper functions are added to `src/lib/analytics.ts` alongside the existing `trackPageView`. Each call site imports and calls its helper at the exact moment of success. The search event uses the existing `debouncedQuery` state and only fires for queries of 3+ characters.

**Tech Stack:** Google Analytics 4 (`gtag`), React 19, TypeScript, Vite

---

### Task 1: Add `trackSignUp`, `trackSwapRequested`, and `trackSearch` to `analytics.ts`

**Files:**
- Modify: `src/lib/analytics.ts`

**Step 1: Add the three helpers**

The current file ends after `trackPageView`. Append these three functions:

```typescript
/**
 * Track a successful sign-up. Uses GA4's recommended 'sign_up' event.
 * No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackSignUp(): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'sign_up', {
    send_to: measurementId,
  })
}

/**
 * Track a successful swap proposal submission.
 * No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackSwapRequested(): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'swap_requested', {
    send_to: measurementId,
  })
}

/**
 * Track a search query. Uses GA4's recommended 'search' event.
 * Only call this when query.length >= 3.
 * No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackSearch(query: string): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'search', {
    search_term: query,
    send_to: measurementId,
  })
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

**Step 3: Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat: add trackSignUp, trackSwapRequested, trackSearch helpers"
```

---

### Task 2: Fire `trackSignUp` in `SignUpForm`

**Files:**
- Modify: `src/components/auth/SignUpForm.tsx`

**Step 1: Add the import**

At the top of `SignUpForm.tsx`, the existing imports end around line 8. Add this import after the existing imports:

```typescript
import { trackSignUp } from '@/lib/analytics'
```

**Step 2: Call `trackSignUp` on successful registration**

Find this block (around line 100):

```typescript
    if (!result.error) {
      setShowConfirmation(true)
      onSuccess?.()
    }
```

Change it to:

```typescript
    if (!result.error) {
      trackSignUp()
      setShowConfirmation(true)
      onSuccess?.()
    }
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

**Step 4: Commit**

```bash
git add src/components/auth/SignUpForm.tsx
git commit -m "feat: track sign_up event on successful registration"
```

---

### Task 3: Fire `trackSwapRequested` in `SkillDetailPage`

**Files:**
- Modify: `src/pages/SkillDetailPage.tsx`

**Step 1: Add the import**

At the top of `SkillDetailPage.tsx`, add after the existing imports:

```typescript
import { trackSwapRequested } from '@/lib/analytics'
```

**Step 2: Call `trackSwapRequested` on successful proposal**

Find this block in `handleSwapSubmit` (around line 81):

```typescript
    if (proposal) {
      addToast('Swap proposal sent successfully!', 'success');
      setShowSwapModal(false);
    } else {
```

Change it to:

```typescript
    if (proposal) {
      trackSwapRequested()
      addToast('Swap proposal sent successfully!', 'success');
      setShowSwapModal(false);
    } else {
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

**Step 4: Commit**

```bash
git add src/pages/SkillDetailPage.tsx
git commit -m "feat: track swap_requested event on successful proposal"
```

---

### Task 4: Fire `trackSearch` in `BrowseSkillsPage`

**Files:**
- Modify: `src/pages/BrowseSkillsPage.tsx`

**Step 1: Add the import**

At the top of `BrowseSkillsPage.tsx`, add `trackSearch` to the analytics import (or add a new import line after the existing imports):

```typescript
import { trackSearch } from '@/lib/analytics'
```

**Step 2: Add the `useEffect` for search tracking**

`BrowseSkillsPage` already has several `useEffect` blocks. Add this one after the existing `useEffect` that resets `visibleCount` (around line 42):

```typescript
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      trackSearch(debouncedQuery)
    }
  }, [debouncedQuery])
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

**Step 4: Commit**

```bash
git add src/pages/BrowseSkillsPage.tsx
git commit -m "feat: track search event for queries of 3+ characters"
```
