import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSwaps } from '@/hooks/useSwaps'
import { exportAccountData, deleteAccount, AccountServiceError } from '@/services/account'

type Step = 'idle' | 'consequences' | 'confirm'

export default function DeleteAccountFlow() {
  const [step, setStep] = useState<Step>('idle')
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { currentUser, signOut } = useAuth()
  const { getActiveSwaps } = useSwaps()
  const navigate = useNavigate()

  const activeSwapCount = currentUser ? getActiveSwaps(currentUser.id).length : 0

  async function handleExport() {
    setIsExporting(true)
    setError(null)
    try {
      const data = await exportAccountData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'skillswap-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof AccountServiceError ? err.message : 'Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleDelete() {
    if (confirmation !== 'DELETE') return
    setIsDeleting(true)
    setError(null)
    try {
      await deleteAccount(confirmation)
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof AccountServiceError ? err.message : 'Deletion failed. Please try again.')
      setIsDeleting(false)
    }
  }

  // ── Idle state ────────────────────────────────────────────────────────────
  if (step === 'idle') {
    return (
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-900">Delete account</h3>
          <p className="text-sm text-gray-500 mt-1">
            Permanently remove your account and all associated data.
          </p>
        </div>
        <button
          onClick={() => setStep('consequences')}
          className="shrink-0 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete account
        </button>
      </div>
    )
  }

  // ── Step 1: Consequences ──────────────────────────────────────────────────
  if (step === 'consequences') {
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Delete your account</h3>
        <p className="text-sm text-gray-700 mb-4">This will permanently:</p>
        <ul className="text-sm text-gray-700 space-y-2 mb-6 list-disc list-inside">
          <li>Delete your profile and all skill listings</li>
          {activeSwapCount > 0 && (
            <li>
              Cancel{' '}
              <span className="font-medium">
                {activeSwapCount} active swap{activeSwapCount !== 1 ? 's' : ''}
              </span>
            </li>
          )}
          <li>Remove all your messages</li>
          <li>Anonymise reviews you&apos;ve given and received</li>
        </ul>

        <p className="text-sm text-gray-500 mb-6">
          Under UK GDPR you have the right to a copy of your data before deletion.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? 'Preparing download…' : '↓ Download your data'}
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue →
          </button>
          <button
            onClick={() => setStep('idle')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: Typed confirmation ────────────────────────────────────────────
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">Are you absolutely sure?</h3>
      <p className="text-sm text-gray-600 mb-6">
        Type <span className="font-mono font-semibold">DELETE</span> to confirm permanent account
        deletion. This cannot be undone.
      </p>

      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="Type DELETE to confirm"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        autoComplete="off"
        data-testid="delete-confirmation-input"
      />

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDelete}
          disabled={confirmation !== 'DELETE' || isDeleting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="confirm-delete-button"
        >
          {isDeleting ? 'Deleting…' : 'Permanently delete my account'}
        </button>
        <button
          onClick={() => setStep('consequences')}
          disabled={isDeleting}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Go back
        </button>
      </div>
    </div>
  )
}
