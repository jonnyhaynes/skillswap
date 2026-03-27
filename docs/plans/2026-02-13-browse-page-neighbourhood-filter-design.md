# Browse Page Neighbourhood Filter & Distance Sort

## Problem

The browse page subtitle says "Find skills in your neighbourhood" but provides no way to filter or sort by neighbourhood. Users have no way to discover skills near them.

## Approach

Client-side distance calculation using Haversine formula. Store latitude/longitude on the `neighbourhoods` table, capture coords from the OS Names API when users select a neighbourhood, and sort listings by distance on the browse page.

This is the right complexity for current scale. Can migrate to PostGIS later if needed.

## Data Model Changes

### `neighbourhoods` table — new columns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `latitude` | `float8` | `null` | WGS84 latitude |
| `longitude` | `float8` | `null` | WGS84 longitude |

New migration adds the columns. Existing migration `002_neighbourhoods.sql` updated with coords for all 48 seeded neighbourhoods. Seed script updated so test users' neighbourhoods have coords.

### `PlaceResult` type — extended

```ts
export interface PlaceResult {
  name: string
  localType: string
  county: string
  latitude?: number
  longitude?: number
}
```

### `database.ts` types — updated

Add `latitude` and `longitude` (both `number | null`) to the neighbourhoods row/insert/update types.

## OS Names API Coordinate Extraction

The API returns British National Grid (EPSG:27700) coordinates in `GEOMETRY_X` (easting) and `GEOMETRY_Y` (northing). These are converted to WGS84 lat/lng using a pure `bngToLatLng()` function in `osNames.ts` (~30 lines of maths, no external library).

`searchPlaces()` extracts and converts coords for each result. Fallback to static list produces results without coords (acceptable — coords only needed for distance sorting).

## Service Changes

### `ensureNeighbourhoodExists(name, latitude?, longitude?)`

Extended to accept and upsert lat/lng. If a neighbourhood already exists without coords but we now have them, the upsert updates the row. Self-healing data.

### New: fetch neighbourhood coords

A function to fetch all neighbourhoods with their lat/lng as a `Map<string, {latitude, longitude}>` for the browse page to use in distance calculations.

## NeighbourhoodTypeahead Changes

`onChange` signature changes from `(value: string) => void` to `(place: PlaceResult | null) => void`. This passes the full place data (including coords) instead of just the name.

Breaking change — requires updating all callers:
- `SignUpForm` — handle new shape, pass coords to `ensureNeighbourhoodExists()`
- `ProfileForm` — same
- `BrowseSkillsPage` — new caller, uses coords for distance sorting

## Browse Page Changes

### Neighbourhood filter

- Added to sidebar between Search and Categories
- Reuses `NeighbourhoodTypeahead` component
- Clear button to reset selection
- Increments active filter badge count
- Results summary shows selected neighbourhood (e.g. "12 results · near Bramley")

### "Nearest" sort option

- Added to sort pills alongside Newest, Oldest, A-Z, Z-A
- Enabled when we have a reference point:
  1. User selected a neighbourhood in the filter, OR
  2. Logged-in user has a neighbourhood with coords
- Listings without coords sort to the bottom

### Data flow change

User data fetching moves up from `SkillGrid` to `BrowseSkillsPage`. The page needs access to user data for distance calculations before rendering. User map passed down to `SkillGrid` to avoid re-fetching.

## New Utilities

### `src/utils/distance.ts`

Exports `haversineDistance(lat1, lng1, lat2, lng2)` returning distance in miles. Pure function, no dependencies.

### `sortSkills.ts` — extended

New `'nearest'` sort option. Accepts optional reference coords and a way to look up each listing's user neighbourhood coords.

### `filterSkills.ts` — no changes

Distance is handled via sorting, not filtering.

## Not In Scope

- Radius filtering (sort-by-distance naturally surfaces nearby results)
- PostGIS server-side filtering (overkill at current scale)
- "Near you" hero/featured section on browse page
