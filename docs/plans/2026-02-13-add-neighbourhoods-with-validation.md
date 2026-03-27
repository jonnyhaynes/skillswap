# OS Names API Neighbourhood Typeahead Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static neighbourhood `<select>` dropdown with a typeahead autocomplete powered by the Ordnance Survey Names API, so users pick from authoritative, validated place names — eliminating manual maintenance and preventing duplicates.

**Architecture:** A new `searchPlaces` service calls the OS Names API (`/search/names/v1/find`) filtered to settlement types only (`Village`, `Hamlet`, `Suburban_Area`, `Town`, `City`, `Other_Settlement`). A new `NeighbourhoodTypeahead` component wraps a text input with debounced search, renders a dropdown of results, and writes the selected name to form state. When a user picks a place, `addNeighbourhood` upserts it into the DB `neighbourhoods` table (with `ON CONFLICT DO NOTHING`). Both `SignUpForm` and `ProfileForm` swap their `<select>` for this new component. The static `NEIGHBOURHOODS` array remains as a fallback but is no longer the primary data source. The seed SQL and migration are updated so `supabase db reset` stays green.

**Tech Stack:** React 19, TypeScript, Supabase (PostgreSQL), Tailwind CSS 4, React Router 7, OS Names API (free, OGL)

---

### Task 1: Add OS Names API key to environment config

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

**Context:** The OS Names API requires a free API key from the [OS Data Hub](https://osdatahub.os.uk). The key is passed as a `key` query parameter. We expose it via a `VITE_` prefixed env var so Vite bundles it client-side.

**Step 1: Add the env var to `.env.example`**

Add after the Cloudflare Turnstile block at the bottom of `.env.example`:

```
# Ordnance Survey Names API (free — https://osdatahub.os.uk)
VITE_OS_NAMES_API_KEY=your-os-names-api-key
```

**Step 2: Add the real key to `.env.local`**

Add at the bottom of `.env.local`:

```
# Ordnance Survey Names API
VITE_OS_NAMES_API_KEY=<paste-your-key-here>
```

> **Note:** You must sign up at https://osdatahub.os.uk, create an API project, enable the OS Names API, and copy the key.

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add OS Names API key placeholder to .env.example"
```

> Do NOT commit `.env.local` — it is gitignored.

---

### Task 2: Create `searchPlaces` service

**Files:**
- Create: `src/services/osNames.ts`

**Step 1: Create the OS Names API service**

```typescript
// OS Names API service
// Docs: https://docs.os.uk/os-apis/accessing-os-apis/os-names-api

const OS_NAMES_API_URL = 'https://api.os.uk/search/names/v1/find'
const API_KEY = import.meta.env.VITE_OS_NAMES_API_KEY

/** Settlement types we care about (excludes roads, postcodes, landmarks, etc.) */
const SETTLEMENT_TYPES = [
  'City',
  'Town',
  'Suburban_Area',
  'Village',
  'Hamlet',
  'Other_Settlement',
] as const

export interface PlaceResult {
  name: string
  localType: string
  county: string
}

/**
 * Search for places by name using the OS Names API.
 * Returns only settlement-type results (cities, towns, villages, hamlets, etc.)
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  if (!API_KEY) {
    console.warn('OS Names API key not configured (VITE_OS_NAMES_API_KEY)')
    return []
  }

  const fq = SETTLEMENT_TYPES.map((type) => `LOCAL_TYPE:${type}`).join(' ')

  const params = new URLSearchParams({
    query: trimmed,
    fq,
    key: API_KEY,
  })

  const response = await fetch(`${OS_NAMES_API_URL}?${params}`)

  if (!response.ok) {
    console.error('OS Names API error:', response.status, response.statusText)
    return []
  }

  const data = await response.json()

  if (!data.results) return []

  // Deduplicate by name (API can return the same place name multiple times)
  const seen = new Set<string>()
  const places: PlaceResult[] = []

  for (const result of data.results) {
    const entry = result.GAZETTEER_ENTRY
    if (!entry) continue

    const name = entry.NAME1 as string
    if (seen.has(name)) continue
    seen.add(name)

    places.push({
      name,
      localType: entry.LOCAL_TYPE as string,
      county: (entry.COUNTY_UNITARY as string) || '',
    })
  }

  return places
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/services/osNames.ts
git commit -m "feat: add OS Names API searchPlaces service"
```

---

### Task 3: Add `ensureNeighbourhoodExists` to neighbourhoods service

**Files:**
- Modify: `src/services/neighbourhoods.ts`

**Context:** When a user picks a place from the typeahead, we need to ensure it exists in the `neighbourhoods` DB table before they can reference it from `profiles.neighbourhood` (which has a foreign key constraint). This upserts — insert with `ON CONFLICT DO NOTHING`.

**Step 1: Add the function to `src/services/neighbourhoods.ts`**

Add after the existing `getNeighbourhoods` function:

```typescript
/**
 * Ensure a neighbourhood exists in the database.
 * Inserts it if missing; silently succeeds if already present.
 * Call this when a user selects a place from the typeahead,
 * before storing it on their profile.
 */
export async function ensureNeighbourhoodExists(name: string): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) return

  const { error } = await supabase
    .from('neighbourhoods')
    .upsert({ name: trimmed }, { onConflict: 'name' })

  if (error) {
    console.error('Failed to ensure neighbourhood exists:', error.message)
  }
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/services/neighbourhoods.ts
git commit -m "feat: add ensureNeighbourhoodExists upsert function"
```

---

### Task 4: Create `NeighbourhoodTypeahead` component

**Files:**
- Create: `src/components/ui/NeighbourhoodTypeahead.tsx`

**Context:** This replaces the `<select>` dropdown. It's a text input that:
- Debounces input by 300ms before querying the OS Names API
- Shows a dropdown of matching places (name + type + county for disambiguation)
- Lets the user click a result to select it
- Falls back to the existing DB list if the API key is missing or the API fails
- Supports keyboard navigation (Arrow keys + Enter + Escape)

**Step 1: Create the component**

```tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { searchPlaces, type PlaceResult } from '@/services/osNames'
import { getNeighbourhoods } from '@/services/neighbourhoods'
import { cn } from '@/utils/cn'

interface NeighbourhoodTypeaheadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  id?: string
  error?: string
}

export function NeighbourhoodTypeahead({
  value,
  onChange,
  label = 'Neighbourhood',
  required = false,
  id,
  error,
}: NeighbourhoodTypeaheadProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [fallbackResults, setFallbackResults] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasApiKey] = useState(() => !!import.meta.env.VITE_OS_NAMES_API_KEY)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${inputId}-error` : undefined

  // Load fallback neighbourhoods list once (for when API key is missing)
  useEffect(() => {
    if (!hasApiKey) {
      getNeighbourhoods().then(setFallbackResults)
    }
  }, [hasApiKey])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const doSearch = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    if (!hasApiKey) {
      // Fallback: filter static list
      const filtered = fallbackResults
        .filter((n) => n.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
      setResults(filtered.map((n) => ({ name: n, localType: '', county: '' })))
      setIsOpen(filtered.length > 0)
      setActiveIndex(-1)
      return
    }

    setLoading(true)
    try {
      const places = await searchPlaces(term)
      setResults(places.slice(0, 10))
      setIsOpen(places.length > 0)
      setActiveIndex(-1)
    } catch {
      // Silently fail — user can still type manually
      setResults([])
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }, [hasApiKey, fallbackResults])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)

    // Clear selection if user edits after selecting
    if (value && val !== value) {
      onChange('')
    }

    // Debounce the search
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  function selectPlace(place: PlaceResult) {
    setQuery(place.name)
    onChange(place.name)
    setIsOpen(false)
    setResults([])
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          selectPlace(results[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-slate-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim().length >= 2 && results.length > 0) {
            setIsOpen(true)
          }
        }}
        placeholder="Start typing a place name…"
        autoComplete="off"
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none hover:border-slate-300 placeholder:text-slate-400',
          error && 'border-red-600'
        )}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-[38px]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500" />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
        >
          {results.map((place, index) => (
            <li
              key={`${place.name}-${index}`}
              id={`${inputId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                selectPlace(place)
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer px-4 py-2.5 text-sm transition-colors',
                index === activeIndex
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <span className="font-medium">{place.name}</span>
              {(place.localType || place.county) && (
                <span className="ml-2 text-xs text-slate-400">
                  {[place.localType, place.county].filter(Boolean).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="text-red-600 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/NeighbourhoodTypeahead.tsx
git commit -m "feat: add NeighbourhoodTypeahead component with OS Names API"
```

---

### Task 5: Replace `<select>` in SignUpForm with typeahead

**Files:**
- Modify: `src/components/auth/SignUpForm.tsx`

**Context:** Currently the SignUpForm fetches all neighbourhoods on mount and renders a `<select>`. We replace this with the new `NeighbourhoodTypeahead`. When the form submits, we call `ensureNeighbourhoodExists` so the FK constraint is satisfied.

**Step 1: Update imports**

At the top of `src/components/auth/SignUpForm.tsx`, replace:
```typescript
import { getNeighbourhoods } from '@/services/neighbourhoods'
```
with:
```typescript
import { ensureNeighbourhoodExists } from '@/services/neighbourhoods'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
```

**Step 2: Remove neighbourhood loading state**

Delete these lines from the component body:

```typescript
const [neighbourhoods, setNeighbourhoods] = useState<string[]>([])
```

and:

```typescript
useEffect(() => {
  getNeighbourhoods().then(setNeighbourhoods)
}, [])
```

**Step 3: Update validation in `handleSubmit`**

Replace the validation check:
```typescript
if (!formData.neighbourhood) {
  setLocalError('Please select a neighbourhood')
  return
}
```
with:
```typescript
if (!formData.neighbourhood) {
  setLocalError('Please select a neighbourhood from the suggestions')
  return
}
```

**Step 4: Add `ensureNeighbourhoodExists` call before signup**

In the `handleSubmit` function, immediately before the `const result = await signUp(...)` call, add:

```typescript
// Ensure the selected neighbourhood exists in the DB (upserts)
await ensureNeighbourhoodExists(formData.neighbourhood)
```

**Step 5: Replace the `<select>` JSX block with the typeahead**

Replace this entire block:
```tsx
<div>
  <label htmlFor="neighbourhood" className="block text-sm font-medium text-slate-700 mb-1">
    Neighbourhood
  </label>
  <select
    id="neighbourhood"
    name="neighbourhood"
    required
    value={formData.neighbourhood}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
  >
    <option value="">Select a neighbourhood</option>
    {neighbourhoods.map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ))}
  </select>
</div>
```

with:

```tsx
<NeighbourhoodTypeahead
  value={formData.neighbourhood}
  onChange={(value) =>
    setFormData((prev) => ({ ...prev, neighbourhood: value }))
  }
  required
/>
```

**Step 6: Verify it compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add src/components/auth/SignUpForm.tsx
git commit -m "feat: replace neighbourhood select with typeahead in SignUpForm"
```

---

### Task 6: Replace `<Select>` in ProfileForm with typeahead

**Files:**
- Modify: `src/components/profile/ProfileForm.tsx`

**Context:** Same change as SignUpForm but adapted for the ProfileForm. Currently uses the `<Select>` UI component with `neighbourhoodOptions` state.

**Step 1: Update imports**

Replace:
```typescript
import { Select } from '@/components/ui/Select'
import { getNeighbourhoods } from '@/services/neighbourhoods'
```
with:
```typescript
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import { ensureNeighbourhoodExists } from '@/services/neighbourhoods'
```

**Step 2: Remove neighbourhood options loading**

Delete this state:
```typescript
const [neighbourhoodOptions, setNeighbourhoodOptions] = useState<{ value: string; label: string }[]>([])
```

and this effect:
```typescript
useEffect(() => {
  getNeighbourhoods().then((names) =>
    setNeighbourhoodOptions(names.map((n) => ({ value: n, label: n })))
  )
}, [])
```

**Step 3: Add `ensureNeighbourhoodExists` in `handleSubmit`**

In the `handleSubmit` function, add before the `onSubmit({...})` call:

```typescript
// Ensure the selected neighbourhood exists in the DB
await ensureNeighbourhoodExists(neighbourhood)
```

Also change `handleSubmit` from `function handleSubmit(e: React.FormEvent)` to `async function handleSubmit(e: React.FormEvent)` since it now uses `await`.

**Step 4: Replace the `<Select>` in the JSX grid**

In the grid `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">` that contains the neighbourhood Select and postcode Input, replace:

```tsx
<Select
  label="Neighbourhood"
  options={neighbourhoodOptions}
  value={neighbourhood}
  onChange={(e) => setNeighbourhood(e.target.value)}
/>
```

with:

```tsx
<NeighbourhoodTypeahead
  value={neighbourhood}
  onChange={setNeighbourhood}
/>
```

**Step 5: Check if `Select` is still imported/used elsewhere in this file**

If `Select` is no longer used anywhere in this file, the import was already removed in Step 1. Good.

**Step 6: Verify it compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add src/components/profile/ProfileForm.tsx
git commit -m "feat: replace neighbourhood select with typeahead in ProfileForm"
```

---

### Task 7: Add RLS insert/upsert policy for neighbourhoods table

**Files:**
- Create: `supabase/migrations/009_neighbourhood_insert_policy.sql`

**Context:** Currently only a `SELECT` RLS policy exists on `neighbourhoods`. The `ensureNeighbourhoodExists` function needs `INSERT` permission for authenticated users. Without this, the upsert will be silently blocked by RLS.

**Step 1: Create the migration**

```sql
-- Allow authenticated users to insert new neighbourhoods.
-- This supports the typeahead flow where selecting a place
-- from the OS Names API upserts it into the neighbourhoods table.

CREATE POLICY "Authenticated users can insert neighbourhoods"
  ON public.neighbourhoods FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

**Step 2: Commit**

```bash
git add supabase/migrations/009_neighbourhood_insert_policy.sql
git commit -m "feat: add RLS insert policy for neighbourhoods table"
```

---

### Task 8: Update seed data for local dev database

**Files:**
- Modify: `supabase/migrations/002_neighbourhoods.sql`

**Context:** The existing migration seeds 49 hardcoded neighbourhoods. These remain valid — they're real places that seed users reference. No changes needed to the seed values. However, the seed data in `supabase/seed.sql` references neighbourhoods like `Wickersley`, `Maltby`, `Bramley`, `Swinton`, and `Rawmarsh` in the `raw_user_meta_data` — these already exist in the migration seed, so the FK constraint is satisfied.

The key insight: the migration already handles stale profiles via the `INSERT ... SELECT DISTINCT ... ON CONFLICT DO NOTHING` block (line 83-86 of `002_neighbourhoods.sql`). No seed changes are required because:

1. Migration 002 seeds all neighbourhoods the test users reference
2. The `ON CONFLICT DO NOTHING` ensures new runtime inserts from the typeahead are safe
3. `supabase db reset` runs migrations then `seed.sql` — the order is correct

**Step 1: Verify the local database resets cleanly**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && supabase db reset`
Expected: Resets without errors, all migrations apply, seed data loads

**Step 2: Verify the FK constraint is satisfied**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && supabase db reset && echo "SELECT p.id, p.neighbourhood FROM profiles p LEFT JOIN neighbourhoods n ON p.neighbourhood = n.name WHERE n.name IS NULL;" | supabase db execute`
Expected: No rows returned (all profile neighbourhoods exist in the neighbourhoods table)

**Step 3: Commit (only if changes were needed)**

If `supabase db reset` failed and you had to adjust anything, commit those fixes.

---

### Task 9: Update static fallback list with sync docs

**Files:**
- Modify: `src/data/neighbourhoods.ts`

**Context:** The static `NEIGHBOURHOODS` array is now a fallback for when the API key is missing or the DB is unreachable. Add documentation explaining this.

**Step 1: Add a doc comment at the top of `src/data/neighbourhoods.ts`**

Add before the existing `export const NEIGHBOURHOODS = [` line:

```typescript
/**
 * Static fallback list of neighbourhoods.
 *
 * Primary sources (in priority order):
 *   1. OS Names API — live typeahead search for any place in Great Britain
 *   2. Supabase `neighbourhoods` table — stores places users have selected
 *   3. This array — offline/fallback only
 *
 * This list is used when both the API and database are unreachable.
 * It does NOT need to be kept in sync — the database is the source of truth.
 */
```

**Step 2: Commit**

```bash
git add src/data/neighbourhoods.ts
git commit -m "docs: add source-of-truth hierarchy to static neighbourhoods list"
```

---

### Task 10: Build, lint, and verify end-to-end

**Step 1: Run the full build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npm run build`
Expected: Build completes without errors

**Step 2: Run lint**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npm run lint`
Expected: No lint errors

**Step 3: Reset local database**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && supabase db reset`
Expected: Completes without errors

**Step 4: Spot-check in browser**

Start dev server: `npm run dev`

Test the **Sign Up page** (`/signup`):
- The neighbourhood field is now a text input, not a dropdown
- Typing "Wick" shows results like "Wickersley" (Village, South Yorkshire)
- Clicking a result fills the input and clears the dropdown
- Arrow keys navigate the dropdown, Enter selects, Escape closes
- Submitting with no neighbourhood selected shows validation error
- Submitting with a selected neighbourhood succeeds (sign-up flow)

Test the **Edit Profile page** (`/profile/edit`):
- The neighbourhood field shows the user's current neighbourhood as text
- Clearing it and typing shows typeahead results
- Saving a new neighbourhood from the typeahead updates the profile

Test **without API key** (temporarily remove `VITE_OS_NAMES_API_KEY` from `.env.local`):
- Typing in the neighbourhood field should filter the static fallback list
- Selecting from the fallback list works normally

**Step 5: Final commit (if any lint/build fixes needed)**

```bash
git add -A
git commit -m "chore: lint and build fixes"
```
