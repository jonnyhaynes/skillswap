import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthProvider } from './context/AuthContext'
import { SkillsProvider } from './context/SkillsContext'
import { SwapsProvider } from './context/SwapsContext'
import { MessagesProvider } from './context/MessagesContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { ToastProvider } from './context/ToastContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { BugsnagErrorBoundary } from './lib/bugsnag'

function AppContent() {
  return (
    <ErrorBoundary>
      <ToastProvider>
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
