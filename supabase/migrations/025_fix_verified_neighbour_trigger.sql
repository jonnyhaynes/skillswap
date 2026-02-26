-- Security fix: extend the verified neighbour trigger to fire on UPDATE and
-- DELETE of reviews, not only INSERT.
--
-- Previously, if a review's rating was changed (e.g. by the service role
-- during account anonymisation) or a review was deleted, is_verified_neighbour
-- would not be recalculated and could remain stale.

-- Update on_review_inserted() to handle DELETE (NEW is NULL) and UPDATE
-- (reviewee_id may have changed between old and new row).
CREATE OR REPLACE FUNCTION on_review_inserted()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_verified_neighbour(OLD.reviewee_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_verified_neighbour(NEW.reviewee_id);
    -- If the reviewee changed on an UPDATE, recalculate the old one too
    IF TG_OP = 'UPDATE'
       AND OLD.reviewee_id IS DISTINCT FROM NEW.reviewee_id
       AND OLD.reviewee_id IS NOT NULL
    THEN
      PERFORM recalculate_verified_neighbour(OLD.reviewee_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Drop the INSERT-only trigger and recreate for INSERT, UPDATE, and DELETE
DROP TRIGGER IF EXISTS trigger_recalculate_verified_neighbour ON public.reviews;

CREATE TRIGGER trigger_recalculate_verified_neighbour
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION on_review_inserted();
