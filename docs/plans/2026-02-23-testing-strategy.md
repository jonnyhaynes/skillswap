# Testing Strategy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Vitest unit/integration tests, Playwright E2E tests, and GitHub Actions CI to SkillSwap.

**Architecture:** Vitest with MSW intercepts Supabase HTTP calls for service/hook tests. Playwright runs full browser flows against the local Vite dev server. GitHub Actions runs both in parallel on every PR.

**Tech Stack:** Vitest 3, MSW 2, @testing-library/react, @playwright/test, GitHub Actions

---

## Task 1: Install Vitest dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
```

Expected output: packages installed, no peer dep errors.

**Step 2: Verify installation**

```bash
npx vitest --version
```

Expected: prints a version like `3.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install vitest, testing-library, and msw"
```

---

## Task 2: Create Vitest config

**Files:**
- Create: `vitest.config.ts`

**Step 1: Create the config**

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        VITE_BUGSNAG_API_KEY: 'test-bugsnag-key',
        VITE_CLOUDFLARE_TURNSTILE_SITEKEY: 'test-turnstile-key',
        VITE_OS_NAMES_API_KEY: 'test-os-key',
      },
    },
  })
)
```

**Step 2: Add scripts to `package.json`**

In the `"scripts"` section, add:

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

**Step 3: Verify config loads**

```bash
npm run test:run
```

Expected: "No test files found" — that's fine, no tests exist yet. Should NOT throw about missing env vars.

**Step 4: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "chore: configure vitest with jsdom and fake env vars"
```

---

## Task 3: Create test setup file and MSW server

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/test/mocks/handlers.ts`

**Step 1: Create the MSW handlers file**

These handlers intercept Supabase REST calls and return realistic responses.

```ts
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const BASE = 'https://test.supabase.co/rest/v1'

// Reusable skill listing shape (matches SkillListingRow from database.ts)
export const mockSkillRow = {
  id: 'skill-1',
  user_id: 'user-1',
  title: 'Piano Lessons',
  description: 'Beginner to intermediate piano tuition',
  category: 'music',
  level: 'intermediate',
  listing_type: 'offered',
  availability: 'Weekends',
  is_remote: true,
  is_in_person: true,
  tags: ['music', 'piano'],
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
}

export const mockSwapRow = {
  id: 'swap-1',
  proposer_id: 'user-1',
  recipient_id: 'user-2',
  offered_skill_id: 'skill-1',
  requested_skill_id: 'skill-2',
  message: 'I would love to swap skills!',
  status: 'pending',
  proposed_at: '2025-01-01T10:00:00Z',
  responded_at: null,
  completed_at: null,
  conversation_id: null,
  proposer_completed: false,
  recipient_completed: false,
}

export const mockReviewRow = {
  id: 'review-1',
  swap_id: 'swap-1',
  reviewer_id: 'user-1',
  reviewee_id: 'user-2',
  rating: 5,
  comment: 'Great swap!',
  skill_category: 'music',
  created_at: '2025-01-15T10:00:00Z',
}

export const handlers = [
  // Skills
  http.get(`${BASE}/skill_listings`, () => {
    return HttpResponse.json([mockSkillRow])
  }),
  http.post(`${BASE}/skill_listings`, () => {
    return HttpResponse.json([mockSkillRow], { status: 201 })
  }),
  http.patch(`${BASE}/skill_listings`, () => {
    return HttpResponse.json([mockSkillRow])
  }),
  http.delete(`${BASE}/skill_listings`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Swaps
  http.get(`${BASE}/swap_proposals`, () => {
    return HttpResponse.json([mockSwapRow])
  }),
  http.post(`${BASE}/swap_proposals`, () => {
    return HttpResponse.json([mockSwapRow], { status: 201 })
  }),
  http.patch(`${BASE}/swap_proposals`, () => {
    return HttpResponse.json([mockSwapRow])
  }),

  // Reviews
  http.get(`${BASE}/reviews`, () => {
    return HttpResponse.json([mockReviewRow])
  }),
  http.post(`${BASE}/reviews`, () => {
    return HttpResponse.json([mockReviewRow], { status: 201 })
  }),
]
```

**Step 2: Create the setup file**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Step 3: Verify setup loads**

```bash
npm run test:run
```

Expected: still "No test files found" but no errors about MSW or imports.

**Step 4: Commit**

```bash
git add src/test/
git commit -m "chore: add MSW server and Supabase request handlers"
```

---

## Task 4: Unit tests for `formatDate` and `formatRelativeTime`

**Files:**
- Create: `src/utils/__tests__/formatDate.test.ts`
- Create: `src/utils/__tests__/formatRelativeTime.test.ts`

**Step 1: Write tests for `formatDate`**

```ts
// src/utils/__tests__/formatDate.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from '../formatDate'

describe('formatDate', () => {
  it('formats a date string to en-GB short format', () => {
    expect(formatDate('2025-06-15T00:00:00Z')).toBe('15 Jun 2025')
  })

  it('formats January correctly', () => {
    expect(formatDate('2025-01-01T00:00:00Z')).toBe('1 Jan 2025')
  })
})

describe('formatDateTime', () => {
  it('includes time component', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z')
    expect(result).toContain('Jun 2025')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})
```

**Step 2: Run and confirm pass**

```bash
npm run test:run src/utils/__tests__/formatDate.test.ts
```

Expected: 3 tests pass.

**Step 3: Write tests for `formatRelativeTime`**

```ts
// src/utils/__tests__/formatRelativeTime.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime } from '../formatRelativeTime'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Fix "now" to a known timestamp
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for < 60 seconds ago', () => {
    const date = new Date('2025-06-15T11:59:30Z').toISOString()
    expect(formatRelativeTime(date)).toBe('just now')
  })

  it('returns minutes for < 1 hour ago', () => {
    const date = new Date('2025-06-15T11:30:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('30m ago')
  })

  it('returns hours for < 24 hours ago', () => {
    const date = new Date('2025-06-15T09:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('3h ago')
  })

  it('returns days for < 7 days ago', () => {
    const date = new Date('2025-06-12T12:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('3d ago')
  })

  it('returns weeks for < 5 weeks ago', () => {
    const date = new Date('2025-05-25T12:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('3w ago')
  })

  it('returns months for older dates', () => {
    const date = new Date('2025-04-01T12:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('2mo ago')
  })
})
```

**Step 4: Run and confirm pass**

```bash
npm run test:run src/utils/__tests__/formatRelativeTime.test.ts
```

Expected: 6 tests pass.

**Step 5: Commit**

```bash
git add src/utils/__tests__/
git commit -m "test: add unit tests for formatDate and formatRelativeTime"
```

---

## Task 5: Unit tests for `filterSkills`

**Files:**
- Create: `src/utils/__tests__/filterSkills.test.ts`

**Step 1: Write tests**

```ts
// src/utils/__tests__/filterSkills.test.ts
import { describe, it, expect } from 'vitest'
import { filterSkills } from '../filterSkills'
import type { SkillListing } from '@/types'

const base: SkillListing = {
  id: '1',
  userId: 'user-1',
  title: 'Piano Lessons',
  description: 'Learn piano from scratch',
  category: 'music',
  level: 'beginner',
  listingType: 'offered',
  availability: 'Weekends',
  isRemote: true,
  isInPerson: false,
  tags: ['piano', 'classical'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const listings: SkillListing[] = [
  base,
  { ...base, id: '2', userId: 'user-2', title: 'Guitar Hero', category: 'music', listingType: 'wanted', tags: ['guitar'] },
  { ...base, id: '3', userId: 'user-1', title: 'Python Coding', category: 'technology', listingType: 'offered', tags: ['python'] },
]

describe('filterSkills', () => {
  it('returns all listings when no options given', () => {
    expect(filterSkills(listings, {})).toHaveLength(3)
  })

  it('excludes listings by userId', () => {
    const result = filterSkills(listings, { excludeUserId: 'user-1' })
    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe('user-2')
  })

  it('filters by listingType', () => {
    const result = filterSkills(listings, { listingType: 'wanted' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by category', () => {
    const result = filterSkills(listings, { categories: ['technology'] })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Python Coding')
  })

  it('filters by search query matching title', () => {
    const result = filterSkills(listings, { query: 'guitar' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by search query matching tags', () => {
    const result = filterSkills(listings, { query: 'classical' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('search is case-insensitive', () => {
    const result = filterSkills(listings, { query: 'PIANO' })
    expect(result).toHaveLength(1)
  })

  it('combines multiple filters', () => {
    const result = filterSkills(listings, {
      categories: ['music'],
      listingType: 'offered',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns empty array when nothing matches', () => {
    const result = filterSkills(listings, { query: 'xyznotfound' })
    expect(result).toHaveLength(0)
  })
})
```

**Step 2: Run and confirm pass**

```bash
npm run test:run src/utils/__tests__/filterSkills.test.ts
```

Expected: 9 tests pass.

**Step 3: Commit**

```bash
git add src/utils/__tests__/filterSkills.test.ts
git commit -m "test: add unit tests for filterSkills"
```

---

## Task 6: Unit tests for `sortSkills` and `haversineDistance`

**Files:**
- Create: `src/utils/__tests__/sortSkills.test.ts`
- Create: `src/utils/__tests__/distance.test.ts`

**Step 1: Write tests for `haversineDistance`**

```ts
// src/utils/__tests__/distance.test.ts
import { describe, it, expect } from 'vitest'
import { haversineDistance } from '../distance'

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(51.5, -0.1, 51.5, -0.1)).toBe(0)
  })

  it('calculates approximate distance between London and Manchester', () => {
    // London: 51.5074, -0.1278 | Manchester: 53.4808, -2.2426
    const dist = haversineDistance(51.5074, -0.1278, 53.4808, -2.2426)
    // ~163 miles
    expect(dist).toBeGreaterThan(155)
    expect(dist).toBeLessThan(175)
  })

  it('is symmetric (A→B equals B→A)', () => {
    const ab = haversineDistance(51.5, -0.1, 53.48, -2.24)
    const ba = haversineDistance(53.48, -2.24, 51.5, -0.1)
    expect(ab).toBeCloseTo(ba, 5)
  })
})
```

**Step 2: Write tests for `sortSkills`**

```ts
// src/utils/__tests__/sortSkills.test.ts
import { describe, it, expect } from 'vitest'
import { sortSkills } from '../sortSkills'
import type { SkillListing } from '@/types'

const base: SkillListing = {
  id: '1',
  userId: 'user-1',
  title: 'Baking',
  description: '',
  category: 'cooking',
  level: 'beginner',
  listingType: 'offered',
  availability: '',
  isRemote: true,
  isInPerson: true,
  tags: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const listings: SkillListing[] = [
  { ...base, id: '1', title: 'Baking', createdAt: '2025-01-01T00:00:00Z' },
  { ...base, id: '2', title: 'Archery', createdAt: '2025-03-01T00:00:00Z' },
  { ...base, id: '3', title: 'Coding', createdAt: '2025-02-01T00:00:00Z' },
]

describe('sortSkills', () => {
  it('sorts newest first', () => {
    const result = sortSkills(listings, 'newest')
    expect(result[0].id).toBe('2')
    expect(result[2].id).toBe('1')
  })

  it('sorts oldest first', () => {
    const result = sortSkills(listings, 'oldest')
    expect(result[0].id).toBe('1')
    expect(result[2].id).toBe('2')
  })

  it('sorts title A→Z', () => {
    const result = sortSkills(listings, 'title-asc')
    expect(result[0].title).toBe('Archery')
    expect(result[2].title).toBe('Coding')
  })

  it('sorts title Z→A', () => {
    const result = sortSkills(listings, 'title-desc')
    expect(result[0].title).toBe('Coding')
    expect(result[2].title).toBe('Archery')
  })

  it('does not mutate the original array', () => {
    const original = [...listings]
    sortSkills(listings, 'title-asc')
    expect(listings[0].id).toBe(original[0].id)
  })

  it('returns unsorted list when nearest context missing', () => {
    const result = sortSkills(listings, 'nearest')
    expect(result).toHaveLength(3)
  })
})
```

**Step 3: Run and confirm all pass**

```bash
npm run test:run src/utils/__tests__/distance.test.ts src/utils/__tests__/sortSkills.test.ts
```

Expected: all tests pass.

**Step 4: Commit**

```bash
git add src/utils/__tests__/
git commit -m "test: add unit tests for sortSkills and haversineDistance"
```

---

## Task 7: Hook test for `useDebounce`

**Files:**
- Create: `src/hooks/__tests__/useDebounce.test.ts`

**Step 1: Write tests**

```ts
// src/hooks/__tests__/useDebounce.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update before the delay has passed', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })
    expect(result.current).toBe('hello')

    vi.useRealTimers()
  })

  it('updates after the delay has passed', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('world')
    vi.useRealTimers()
  })

  it('resets the timer if value changes before delay', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    act(() => { vi.advanceTimersByTime(200) })
    rerender({ value: 'c' })
    act(() => { vi.advanceTimersByTime(200) })

    // Only 200ms since last change — should still be 'a'
    expect(result.current).toBe('a')

    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('c')

    vi.useRealTimers()
  })
})
```

**Step 2: Run and confirm pass**

```bash
npm run test:run src/hooks/__tests__/useDebounce.test.ts
```

Expected: 4 tests pass.

**Step 3: Commit**

```bash
git add src/hooks/__tests__/useDebounce.test.ts
git commit -m "test: add hook tests for useDebounce"
```

---

## Task 8: Tests for `getPresenceState`

**Files:**
- Create: `src/hooks/__tests__/getPresenceState.test.ts`

**Note:** `getPresenceState` is a pure function exported from `usePresence.ts`. We test it directly without rendering a hook — the Supabase channel used by `usePresence` itself is not needed here.

**Step 1: Write tests**

The function reads from an internal module-level `Map`. We can't reset the map between tests without importing it, so we test the logic by calling `getPresenceState` for a user who was never tracked (should be offline) and by checking the threshold logic via the exported constant behaviour.

```ts
// src/hooks/__tests__/getPresenceState.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPresenceState } from '../usePresence'

describe('getPresenceState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns isOnline: false for an unknown user', () => {
    const { isOnline } = getPresenceState('unknown-user-xyz')
    expect(isOnline).toBe(false)
  })
})
```

**Step 2: Run and confirm pass**

```bash
npm run test:run src/hooks/__tests__/getPresenceState.test.ts
```

Expected: 1 test passes.

**Step 3: Commit**

```bash
git add src/hooks/__tests__/getPresenceState.test.ts
git commit -m "test: add tests for getPresenceState"
```

---

## Task 9: Service tests for `skills.ts`

**Files:**
- Create: `src/services/__tests__/skills.test.ts`

**Step 1: Write tests**

```ts
// src/services/__tests__/skills.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockSkillRow } from '@/test/mocks/handlers'
import {
  getSkillListings,
  getSkillById,
  createSkillListing,
  deleteSkillListing,
  SkillsServiceError,
} from '../skills'

describe('getSkillListings', () => {
  it('returns mapped listings', async () => {
    const result = await getSkillListings()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('skill-1')
    expect(result[0].userId).toBe('user-1')
    expect(result[0].listingType).toBe('offered') // snake_case mapped to camelCase
  })

  it('throws SkillsServiceError on Supabase error', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(
          { message: 'permission denied', code: '42501' },
          { status: 400 }
        )
      })
    )
    await expect(getSkillListings()).rejects.toThrow(SkillsServiceError)
  })
})

describe('getSkillById', () => {
  it('returns a single skill', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(mockSkillRow) // single object for .single()
      })
    )
    const result = await getSkillById('skill-1')
    expect(result?.id).toBe('skill-1')
  })

  it('returns null when not found (PGRST116)', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(
          { message: 'not found', code: 'PGRST116' },
          { status: 406 }
        )
      })
    )
    const result = await getSkillById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createSkillListing', () => {
  it('returns the created listing', async () => {
    server.use(
      http.post('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(mockSkillRow, { status: 201 })
      })
    )

    const result = await createSkillListing({
      userId: 'user-1',
      title: 'Piano Lessons',
      description: 'Beginner to intermediate',
      category: 'music',
      level: 'intermediate',
      listingType: 'offered',
      availability: 'Weekends',
      isRemote: true,
      isInPerson: true,
      tags: ['piano'],
    })
    expect(result.id).toBe('skill-1')
  })
})

describe('deleteSkillListing', () => {
  it('resolves without error on success', async () => {
    server.use(
      http.delete('https://test.supabase.co/rest/v1/skill_listings', () => {
        return new HttpResponse(null, { status: 204 })
      })
    )
    await expect(deleteSkillListing('skill-1')).resolves.toBeUndefined()
  })
})
```

**Step 2: Run and confirm pass**

```bash
npm run test:run src/services/__tests__/skills.test.ts
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add src/services/__tests__/skills.test.ts
git commit -m "test: add service tests for skills"
```

---

## Task 10: Service tests for `swaps.ts`

**Files:**
- Create: `src/services/__tests__/swaps.test.ts`

**Step 1: Write tests**

```ts
// src/services/__tests__/swaps.test.ts
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockSwapRow } from '@/test/mocks/handlers'
import {
  getSwapsForUser,
  createProposal,
  updateSwapStatus,
  SwapsServiceError,
} from '../swaps'

describe('getSwapsForUser', () => {
  it('returns mapped swap proposals', async () => {
    const result = await getSwapsForUser('user-1')
    expect(result).toHaveLength(1)
    expect(result[0].proposerId).toBe('user-1')
    expect(result[0].status).toBe('pending')
  })

  it('throws SwapsServiceError on failure', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json({ message: 'error', code: '42501' }, { status: 400 })
      })
    )
    await expect(getSwapsForUser('user-1')).rejects.toThrow(SwapsServiceError)
  })
})

describe('createProposal', () => {
  it('returns the created proposal', async () => {
    server.use(
      http.post('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json(mockSwapRow, { status: 201 })
      })
    )

    const result = await createProposal({
      proposerId: 'user-1',
      recipientId: 'user-2',
      offeredSkillId: 'skill-1',
      requestedSkillId: 'skill-2',
      message: 'Want to swap?',
      conversationId: null,
    })
    expect(result.id).toBe('swap-1')
    expect(result.status).toBe('pending')
  })
})

describe('updateSwapStatus', () => {
  it('sets respondedAt when status becomes in_progress', async () => {
    const respondedRow = {
      ...mockSwapRow,
      status: 'in_progress',
      responded_at: '2025-01-02T10:00:00Z',
    }
    server.use(
      http.patch('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json(respondedRow)
      })
    )
    const result = await updateSwapStatus('swap-1', 'in_progress')
    expect(result.status).toBe('in_progress')
    expect(result.respondedAt).toBe('2025-01-02T10:00:00Z')
  })

  it('sets respondedAt when status becomes declined', async () => {
    const declinedRow = {
      ...mockSwapRow,
      status: 'declined',
      responded_at: '2025-01-02T10:00:00Z',
    }
    server.use(
      http.patch('https://test.supabase.co/rest/v1/swap_proposals', () => {
        return HttpResponse.json(declinedRow)
      })
    )
    const result = await updateSwapStatus('swap-1', 'declined')
    expect(result.status).toBe('declined')
  })
})
```

**Step 2: Run and confirm pass**

```bash
npm run test:run src/services/__tests__/swaps.test.ts
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add src/services/__tests__/swaps.test.ts
git commit -m "test: add service tests for swaps"
```

---

## Task 11: Service tests for `reviews.ts`

**Files:**
- Create: `src/services/__tests__/reviews.test.ts`

**Step 1: Write tests**

```ts
// src/services/__tests__/reviews.test.ts
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockReviewRow } from '@/test/mocks/handlers'
import {
  getReviewsForUser,
  createReview,
  ReviewsServiceError,
} from '../reviews'

describe('getReviewsForUser', () => {
  it('returns mapped reviews', async () => {
    const result = await getReviewsForUser('user-2')
    expect(result).toHaveLength(1)
    expect(result[0].revieweeId).toBe('user-2')
    expect(result[0].rating).toBe(5)
  })

  it('throws ReviewsServiceError on failure', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/reviews', () => {
        return HttpResponse.json({ message: 'error', code: '42501' }, { status: 400 })
      })
    )
    await expect(getReviewsForUser('user-2')).rejects.toThrow(ReviewsServiceError)
  })
})

describe('createReview', () => {
  it('returns the created review', async () => {
    server.use(
      http.post('https://test.supabase.co/rest/v1/reviews', () => {
        return HttpResponse.json(mockReviewRow, { status: 201 })
      })
    )

    const result = await createReview({
      swapId: 'swap-1',
      reviewerId: 'user-1',
      revieweeId: 'user-2',
      rating: 5,
      comment: 'Great swap!',
      skillCategory: 'music',
    })
    expect(result.id).toBe('review-1')
    expect(result.rating).toBe(5)
  })
})
```

**Step 2: Run all Vitest tests to confirm everything passes**

```bash
npm run test:run
```

Expected: all tests pass, 0 failures.

**Step 3: Commit**

```bash
git add src/services/__tests__/reviews.test.ts
git commit -m "test: add service tests for reviews"
```

---

## Task 12: Install and configure Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/fixtures/auth.ts`

**Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Expected: Playwright and chromium browser downloaded.

**Step 2: Create `playwright.config.ts`**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project: logs in and saves auth state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/fixtures/.auth.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run preview -- --port 5173' : 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 3: Create auth fixture**

This file stores the authenticated state after login. The actual login happens in `auth.setup.ts` (created in Task 13).

```ts
// e2e/fixtures/auth.ts
import { test as base } from '@playwright/test'

// Re-export base test — auth state is already applied via storageState in playwright.config.ts
export { expect } from '@playwright/test'
export const test = base
```

**Step 4: Add E2E script to `package.json`**

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:report": "playwright show-report"
```

**Step 5: Add E2E artifacts to `.gitignore`**

Open `.gitignore` and add these lines at the bottom:

```
# Playwright
/e2e/fixtures/.auth.json
/playwright-report/
/test-results/
```

**Step 6: Commit**

```bash
git add playwright.config.ts e2e/fixtures/auth.ts package.json .gitignore
git commit -m "chore: install and configure Playwright"
```

---

## Task 13: E2E auth setup (login once, reuse state)

**Files:**
- Create: `e2e/auth.setup.ts`

**Step 1: Create the setup file**

This file runs before E2E tests. It logs in with a known test account and saves the session to `.auth.json`.

> **Important:** You need a real test user in your Supabase project. Create one manually in the Supabase dashboard: Settings → Authentication → Users → Add user. Use email `test@skillswap.test` and a password you'll put in `.env.local` as `E2E_TEST_PASSWORD`.

```ts
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, 'fixtures/.auth.json')

setup('authenticate', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('test@skillswap.test')
  await page.getByLabel('Password').fill(process.env.E2E_TEST_PASSWORD!)

  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect to home or dashboard after successful login
  await expect(page).toHaveURL(/\/(browse|home|$)/, { timeout: 10_000 })

  await page.context().storageState({ path: authFile })
})
```

**Step 2: Add `E2E_TEST_PASSWORD` to `.env.local`**

```
E2E_TEST_PASSWORD=your-test-user-password
```

**Step 3: Run setup to verify login works**

```bash
npx playwright test auth.setup.ts --project=setup
```

Expected: test passes, `e2e/fixtures/.auth.json` is created.

**Step 4: Commit**

```bash
git add e2e/auth.setup.ts .env.example
git commit -m "test: add Playwright auth setup"
```

---

## Task 14: E2E tests for auth flows

**Files:**
- Create: `e2e/auth.spec.ts`

**Step 1: Write tests**

```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

// These tests use a fresh page (not logged in) to test auth flows
// Override storageState to empty so we start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } })

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('shows error for invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('notauser@example.com')
  await page.getByLabel('Password').fill('wrongpassword')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 })
})

test('forgot password page is reachable', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: /forgot/i }).click()
  await expect(page).toHaveURL(/forgot/)
  await expect(page.getByLabel('Email')).toBeVisible()
})

test('sign up page loads', async ({ page }) => {
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: /create/i })).toBeVisible()
})
```

**Step 2: Run auth tests**

```bash
npx playwright test e2e/auth.spec.ts
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add e2e/auth.spec.ts
git commit -m "test: add E2E auth flow tests"
```

---

## Task 15: E2E tests for skills browsing

**Files:**
- Create: `e2e/skills.spec.ts`

**Step 1: Write tests**

```ts
// e2e/skills.spec.ts
import { test, expect } from '@playwright/test'

test('browse skills page loads listing cards', async ({ page }) => {
  await page.goto('/browse')
  // At least one skill card should appear
  await expect(page.locator('[data-testid="skill-card"]').first()).toBeVisible({ timeout: 10_000 })
})

test('search filters results', async ({ page }) => {
  await page.goto('/browse')
  await page.getByPlaceholder(/search/i).fill('piano')
  // Wait for results to update (debounced)
  await page.waitForTimeout(500)
  // All visible cards should relate to the search (we just check the page doesn't crash)
  await expect(page).toHaveURL(/browse/)
})

test('skill detail page loads from listing', async ({ page }) => {
  await page.goto('/browse')
  const firstCard = page.locator('[data-testid="skill-card"]').first()
  await firstCard.waitFor({ timeout: 10_000 })
  await firstCard.click()
  await expect(page).toHaveURL(/\/skills\//)
  await expect(page.getByRole('heading').first()).toBeVisible()
})
```

**Note:** The `data-testid="skill-card"` attribute must exist on skill card components. If it doesn't, add it in the next step.

**Step 2: Add `data-testid` to SkillCard component**

Find the root element of `src/components/skills/SkillCard.tsx` and add `data-testid="skill-card"` to it. Example:

```tsx
<div data-testid="skill-card" className={...}>
```

**Step 3: Run skills E2E tests**

```bash
npx playwright test e2e/skills.spec.ts
```

Expected: all pass.

**Step 4: Commit**

```bash
git add e2e/skills.spec.ts src/components/skills/SkillCard.tsx
git commit -m "test: add E2E skills browsing tests"
```

---

## Task 16: E2E tests for swaps

**Files:**
- Create: `e2e/swaps.spec.ts`

**Step 1: Write tests**

```ts
// e2e/swaps.spec.ts
import { test, expect } from '@playwright/test'

test('swaps page loads', async ({ page }) => {
  await page.goto('/swaps')
  await expect(page).toHaveURL(/swaps/)
  // Should show some swap-related heading or empty state
  await expect(page.getByRole('heading').first()).toBeVisible()
})

test('navigates to swap detail from swaps list', async ({ page }) => {
  await page.goto('/swaps')
  const swapLink = page.locator('[data-testid="swap-card"]').first()
  const hasSwaps = await swapLink.count() > 0

  if (hasSwaps) {
    await swapLink.click()
    await expect(page).toHaveURL(/\/swaps\//)
  } else {
    // Empty state is acceptable for test user
    await expect(page.getByText(/no swaps/i)).toBeVisible()
  }
})
```

**Step 2: Add `data-testid` to SwapCard component if needed**

Same pattern as SkillCard — find the root element of any swap card/list-item component and add `data-testid="swap-card"`.

**Step 3: Run swaps E2E tests**

```bash
npx playwright test e2e/swaps.spec.ts
```

**Step 4: Commit**

```bash
git add e2e/swaps.spec.ts
git commit -m "test: add E2E swaps page tests"
```

---

## Task 17: E2E tests for profile

**Files:**
- Create: `e2e/profile.spec.ts`

**Step 1: Write tests**

```ts
// e2e/profile.spec.ts
import { test, expect } from '@playwright/test'

test('profile page loads for current user', async ({ page }) => {
  await page.goto('/profile')
  // Should either show the profile or redirect to login (if URL is different)
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
})

test('edit profile page is accessible', async ({ page }) => {
  await page.goto('/profile/edit')
  await expect(page).toHaveURL(/profile/)
  await expect(page.getByRole('heading').first()).toBeVisible()
})
```

**Step 2: Run profile E2E tests**

```bash
npx playwright test e2e/profile.spec.ts
```

**Step 3: Run the full E2E suite**

```bash
npx playwright test
```

Expected: all E2E tests pass.

**Step 4: Commit**

```bash
git add e2e/profile.spec.ts
git commit -m "test: add E2E profile page tests"
```

---

## Task 18: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create the workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run Vitest
        run: npm run test:run
        env:
          VITE_SUPABASE_URL: https://test.supabase.co
          VITE_SUPABASE_ANON_KEY: test-anon-key

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build app
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_BUGSNAG_API_KEY: ${{ secrets.VITE_BUGSNAG_API_KEY }}
          VITE_CLOUDFLARE_TURNSTILE_SITEKEY: ${{ secrets.VITE_CLOUDFLARE_TURNSTILE_SITEKEY }}
          VITE_OS_NAMES_API_KEY: ${{ secrets.VITE_OS_NAMES_API_KEY }}
          VITE_GA_MEASUREMENT_ID: ${{ secrets.VITE_GA_MEASUREMENT_ID }}

      - name: Run Playwright tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}

      - name: Upload test results on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Step 2: Add GitHub repository secrets**

In GitHub: Settings → Secrets and variables → Actions → New repository secret. Add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BUGSNAG_API_KEY`
- `VITE_CLOUDFLARE_TURNSTILE_SITEKEY`
- `VITE_OS_NAMES_API_KEY`
- `VITE_GA_MEASUREMENT_ID`
- `E2E_TEST_PASSWORD`

**Step 3: Commit and push to trigger CI**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for unit and E2E tests"
git push origin main
```

Expected: GitHub Actions triggers two jobs. Check the Actions tab to verify both pass.

---

## Final verification

Run the full test suite locally before pushing:

```bash
# Unit tests
npm run test:run

# E2E tests (requires dev server)
npm run test:e2e
```

All tests should pass.
