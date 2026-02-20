import { useState, useEffect, useCallback } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthProvider } from './context/AuthContext'
import { SkillsProvider } from './context/SkillsContext'
import { SwapsProvider } from './context/SwapsContext'
import { MessagesProvider } from './context/MessagesContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { ToastProvider } from './context/ToastContext'
import { CookieConsentProvider } from './context/CookieConsentContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { createBugsnagErrorBoundary } from './lib/bugsnag'
import type { ComponentType, ReactNode } from 'react'

// Bugsnag boundary type returned by createErrorBoundary
type BugsnagBoundaryType = ComponentType<{ children: ReactNode }>

function AppContent() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CookieConsentProvider>
          <AuthProvider>
            <SkillsProvider>
              <SwapsProvider>
                <MessagesProvider>
                  <ReviewsProvider>
                    <RouterProvider router={router} />
                  </ReviewsProvider>
                </MessagesProvider>
              </SwapsProvider>
            </SkillsProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default function App() {
  // Initialise with any existing boundary (returning user who previously accepted).
  // useState lazy initialiser: pass a wrapper fn so React calls it once on mount.
  // For first-time visitors createBugsnagErrorBoundary() returns null until consent.
  const [BugsnagBoundary, setBugsnagBoundary] = useState<BugsnagBoundaryType | null>(
    () => createBugsnagErrorBoundary() as BugsnagBoundaryType | null
  )

  const activateBugsnagBoundary = useCallback(() => {
    const boundary = createBugsnagErrorBoundary()
    if (boundary) setBugsnagBoundary(boundary as BugsnagBoundaryType)
  }, [])

  // Listen for consent being granted so we can activate Bugsnag boundary
  // after initBugsnag() has been called by CookieConsentContext.
  useEffect(() => {
    window.addEventListener('skillswap:consent-accepted', activateBugsnagBoundary)
    return () => window.removeEventListener('skillswap:consent-accepted', activateBugsnagBoundary)
  }, [activateBugsnagBoundary])

  if (BugsnagBoundary) {
    return (
      <BugsnagBoundary>
        <AppContent />
      </BugsnagBoundary>
    )
  }

  return <AppContent />
}
