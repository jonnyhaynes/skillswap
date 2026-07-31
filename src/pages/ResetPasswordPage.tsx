import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/errors'
import { Button } from '@/components/ui/Button'
import { useSeo } from '@/hooks/useSeo'

type PageStatus = 'loading' | 'ready' | 'invalid' | 'success'

export function ResetPasswordPage() {
  useSeo({
    title: 'Choose a New Password',
    description: 'Set a new password for your SkillSwap account.',
    noindex: true,
  })

  const navigate = useNavigate()
  const [status, setStatus] = useState<PageStatus>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Supabase parses the access_token from the URL hash and fires
    // PASSWORD_RECOVERY on all onAuthStateChange listeners. We register
    // here AND check getSession() to handle the case where the event
    // fired before this component mounted.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      }
    })

    // Only use getSession() to detect the case where the PASSWORD_RECOVERY
    // event fired before this component mounted (e.g. hard refresh on the link).
    // Never promote a regular authenticated session to 'ready' — that would
    // show the reset form to any logged-in user who navigates to this URL.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No session at all — don't wait for the full 3s timeout
        setStatus((current) => current === 'loading' ? 'invalid' : current)
      }
      // If there is a session, defer to the onAuthStateChange PASSWORD_RECOVERY
      // event to set 'ready'. A regular (non-recovery) session is not sufficient.
    })

    // If no recovery session is detected within 3 seconds the link has
    // expired or is otherwise invalid.
    const timeout = setTimeout(() => {
      setStatus((current) => current === 'loading' ? 'invalid' : current)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (updateError) {
      setError(getAuthErrorMessage(updateError))
      return
    }

    setStatus('success')
    await supabase.auth.signOut()
    setTimeout(() => navigate('/login'), 3000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600">Verifying your reset link…</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Link expired or invalid</h1>
            <p className="text-slate-600 text-sm">
              This password reset link has expired or has already been used. Reset links are valid for one hour.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Password updated</h1>
            <p className="text-slate-600 text-sm">
              Your password has been changed. Redirecting you to sign in…
            </p>
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
          <p className="mt-2 text-slate-600">Choose a strong password for your account.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-slate-700 mb-1">
                New password
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm new password
              </label>
              <input
                id="reset-password-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Repeat your new password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Updating password…' : 'Update password'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-4">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
