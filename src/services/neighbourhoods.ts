import { supabase } from '@/lib/supabase'
import { NEIGHBOURHOODS } from '@/data/neighbourhoods'

/**
 * Fetch all neighbourhoods from the database.
 * Falls back to the static list if the query fails.
 */
export async function getNeighbourhoods(): Promise<string[]> {
  const { data, error } = await supabase
    .from('neighbourhoods')
    .select('name')
    .order('name')

  if (error || !data?.length) {
    return [...NEIGHBOURHOODS]
  }

  return data.map((row) => row.name)
}

/**
 * Ensure a neighbourhood exists in the database.
 * Inserts it if missing; silently succeeds if already present.
 * Call this when a user selects a place from the typeahead,
 * before storing it on their profile.
 *
 * Throws on failure so callers can handle FK constraint issues
 * before attempting to save a profile.
 */
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
