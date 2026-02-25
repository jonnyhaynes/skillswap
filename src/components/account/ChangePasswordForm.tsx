import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function ChangePasswordForm() {
  const { updatePassword } = useAuth()

  const [expanded, setExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCancel() {
    setExpanded(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const result = await updatePassword(currentPassword, newPassword)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  // ── Collapsed ──────────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="flex justify-between items-center px-4 py-3">
        <div>
          <span className="text-sm text-gray-500">Password</span>
          <span className="text-sm text-gray-400 ml-4">••••••••</span>
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
      <p className="text-sm font-medium text-gray-700 mb-3">Change password</p>

      {success && (
        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          Password updated successfully.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="password-current" className="block text-sm text-gray-600 mb-1">
            Current password
          </label>
          <input
            id="password-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password-new" className="block text-sm text-gray-600 mb-1">
            New password
          </label>
          <input
            id="password-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password-confirm" className="block text-sm text-gray-600 mb-1">
            Confirm new password
          </label>
          <input
            id="password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save password'}
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
