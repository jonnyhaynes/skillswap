import { Navigate } from 'react-router'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useAuth } from '@/hooks/useAuth'

export function SignUpPage() {
  const { currentUser, initialized } = useAuth()

  // Redirect if already logged in
  if (initialized && currentUser) {
    return <Navigate to="/" replace />
  }

  const handleSuccess = () => {
    // Don't navigate immediately - the form shows a confirmation message
    // User will navigate themselves after email confirmation
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-600 mt-2">Join SkillSwap and start bartering skills</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <SignUpForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
