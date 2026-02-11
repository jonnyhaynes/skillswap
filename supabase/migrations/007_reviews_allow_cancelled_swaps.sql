-- Allow reviews on cancelled swaps (not just completed)
DROP POLICY IF EXISTS "Users can create reviews for own completed swaps" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for own completed or cancelled swaps" ON public.reviews;

CREATE POLICY "Users can create reviews for own completed or cancelled swaps"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.swap_proposals
      WHERE id = swap_id
      AND status IN ('completed', 'cancelled')
      AND (proposer_id = auth.uid() OR recipient_id = auth.uid())
    )
  );
