-- Security: prevent a single user from filing duplicate reports against the same target.
-- Combined with the Turnstile server-side verification added in the submit-report
-- Edge Function, this closes the report-flooding vector identified in the security review.
--
-- A user may re-report the same person after a moderator resolves/dismisses the
-- original report by deleting or updating it.

ALTER TABLE public.user_reports
  ADD CONSTRAINT user_reports_reporter_reported_unique
  UNIQUE (reporter_id, reported_user_id);
