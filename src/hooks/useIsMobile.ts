import { useState, useEffect } from 'react'

/** Tracks whether the viewport is below the Tailwind `sm` breakpoint (640px). */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(min-width: 640px)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(!e.matches)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
