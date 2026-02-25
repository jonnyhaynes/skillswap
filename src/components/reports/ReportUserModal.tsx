import { useState, useCallback, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Turnstile } from '@/components/ui/Turnstile'
import { useAuth } from '@/hooks/useAuth'
import { submitUserReport } from '@/services/reports'
import type { ReportReason } from '@/types'

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate-content', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam or unwanted messages' },
  { value: 'scam-fraud', label: 'Scam or fraud' },
  { value: 'dangerous-illegal-activity', label: 'Dangerous or illegal activity' },
  { value: 'safety-concern', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
]

interface ReportUserModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  evidenceSwapId?: string
  evidenceSkillId?: string
}

export function ReportUserModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  evidenceSwapId,
  evidenceSkillId,
}: ReportUserModalProps) {
  const { currentUser } = useAuth()

  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  const resetForm = () => {
    setReason('')
    setDescription('')
    setError(null)
    setLoading(false)
    setShowConfirmation(false)
    setTurnstileToken(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentUser) {
      setError('You must be logged in to submit a report')
      return
    }

    if (!reason) {
      setError('Please select a reason for your report')
      return
    }

    if (!description.trim()) {
      setError('Please provide details about your report')
      return
    }

    if (description.trim().length < 20) {
      setError('Please provide at least 20 characters of detail')
      return
    }

    if (!turnstileToken) {
      setError('Please complete the verification check')
      return
    }

    setLoading(true)

    try {
      await submitUserReport({
        reportedUserId,
        reason,
        description: description.trim(),
        evidenceSwapId: evidenceSwapId ?? null,
        evidenceSkillId: evidenceSkillId ?? null,
        turnstileToken: turnstileToken!,
      })
      setShowConfirmation(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again later.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Report ${reportedUserName}`}>
      {showConfirmation ? (
        <div className="text-center py-6 space-y-5">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary-500 opacity-15 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 font-display">Report submitted</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
              Thank you for helping keep our community safe. We'll review your report and take appropriate action.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            If someone is in immediate danger, please contact the emergency services. For all other concerns, please provide as much detail as possible below.
          </p>

          <div>
            <label htmlFor="report-reason" className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason for report
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="report-description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Details
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y placeholder:text-slate-400 bg-white"
              placeholder="Please describe what happened and why you're reporting this user..."
            />
          </div>

          {(evidenceSwapId || evidenceSkillId) && (
            <p className="text-xs text-slate-400">
              This report will be linked to the associated {evidenceSwapId ? 'swap' : 'skill listing'} for context.
            </p>
          )}

          <Turnstile
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
          />

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              disabled={loading || !turnstileToken}
              className="flex-1"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
