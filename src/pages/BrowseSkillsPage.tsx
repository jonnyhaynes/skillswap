import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { SkillCategory, ListingType } from '@/types'
import { useSkills } from '@/hooks/useSkills'
import { useDebounce } from '@/hooks/useDebounce'
import { filterSkills } from '@/utils/filterSkills'
import { sortSkills, type SortOption } from '@/utils/sortSkills'
import { CATEGORIES } from '@/data/categories'
import { SearchBar } from '@/components/skills/SearchBar'
import { CategoryFilter } from '@/components/skills/CategoryFilter'
import { SkillGrid } from '@/components/skills/SkillGrid'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

const TYPE_OPTIONS: { value: ListingType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'offered', label: 'Offered' },
  { value: 'wanted', label: 'Seeking' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-asc', label: 'A–Z' },
  { value: 'title-desc', label: 'Z–A' },
]

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
            <div className="space-y-6">
              {/* Search bar */}
              <div className="h-12 rounded-xl skeleton-shimmer" />

              {/* Categories */}
              <div>
                <div className="h-3 w-20 rounded skeleton-shimmer mb-3" />
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-9 rounded-lg skeleton-shimmer" />
                  ))}
                </div>
              </div>

              {/* Type pills */}
              <div>
                <div className="h-3 w-10 rounded skeleton-shimmer mb-3" />
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-16 rounded-lg skeleton-shimmer" />
                  ))}
                </div>
              </div>

              {/* Sort pills */}
              <div>
                <div className="h-3 w-14 rounded skeleton-shimmer mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-14 rounded-lg skeleton-shimmer" />
                  ))}
                </div>
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
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setListingType(opt.value)}
              aria-pressed={listingType === opt.value}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                listingType === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Sort by
        </h3>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort order">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              aria-pressed={sortBy === opt.value}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                sortBy === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
            className="w-full block rounded-xl bg-primary-600 hover:bg-primary-700 px-3 py-2 text-center text-sm font-semibold text-white transition-all duration-200"
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
              {selectedCategories.length > 0 && (
                <> in {selectedCategories.map((c) => CATEGORIES.find((cat) => cat.id === c)?.label).filter(Boolean).join(', ')}</>
              )}
              {listingType !== 'all' && (
                <> · {listingType === 'offered' ? 'Offered' : 'Seeking'}</>
              )}
              {debouncedQuery && (
                <> · &ldquo;{debouncedQuery}&rdquo;</>
              )}
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedCategories([])
                  setListingType('all')
                  setSearchQuery('')
                }}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <SkillGrid listings={filteredAndSorted} />
        </div>
      </div>
    </div>
  )
}
