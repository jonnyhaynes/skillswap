# Accordion Filters on Mobile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace bottom sheet popovers with inline accordion filters on mobile, eliminating the keyboard occlusion problem for the Location typeahead.

**Architecture:** Add controlled mode (`isOpen`/`onToggle` props) to FilterPopover. On mobile, render children inline below the button instead of in a fixed bottom sheet. Lift open state to FilterToolbar to coordinate accordion behaviour (one filter open at a time). Desktop behaviour is completely unchanged.

**Tech Stack:** React 19 (useState, useEffect, useRef), Tailwind CSS 4, `window.matchMedia` for breakpoint detection

---

### Task 1: Add controlled mode to FilterPopover

**Files:**
- Modify: `src/components/ui/FilterPopover.tsx`

**Step 1: Add controlled props to the interface**

Add `isOpen` and `onToggle` optional props to `FilterPopoverProps`. At line 4-12, change the interface to:

```tsx
interface FilterPopoverProps {
  label: string
  icon?: ReactNode
  activeCount?: number
  children: ReactNode
  align?: 'left' | 'right'
  /** Optional: extra classes on the popover panel */
  panelClassName?: string
  /** Controlled open state (for accordion mode) */
  isOpen?: boolean
  /** Callback to toggle open state (for accordion mode) */
  onToggle?: () => void
}
```

**Step 2: Add controlled mode logic**

Update the destructured props and add controlled/uncontrolled logic. Replace lines 14-24 with:

```tsx
export function FilterPopover({
  label,
  icon,
  activeCount = 0,
  children,
  align = 'left',
  panelClassName,
  isOpen: controlledOpen,
  onToggle,
}: FilterPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
```

**Step 3: Update toggle and close handlers**

Create a `toggle` function and a `close` function that work in both modes. Add these after the refs:

```tsx
  function toggle() {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }

  function close() {
    if (isControlled) {
      if (open) onToggle?.()
    } else {
      setInternalOpen(false)
    }
  }
```

Then update all places that currently call `setOpen`:
- Button `onClick`: change `() => setOpen(!open)` to `toggle`
- Escape handler: change `setOpen(false)` to `close()`
- Outside click handler: change `setOpen(false)` to `close()`
- Backdrop `onClick`: change `() => setOpen(false)` to `close`
- Close button `onClick`: change `() => setOpen(false)` to `close`

**Step 4: Add mobile detection state**

Add a `isMobile` state that tracks the `sm` breakpoint. Add this after the `close` function:

```tsx
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(min-width: 640px)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(!e.matches)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])
```

**Step 5: Update body scroll lock to skip mobile accordion mode**

The body scroll lock effect currently locks scroll on mobile when the popover is open. In accordion mode on mobile, we don't want this (content is inline, not an overlay). Update the body scroll lock effect:

```tsx
  // Lock body scroll on mobile when open (only for bottom sheet mode, not accordion)
  useEffect(() => {
    if (!open) return
    if (isMobile && isControlled) return // accordion mode — no scroll lock
    const mq = window.matchMedia('(min-width: 640px)')
    if (mq.matches) return // desktop — don't lock scroll

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, isMobile, isControlled])
```

**Step 6: Split mobile and desktop rendering**

Replace the entire `{open && (...)}` block (lines 94-139) with dual-path rendering:

```tsx
      {/* Desktop: dropdown popover (unchanged) */}
      {open && !isMobile && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute mt-2 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-black/[0.06] animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName
          )}
        >
          {children}
        </div>
      )}

      {/* Mobile bottom sheet (uncontrolled mode only) */}
      {open && isMobile && !isControlled && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm animate-fade-in"
            onClick={close}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label={label}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] animate-slide-up max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>
        </>
      )}
```

Note: The mobile accordion content (controlled mode on mobile) is NOT rendered here — it will be rendered by FilterToolbar in Task 2.

**Step 7: Verify build passes**

Run: `npm run build`
Expected: No TypeScript or build errors. Existing behaviour unchanged since no callers pass `isOpen`/`onToggle` yet.

**Step 8: Commit**

```bash
git add src/components/ui/FilterPopover.tsx
git commit -m "feat: add controlled mode and mobile detection to FilterPopover

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Wire up accordion mode in FilterToolbar

**Files:**
- Modify: `src/components/skills/FilterToolbar.tsx`

**Step 1: Add accordion state and mobile detection**

Add state for which filter is active and whether we're on mobile. After the destructured props (after line 51), add:

```tsx
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(min-width: 640px)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(!e.matches)
      if (e.matches) setActiveFilter(null) // close accordion when resizing to desktop
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  function toggleFilter(name: string) {
    setActiveFilter((prev) => (prev === name ? null : name))
  }
```

**Step 2: Pass controlled props to each FilterPopover on mobile**

Update each `<FilterPopover>` to pass `isOpen` and `onToggle` when on mobile. For each of the 4 filter popovers, add the controlled props:

Categories:
```tsx
        <FilterPopover
          label="Categories"
          activeCount={selectedCategories.length}
          panelClassName="sm:w-[260px] sm:p-2"
          isOpen={isMobile ? activeFilter === 'categories' : undefined}
          onToggle={isMobile ? () => toggleFilter('categories') : undefined}
        >
```

Type:
```tsx
        <FilterPopover
          label="Type"
          activeCount={listingType !== 'all' ? 1 : 0}
          panelClassName="sm:p-2"
          isOpen={isMobile ? activeFilter === 'type' : undefined}
          onToggle={isMobile ? () => toggleFilter('type') : undefined}
        >
```

Location:
```tsx
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
```

Sort:
```tsx
        <FilterPopover
          label={`Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Newest'}`}
          align="right"
          panelClassName="sm:w-[180px] sm:p-2"
          isOpen={isMobile ? activeFilter === 'sort' : undefined}
          onToggle={isMobile ? () => toggleFilter('sort') : undefined}
        >
```

**Step 3: Add inline accordion content area**

After the filter buttons `div` (after line 162's closing `</div>`), add the accordion content area that renders on mobile when a filter is active. This goes inside the outer `div` but after the buttons row:

```tsx
      {/* Mobile accordion content — renders inline below filter buttons */}
      {isMobile && activeFilter && (
        <div className="border-t border-slate-100 pt-3 mt-1">
          {activeFilter === 'categories' && (
            <CategoryFilter
              selected={selectedCategories}
              onChange={onCategoriesChange}
              layout="list"
            />
          )}
          {activeFilter === 'type' && (
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
          )}
          {activeFilter === 'location' && (
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
          )}
          {activeFilter === 'sort' && (
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
          )}
        </div>
      )}
```

**Important note on DRY:** The filter content (CategoryFilter, type buttons, location typeahead, sort buttons) is now duplicated — once inside each `<FilterPopover>` (used on desktop) and once in the accordion area (used on mobile). This is acceptable because:
1. The FilterPopover children are still needed for the desktop dropdown
2. On mobile in controlled mode, FilterPopover doesn't render children (it's just the button)
3. Extracting shared components would add complexity for no real benefit at this scale

**Step 4: Verify build passes**

Run: `npm run build`
Expected: No TypeScript or build errors

**Step 5: Manual testing**

1. **Mobile (or Chrome DevTools mobile emulator):**
   - Tap "Categories" — options expand inline below the toolbar
   - Tap "Type" — Categories collapses, Type options expand
   - Tap "Location" — typeahead input appears inline, type in it, verify results are visible (no keyboard occlusion!)
   - Tap "Sort" — sort options expand
   - Tap the active filter button again — it collapses
   - Resize to desktop width — accordion closes, filters work as dropdown popovers

2. **Desktop:**
   - Click any filter — dropdown popover appears as before
   - Verify no visual or behavioural changes

**Step 6: Commit**

```bash
git add src/components/skills/FilterToolbar.tsx
git commit -m "feat: wire up accordion filter mode on mobile in FilterToolbar

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
