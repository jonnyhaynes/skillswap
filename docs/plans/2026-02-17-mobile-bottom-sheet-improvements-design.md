# Mobile Bottom Sheet Improvements

## Problem

The `FilterPopover` mobile bottom sheets (Categories, Type, Location, Sort) have three issues:

1. **Cramped content** — short-content sheets (Type, Sort) feel lost at the bottom edge
2. **No safe area padding** — on devices with a home indicator (modern iPhones), the last items are obscured
3. **Keyboard overlap** — when the on-screen keyboard opens (Categories search, Location input), the bottom sheet stays behind the keyboard

## Approach

Use the `visualViewport` API to detect keyboard presence and dynamically offset the bottom sheet. Combine with safe area padding and a drag handle for a polished mobile experience.

## Changes

### 1. Drag handle (FilterPopover.tsx)

Add a cosmetic pill-shaped drag handle above the mobile header. Standard bottom sheet affordance — no swipe-to-dismiss logic needed.

- `w-8 h-1 rounded-full bg-slate-300` centered with auto margins
- Small padding container above the existing header
- Hidden on desktop via `sm:hidden`

### 2. Safe area bottom padding (index.css + index.html)

Define the `.safe-area-bottom` utility class that's already used by `MobileNav` but never declared:

```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

Update `index.html` viewport meta tag to include `viewport-fit=cover` — required for `env(safe-area-inset-bottom)` to return non-zero values.

Apply `safe-area-bottom` to the bottom sheet content area.

### 3. Keyboard-aware positioning (FilterPopover.tsx)

Add a `useEffect` that listens to `window.visualViewport` resize events when the sheet is open on mobile:

- Compute keyboard offset: `window.innerHeight - visualViewport.height - visualViewport.offsetTop`
- Apply as inline `bottom` style on the sheet panel
- Adjust `max-height` to `visualViewport.height * 0.8` so the sheet doesn't overflow above the screen
- Smooth CSS transition on both properties
- Clean up listeners on close/unmount
- Skip entirely on desktop (check `matchMedia('(min-width: 640px)')`)

## Files

| File | Change |
|---|---|
| `index.html` | Add `viewport-fit=cover` to viewport meta |
| `src/index.css` | Add `.safe-area-bottom` utility |
| `src/components/ui/FilterPopover.tsx` | Drag handle, safe area padding, visualViewport keyboard offset |

## No new files or dependencies
