# Keyboard-Aware Bottom Sheets

## Problem

When a user opens the Location filter on mobile and starts typing in the NeighbourhoodTypeahead input, the on-screen keyboard obscures the typeahead results dropdown. The user cannot see what they're selecting.

## Constraint

All FilterPopovers must behave consistently — no per-filter branching. The solution applies uniformly to every bottom sheet.

## Approach

Use the `visualViewport` API to detect when the mobile keyboard opens and dynamically adjust the bottom sheet's position and height so content stays visible above the keyboard.

## Implementation

### File changed

`src/components/ui/FilterPopover.tsx` (single file change)

### Mechanism

1. Add a `keyboardOffset` state variable (default `0`)
2. When the popover is open on mobile (`< 640px`), attach a `resize` listener to `window.visualViewport`
3. On resize, calculate: `keyboardOffset = window.innerHeight - visualViewport.height - visualViewport.offsetTop`
4. On cleanup (popover closes or unmounts), remove the listener and reset to `0`

### Styling changes

- Replace fixed `bottom-0` with dynamic `bottom: ${keyboardOffset}px`
- Replace fixed `max-h-[80vh]` with dynamic `max-height: calc(80vh - ${keyboardOffset}px)`
- Applied via inline style on the mobile sheet panel

### What stays the same

- Desktop dropdown behaviour (effect bails out on `sm:` breakpoint)
- Body scroll lock
- Slide-up animation
- All existing mobile header/close button styling
- No changes to NeighbourhoodTypeahead.tsx — the absolute-positioned dropdown scrolls within the sheet's `overflow-y-auto` naturally

### Browser support

`visualViewport` is supported in all modern mobile browsers (iOS Safari 13+, Chrome Android 62+). No fallback needed — if unsupported, `keyboardOffset` stays at `0` and behaviour is identical to the current experience.

### Edge cases

- `visualViewport.offsetTop` accounts for browser chrome (URL bar) resizing the viewport
- Filters without text inputs (Categories, Type, Sort) attach the listener but it never fires since no keyboard appears — zero visual impact
