import { Link } from 'react-router'
import { useCookieConsent } from '@/hooks/useCookieConsent'

/**
 * GDPR cookie consent banner. Renders as a fixed bottom bar when the user
 * has not yet made a consent decision. Disappears permanently once they
 * accept or decline.
 *
 * GA4 and Bugsnag are only initialised after the user clicks "Accept cookies".
 */
export function CookieBanner() {
  const { consentStatus, accept, decline } = useCookieConsent()

  // Only render when no decision has been made yet
  if (consentStatus !== null) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/60 bg-white/95 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
        pb-16 md:pb-0 animate-fade-in"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-slate-600 leading-relaxed">
          We use cookies to keep you signed in and to understand how SkillSwap is used (Google
          Analytics) and catch errors (Bugsnag). Analytics and error reporting only activate with
          your consent.{' '}
          <Link
            to="/privacy"
            className="font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={decline}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
          >
            Accept cookies
          </button>
        </div>
      </div>
    </div>
  )
}
