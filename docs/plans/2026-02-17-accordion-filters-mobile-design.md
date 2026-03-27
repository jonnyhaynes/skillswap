# Accordion Filters on Mobile

## Problem

When a user opens the Location filter on mobile and starts typing in the NeighbourhoodTypeahead input, the on-screen keyboard obscures the typeahead results dropdown. The user cannot see what they're selecting. The root cause is that filters live inside bottom sheet overlays, which conflict with the keyboard.

## Constraint

All FilterPopovers must behave consistently on mobile — no per-filter branching.

## Approach

On mobile, replace bottom sheet popovers with inline accordion behaviour. Tapping a filter button expands its content directly below the filter toolbar in the page flow. Only one filter can be open at a time. On desktop, everything remains unchanged (dropdown popovers).

This eliminates the keyboard problem entirely — there is no overlay for the keyboard to obscure. The typeahead input sits in the normal page flow, and the browser handles scrolling to focused inputs natively.

## Implementation

### Files changed

1. `src/components/ui/FilterPopover.tsx` — dual behaviour: inline accordion on mobile, dropdown popover on desktop
2. `src/components/skills/FilterToolbar.tsx` — lift open state for accordion coordination

### FilterPopover changes

Add two new optional props for controlled (accordion) mode:

```ts
interface FilterPopoverProps {
  // ... existing props
  /** Controlled open state for accordion mode */
  isOpen?: boolean
  /** Callback when the popover wants to toggle */
  onToggle?: () => void
}
```

When `isOpen` and `onToggle` are provided, the component uses controlled mode. Otherwise, it falls back to its existing internal `open` state (backwards compatible).

**Mobile rendering (below `sm` breakpoint):**
- No fixed positioning, no backdrop, no scroll lock, no slide-up animation
- Children render in a `div` directly after the button, in normal document flow
- Subtle top border and padding to separate from the button row
- The expanded content is full-width within the toolbar container

**Desktop rendering (at `sm` and above):**
- Unchanged — absolute dropdown popover with existing styling

**What's removed on mobile:**
- Fixed bottom sheet positioning (`fixed inset-x-0 bottom-0`)
- Backdrop overlay (`bg-black/25 backdrop-blur-sm`)
- Body scroll lock (`document.body.style.overflow = 'hidden'`)
- Mobile header with close button (the filter button itself acts as the toggle)
- `max-h-[80vh]` constraint (content flows naturally)

**What's kept on mobile:**
- Escape key closes the open filter
- Outside click closes the open filter

### FilterToolbar changes

Lift accordion state to coordinate which filter is open:

```ts
const [activeFilter, setActiveFilter] = useState<string | null>(null)
```

Each `FilterPopover` receives:
- `isOpen={activeFilter === 'categories'}` (etc.)
- `onToggle={() => setActiveFilter(prev => prev === 'categories' ? null : 'categories')}`

The expanded filter content renders below the button row, outside the `flex` container of buttons, so it spans the full width.

### Layout structure on mobile

```
┌─────────────────────────────────────┐
│ [Search bar                       ] │
├─────────────────────────────────────┤
│ [Categories] [Type] [Location] [Sort]│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │  ← expanded content (if any filter open)
│ │ Category buttons / Type pills / │ │
│ │ Location typeahead / Sort list  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Skill cards...                      │
└─────────────────────────────────────┘
```

### What stays the same

- Desktop behaviour — no changes whatsoever
- All filter content components (CategoryFilter, NeighbourhoodTypeahead, type buttons, sort buttons)
- FilterPopover API for desktop (uncontrolled mode still works)
- All existing styling on desktop
