import { Navigate } from 'react-router'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useAuth } from '@/hooks/useAuth'
import { useSeo } from '@/hooks/useSeo'

export function ForgotPasswordPage() {
  useSeo({
    title: 'Reset Your Password',
    description: 'Request a password reset link for your SkillSwap account.',
    noindex: true,
  })

  const { currentUser, initialized } = useAuth()

  // Redirect if already logged in
  if (initialized && currentUser) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
