# Browse Page Neighbourhood Filter & Distance Sort — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add neighbourhood filtering and distance-based sorting to the browse page so users can discover skills near them.

**Architecture:** Client-side Haversine distance calculation. Store lat/lng on the `neighbourhoods` table, capture coordinates from the OS Names API (converting BNG→WGS84), and sort/filter listings on the browse page using a neighbourhood typeahead + "Nearest" sort option.

**Tech Stack:** React, TypeScript, Supabase (Postgres), Vite, Tailwind CSS, OS Names API

---

### Task 1: Database Migration — Add lat/lng columns to neighbourhoods

**Files:**
- Create: `supabase/migrations/010_neighbourhood_coordinates.sql`

**Step 1: Create the migration file**

```sql
-- Add latitude/longitude columns to neighbourhoods table
-- Stores WGS84 coordinates for distance calculations

ALTER TABLE public.neighbourhoods
  ADD COLUMN latitude DOUBLE PRECISION,
  ADD COLUMN longitude DOUBLE PRECISION;
```

**Step 2: Verify migration is valid SQL**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx supabase migration list`

**Step 3: Commit**

```bash
git add supabase/migrations/010_neighbourhood_coordinates.sql
git commit -m "feat: add lat/lng columns to neighbourhoods table"
```

---

### Task 2: Update TypeScript database types

**Files:**
- Modify: `src/types/database.ts:318-335`

**Step 1: Add latitude and longitude to neighbourhoods types**

Update the `neighbourhoods` block in `database.ts` to:

```typescript
neighbourhoods: {
  Row: {
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    created_at: string
  }
  Insert: {
    id?: string
    name: string
    latitude?: number | null
    longitude?: number | null
    created_at?: string
  }
  Update: {
    id?: string
    name?: string
    latitude?: number | null
    longitude?: number | null
    created_at?: string
  }
  Relationships: []
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add lat/lng to neighbourhoods database types"
```

---

### Task 3: Seed neighbourhoods with coordinates

**Files:**
- Modify: `supabase/migrations/002_neighbourhoods.sql:18-68`

**Step 1: Update the INSERT block to include lat/lng for all 48 neighbourhoods**

Replace the existing `INSERT INTO public.neighbourhoods (name) VALUES ...` block with an insert that includes latitude and longitude columns. Use WGS84 coordinates for each South Yorkshire neighbourhood (look up approximate coords).

The format should be:
```sql
INSERT INTO public.neighbourhoods (name, latitude, longitude) VALUES
  ('Aston cum Aughton', 53.3547, -1.2862),
  ('Aughton Common', 53.3500, -1.2700),
  ...etc for all 48 places...
```

Also update the `CREATE TABLE` statement at lines 8-12 to include the columns:
```sql
CREATE TABLE public.neighbourhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important:** This migration runs before migration 010. The columns must be declared in the CREATE TABLE here AND in 010 (which uses ALTER TABLE for existing databases). On a fresh `supabase db reset` the CREATE TABLE already has the columns and the ALTER TABLE in 010 will need `IF NOT EXISTS` or be made idempotent. Alternatively, keep 002 as-is for the CREATE TABLE and only populate coords via an UPDATE in 010 after the ALTER TABLE. **Recommended approach:** Add columns to the CREATE TABLE in 002, and in migration 010 use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so both fresh and existing databases work.

Update migration 010 to use:
```sql
ALTER TABLE public.neighbourhoods
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
```

Then add UPDATE statements in 010 for all 48 neighbourhoods:
```sql
UPDATE public.neighbourhoods SET latitude = 53.3547, longitude = -1.2862 WHERE name = 'Aston cum Aughton';
UPDATE public.neighbourhoods SET latitude = 53.3500, longitude = -1.2700 WHERE name = 'Aughton Common';
-- ...etc for all 48
```

**Step 2: Commit**

```bash
git add supabase/migrations/002_neighbourhoods.sql supabase/migrations/010_neighbourhood_coordinates.sql
git commit -m "feat: seed neighbourhood coordinates for all 48 places"
```

---

### Task 4: BNG→WGS84 conversion and OS Names API coordinate extraction

**Files:**
- Modify: `src/services/osNames.ts`

**Step 1: Add BNG to WGS84 conversion function**

Add this function to `osNames.ts` (before `searchPlaces`):

```typescript
/**
 * Convert British National Grid (EPSG:27700) easting/northing
 * to WGS84 latitude/longitude.
 * Uses an iterative approach with Helmert transformation.
 */
function bngToLatLng(
  easting: number,
  northing: number
): { latitude: number; longitude: number } {
  // Airy 1830 ellipsoid
  const a = 6377563.396
  const b = 6356256.909
  const F0 = 0.9996012717
  const lat0 = (49 * Math.PI) / 180
  const lon0 = (-2 * Math.PI) / 180
  const N0 = -100000
  const E0 = 400000

  const e2 = 1 - (b * b) / (a * a)
  const n = (a - b) / (a + b)
  const n2 = n * n
  const n3 = n * n * n

  let lat = lat0
  let M = 0

  // Iterate to find latitude
  do {
    lat = ((northing - N0 - M) / (a * F0)) + lat

    const Ma = (1 + n + (5 / 4) * n2 + (5 / 4) * n3) * (lat - lat0)
    const Mb = (3 * n + 3 * n2 + (21 / 8) * n3) * Math.sin(lat - lat0) * Math.cos(lat + lat0)
    const Mc = ((15 / 8) * n2 + (15 / 8) * n3) * Math.sin(2 * (lat - lat0)) * Math.cos(2 * (lat + lat0))
    const Md = (35 / 24) * n3 * Math.sin(3 * (lat - lat0)) * Math.cos(3 * (lat + lat0))
    M = b * F0 * (Ma - Mb + Mc - Md)
  } while (Math.abs(northing - N0 - M) >= 0.00001)

  const sinLat = Math.sin(lat)
  const cosLat = Math.cos(lat)
  const tanLat = Math.tan(lat)

  const nu = (a * F0) / Math.sqrt(1 - e2 * sinLat * sinLat)
  const rho = (a * F0 * (1 - e2)) / Math.pow(1 - e2 * sinLat * sinLat, 1.5)
  const eta2 = nu / rho - 1

  const tanLat2 = tanLat * tanLat
  const tanLat4 = tanLat2 * tanLat2
  const tanLat6 = tanLat4 * tanLat2

  const secLat = 1 / cosLat
  const nu3 = nu * nu * nu
  const nu5 = nu3 * nu * nu
  const nu7 = nu5 * nu * nu
  const dE = easting - E0

  const VII = tanLat / (2 * rho * nu)
  const VIII = (tanLat / (24 * rho * nu3)) * (5 + 3 * tanLat2 + eta2 - 9 * tanLat2 * eta2)
  const IX = (tanLat / (720 * rho * nu5)) * (61 + 90 * tanLat2 + 45 * tanLat4)
  const X = secLat / nu
  const XI = (secLat / (6 * nu3)) * (nu / rho + 2 * tanLat2)
  const XII = (secLat / (120 * nu5)) * (5 + 28 * tanLat2 + 24 * tanLat4)
  const XIIA = (secLat / (5040 * nu7)) * (61 + 662 * tanLat2 + 1320 * tanLat4 + 720 * tanLat6)

  const osgbLat = lat - VII * dE * dE + VIII * Math.pow(dE, 4) - IX * Math.pow(dE, 6)
  const osgbLon = lon0 + X * dE - XI * Math.pow(dE, 3) + XII * Math.pow(dE, 5) - XIIA * Math.pow(dE, 7)

  // Helmert transformation from OSGB36 to WGS84
  const sinOsgbLat = Math.sin(osgbLat)
  const cosOsgbLat = Math.cos(osgbLat)
  const sinOsgbLon = Math.sin(osgbLon)
  const cosOsgbLon = Math.cos(osgbLon)

  const airy_a = 6377563.396
  const airy_b = 6356256.909
  const airy_e2 = 1 - (airy_b * airy_b) / (airy_a * airy_a)
  const v = airy_a / Math.sqrt(1 - airy_e2 * sinOsgbLat * sinOsgbLat)

  const x1 = (v + 0) * cosOsgbLat * cosOsgbLon
  const y1 = (v + 0) * cosOsgbLat * sinOsgbLon
  const z1 = ((1 - airy_e2) * v + 0) * sinOsgbLat

  // Helmert parameters (OSGB36 → WGS84)
  const tx = 446.448
  const ty = -125.157
  const tz = 542.06
  const s = -20.4894 / 1e6
  const rx = (0.1502 / 3600) * (Math.PI / 180)
  const ry = (0.247 / 3600) * (Math.PI / 180)
  const rz = (0.8421 / 3600) * (Math.PI / 180)

  const x2 = tx + (1 + s) * x1 + -rz * y1 + ry * z1
  const y2 = ty + rz * x1 + (1 + s) * y1 + -rx * z1
  const z2 = tz + -ry * x1 + rx * y1 + (1 + s) * z1

  // Convert Cartesian to WGS84 lat/lon
  const wgs_a = 6378137.0
  const wgs_b = 6356752.3142
  const wgs_e2 = 1 - (wgs_b * wgs_b) / (wgs_a * wgs_a)

  const p = Math.sqrt(x2 * x2 + y2 * y2)
  let wgsLat = Math.atan2(z2, p * (1 - wgs_e2))

  for (let i = 0; i < 10; i++) {
    const sinWgsLat = Math.sin(wgsLat)
    const v2 = wgs_a / Math.sqrt(1 - wgs_e2 * sinWgsLat * sinWgsLat)
    wgsLat = Math.atan2(z2 + wgs_e2 * v2 * sinWgsLat, p)
  }
  const wgsLon = Math.atan2(y2, x2)

  return {
    latitude: (wgsLat * 180) / Math.PI,
    longitude: (wgsLon * 180) / Math.PI,
  }
}
```

**Step 2: Extend PlaceResult interface**

```typescript
export interface PlaceResult {
  name: string
  localType: string
  county: string
  latitude?: number
  longitude?: number
}
```

**Step 3: Update searchPlaces to extract and convert coordinates**

In the `for` loop inside `searchPlaces()`, after extracting `name`, extract coords:

```typescript
const geometryX = entry.GEOMETRY_X as number | undefined
const geometryY = entry.GEOMETRY_Y as number | undefined

let latitude: number | undefined
let longitude: number | undefined

if (geometryX && geometryY) {
  const coords = bngToLatLng(geometryX, geometryY)
  latitude = coords.latitude
  longitude = coords.longitude
}

places.push({
  name,
  localType: entry.LOCAL_TYPE as string,
  county: (entry.COUNTY_UNITARY as string) || '',
  latitude,
  longitude,
})
```

**Step 4: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 5: Commit**

```bash
git add src/services/osNames.ts
git commit -m "feat: extract and convert BNG coords to WGS84 from OS Names API"
```

---

### Task 5: Extend ensureNeighbourhoodExists to accept coordinates

**Files:**
- Modify: `src/services/neighbourhoods.ts`

**Step 1: Update function signature and upsert logic**

```typescript
export async function ensureNeighbourhoodExists(
  name: string,
  latitude?: number,
  longitude?: number,
): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) return

  const row: { name: string; latitude?: number; longitude?: number } = { name: trimmed }
  if (latitude !== undefined && longitude !== undefined) {
    row.latitude = latitude
    row.longitude = longitude
  }

  const { error } = await supabase
    .from('neighbourhoods')
    .upsert(row, { onConflict: 'name' })

  if (error) {
    throw new Error(`Failed to ensure neighbourhood exists: ${error.message}`)
  }
}
```

**Step 2: Add getNeighbourhoodCoords function**

```typescript
export interface NeighbourhoodCoords {
  latitude: number
  longitude: number
}

/**
 * Fetch all neighbourhoods that have coordinates.
 * Returns a Map of neighbourhood name → coords for distance lookups.
 */
export async function getNeighbourhoodCoords(): Promise<Map<string, NeighbourhoodCoords>> {
  const { data, error } = await supabase
    .from('neighbourhoods')
    .select('name, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  const coordsMap = new Map<string, NeighbourhoodCoords>()

  if (error || !data) return coordsMap

  for (const row of data) {
    if (row.latitude != null && row.longitude != null) {
      coordsMap.set(row.name, {
        latitude: row.latitude,
        longitude: row.longitude,
      })
    }
  }

  return coordsMap
}
```

**Step 3: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 4: Commit**

```bash
git add src/services/neighbourhoods.ts
git commit -m "feat: extend ensureNeighbourhoodExists with coords, add getNeighbourhoodCoords"
```

---

### Task 6: Update NeighbourhoodTypeahead onChange signature

**Files:**
- Modify: `src/components/ui/NeighbourhoodTypeahead.tsx`

**Step 1: Change onChange to pass PlaceResult | null**

Update the interface:
```typescript
import { type PlaceResult } from '@/services/osNames'

interface NeighbourhoodTypeaheadProps {
  value: string
  onChange: (place: PlaceResult | null) => void
  label?: string
  required?: boolean
  id?: string
  error?: string
}
```

Update `handleInputChange` — when the user edits after selecting, emit null:
```typescript
if (value && val !== value) {
  onChange(null)
}
```

Update `selectPlace` — pass the full PlaceResult:
```typescript
function selectPlace(place: PlaceResult) {
  setQuery(place.name)
  onChange(place)
  setIsOpen(false)
  setResults([])
  inputRef.current?.focus()
}
```

**Step 2: Verify build (expect errors in SignUpForm and ProfileForm — fixed in next tasks)**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`
Expected: Type errors in `SignUpForm.tsx` and `ProfileForm.tsx`

**Step 3: Commit**

```bash
git add src/components/ui/NeighbourhoodTypeahead.tsx
git commit -m "feat: change NeighbourhoodTypeahead onChange to pass full PlaceResult"
```

---

### Task 7: Update SignUpForm to handle new onChange shape

**Files:**
- Modify: `src/components/auth/SignUpForm.tsx`

**Step 1: Update form data and handlers**

Import PlaceResult:
```typescript
import type { PlaceResult } from '@/services/osNames'
```

Add state for coords:
```typescript
const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{ latitude?: number; longitude?: number }>({})
```

Update the NeighbourhoodTypeahead onChange handler (around line 197-201):
```typescript
<NeighbourhoodTypeahead
  value={formData.neighbourhood}
  onChange={(place) => {
    setFormData((prev) => ({ ...prev, neighbourhood: place?.name ?? '' }))
    setNeighbourhoodCoords({
      latitude: place?.latitude,
      longitude: place?.longitude,
    })
  }}
  required
/>
```

Update the `ensureNeighbourhoodExists` call (around line 85):
```typescript
await ensureNeighbourhoodExists(
  formData.neighbourhood,
  neighbourhoodCoords.latitude,
  neighbourhoodCoords.longitude,
)
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 3: Commit**

```bash
git add src/components/auth/SignUpForm.tsx
git commit -m "feat: pass neighbourhood coords from SignUpForm to ensureNeighbourhoodExists"
```

---

### Task 8: Update ProfileForm to handle new onChange shape

**Files:**
- Modify: `src/components/profile/ProfileForm.tsx`

**Step 1: Update form state and handlers**

Import PlaceResult:
```typescript
import type { PlaceResult } from '@/services/osNames'
```

Add state for coords:
```typescript
const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{ latitude?: number; longitude?: number }>({})
```

Update the NeighbourhoodTypeahead (around line 195-198):
```typescript
<NeighbourhoodTypeahead
  value={neighbourhood}
  onChange={(place) => {
    setNeighbourhood(place?.name ?? '')
    setNeighbourhoodCoords({
      latitude: place?.latitude,
      longitude: place?.longitude,
    })
  }}
/>
```

Update `ensureNeighbourhoodExists` call in handleSubmit (around line 91):
```typescript
await ensureNeighbourhoodExists(
  neighbourhood,
  neighbourhoodCoords.latitude,
  neighbourhoodCoords.longitude,
)
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 3: Commit**

```bash
git add src/components/profile/ProfileForm.tsx
git commit -m "feat: pass neighbourhood coords from ProfileForm to ensureNeighbourhoodExists"
```

---

### Task 9: Create Haversine distance utility

**Files:**
- Create: `src/utils/distance.ts`

**Step 1: Create the utility**

```typescript
/**
 * Calculate the distance between two WGS84 coordinates using the Haversine formula.
 * Returns distance in miles.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 3: Commit**

```bash
git add src/utils/distance.ts
git commit -m "feat: add Haversine distance utility"
```

---

### Task 10: Extend sortSkills with "nearest" option

**Files:**
- Modify: `src/utils/sortSkills.ts`

**Step 1: Add nearest sort option**

```typescript
import type { SkillListing, User } from '@/types'
import { haversineDistance } from './distance'
import type { NeighbourhoodCoords } from '@/services/neighbourhoods'

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'nearest'

interface SortContext {
  /** Reference point for distance sorting */
  referenceCoords?: NeighbourhoodCoords | null
  /** Map of userId → User for looking up neighbourhoods */
  usersMap?: Map<string, User>
  /** Map of neighbourhood name → coords */
  neighbourhoodCoords?: Map<string, NeighbourhoodCoords>
}

export function sortSkills(
  listings: SkillListing[],
  sortBy: SortOption,
  context?: SortContext,
): SkillListing[] {
  const sorted = [...listings]

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'nearest': {
      if (!context?.referenceCoords || !context.usersMap || !context.neighbourhoodCoords) {
        return sorted
      }
      const ref = context.referenceCoords
      return sorted.sort((a, b) => {
        const distA = getListingDistance(a, ref, context.usersMap!, context.neighbourhoodCoords!)
        const distB = getListingDistance(b, ref, context.usersMap!, context.neighbourhoodCoords!)
        return distA - distB
      })
    }
    default:
      return sorted
  }
}

function getListingDistance(
  listing: SkillListing,
  ref: NeighbourhoodCoords,
  usersMap: Map<string, User>,
  neighbourhoodCoords: Map<string, NeighbourhoodCoords>,
): number {
  const user = usersMap.get(listing.userId)
  if (!user) return Infinity
  const coords = neighbourhoodCoords.get(user.neighbourhood)
  if (!coords) return Infinity
  return haversineDistance(ref.latitude, ref.longitude, coords.latitude, coords.longitude)
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 3: Commit**

```bash
git add src/utils/sortSkills.ts
git commit -m "feat: add nearest sort option with Haversine distance"
```

---

### Task 11: Update SkillGrid to accept optional users prop

**Files:**
- Modify: `src/components/skills/SkillGrid.tsx`

**Step 1: Add optional users prop**

The browse page will pass pre-fetched user data. When provided, SkillGrid skips its own fetch. When not provided (e.g. homepage), it fetches as before.

Update the props interface:
```typescript
interface SkillGridProps {
  listings: SkillListing[]
  staggerReveal?: boolean
  /** Pre-fetched user map. When provided, SkillGrid skips its own user fetch. */
  preloadedUsers?: Map<string, User>
}
```

Update the component to use preloaded users when available:
```typescript
export function SkillGrid({ listings, staggerReveal, preloadedUsers }: SkillGridProps) {
  const { fetchUsersByIds } = useAuth()
  const [users, setUsers] = useState<Map<string, User>>(preloadedUsers ?? new Map())
  const [loading, setLoading] = useState(!preloadedUsers && listings.length > 0)

  useEffect(() => {
    // Skip fetching if users were preloaded
    if (preloadedUsers) {
      setUsers(preloadedUsers)
      setLoading(false)
      return
    }

    if (listings.length === 0) return

    let cancelled = false
    const userIds = [...new Set(listings.map((l) => l.userId))]

    fetchUsersByIds(userIds).then((fetchedUsers) => {
      if (cancelled) return
      const userMap = new Map<string, User>()
      fetchedUsers.forEach((user) => userMap.set(user.id, user))
      setUsers(userMap)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [listings, fetchUsersByIds, preloadedUsers])

  // ...rest unchanged
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 3: Commit**

```bash
git add src/components/skills/SkillGrid.tsx
git commit -m "feat: add optional preloadedUsers prop to SkillGrid"
```

---

### Task 12: Rebuild BrowseSkillsPage with neighbourhood filter and nearest sort

**Files:**
- Modify: `src/pages/BrowseSkillsPage.tsx`

This is the largest task. It involves:
1. Moving user data fetching up to the page level
2. Adding neighbourhood typeahead filter to the sidebar
3. Adding "Nearest" sort option
4. Fetching neighbourhood coords for distance calculations
5. Updating the results summary
6. Updating the active filter count
7. Passing user data down to SkillGrid

**Step 1: Add new imports**

```typescript
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import type { PlaceResult } from '@/services/osNames'
import { getNeighbourhoodCoords, type NeighbourhoodCoords } from '@/services/neighbourhoods'
import { useAuth } from '@/hooks/useAuth'
```

**Step 2: Add state for neighbourhood filter, users, and neighbourhood coords**

Inside the component, add:

```typescript
const { currentUser, fetchUsersByIds } = useAuth()

// Neighbourhood filter state
const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<PlaceResult | null>(null)

// User data (moved up from SkillGrid for distance calculations)
const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map())
const [usersLoading, setUsersLoading] = useState(true)

// Neighbourhood coordinates for distance calculations
const [neighbourhoodCoordsMap, setNeighbourhoodCoordsMap] = useState<Map<string, NeighbourhoodCoords>>(new Map())
```

**Step 3: Fetch neighbourhood coords on mount**

```typescript
useEffect(() => {
  getNeighbourhoodCoords().then(setNeighbourhoodCoordsMap)
}, [])
```

**Step 4: Fetch users for all listings**

```typescript
useEffect(() => {
  if (listings.length === 0) {
    setUsersLoading(false)
    return
  }

  const userIds = [...new Set(listings.map((l) => l.userId))]
  fetchUsersByIds(userIds).then((users) => {
    const map = new Map<string, User>()
    users.forEach((u) => map.set(u.id, u))
    setUsersMap(map)
    setUsersLoading(false)
  })
}, [listings, fetchUsersByIds])
```

**Step 5: Update SORT_OPTIONS to include Nearest**

```typescript
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-asc', label: 'A–Z' },
  { value: 'title-desc', label: 'Z–A' },
  { value: 'nearest', label: 'Nearest' },
]
```

**Step 6: Compute reference coords for distance sorting**

```typescript
// Reference coords: selected neighbourhood filter coords, or logged-in user's neighbourhood
const referenceCoords = useMemo<NeighbourhoodCoords | null>(() => {
  if (selectedNeighbourhood?.latitude && selectedNeighbourhood?.longitude) {
    return { latitude: selectedNeighbourhood.latitude, longitude: selectedNeighbourhood.longitude }
  }
  if (currentUser?.neighbourhood) {
    const userCoords = neighbourhoodCoordsMap.get(currentUser.neighbourhood)
    if (userCoords) return userCoords
  }
  return null
}, [selectedNeighbourhood, currentUser, neighbourhoodCoordsMap])
```

**Step 7: Update filteredAndSorted to pass sort context**

```typescript
const filteredAndSorted = useMemo(() => {
  const filtered = filterSkills(listings, {
    query: debouncedQuery,
    categories: selectedCategories,
    listingType,
  })
  return sortSkills(filtered, sortBy, {
    referenceCoords,
    usersMap,
    neighbourhoodCoords: neighbourhoodCoordsMap,
  })
}, [listings, debouncedQuery, selectedCategories, listingType, sortBy, referenceCoords, usersMap, neighbourhoodCoordsMap])
```

**Step 8: Update activeFilterCount**

```typescript
const activeFilterCount = selectedCategories.length
  + (listingType !== 'all' ? 1 : 0)
  + (selectedNeighbourhood ? 1 : 0)
```

**Step 9: Add neighbourhood typeahead to filtersSidebar**

Insert between `<SearchBar>` and the Categories `<div>`, inside `filtersSidebar`:

```tsx
<div>
  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
    Neighbourhood
  </h3>
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <NeighbourhoodTypeahead
        value={selectedNeighbourhood?.name ?? ''}
        onChange={(place) => {
          setSelectedNeighbourhood(place)
          // Auto-switch to nearest sort when a neighbourhood is selected
          if (place && referenceCoords) {
            setSortBy('nearest')
          }
        }}
      />
    </div>
    {selectedNeighbourhood && (
      <button
        onClick={() => {
          setSelectedNeighbourhood(null)
          if (sortBy === 'nearest') setSortBy('newest')
        }}
        className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Clear neighbourhood filter"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
</div>
```

**Step 10: Update results summary to show neighbourhood**

In the results summary `<span>`, after the existing filters, add:

```tsx
{selectedNeighbourhood && (
  <> · near {selectedNeighbourhood.name}</>
)}
```

**Step 11: Update clear filters handler**

```typescript
onClick={() => {
  setSelectedCategories([])
  setListingType('all')
  setSearchQuery('')
  setSelectedNeighbourhood(null)
  if (sortBy === 'nearest') setSortBy('newest')
}}
```

**Step 12: Pass preloadedUsers to SkillGrid**

```tsx
<SkillGrid listings={filteredAndSorted} preloadedUsers={usersMap} />
```

**Step 13: Update loading state**

The loading check should also wait for users:
```typescript
if (!initialized || loading || usersLoading) {
```

**Step 14: Add neighbourhood skeleton to the loading sidebar**

After the search bar skeleton, add:
```tsx
{/* Neighbourhood */}
<div>
  <div className="h-3 w-28 rounded skeleton-shimmer mb-3" />
  <div className="h-10 rounded-xl skeleton-shimmer" />
</div>
```

**Step 15: Disable "Nearest" sort when no reference coords**

Update the sort button rendering to disable the Nearest option when there's no reference point:

```tsx
{SORT_OPTIONS.map((opt) => {
  const disabled = opt.value === 'nearest' && !referenceCoords
  return (
    <button
      key={opt.value}
      onClick={() => !disabled && setSortBy(opt.value)}
      aria-pressed={sortBy === opt.value}
      disabled={disabled}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        sortBy === opt.value
          ? 'bg-slate-900 text-white'
          : disabled
            ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
    >
      {opt.label}
    </button>
  )
})}
```

**Step 16: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b --noEmit`

**Step 17: Commit**

```bash
git add src/pages/BrowseSkillsPage.tsx
git commit -m "feat: add neighbourhood filter and nearest sort to browse page"
```

---

### Task 13: Final build verification and manual testing

**Step 1: Full build check**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && tsc -b && vite build`

Expected: Clean build with no errors.

**Step 2: Manual testing checklist**

- [ ] Browse page loads without errors
- [ ] Neighbourhood typeahead appears in the sidebar between Search and Categories
- [ ] Selecting a neighbourhood auto-switches sort to "Nearest"
- [ ] "Nearest" sort pill is disabled (greyed out) when no neighbourhood is selected and user is not logged in
- [ ] Clearing the neighbourhood filter resets sort to "Newest"
- [ ] Results summary shows "near [name]" when neighbourhood is selected
- [ ] Active filter count badge includes neighbourhood
- [ ] "Clear filters" button clears neighbourhood
- [ ] SkillGrid displays correctly with pre-loaded users (no double-fetch)
- [ ] Mobile filter panel shows neighbourhood typeahead
- [ ] Sign-up form still works (coords passed to ensureNeighbourhoodExists)
- [ ] Profile edit form still works (coords passed to ensureNeighbourhoodExists)

**Step 3: Commit any fixes from manual testing**
