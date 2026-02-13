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
