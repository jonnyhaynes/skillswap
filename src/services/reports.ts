import { supabase } from '@/lib/supabase'
import type { ReportReason } from '@/types'

export class ReportsServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ReportsServiceError'
    this.code = code
  }
}

export async function submitUserReport(data: {
  reportedUserId: string
  reason: ReportReason
  description: string
  evidenceSwapId?: string | null
  evidenceSkillId?: string | null
  turnstileToken: string
}): Promise<void> {
  const { error } = await supabase.functions.invoke('submit-report', {
    body: {
      reportedUserId: data.reportedUserId,
      reason: data.reason,
      description: data.description,
      evidenceSwapId: data.evidenceSwapId ?? null,
      evidenceSkillId: data.evidenceSkillId ?? null,
      turnstileToken: data.turnstileToken,
    },
  })

  if (error) {
    // Supabase wraps the function's error response in error.message as JSON
    try {
      const parsed = JSON.parse(error.message)
      throw new ReportsServiceError(parsed.error || 'Failed to submit report')
    } catch {
      throw new ReportsServiceError(error.message || 'Failed to submit report')
    }
  }
}
