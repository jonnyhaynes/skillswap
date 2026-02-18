import { useState, useEffect } from 'react'
import type { SkillCategory, ListingType } from '@/types'
import type { PlaceResult } from '@/services/osNames'
import type { SortOption } from '@/utils/sortSkills'
import type { NeighbourhoodCoords } from '@/services/neighbourhoods'
import { SearchBar } from '@/components/skills/SearchBar'
import { CategoryFilter } from '@/components/skills/CategoryFilter'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import { FilterPopover } from '@/components/ui/FilterPopover'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/cn'

type FilterName = 'categories' | 'type' | 'location' | 'sort'

const TYPE_OPTIONS: { value: ListingType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'offered', label: 'Offered' },
  { value: 'wanted', label: 'Seeking' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-asc', label: 'A\u2013Z' },
  { value: 'title-desc', label: 'Z\u2013A' },
  { value: 'nearest', label: 'Nearest' },
]

interface FilterToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategories: SkillCategory[]
  onCategoriesChange: (categories: SkillCategory[]) => void
  listingType: ListingType | 'all'
  onListingTypeChange: (type: ListingType | 'all') => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  selectedNeighbourhood: PlaceResult | null
  onNeighbourhoodChange: (place: PlaceResult | null) => void
  referenceCoords: NeighbourhoodCoords | null
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  listingType,
  onListingTypeChange,
  sortBy,
  onSortChange,
  selectedNeighbourhood,
  onNeighbourhoodChange,
  referenceCoords,
}: FilterToolbarProps) {
  const isMobile = useIsMobile()
  const [activeFilter, setActiveFilter] = useState<FilterName | null>(null)

  // Close accordion when resizing to desktop
  useEffect(() => {
    if (!isMobile) setActiveFilter(null)
  }, [isMobile])

  function toggleFilter(name: FilterName) {
    setActiveFilter((prev) => (prev === name ? null : name))
  }

  // Shared filter content — used by both desktop popovers and mobile accordion
  const categoriesContent = (
    <CategoryFilter
      selected={selectedCategories}
      onChange={onCategoriesChange}
      layout="list"
    />
  )

  const typeContent = (
    <div className="flex gap-1.5" role="group" aria-label="Filter by type">
      {TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onListingTypeChange(opt.value)}
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
  )

  const locationContent = (
    <div className="space-y-2">
      <NeighbourhoodTypeahead
        value={selectedNeighbourhood?.name ?? ''}
        onChange={onNeighbourhoodChange}
        label=""
      />
      {selectedNeighbourhood && (
        <button
          onClick={() => onNeighbourhoodChange(null)}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Clear location
        </button>
      )}
    </div>
  )

  const sortContent = (
    <div className="flex flex-col gap-0.5" role="group" aria-label="Sort order">
      {SORT_OPTIONS.map((opt) => {
        const disabled = opt.value === 'nearest' && !referenceCoords
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onSortChange(opt.value)}
            disabled={disabled}
            className={cn(
              'w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              sortBy === opt.value
                ? 'bg-primary-50 text-primary-700'
                : disabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )

  const filterContent: Record<FilterName, React.ReactNode> = {
    categories: categoriesContent,
    type: typeContent,
    location: locationContent,
    sort: sortContent,
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search bar — takes available space */}
      <div className="flex-1 min-w-0">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search skills..."
        />
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Categories */}
        <FilterPopover
          label="Categories"
          activeCount={selectedCategories.length}
          panelClassName="sm:w-[260px] sm:p-2"
          isOpen={isMobile ? activeFilter === 'categories' : undefined}
          onToggle={isMobile ? () => toggleFilter('categories') : undefined}
        >
          {categoriesContent}
        </FilterPopover>

        {/* Type */}
        <FilterPopover
          label="Type"
          activeCount={listingType !== 'all' ? 1 : 0}
          panelClassName="sm:p-2"
          isOpen={isMobile ? activeFilter === 'type' : undefined}
          onToggle={isMobile ? () => toggleFilter('type') : undefined}
        >
          {typeContent}
        </FilterPopover>

        {/* Location */}
        <FilterPopover
          label="Location"
          align="right"
          activeCount={selectedNeighbourhood ? 1 : 0}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          panelClassName="sm:w-[320px] sm:p-2"
          isOpen={isMobile ? activeFilter === 'location' : undefined}
          onToggle={isMobile ? () => toggleFilter('location') : undefined}
        >
          {locationContent}
        </FilterPopover>

        {/* Sort */}
        <FilterPopover
          label={`Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Newest'}`}
          align="right"
          panelClassName="sm:w-[180px] sm:p-2"
          isOpen={isMobile ? activeFilter === 'sort' : undefined}
          onToggle={isMobile ? () => toggleFilter('sort') : undefined}
        >
          {sortContent}
        </FilterPopover>
      </div>

      {/* Mobile accordion content — renders inline below filter buttons */}
      {isMobile && activeFilter && (
        <div className="border-t border-slate-100 pt-3 mt-1">
          {filterContent[activeFilter]}
        </div>
      )}
    </div>
  )
}
