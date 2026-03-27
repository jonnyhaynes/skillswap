# Browse Page Filter Toolbar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the browse page sidebar with a compact horizontal filter toolbar using popover dropdowns, freeing up the full page width for the skill card grid.

**Architecture:** New `FilterPopover` generic component handles open/close/positioning. `FilterToolbar` composes SearchBar + 4 FilterPopovers. `ActiveFilters` renders dismissible chips. `BrowseSkillsPage` loses its sidebar layout and uses the new toolbar instead. All filter state stays lifted in BrowseSkillsPage.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite (no test framework — verify with `tsc -b && vite build`)

**Design Doc:** `docs/plans/2026-02-13-browse-page-filter-toolbar-design.md`

---

### Task 1: Create `FilterPopover` component

**Files:**
- Create: `src/components/ui/FilterPopover.tsx`

**Step 1: Create the FilterPopover component**

```tsx
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FilterPopoverProps {
  label: string
  icon?: ReactNode
  activeCount?: number
  children: ReactNode
  align?: 'left' | 'right'
  /** Optional: extra classes on the popover panel */
  panelClassName?: string
}

export function FilterPopover({
  label,
  icon,
  activeCount = 0,
  children,
  align = 'left',
  panelClassName,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const isActive = open || activeCount > 0

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
            : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-100 hover:text-slate-700'
        )}
      >
        {icon}
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
        <svg
          className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-black/[0.06] animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b`
Expected: No errors (component not imported anywhere yet, but types should be valid)

**Step 3: Commit**

```bash
git add src/components/ui/FilterPopover.tsx
git commit -m "feat: add FilterPopover component for browse page toolbar"
```

---

### Task 2: Add `grid` layout to `CategoryFilter`

**Files:**
- Modify: `src/components/skills/CategoryFilter.tsx`

**Step 1: Update CategoryFilter to support grid layout**

Change the `layout` prop type from `'horizontal' | 'vertical'` to `'horizontal' | 'vertical' | 'grid'`.

Add grid-specific styling: when `layout="grid"`, render buttons in a 3-column CSS grid. The "All" button spans full width. Each category button is slightly more compact.

```tsx
import type { SkillCategory } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: SkillCategory[];
  onChange: (selected: SkillCategory[]) => void;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export function CategoryFilter({ selected, onChange, layout = 'horizontal' }: CategoryFilterProps) {
  const isAllSelected = selected.length === 0;
  const isVertical = layout === 'vertical';
  const isGrid = layout === 'grid';

  const toggleCategory = (categoryId: SkillCategory) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId));
    } else {
      onChange([...selected, categoryId]);
    }
  };

  return (
    <div
      className={cn(
        isGrid
          ? 'grid grid-cols-3 gap-1.5'
          : isVertical
            ? 'flex flex-col gap-1'
            : 'flex flex-wrap gap-2'
      )}
      role="group"
      aria-label="Filter by category"
    >
      <button
        onClick={() => onChange([])}
        aria-pressed={isAllSelected}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium transition-colors text-sm',
          isGrid
            ? 'col-span-3 justify-center rounded-lg px-3 py-2'
            : isVertical
              ? 'w-full justify-start rounded-lg px-3 py-2'
              : 'rounded-xl px-4 py-2',
          isAllSelected
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        )}
      >
        All
      </button>
      {CATEGORIES.map((category) => {
        const isSelected = selected.includes(category.id);
        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            aria-pressed={isSelected}
            className={cn(
              'inline-flex items-center gap-1.5 font-medium transition-colors text-sm',
              isGrid
                ? 'justify-start rounded-lg px-2.5 py-2'
                : isVertical
                  ? 'w-full justify-start rounded-lg px-3 py-2'
                  : 'rounded-xl px-4 py-2',
              isSelected
                ? `${category.bgColor} ${category.textColor}`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <span aria-hidden="true">{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/skills/CategoryFilter.tsx
git commit -m "feat: add grid layout option to CategoryFilter"
```

---

### Task 3: Create `ActiveFilters` component

**Files:**
- Create: `src/components/skills/ActiveFilters.tsx`

**Step 1: Create the ActiveFilters chip row component**

```tsx
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
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/skills/ActiveFilters.tsx
git commit -m "feat: add ActiveFilters chip row component"
```

---

### Task 4: Create `FilterToolbar` component

**Files:**
- Create: `src/components/skills/FilterToolbar.tsx`

**Step 1: Create the FilterToolbar that composes all filter controls**

This component receives all filter state as props and renders the horizontal toolbar with SearchBar + 4 FilterPopovers.

```tsx
import type { SkillCategory, ListingType } from '@/types'
import type { PlaceResult } from '@/services/osNames'
import type { SortOption } from '@/utils/sortSkills'
import type { NeighbourhoodCoords } from '@/services/neighbourhoods'
import { SearchBar } from '@/components/skills/SearchBar'
import { CategoryFilter } from '@/components/skills/CategoryFilter'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import { FilterPopover } from '@/components/ui/FilterPopover'
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
          panelClassName="w-[380px] p-4"
        >
          <CategoryFilter
            selected={selectedCategories}
            onChange={onCategoriesChange}
            layout="grid"
          />
        </FilterPopover>

        {/* Type */}
        <FilterPopover
          label="Type"
          activeCount={listingType !== 'all' ? 1 : 0}
          panelClassName="p-3"
        >
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
        </FilterPopover>

        {/* Location */}
        <FilterPopover
          label="Location"
          activeCount={selectedNeighbourhood ? 1 : 0}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          panelClassName="w-[320px] p-4"
        >
          <div className="space-y-3">
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
        </FilterPopover>

        {/* Sort */}
        <FilterPopover
          label={`Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Newest'}`}
          align="right"
          panelClassName="w-[180px] p-2"
        >
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
        </FilterPopover>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/skills/FilterToolbar.tsx
git commit -m "feat: add FilterToolbar component composing search + filter popovers"
```

---

### Task 5: Rewrite `BrowseSkillsPage` to use toolbar layout

**Files:**
- Modify: `src/pages/BrowseSkillsPage.tsx`

**Step 1: Replace sidebar layout with toolbar layout**

Rewrite `BrowseSkillsPage.tsx` with these changes:
- Remove the `filtersSidebar` variable and all sidebar JSX
- Remove the `filtersOpen` state and mobile filter toggle button
- Remove the `lg:grid lg:grid-cols-[260px_1fr]` layout
- Remove the `TYPE_OPTIONS` and `SORT_OPTIONS` constants (moved to `FilterToolbar`)
- Import and render `FilterToolbar` and `ActiveFilters` above the grid
- Update skeleton loading state to show a toolbar skeleton instead of sidebar skeleton

The full replacement for `BrowseSkillsPage.tsx`:

```tsx
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
    if (selectedNeighbourhood?.latitude && selectedNeighbourhood?.longitude) {
      return { latitude: selectedNeighbourhood.latitude, longitude: selectedNeighbourhood.longitude }
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
      <SkillGrid listings={filteredAndSorted} preloadedUsers={usersMap} />
    </div>
  )
}
```

**Step 2: Verify build**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b && npx vite build`
Expected: Build succeeds with no errors

**Step 3: Manual verification**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx vite --open`

Verify:
- Page loads with search bar + 4 filter buttons in a horizontal row
- Clicking each filter button opens its popover
- Clicking outside a popover closes it
- Selecting categories shows count badge on the button
- Active filter chips appear below the toolbar
- Dismissing chips removes the corresponding filter
- "Clear all" resets everything
- Skill grid takes full page width
- Mobile: search and buttons stack vertically

**Step 4: Commit**

```bash
git add src/pages/BrowseSkillsPage.tsx
git commit -m "feat: replace browse page sidebar with filter toolbar layout"
```

---

### Task 6: Polish and responsive tweaks

**Files:**
- Modify: `src/components/skills/SkillGrid.tsx` (optional grid column tweak)
- Modify: `src/components/ui/FilterPopover.tsx` (mobile full-width popovers)

**Step 1: Update SkillGrid to support wider layouts**

In `src/components/skills/SkillGrid.tsx`, update the grid class from `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4` in both the loading skeleton and the main grid. This takes advantage of the extra width now available.

**Step 2: Add mobile-friendly popover sizing**

In `FilterPopover.tsx`, add responsive sizing for the panel. On small screens, the popover should be wider (close to full container width). Add `max-w-[calc(100vw-2rem)] sm:max-w-none` to the panel className defaults so popovers don't overflow the viewport on mobile.

**Step 3: Verify build and test responsively**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc -b && npx vite build`
Expected: No errors

Resize browser to test mobile, tablet, desktop layouts.

**Step 4: Commit**

```bash
git add src/components/skills/SkillGrid.tsx src/components/ui/FilterPopover.tsx
git commit -m "feat: widen skill grid for new layout and improve mobile popover sizing"
```
