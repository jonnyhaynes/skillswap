# Testing Strategy Design

**Date:** 2026-02-23
**Status:** Approved

## Overview

Add a comprehensive testing suite to SkillSwap using Vitest for unit/integration tests and Playwright for E2E tests, with GitHub Actions CI running on every PR.

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Unit | Vitest | Pure utility functions |
| Integration | Vitest + MSW | Custom hooks and Supabase services |
| E2E | Playwright | Full user flows in a real browser |
| CI | GitHub Actions | Run all tests on every PR and push to main |

## Directory Structure

```
src/
├── utils/__tests__/           # Unit tests for pure utils
├── hooks/__tests__/           # Hook tests via renderHook
├── services/__tests__/        # Service tests with MSW
├── test/
│   ├── setup.ts               # Vitest global setup (MSW server, cleanup)
│   └── mocks/
│       └── handlers.ts        # MSW Supabase REST handlers

e2e/
├── auth.spec.ts
├── skills.spec.ts
├── swaps.spec.ts
├── profile.spec.ts
└── fixtures/
    └── auth.ts                # Saved auth state (storageState)
```

## Section 1: Vitest Configuration

**New dependencies:**
- `vitest`, `@vitest/ui`, `jsdom`
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- `msw`

**`vitest.config.ts`** extends the existing Vite config with jsdom environment and global setup file.

**New scripts:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

## Section 2: Unit & Integration Test Scope

### Utils (pure unit — no mocking)
- `formatDate`, `formatRelativeTime` — date edge cases
- `filterSkills`, `sortSkills` — filter/sort logic
- `distance` — haversine calculation accuracy
- `cn` — class merging correctness

### Custom hooks (Vitest + RTL `renderHook`)
- `useDebounce` — timing behaviour
- `useCountUp` — animation progression
- `usePresence` — online/offline state transitions

### Services (Vitest + MSW)
MSW intercepts `https://*.supabase.co/rest/v1/*` and returns realistic Supabase JSON responses matching `database.ts` types.

- `skills.ts` — fetch skills, create listing, update listing
- `swaps.ts` — propose swap, accept/decline, fetch by status
- `reviews.ts` — submit review, fetch for user

## Section 3: Playwright E2E

**New dependency:** `@playwright/test`

**Strategy:**
- Runs against local Vite dev server in development, `vite preview` in CI
- Auth handled via `storageState` — log in once per suite, reuse across tests
- Test data created/cleaned up via Supabase service role key in `global-setup.ts`

**Test files:**

| File | Flows |
|---|---|
| `auth.spec.ts` | Sign up, log in, log out, forgot password redirect |
| `skills.spec.ts` | Browse listing, search/filter, view skill detail |
| `swaps.spec.ts` | Propose a swap, view status, accept/decline |
| `profile.spec.ts` | View own profile, edit profile, view another user |

**New scripts:**
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## Section 4: GitHub Actions CI

**File:** `.github/workflows/ci.yml`
**Triggers:** Pull requests and pushes to `main`

**Two parallel jobs:**
1. `unit-tests` — checkout, install, run `vitest run`
2. `e2e-tests` — checkout, install, install Playwright browsers, build, run `playwright test`

**Required GitHub secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**On failure:** Playwright traces and screenshots uploaded as GitHub Actions artifacts.
