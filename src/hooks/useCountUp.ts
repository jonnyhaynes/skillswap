import { useEffect, useRef, useState } from 'react'

export function useCountUp(end: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const isVisible = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (end === 0 || hasAnimated.current) return

    function tryAnimate() {
      if (!isVisible.current) {
        // Not visible yet — wait and check again
        const id = requestAnimationFrame(tryAnimate)
        return () => cancelAnimationFrame(id)
      }

      hasAnimated.current = true
      const start = performance.now()

      function tick(now: number) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * end))
        if (progress < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    }

    tryAnimate()
  }, [end, duration])

  return { count, ref }
}
