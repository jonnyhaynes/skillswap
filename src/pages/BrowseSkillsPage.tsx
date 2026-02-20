import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import type { SkillCategory, ListingType, User } from '@/types'
import { useSkills } from '@/hooks/useSkills'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'
import { filterSkills } from '@/utils/filterSkills'
import { sortSkills, type SortOption } from '@/utils/sortSkills'
import { SkillGrid } from '@/components/skills/SkillGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { FilterToolbar } from '@/components/skills/FilterToolbar'
import { ActiveFilters } from '@/components/skills/ActiveFilters'
import type { PlaceResult } from '@/services/osNames'
import { getNeighbourhoodCoords, type NeighbourhoodCoords } from '@/services/neighbourhoods'
import { trackSearch } from '@/lib/analytics'

const PAGE_SIZE = 18

export function BrowseSkillsPage() {
  const { listings, loading, initialized } = useSkills()
  const [searchParams] = useSearchParams()
  const { currentUser, fetchUsersByIds } = useAuth()

  const fetchUsersByIdsRef = useRef(fetchUsersByIds)
  fetchUsersByIdsRef.current = fetchUsersByIds

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>([])
  const [listingType, setListingType] = useState<ListingType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<PlaceResult | null>(null)

  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map())
  const [usersLoading, setUsersLoading] = useState(true)

  const [neighbourhoodCoordsMap, setNeighbourhoodCoordsMap] = useState<Map<string, NeighbourhoodCoords>>(new Map())

  const debouncedQuery = useDebounce(searchQuery, 300)

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [debouncedQuery, selectedCategories, listingType, sortBy, selectedNeighbourhood])

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      trackSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  useEffect(() => {
    let cancelled = false
    getNeighbourhoodCoords()
      .then((coords) => {
        if (!cancelled) setNeighbourhoodCoordsMap(coords)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (listings.length === 0) {
      setUsersLoading(false)
      return
    }

    let cancelled = false
    const userIds = [...new Set(listings.map((l) => l.userId))]
    fetchUsersByIdsRef.current(userIds)
      .then((users) => {
        if (cancelled) return
        const map = new Map<string, User>()
        users.forEach((u) => map.set(u.id, u))
        setUsersMap(map)
        setUsersLoading(false)
      })
      .catch(() => {
        if (!cancelled) setUsersLoading(false)
      })
    return () => { cancelled = true }
  }, [listings])

  const referenceCoords = useMemo<NeighbourhoodCoords | null>(() => {
    if (selectedNeighbourhood) {
      // Prefer coordinates from the OS API response
      if (selectedNeighbourhood.latitude && selectedNeighbourhood.longitude) {
        return { latitude: selectedNeighbourhood.latitude, longitude: selectedNeighbourhood.longitude }
      }
      // Fallback: look up coordinates from the neighbourhoods table
      const dbCoords = neighbourhoodCoordsMap.get(selectedNeighbourhood.name)
      if (dbCoords) return dbCoords
    }
    if (currentUser?.neighbourhood) {
      const userCoords = neighbourhoodCoordsMap.get(currentUser.neighbourhood)
      if (userCoords) return userCoords
    }
    return null
  }, [selectedNeighbourhood, currentUser, neighbourhoodCoordsMap])

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

  const visibleListings = useMemo(
    () => filteredAndSorted.slice(0, visibleCount),
    [filteredAndSorted, visibleCount]
  )

  const remainingCount = filteredAndSorted.length - visibleListings.length

  const handleNeighbourhoodChange = (place: PlaceResult | null) => {
    setSelectedNeighbourhood(place)
    if (place) {
      setSortBy('nearest')
    } else if (sortBy === 'nearest') {
      setSortBy('newest')
    }
  }

  const handleClearAll = () => {
    setSelectedCategories([])
    setListingType('all')
    setSearchQuery('')
    setSelectedNeighbourhood(null)
    if (sortBy === 'nearest') setSortBy('newest')
  }

  if (!initialized || loading || usersLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Browse Skills</h1>
          <p className="text-slate-500 mt-1">Find skills in your neighbourhood</p>
        </div>
        {/* Toolbar skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="flex-1 h-12 rounded-xl skeleton-shimmer" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
        <SkeletonGrid count={8} />
      </div>
    )
  }

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 font-display">Browse Skills</h1>
        <p className="text-slate-500 mt-1">Find skills in your neighbourhood</p>
      </div>

      {/* Filter toolbar */}
      <div className="mb-4">
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          listingType={listingType}
          onListingTypeChange={setListingType}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedNeighbourhood={selectedNeighbourhood}
          onNeighbourhoodChange={handleNeighbourhoodChange}
          referenceCoords={referenceCoords}
        />
      </div>

      {/* Active filter chips */}
      <div className="mb-4">
        <ActiveFilters
          selectedCategories={selectedCategories}
          onRemoveCategory={(cat) =>
            setSelectedCategories((prev) => prev.filter((c) => c !== cat))
          }
          listingType={listingType}
          onClearType={() => setListingType('all')}
          selectedNeighbourhood={selectedNeighbourhood}
          onClearNeighbourhood={() => handleNeighbourhoodChange(null)}
          searchQuery={debouncedQuery}
          onClearSearch={() => setSearchQuery('')}
          resultCount={filteredAndSorted.length}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Results grid — full width now */}
      <SkillGrid
        listings={visibleListings}
        preloadedUsers={usersMap}
        onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
        remainingCount={remainingCount}
      />
    </div>
  )
}
