import { createBrowserRouter, useRouteError, Link } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { HomePage } from '@/pages/HomePage'
import { BrowseSkillsPage } from '@/pages/BrowseSkillsPage'
import { SkillDetailPage } from '@/pages/SkillDetailPage'
import { CreateListingPage } from '@/pages/CreateListingPage'
import { EditListingPage } from '@/pages/EditListingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { EditProfilePage } from '@/pages/EditProfilePage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { SwapsPage } from '@/pages/SwapsPage'
import { SwapDetailPage } from '@/pages/SwapDetailPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { ConversationPage } from '@/pages/ConversationPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { ContactPage } from '@/pages/ContactPage'

function RouteErrorPage() {
  const error = useRouteError()
  console.error('Route error:', error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-slate-600">
          An unexpected error occurred. Please try again.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    errorElement: <RouteErrorPage />,
    children: [
      // Public routes
      { index: true, Component: HomePage },
      { path: 'browse', Component: BrowseSkillsPage },
      {
        path: 'skills/:skillId',
        element: (
          <AuthGuard>
            <SkillDetailPage />
          </AuthGuard>
        ),
      },
      { path: 'profile/:userId', Component: ProfilePage },

      // Auth routes (public, redirect if logged in)
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignUpPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },

      // Protected routes - require authentication
      {
        path: 'skills/new',
        element: (
          <AuthGuard>
            <CreateListingPage />
          </AuthGuard>
        ),
      },
      {
        path: 'skills/:skillId/edit',
        element: (
          <AuthGuard>
            <EditListingPage />
          </AuthGuard>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <AuthGuard>
            <EditProfilePage />
          </AuthGuard>
        ),
      },
      {
        path: 'my-listings',
        element: (
          <AuthGuard>
            <MyListingsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'swaps',
        element: (
          <AuthGuard>
            <SwapsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'swaps/:swapId',
        element: (
          <AuthGuard>
            <SwapDetailPage />
          </AuthGuard>
        ),
      },
      {
        path: 'messages',
        element: (
          <AuthGuard>
            <MessagesPage />
          </AuthGuard>
        ),
      },
      {
        path: 'messages/:conversationId',
        element: (
          <AuthGuard>
            <ConversationPage />
          </AuthGuard>
        ),
      },

      // Legal pages
      { path: 'terms', Component: TermsOfServicePage },
      { path: 'privacy', Component: PrivacyPolicyPage },
      { path: 'contact', Component: ContactPage },

      // 404
      { path: '*', Component: NotFoundPage },
    ],
  },
])
