-- Security fix: verify that reviewee_id is the OTHER participant of the
-- referenced swap, not just any arbitrary user ID.
--
-- The previous policy only checked that the reviewer (auth.uid()) was a
-- participant in a completed/cancelled swap — it did not verify that
-- reviewee_id was the other party. This allowed a reviewer to assign a
-- review (and rating) to any third-party user by supplying an arbitrary UUID.

DROP POLICY IF EXISTS "Users can create reviews for own completed or cancelled swaps" ON public.reviews;

CREATE POLICY "Users can create reviews for completed swaps"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id != reviewee_id
    AND EXISTS (
      SELECT 1 FROM public.swap_proposals sp
      WHERE sp.id = swap_id
        AND sp.status IN ('completed', 'cancelled')
        AND (
          (sp.proposer_id = auth.uid() AND sp.recipient_id = reviewee_id)
          OR (sp.recipient_id = auth.uid() AND sp.proposer_id = reviewee_id)
        )
    )
  );
