import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useIsMobile } from '@/hooks/useIsMobile'

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

  const toggle = useCallback(() => {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalOpen((prev) => !prev)
    }
  }, [isControlled, onToggle])

  const close = useCallback(() => {
    if (isControlled) {
      if (open) onToggle?.()
    } else {
      setInternalOpen(false)
    }
  }, [isControlled, open, onToggle])

  const isMobile = useIsMobile()

  // Close on outside click (desktop only — mobile has backdrop) or Escape
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close])

  // Lock body scroll on mobile when open (only for bottom sheet mode, not accordion)
  useEffect(() => {
    if (!open) return
    if (isControlled) return // accordion mode — no scroll lock
    if (!isMobile) return // desktop — don't lock scroll

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, isMobile, isControlled])

  const isActive = open || activeCount > 0

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
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

      {/* Controlled mobile (accordion mode): button only — parent renders content */}

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
    </div>
  )
}
