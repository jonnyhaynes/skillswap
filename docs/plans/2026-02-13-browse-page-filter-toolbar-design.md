# Browse Page Filter Toolbar Redesign

## Problem

The `/browse` page uses a 260px sidebar for filters and search. This consumes too much horizontal space (reducing the card grid width) and too much vertical space (13 category buttons + neighbourhood + type + sort stack tall, requiring scroll). The sidebar approach feels heavy on both desktop and mobile.

## Solution

Replace the sidebar with a **horizontal filter toolbar** using **popover dropdowns**. The search bar stays always-visible; all other filters (Categories, Type, Location, Sort) are accessed via compact buttons that open popover panels. Active filters display as dismissible chips below the toolbar.

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Browse Skills                                                    │
│  Find skills in your neighbourhood                                │
├──────────────────────────────────────────────────────────────────┤
│  [Search skills...             ] [Categories ▾] [Type ▾] [Location ▾] [Sort ▾]  │
├──────────────────────────────────────────────────────────────────┤
│  [✕ Music] [✕ Offered] [✕ near Hackney]          12 results · Clear all  │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │  │ Card 4 │                 │
│  └────────┘  └────────┘  └────────┘  └────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

## Components

### New: `FilterPopover` (`src/components/ui/FilterPopover.tsx`)

Reusable popover wrapper. A trigger button toggles a dropdown panel.

- Click-outside to close (mousedown listener, same pattern as NeighbourhoodTypeahead)
- Escape key to close
- Props: `label`, `icon` (optional), `activeCount` (shows badge on button), `children`, `align` ('left' | 'right')
- Positioned absolutely below trigger, uses existing `glass` utility
- Entrance animation: `animate-scale-in` (already in index.css)
- Button styling: `bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200/60 rounded-xl`
- Active state (open or has selections): `bg-primary-50 text-primary-700 ring-primary-200`

### New: `FilterToolbar` (`src/components/skills/FilterToolbar.tsx`)

Horizontal flex row containing:
1. `SearchBar` (flex-1, takes most width)
2. Categories `FilterPopover` — contains `CategoryFilter` in grid layout mode
3. Type `FilterPopover` — contains type radio pills
4. Location `FilterPopover` — contains `NeighbourhoodTypeahead`
5. Sort `FilterPopover` — contains sort radio list

Props: receives all filter state + setters from BrowseSkillsPage.

### New: `ActiveFilters` (`src/components/skills/ActiveFilters.tsx`)

Chip row below the toolbar, only rendered when filters are active.

- Each active filter is a pill with an X button to dismiss
- Category chips use their category colors (from `getCategoryInfo`)
- Type/location chips use `bg-slate-100`
- Left side: result count text
- Right side: "Clear all" button
- Smooth reveal with `animate-slide-up`

### Modified: `CategoryFilter` (`src/components/skills/CategoryFilter.tsx`)

Add a third layout option: `'grid'`. When `layout="grid"`:
- Categories display in a 3-column CSS grid
- "All" button spans full width at top
- Each button is more compact than vertical mode
- Fits neatly inside a ~420px wide popover

### Modified: `BrowseSkillsPage` (`src/pages/BrowseSkillsPage.tsx`)

- Remove the `filtersSidebar` JSX block
- Remove the `lg:grid-cols-[260px_1fr]` layout
- Replace with: `FilterToolbar` + `ActiveFilters` + full-width `SkillGrid`
- All filter state stays in this component (lifted state pattern unchanged)
- Update skeleton loading state to match new toolbar layout
- Grid can now support `2xl:grid-cols-4` for wide screens

## Mobile Behaviour

- `< lg`: Search bar takes full width (own row)
- Filter buttons wrap into a second row below search
- Popovers expand to near-full-width within their relative container
- Remove the existing mobile filter toggle button + collapsible panel (no longer needed)

## Styling

All styling follows existing design tokens:

- Filter buttons: `rounded-xl`, matching Card component's ring style
- Popover panels: white bg + `glass` effect, `rounded-2xl`, `shadow-lg`, `ring-1 ring-black/[0.03]`
- Chips: category colors for category chips, `bg-slate-100` for others
- Transitions: `transition-all duration-200` (existing pattern)
- Focus: existing `focus-visible` ring style

## What Stays the Same

- `SearchBar` component (reused, repositioned)
- `NeighbourhoodTypeahead` component (reused inside Location popover)
- `SkillGrid` and `SkillCard` (untouched, just gain more width)
- All filter/sort state management logic in BrowseSkillsPage
- All existing CSS animations and design tokens
- `filterSkills` and `sortSkills` utility functions

## Files Summary

| File | Action |
|------|--------|
| `src/components/ui/FilterPopover.tsx` | Create |
| `src/components/skills/FilterToolbar.tsx` | Create |
| `src/components/skills/ActiveFilters.tsx` | Create |
| `src/pages/BrowseSkillsPage.tsx` | Modify (remove sidebar, add toolbar) |
| `src/components/skills/CategoryFilter.tsx` | Modify (add grid layout) |
