# Mobile Bottom Sheet Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix mobile bottom sheets so they have proper safe area padding, a drag handle, and move above the on-screen keyboard when it appears.

**Architecture:** Add `visualViewport` resize listener in `FilterPopover` to compute keyboard offset. Add safe area CSS utility. Add drag handle UI element. All changes scoped to 3 files.

**Tech Stack:** React 19, Tailwind CSS 4, `window.visualViewport` API

---

### Task 1: Add viewport-fit=cover to index.html

**Files:**
- Modify: `index.html:6`

**Step 1: Update the viewport meta tag**

Change line 6 from:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
to:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

This is required for `env(safe-area-inset-bottom)` to return non-zero values on devices with a home indicator.

**Step 2: Verify dev server still loads**

Run: `npm run dev` (should already be running)
Expected: Page loads normally at localhost:5173, no visual changes on desktop.

**Step 3: Commit**

```bash
git add index.html
git commit -m "fix: add viewport-fit=cover for safe area inset support"
```

---

### Task 2: Add safe-area-bottom CSS utility

**Files:**
- Modify: `src/index.css` (append after the `::selection` block, before the `@media (prefers-reduced-motion)` block around line 273)

**Step 1: Add the utility class**

Add this CSS block before the `@media (prefers-reduced-motion: reduce)` rule:

```css
/* Safe area bottom padding for devices with home indicator */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

This class is already referenced by `src/components/layout/MobileNav.tsx:69` but was never defined — this makes it functional.

**Step 2: Verify no visual regression**

Check the browse page at mobile viewport (390x844). The mobile nav bar should render identically.

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "fix: define safe-area-bottom CSS utility used by MobileNav"
```

---

### Task 3: Add drag handle, safe area padding, and keyboard-aware positioning to FilterPopover

**Files:**
- Modify: `src/components/ui/FilterPopover.tsx`

**Step 1: Add keyboard offset state and visualViewport effect**

Add a new state variable `keyboardOffset` (number, default 0) after the existing `open` state.

Add a new `useEffect` that:
- Only runs when `open` is true
- Checks `window.matchMedia('(min-width: 640px)')` — if desktop, return early
- Gets `window.visualViewport` — if not available, return early
- Defines a `handleResize` function that computes: `const offset = window.innerHeight - vv.height - vv.offsetTop` where `vv = window.visualViewport`, then calls `setKeyboardOffset(Math.max(0, offset))`
- Calls `handleResize()` once immediately to get initial value
- Adds event listeners for both `resize` and `scroll` events on `window.visualViewport`
- Cleanup: removes both event listeners and resets `setKeyboardOffset(0)`

```typescript
const [keyboardOffset, setKeyboardOffset] = useState(0)

// Adjust bottom-sheet position when on-screen keyboard is visible
useEffect(() => {
  if (!open) return
  const mq = window.matchMedia('(min-width: 640px)')
  if (mq.matches) return

  const vv = window.visualViewport
  if (!vv) return

  function handleResize() {
    const offset = window.innerHeight - vv!.height - vv!.offsetTop
    setKeyboardOffset(Math.max(0, offset))
  }

  handleResize()
  vv.addEventListener('resize', handleResize)
  vv.addEventListener('scroll', handleResize)
  return () => {
    vv.removeEventListener('resize', handleResize)
    vv.removeEventListener('scroll', handleResize)
    setKeyboardOffset(0)
  }
}, [open])
```

**Step 2: Apply keyboard offset as inline styles on the panel**

On the panel `<div>` (the one with `role="dialog"`), add an inline `style` prop that applies the keyboard offset on mobile. Also adjust max-height when keyboard is open:

```typescript
style={
  keyboardOffset > 0
    ? {
        bottom: `${keyboardOffset}px`,
        maxHeight: `calc(${window.visualViewport?.height ?? window.innerHeight}px * 0.8)`,
        transition: 'bottom 0.2s ease-out, max-height 0.2s ease-out',
      }
    : undefined
}
```

Remove `bottom-0` from the className since it will conflict with the inline style. Replace it with a conditional: when `keyboardOffset === 0`, keep `bottom-0` in the class; when `keyboardOffset > 0`, the inline style overrides. Actually, CSS inline styles override class-based styles, so we can keep `bottom-0` as the default and let the inline style take precedence when set. But to be safe, add the transition to the base mobile classes too:

Add `transition-[bottom,max-height] duration-200 ease-out` to the mobile panel classes so the animation is smooth even on the first keyboard open.

**Step 3: Add drag handle above the mobile header**

Inside the panel `<div>`, before the existing mobile header `<div>`, add:

```tsx
{/* Drag handle */}
<div className="sm:hidden flex justify-center pt-3 pb-1" aria-hidden="true">
  <div className="h-1 w-8 rounded-full bg-slate-300" />
</div>
```

**Step 4: Add safe area bottom padding to the content area**

Change the content wrapper from:
```tsx
<div className="p-4 sm:p-0">
```
to:
```tsx
<div className="p-4 pb-4 safe-area-bottom sm:p-0">
```

The `safe-area-bottom` class adds `env(safe-area-inset-bottom)` as additional bottom padding, ensuring content clears the home indicator on modern iPhones.

**Step 5: Update mobile header to remove top padding (drag handle provides it)**

Change the mobile header from:
```tsx
<div className="sm:hidden flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
```
to:
```tsx
<div className="sm:hidden flex items-center justify-between px-4 pt-1 pb-2 border-b border-slate-100">
```

The drag handle now provides the top visual spacing, so reduce `pt-4` to `pt-1`.

**Step 6: Verify all four bottom sheets on mobile viewport**

Resize browser to 390x844. Open each popover and verify:
- Drag handle pill is visible at the top
- Categories: scrollable list with breathing room at bottom
- Type: three buttons visible with adequate spacing
- Location: input field visible with room below
- Sort: all 5 options visible including "Nearest"

**Step 7: Verify keyboard behavior**

Open Location popover, tap the input field. If testing in Chrome DevTools, toggle the device toolbar keyboard simulation. The sheet should slide up above the keyboard.

**Step 8: Verify desktop is unaffected**

Resize to desktop width (1280+). All popovers should appear as dropdown panels (no drag handle, no safe area padding, no keyboard logic).

**Step 9: Commit**

```bash
git add src/components/ui/FilterPopover.tsx
git commit -m "fix: improve mobile bottom sheets with drag handle, safe area padding, and keyboard awareness"
```

---

### Summary

| Task | File | What |
|------|------|------|
| 1 | `index.html` | Add `viewport-fit=cover` |
| 2 | `src/index.css` | Define `.safe-area-bottom` utility |
| 3 | `src/components/ui/FilterPopover.tsx` | Drag handle + safe area padding + visualViewport keyboard offset |
