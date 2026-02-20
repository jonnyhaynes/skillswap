// Extend the Window interface so TypeScript knows about gtag
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[]
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

let _initialized = false

/**
 * Initialise GA4. Safe to call multiple times — only runs once.
 * Must be called explicitly after the user has granted cookie consent.
 */
export function initGA4(): void {
  if (_initialized || !measurementId) return
  _initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  // GA4 requires the native `arguments` object — do NOT convert to rest params.
  // dataLayer.push(arguments) pushes an Arguments object (not an array), which
  // the GA4 tag parser specifically inspects. A rest parameter would break tracking.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
}

function isGtagReady(): boolean {
  return Boolean(measurementId) && typeof window.gtag === 'function'
}

// Basic PII guard: matches email-shaped strings (anything@anything.anything).
// Prevents accidental email addresses in search queries being sent to GA4.
const EMAIL_PATTERN = /\S+@\S+\.\S+/

/**
 * Track a page view. No-op if GA4 has not been initialised.
 */
export function trackPageView(path: string): void {
  if (!isGtagReady()) return
  window.gtag!('event', 'page_view', {
    page_path: path,
    send_to: measurementId,
  })
}

/**
 * Track a successful sign-up. Uses GA4's recommended 'sign_up' event.
 * No-op if GA4 has not been initialised.
 */
export function trackSignUp(): void {
  if (!isGtagReady()) return
  window.gtag!('event', 'sign_up', {
    send_to: measurementId,
  })
}

/**
 * Track a successful swap proposal submission.
 * No-op if GA4 has not been initialised.
 */
export function trackSwapRequested(): void {
  if (!isGtagReady()) return
  window.gtag!('event', 'swap_requested', {
    send_to: measurementId,
  })
}

/**
 * Track a search query. Uses GA4's recommended 'search' event.
 * Only fires for queries of 3+ non-whitespace characters.
 * Skips email-shaped queries to avoid sending PII to GA4.
 * No-op if GA4 has not been initialised.
 */
export function trackSearch(query: string): void {
  if (!isGtagReady()) return
  if (query.trim().length < 3) return
  if (EMAIL_PATTERN.test(query)) return
  window.gtag!('event', 'search', {
    search_term: query,
    send_to: measurementId,
  })
}
