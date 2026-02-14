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
  latitude?: number
  longitude?: number
}

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
  }

  return places
}
