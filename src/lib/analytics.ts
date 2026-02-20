// Extend the Window interface so TypeScript knows about gtag
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[]
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

// Only inject the GA4 script when the env var is present.
// This prevents local dev and staging from polluting production analytics.
if (measurementId) {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
}

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

/**
 * Track a successful sign-up. Uses GA4's recommended 'sign_up' event.
 * No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackSignUp(): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'sign_up', {
    send_to: measurementId,
  })
}

/**
 * Track a successful swap proposal submission.
 * No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackSwapRequested(): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'swap_requested', {
    send_to: measurementId,
  })
}

/**
 * Track a search query. Uses GA4's recommended 'search' event.
 * Only call this when query.length >= 3.
 * No-op if VITE_GA_MEASUREMENT_ID is not set.
 */
export function trackSearch(query: string): void {
  if (!measurementId || typeof window.gtag !== 'function') return
  window.gtag('event', 'search', {
    search_term: query,
    send_to: measurementId,
  })
}
