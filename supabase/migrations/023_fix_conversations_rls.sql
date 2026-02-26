-- Security fix: prevent conversation participants from directly modifying
-- participant_ids via the REST API.
--
-- The previous UPDATE policy had no WITH CHECK and no column restriction.
-- While the default WITH CHECK matches the USING expression (requiring the
-- caller to still be in participant_ids after the update), a participant
-- could add or remove other participants from the array.
--
-- Only last_message_at and last_message_preview need to be updatable by
-- authenticated users; everything else is managed by triggers or service role.

REVOKE UPDATE ON public.conversations FROM authenticated;
GRANT UPDATE (last_message_at, last_message_preview) ON public.conversations TO authenticated;
