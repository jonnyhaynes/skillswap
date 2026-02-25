import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function ChangeEmailForm() {
  const { updateEmail, session } = useAuth()
  const currentEmail = session?.user.email ?? ''

  const [expanded, setExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCancel() {
    setExpanded(false)
    setCurrentPassword('')
    setNewEmail('')
    setSubmittedEmail('')
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newEmail === currentEmail) {
      setError("That's already your email address")
      return
    }

    setIsSubmitting(true)
    const result = await updateEmail(currentPassword, newEmail)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSubmittedEmail(newEmail)
    setSuccess(true)
    setCurrentPassword('')
    setNewEmail('')
  }

  // ── Collapsed ──────────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="flex justify-between items-center px-4 py-3">
        <div>
          <span className="text-sm text-gray-500">Email</span>
          <span className="text-sm text-gray-900 ml-4">{currentEmail}</span>
        </div>
        <button
          onClick={() => { setSuccess(false); setExpanded(true) }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Change
        </button>
      </div>
    )
  }

  // ── Expanded ───────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Change email</p>

      {success && (
        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          Confirmation email sent to <strong>{submittedEmail}</strong>. The change
          takes effect once you click the link.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email-current-password" className="block text-sm text-gray-600 mb-1">
            Current password
          </label>
          <input
            id="email-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="new-email" className="block text-sm text-gray-600 mb-1">
            New email address
          </label>
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save email'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
