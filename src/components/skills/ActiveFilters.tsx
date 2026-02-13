import type { SkillCategory, ListingType } from '@/types'
import type { PlaceResult } from '@/services/osNames'
import { getCategoryInfo } from '@/data/categories'
import { cn } from '@/utils/cn'

interface ActiveFiltersProps {
  selectedCategories: SkillCategory[]
  onRemoveCategory: (category: SkillCategory) => void
  listingType: ListingType | 'all'
  onClearType: () => void
  selectedNeighbourhood: PlaceResult | null
  onClearNeighbourhood: () => void
  searchQuery: string
  onClearSearch: () => void
  resultCount: number
  onClearAll: () => void
}

export function ActiveFilters({
  selectedCategories,
  onRemoveCategory,
  listingType,
  onClearType,
  selectedNeighbourhood,
  onClearNeighbourhood,
  searchQuery,
  onClearSearch,
  resultCount,
  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters =
    selectedCategories.length > 0 ||
    listingType !== 'all' ||
    selectedNeighbourhood !== null ||
    searchQuery.length > 0

  if (!hasFilters) return null

  return (
    <div className="flex items-center gap-3 flex-wrap animate-slide-up">
      <span className="text-sm text-slate-500 shrink-0">
        {resultCount} {resultCount === 1 ? 'result' : 'results'}
      </span>

      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {searchQuery && (
          <Chip onRemove={onClearSearch}>
            &ldquo;{searchQuery}&rdquo;
          </Chip>
        )}

        {selectedCategories.map((catId) => {
          const cat = getCategoryInfo(catId)
          return (
            <Chip
              key={catId}
              onRemove={() => onRemoveCategory(catId)}
              className={cn(cat.bgColor, cat.textColor)}
            >
              {cat.emoji} {cat.label}
            </Chip>
          )
        })}

        {listingType !== 'all' && (
          <Chip onRemove={onClearType}>
            {listingType === 'offered' ? 'Offered' : 'Seeking'}
          </Chip>
        )}

        {selectedNeighbourhood && (
          <Chip onRemove={onClearNeighbourhood}>
            near {selectedNeighbourhood.name}
          </Chip>
        )}
      </div>

      <button
        onClick={onClearAll}
        className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
      >
        Clear all
      </button>
    </div>
  )
}

function Chip({
  children,
  onRemove,
  className,
}: {
  children: React.ReactNode
  onRemove: () => void
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
        className || 'bg-slate-100 text-slate-600'
      )}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
        aria-label="Remove filter"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}
