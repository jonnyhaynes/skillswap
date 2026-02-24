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
import { OnboardingPage } from '@/pages/OnboardingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { ContactPage } from '@/pages/ContactPage'
import { AccountSettingsPage } from '@/pages/AccountSettingsPage'

// Stable named wrappers — avoids remounting when search params change
// (inline `element={<AuthGuard><Page /></AuthGuard>}` creates a new element each render)
const GuardedSkillDetail = () => <AuthGuard><SkillDetailPage /></AuthGuard>
const GuardedOnboarding = () => <AuthGuard><OnboardingPage /></AuthGuard>
const GuardedCreateListing = () => <AuthGuard><CreateListingPage /></AuthGuard>
const GuardedEditListing = () => <AuthGuard><EditListingPage /></AuthGuard>
const GuardedEditProfile = () => <AuthGuard><EditProfilePage /></AuthGuard>
const GuardedMyListings = () => <AuthGuard><MyListingsPage /></AuthGuard>
const GuardedSwaps = () => <AuthGuard><SwapsPage /></AuthGuard>
const GuardedSwapDetail = () => <AuthGuard><SwapDetailPage /></AuthGuard>
const GuardedMessages = () => <AuthGuard><MessagesPage /></AuthGuard>
const GuardedConversation = () => <AuthGuard><ConversationPage /></AuthGuard>
const GuardedAccountSettings = () => <AuthGuard><AccountSettingsPage /></AuthGuard>

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
      { path: 'skills/:skillId', Component: GuardedSkillDetail },
      { path: 'profile/:userId', Component: ProfilePage },

      // Auth routes (public, redirect if logged in)
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignUpPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },

      // Onboarding for new OAuth users
      { path: 'onboarding', Component: GuardedOnboarding },

      // Protected routes - require authentication
      { path: 'skills/new', Component: GuardedCreateListing },
      { path: 'skills/:skillId/edit', Component: GuardedEditListing },
      { path: 'profile/edit', Component: GuardedEditProfile },
      { path: 'settings/account', Component: GuardedAccountSettings },
      { path: 'my-listings', Component: GuardedMyListings },
      { path: 'swaps', Component: GuardedSwaps },
      { path: 'swaps/:swapId', Component: GuardedSwapDetail },
      { path: 'messages', Component: GuardedMessages },
      { path: 'messages/:conversationId', Component: GuardedConversation },

      // Legal pages
      { path: 'terms', Component: TermsOfServicePage },
      { path: 'privacy', Component: PrivacyPolicyPage },
      { path: 'contact', Component: ContactPage },

      // 404
      { path: '*', Component: NotFoundPage },
    ],
  },
])
