import { supabase } from '@/lib/supabase'
import { mapUserReportToDbInsert } from '@/lib/typeMappers'
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
  reporterId: string
  reportedUserId: string
  reason: ReportReason
  description: string
  evidenceSwapId?: string | null
}): Promise<void> {
  const insert = mapUserReportToDbInsert({
    reporterId: data.reporterId,
    reportedUserId: data.reportedUserId,
    reason: data.reason,
    description: data.description,
    evidenceSwapId: data.evidenceSwapId ?? null,
  })

  const { error } = await supabase.from('user_reports').insert(insert)

  if (error) {
    throw new ReportsServiceError(
      error.message || 'Failed to submit report',
      error.code,
    )
  }
}
