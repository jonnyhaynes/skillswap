export type ReportReason =
  | 'harassment'
  | 'inappropriate-content'
  | 'spam'
  | 'scam-fraud'
  | 'dangerous-illegal-activity'
  | 'safety-concern'
  | 'other'

export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed'

export interface UserReport {
  id: string
  reporterId: string
  reportedUserId: string
  reason: ReportReason
  description: string
  evidenceSwapId: string | null
  evidenceSkillId: string | null
  status: ReportStatus
  createdAt: string
}
