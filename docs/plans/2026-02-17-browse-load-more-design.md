# Browse Page "Load More" Pagination Design

## Problem
The browse page renders all skill listings at once with no pagination. As listings grow, this degrades DOM rendering performance.

## Approach: Client-side pagination
All listings are already fetched into `SkillsContext` on app startup, and all filtering/sorting is client-side. We slice the filtered results and grow the visible window on "Load more" click.

## Behavior
- Show **18 skills** initially (6 rows in the 3-column grid)
- "Load more" button appends the next 18
- Filter/search changes reset visible count back to 18
- Button text: "Load more (N remaining)"
- Button hidden when all results are visible

## Components Changed

### `BrowseSkillsPage.tsx`
- Add `visibleCount` state (default 18)
- Slice `filteredAndSorted` to `visibleCount`
- Reset `visibleCount` when filters change (debounced query, categories, listing type, neighbourhood, sort)
- Pass `onLoadMore` and `remainingCount` to `SkillGrid`

### `SkillGrid.tsx`
- Accept optional `onLoadMore?: () => void` and `remainingCount?: number` props
- Render a "Load more" button below the grid when `onLoadMore` is provided and `remainingCount > 0`
- Homepage usage (no `onLoadMore`) is unaffected

## Unchanged
- `SkillsContext`, `services/skills.ts` — no changes
- `filterSkills`, `sortSkills` utilities — no changes
- `ActiveFilters` result count — still reflects total filtered count, not visible count
