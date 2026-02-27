-- Explicitly deny DELETE on user_reports for all non-service roles.
--
-- The table already has no SELECT/UPDATE/DELETE policies, so PostgREST
-- returns 0 rows for authenticated SELECT and blocks UPDATE. However,
-- without an explicit DENY for DELETE, a determined caller could still
-- attempt deletion via the authenticated role if they bypassed the
-- lack-of-policy guard in a future PostgREST version or misconfiguration.
-- An explicit USING (false) policy closes this gap permanently.

CREATE POLICY "Deny deletion of reports by authenticated users"
  ON user_reports FOR DELETE
  TO authenticated
  USING (false);
