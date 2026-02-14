import { useNavigate, useLocation, Navigate } from 'react-router'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, initialized, needsOnboarding } = useAuth()

  // Get the redirect destination from location state, or default to home
  const from = (location.state as { from?: Location })?.from?.pathname || '/'

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
