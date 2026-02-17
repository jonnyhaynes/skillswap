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
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on outside click (desktop only — mobile has backdrop) or Escape
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 640px)')
    if (mq.matches) return // desktop — don't lock scroll

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Adjust bottom-sheet position when on-screen keyboard is visible.
  // Note: matchMedia is checked once on open — orientation changes while
  // the sheet is open are not tracked (acceptable trade-off for simplicity).
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 640px)')
    if (mq.matches) return

    const vv = window.visualViewport
    if (!vv) return

    const handleResize = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardOffset(Math.max(0, offset))
      setViewportHeight(vv.height)
    }

    handleResize()
    vv.addEventListener('resize', handleResize)
    vv.addEventListener('scroll', handleResize)
    return () => {
      vv.removeEventListener('resize', handleResize)
      vv.removeEventListener('scroll', handleResize)
      setKeyboardOffset(0)
      setViewportHeight(window.innerHeight)
    }
  }, [open])

  const isActive = open || activeCount > 0

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
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
        <>
          {/* Mobile backdrop */}
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel: bottom-sheet on mobile, dropdown on desktop */}
          <div
            role="dialog"
            aria-label={label}
            className={cn(
              // Mobile: fixed bottom sheet
              'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] animate-slide-up transition-[bottom,max-height] duration-200 ease-out',
              'max-h-[80vh] overflow-y-auto',
              // Desktop: absolute dropdown
              'sm:absolute sm:inset-auto sm:bottom-auto sm:mt-2 sm:rounded-2xl sm:bg-white/80 sm:backdrop-blur-xl sm:shadow-lg sm:ring-1 sm:ring-black/[0.06] sm:animate-scale-in',
              'sm:max-h-none sm:overflow-visible',
              align === 'right' ? 'sm:right-0' : 'sm:left-0',
              panelClassName
            )}
            style={
              keyboardOffset > 0
                ? {
                    bottom: `${keyboardOffset}px`,
                    maxHeight: `calc(${viewportHeight}px * 0.8)`,
                    transition: 'bottom 0.2s ease-out, max-height 0.2s ease-out',
                  }
                : undefined
            }
          >
            {/* Drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="h-1 w-8 rounded-full bg-slate-300" />
            </div>

            {/* Mobile header with close button */}
            <div className="sm:hidden flex items-center justify-between px-4 pt-1 pb-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content — extra padding on mobile */}
            <div className="p-4 safe-area-bottom sm:p-0">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
