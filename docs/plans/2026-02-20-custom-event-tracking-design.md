# Custom Event Tracking — Design

**Date:** 2026-02-20

## Overview

Add three custom GA4 events to track the most important user actions in SkillSwap: sign-ups, swap requests, and searches.

## Events

| Event name | GA4 type | Where fired | Condition |
|---|---|---|---|
| `sign_up` | GA4 recommended | `SignUpForm` | On successful registration (no error) |
| `swap_requested` | Custom | `SkillDetailPage` | On successful proposal submission |
| `search` | GA4 recommended | `BrowseSkillsPage` | On debounced query ≥ 3 characters |

## Changes

### 1. `src/lib/analytics.ts`
Add three new exported helpers alongside `trackPageView`. All share the same guard (`!measurementId || typeof window.gtag !== 'function'`):

- `trackSignUp()` — fires `sign_up` (GA4 recommended event, no params needed)
- `trackSwapRequested()` — fires `swap_requested` (custom event, no params needed)
- `trackSearch(query: string)` — fires `search` with `{ search_term: query }` (GA4 recommended event params)

### 2. `src/components/auth/SignUpForm.tsx`
Import `trackSignUp`. In the `if (!result.error)` block, call `trackSignUp()` before `setShowConfirmation(true)`.

### 3. `src/pages/SkillDetailPage.tsx`
Import `trackSwapRequested`. In `handleSwapSubmit`, when `proposal` is truthy, call `trackSwapRequested()` before `addToast(...)`.

### 4. `src/pages/BrowseSkillsPage.tsx`
Import `trackSearch`. Add a `useEffect` watching `debouncedQuery` — fires `trackSearch(debouncedQuery)` only when `debouncedQuery.length >= 3`. Uses the existing debounced value (no extra debouncing).

## Out of scope
- Search term PII — query terms are plain skill keywords, not personal data
- Event parameters beyond `search_term` for search — can be extended later
- Social login sign-up tracking — OAuth flow is separate; can be added to `AuthContext` later
