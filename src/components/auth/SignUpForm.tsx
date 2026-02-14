import { useState, useCallback, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Turnstile } from '@/components/ui/Turnstile'
import { useAuth } from '@/hooks/useAuth'
import { ensureNeighbourhoodExists } from '@/services/neighbourhoods'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'


interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    neighbourhood: '',
    postcode: '',
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{ latitude?: number; longitude?: number }>({})

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    // Validation
    if (!formData.firstName.trim()) {
      setLocalError('Please enter your first name')
      return
    }

    if (!formData.lastName.trim()) {
      setLocalError('Please enter your last name')
      return
    }

    if (!formData.email.trim()) {
      setLocalError('Please enter your email address')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (!formData.neighbourhood) {
      setLocalError('Please select a neighbourhood from the suggestions')
      return
    }

    if (!turnstileToken) {
      setLocalError('Please complete the verification check')
      return
    }

    // Ensure the selected neighbourhood exists in the DB (upserts)
    await ensureNeighbourhoodExists(
      formData.neighbourhood,
      neighbourhoodCoords.latitude,
      neighbourhoodCoords.longitude,
    )

    const result = await signUp(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      neighbourhood: formData.neighbourhood,
      postcode: formData.postcode || undefined,
    }, turnstileToken)

    if (!result.error) {
      setShowConfirmation(true)
      onSuccess?.()
    }
  }

  const displayError = localError || error

  if (showConfirmation) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
        <p className="text-slate-600">
          We've sent a confirmation link to <strong>{formData.email}</strong>. Please check your
          inbox and click the link to activate your account.
        </p>
        <p className="text-sm text-slate-500">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setShowConfirmation(false)}
            className="text-primary-600 hover:text-primary-700"
          >
            try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <NeighbourhoodTypeahead
        value={formData.neighbourhood}
        onChange={(place) => {
          setFormData((prev) => ({ ...prev, neighbourhood: place?.name ?? '' }))
          setNeighbourhoodCoords({
            latitude: place?.latitude,
            longitude: place?.longitude,
          })
        }}
        required
      />

      <div>
        <label htmlFor="postcode" className="block text-sm font-medium text-slate-700 mb-1">
          Postcode <span className="text-slate-500">(optional)</span>
        </label>
        <input
          id="postcode"
          name="postcode"
          type="text"
          value={formData.postcode}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="e.g. E8 1AB"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="At least 6 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="Re-enter your password"
        />
      </div>

      <Turnstile
        onVerify={handleTurnstileVerify}
        onExpire={handleTurnstileExpire}
      />

      <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  )
}
