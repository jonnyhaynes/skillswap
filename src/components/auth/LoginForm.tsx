import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!email.trim()) {
      setLocalError('Please enter your email address')
      return
    }

    if (!password) {
      setLocalError('Please enter your password')
      return
    }

    const result = await signIn(email, password)

    if (!result.error) {
      onSuccess?.()
    }
  }

  const displayError = localError || error

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {displayError}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          aria-required="true"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="Enter your password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign up
        </Link>
      </p>
    </form>
  )
}
