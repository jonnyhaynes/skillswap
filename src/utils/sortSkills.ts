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
      const { referenceCoords, usersMap, neighbourhoodCoords } = context ?? {}
      if (!referenceCoords || !usersMap || !neighbourhoodCoords) {
        return sorted
      }
      return sorted.sort((a, b) => {
        const distA = getListingDistance(a, referenceCoords, usersMap, neighbourhoodCoords)
        const distB = getListingDistance(b, referenceCoords, usersMap, neighbourhoodCoords)
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
