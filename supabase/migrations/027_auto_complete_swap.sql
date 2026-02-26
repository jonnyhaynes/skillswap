-- Atomic swap completion trigger.
--
-- Instead of the client reading the swap, deciding both parties are done, and
-- then writing status='completed' (a TOCTOU race), this BEFORE UPDATE trigger
-- performs the transition atomically inside the same transaction.
--
-- Because BEFORE triggers fire in alphabetical order, this trigger runs before
-- the existing `enforce_swap_update_rules` trigger (migration 017), so the
-- validation sees the already-updated status field and accepts the transition.

CREATE OR REPLACE FUNCTION auto_complete_swap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When both completion flags become true on an in-progress swap and
  -- the caller has not already attempted to change the status themselves,
  -- automatically advance status to 'completed'.
  IF NEW.proposer_completed
     AND NEW.recipient_completed
     AND OLD.status = 'in_progress'
     AND NEW.status = 'in_progress' THEN
    NEW.status      := 'completed';
    NEW.completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_complete_swap
  BEFORE UPDATE ON public.swap_proposals
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_swap();
