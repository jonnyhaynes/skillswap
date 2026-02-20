// Extend the Window interface so TypeScript knows about gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

/**
 * Track a page view. No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackPageView(path: string): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    send_to: measurementId,
  })
}
