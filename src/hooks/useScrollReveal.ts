import { useEffect, useRef, useState } from 'react'

/**
 * Triggers a one-time reveal animation when the element enters the viewport.
 * Returns a ref to attach to the element and a `revealed` boolean.
 *
 * @param threshold – fraction of the element visible before triggering (0–1)
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.unobserve(el)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, revealed }
}
