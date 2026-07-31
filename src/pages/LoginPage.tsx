import { useNavigate, useLocation, Navigate } from 'react-router'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { useSeo } from '@/hooks/useSeo'

export function LoginPage() {
  useSeo({
    title: 'Sign In',
    description:
      'Sign in to your SkillSwap account to propose swaps, message neighbours and manage your listings.',
    noindex: true,
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, initialized, needsOnboarding } = useAuth()

  // Get the redirect destination from location state, or default to home.
  // Validate it is a relative path (starts with / but not //) to prevent open redirects.
  const rawFrom = (location.state as { from?: Location })?.from?.pathname
  const from = rawFrom && /^\/(?!\/)/.test(rawFrom) ? rawFrom : '/'

  // Redirect if already logged in
  if (initialized && currentUser) {
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to={from} replace />
  }

  const handleSuccess = () => {
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-600 mt-2">Sign in to your SkillSwap account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
