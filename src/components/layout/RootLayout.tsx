import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { trackPageView } from '@/lib/analytics'
import { useCookieConsent } from '@/hooks/useCookieConsent'

export function RootLayout() {
  const { pathname } = useLocation()
  const { consentStatus } = useCookieConsent()

  useEffect(() => {
    // Only track page views after the user has accepted cookies
    if (consentStatus === 'accepted') {
      trackPageView(pathname)
    }
  }, [pathname, consentStatus])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-700 focus:shadow-lg focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        <div key={pathname} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
      <MobileNav />
      <CookieBanner />
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  )
}
