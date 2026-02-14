-- Verified Neighbour Auto-Verification Trigger
-- Recalculates is_verified_neighbour when a review is inserted.
-- Criteria: 5+ completed swaps AND average review rating = 5.0

CREATE OR REPLACE FUNCTION recalculate_verified_neighbour(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  swap_count INTEGER;
  avg_rating NUMERIC;
BEGIN
  -- Count completed swaps where user is proposer or recipient
  SELECT COUNT(*) INTO swap_count
  FROM public.swap_proposals
  WHERE status = 'completed'
    AND (proposer_id = user_uuid OR recipient_id = user_uuid);

  -- Calculate average rating from reviews where user is reviewee
  SELECT AVG(rating)::NUMERIC INTO avg_rating
  FROM public.reviews
  WHERE reviewee_id = user_uuid;

  -- Update verification status
  UPDATE public.profiles
  SET is_verified_neighbour = (swap_count >= 5 AND avg_rating = 5.0)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function that extracts reviewee_id and calls recalculate
CREATE OR REPLACE FUNCTION on_review_inserted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_verified_neighbour(NEW.reviewee_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire after every review insert
CREATE TRIGGER trigger_recalculate_verified_neighbour
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION on_review_inserted();
