import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { SkillCategory, ListingType } from '@/types'
import { useSkills } from '@/hooks/useSkills'
import { useDebounce } from '@/hooks/useDebounce'
import { filterSkills } from '@/utils/filterSkills'
import { sortSkills, type SortOption } from '@/utils/sortSkills'
import { SearchBar } from '@/components/skills/SearchBar'
import { CategoryFilter } from '@/components/skills/CategoryFilter'
import { SkillGrid } from '@/components/skills/SkillGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'

export function BrowseSkillsPage() {
  const { listings, loading, initialized } = useSkills()
  const [searchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>([])
  const [listingType, setListingType] = useState<ListingType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const debouncedQuery = useDebounce(searchQuery, 300)

  const filteredAndSorted = useMemo(() => {
    const filtered = filterSkills(listings, {
      query: debouncedQuery,
      categories: selectedCategories,
      listingType,
    })
    return sortSkills(filtered, sortBy)
  }, [listings, debouncedQuery, selectedCategories, listingType, sortBy])

  const activeFilterCount = selectedCategories.length + (listingType !== 'all' ? 1 : 0)

  if (!initialized || loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Browse Skills</h1>
          <p className="text-slate-500 mt-1">Find skills in your neighbourhood</p>
        </div>
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="space-y-4">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </aside>
          <SkeletonGrid count={6} />
        </div>
      </div>
    )
  }

  const filtersSidebar = (
    <div className="space-y-6">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search skills..."
      />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Categories
        </h3>
        <CategoryFilter
          selected={selectedCategories}
          onChange={setSelectedCategories}
          layout="vertical"
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Type
        </h3>
        <select
          id="listing-type"
          value={listingType}
          onChange={(e) => setListingType(e.target.value as ListingType | 'all')}
          className="w-full rounded-xl bg-slate-50 border-0 py-2.5 px-3 text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
        >
          <option value="all">All types</option>
          <option value="offered">Offered</option>
          <option value="wanted">Wanted</option>
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Sort by
        </h3>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full rounded-xl bg-slate-50 border-0 py-2.5 px-3 text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title-asc">A–Z</option>
          <option value="title-desc">Z–A</option>
        </select>
      </div>
    </div>
  )

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 font-display">Browse Skills</h1>
        <p className="text-slate-500 mt-1">Find skills in your neighbourhood</p>
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        className="lg:hidden mb-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile filter panel */}
      {filtersOpen && (
        <div className="lg:hidden mb-6 rounded-2xl bg-white p-5 space-y-5">
          {filtersSidebar}
          <button
            onClick={() => setFiltersOpen(false)}
            className="w-full block rounded-xl bg-gradient-to-r from-[#43c1a6] to-[#6366f1] px-3 py-2 text-center text-sm font-semibold text-white hover:brightness-105 transition-all duration-200"
          >
            Show {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'result' : 'results'}
          </button>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-[88px] space-y-6">
            {filtersSidebar}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500">
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'result' : 'results'}
            </span>
          </div>
          <SkillGrid listings={filteredAndSorted} />
        </div>
      </div>
    </div>
  )
}
