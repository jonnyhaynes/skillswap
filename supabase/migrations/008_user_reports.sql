-- User reports table for reporting inappropriate behaviour, harassment, etc.

CREATE TYPE report_reason AS ENUM (
  'harassment',
  'inappropriate-content',
  'spam',
  'scam-fraud',
  'dangerous-illegal-activity',
  'safety-concern',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'open',
  'under_review',
  'resolved',
  'dismissed'
);

CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_swap_id UUID REFERENCES swap_proposals(id) ON DELETE SET NULL,
  status report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_users CHECK (reporter_id != reported_user_id)
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can submit reports
CREATE POLICY "Authenticated users can submit reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- No SELECT/UPDATE/DELETE policies — reports are only visible via admin/service role
