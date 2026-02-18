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
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on outside click or Escape
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
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute z-50 mt-2 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-black/[0.06] animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
