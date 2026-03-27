# Browse Page "Load More" Pagination Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add client-side "Load more" pagination to the browse page, showing 18 skills at a time.

**Architecture:** Slice the already-fetched-and-filtered listings array with a `visibleCount` state. A "Load more" button increments the count by 18. Filter changes reset to 18.

**Tech Stack:** React 19, Tailwind CSS 4

---

### Task 1: Add visibleCount state and slicing to BrowseSkillsPage

**Files:**
- Modify: `src/pages/BrowseSkillsPage.tsx`

**Step 1: Add pagination state and computed values**

Add after the `debouncedQuery` line (~line 36):

```tsx
const PAGE_SIZE = 18
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
```

**Step 2: Reset visibleCount when filters change**

Add a `useEffect` after the existing filter state declarations:

```tsx
useEffect(() => {
  setVisibleCount(PAGE_SIZE)
}, [debouncedQuery, selectedCategories, listingType, sortBy, selectedNeighbourhood])
```

**Step 3: Slice the results and compute remaining count**

After the `filteredAndSorted` memo, add:

```tsx
const visibleListings = useMemo(
  () => filteredAndSorted.slice(0, visibleCount),
  [filteredAndSorted, visibleCount]
)

const remainingCount = filteredAndSorted.length - visibleListings.length
```

**Step 4: Pass new props to SkillGrid**

Change the SkillGrid usage (line ~182) from:

```tsx
<SkillGrid listings={filteredAndSorted} preloadedUsers={usersMap} />
```

to:

```tsx
<SkillGrid
  listings={visibleListings}
  preloadedUsers={usersMap}
  onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
  remainingCount={remainingCount}
/>
```

**Step 5: Add `useMemo` to the import if not already present**

Verify `useMemo` is already imported (it is — line 1).

**Step 6: Verify the app compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: Type errors because SkillGrid doesn't accept the new props yet.

---

### Task 2: Add Load More button to SkillGrid

**Files:**
- Modify: `src/components/skills/SkillGrid.tsx`

**Step 1: Update the SkillGridProps interface**

Change the interface (lines 7-13) to:

```tsx
interface SkillGridProps {
  listings: SkillListing[]
  /** When true, each card animates in with a stagger. Used on the homepage. */
  staggerReveal?: boolean
  /** Pre-fetched user map. When provided, SkillGrid skips its own user fetch. */
  preloadedUsers?: Map<string, User>
  /** Called when "Load more" is clicked. If omitted, no button is shown. */
  onLoadMore?: () => void
  /** Number of results not yet visible. Shown in the button label. */
  remainingCount?: number
}
```

**Step 2: Destructure the new props**

Update the function signature (line 15):

```tsx
export function SkillGrid({ listings, staggerReveal, preloadedUsers, onLoadMore, remainingCount }: SkillGridProps) {
```

**Step 3: Add the Load More button below the grid**

Replace the return statement for the results grid (lines 89-106) with:

```tsx
return (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, index) => {
        const user = users.get(listing.userId)
        if (!user) return null
        return (
          <div
            key={listing.id}
            className={staggerReveal ? 'scroll-reveal revealed' : undefined}
            style={staggerReveal ? { animationDelay: `${0.08 + index * 0.08}s` } : undefined}
          >
            <SkillCard listing={listing} user={user} />
          </div>
        )
      })}
    </div>

    {onLoadMore && remainingCount !== undefined && remainingCount > 0 && (
      <div className="mt-8 flex justify-center">
        <button
          onClick={onLoadMore}
          className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
        >
          Load more ({remainingCount} remaining)
        </button>
      </div>
    )}
  </div>
)
```

**Step 4: Verify the app compiles**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npx tsc --noEmit`
Expected: PASS, no type errors.

**Step 5: Verify in browser**

Run: `cd /Users/jonnyhaynes/Projects/claude/skillswap && npm run dev`
Check: Browse page shows grid with "Load more" button if >18 skills exist. Clicking it reveals more. Changing a filter resets to first 18.

**Step 6: Commit**

```bash
git add src/pages/BrowseSkillsPage.tsx src/components/skills/SkillGrid.tsx
git commit -m "feat: add load more pagination to browse page"
```
