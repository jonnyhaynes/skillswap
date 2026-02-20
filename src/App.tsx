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

// Compute once at module load time — never changes after mount.
// For returning users who previously accepted, CookieConsentContext will have
// called initBugsnag() synchronously (its useState initialiser reads localStorage
// and the useEffect fires before this renders in practice), so this returns the
// real boundary. For first-time visitors Bugsnag is not started, so this is null.
// We accept that the Bugsnag boundary is not active for a brand-new session until
// the next page load after consent — the local ErrorBoundary catches errors in
// the meantime. This avoids remounting RouterProvider when consent changes.
const BugsnagErrorBoundary = createBugsnagErrorBoundary()

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
  if (BugsnagErrorBoundary) {
    return (
      <BugsnagErrorBoundary>
        <AppContent />
      </BugsnagErrorBoundary>
    )
  }

  return <AppContent />
}
