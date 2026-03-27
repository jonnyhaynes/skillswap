# Keyboard-Aware Bottom Sheets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make FilterPopover bottom sheets on mobile adjust their position and height when the on-screen keyboard opens, so content (especially typeahead results) stays visible.

**Architecture:** Add a `useEffect` in FilterPopover that listens to `window.visualViewport` resize events on mobile. When the keyboard opens (viewport shrinks), calculate the offset and apply it as inline styles to the sheet panel's `bottom` and `max-height`.

**Tech Stack:** React (useState/useEffect), visualViewport API, Tailwind CSS (existing classes stay, inline styles override for keyboard offset)

---

### Task 1: Add visualViewport keyboard offset tracking

**Files:**
- Modify: `src/components/ui/FilterPopover.tsx`

**Step 1: Add keyboardOffset state**

Add a `keyboardOffset` state variable after the existing `open` state at line 22:

```tsx
const [keyboardOffset, setKeyboardOffset] = useState(0)
```

**Step 2: Add visualViewport resize effect**

Add a new `useEffect` after the existing body scroll lock effect (after line 58):

```tsx
// Track mobile keyboard height via visualViewport
useEffect(() => {
  if (!open) return
  const mq = window.matchMedia('(min-width: 640px)')
  if (mq.matches) return // desktop — no keyboard issues

  const vv = window.visualViewport
  if (!vv) return // unsupported browser — graceful no-op

  function handleResize() {
    const offset = window.innerHeight - vv!.height - vv!.offsetTop
    setKeyboardOffset(Math.max(0, offset))
  }

  vv.addEventListener('resize', handleResize)
  // Run once immediately in case keyboard is already open
  handleResize()

  return () => {
    vv.removeEventListener('resize', handleResize)
    setKeyboardOffset(0)
  }
}, [open])
```

**Step 3: Apply dynamic styles to the sheet panel**

In the panel `<div>` (currently line 106), add an inline `style` prop and remove the Tailwind classes that the inline styles replace. Change the panel div to:

```tsx
<div
  role="dialog"
  aria-label={label}
  className={cn(
    // Mobile: fixed bottom sheet
    'fixed inset-x-0 z-50 rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] animate-slide-up',
    'overflow-y-auto',
    // Desktop: absolute dropdown
    'sm:absolute sm:inset-auto sm:bottom-auto sm:mt-2 sm:rounded-2xl sm:bg-white/80 sm:backdrop-blur-xl sm:shadow-lg sm:ring-1 sm:ring-black/[0.06] sm:animate-scale-in',
    'sm:max-h-none sm:overflow-visible',
    align === 'right' ? 'sm:right-0' : 'sm:left-0',
    panelClassName
  )}
  style={{
    bottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px',
    maxHeight: keyboardOffset > 0
      ? `calc(80vh - ${keyboardOffset}px)`
      : '80vh',
  }}
>
```

Key changes from the current panel div:
- Removed `bottom-0` from className (now in `style.bottom`)
- Removed `max-h-[80vh]` from className (now in `style.maxHeight`)
- Added `style` prop with dynamic values based on `keyboardOffset`

**Step 4: Verify the build passes**

Run: `npm run build`
Expected: No TypeScript or build errors

**Step 5: Manual test on mobile**

1. Open the app on a mobile device or Chrome DevTools mobile emulator
2. Tap "Location" filter — bottom sheet appears as normal
3. Tap into the neighbourhood input — keyboard opens
4. Verify: the bottom sheet slides up above the keyboard
5. Verify: typeahead results are visible and scrollable
6. Close keyboard — sheet returns to normal position
7. Test Categories, Type, Sort filters — should behave identically to before (no keyboard, no offset)

**Step 6: Commit**

```bash
git add src/components/ui/FilterPopover.tsx
git commit -m "feat: add keyboard-aware positioning to mobile bottom sheets"
```
