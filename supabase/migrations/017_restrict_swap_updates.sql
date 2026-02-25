-- Security: restrict what authenticated users can change on swap_proposals.
--
-- Two-layer defence:
--   1. Column-level REVOKE prevents writing immutable fields entirely.
--   2. A BEFORE UPDATE trigger enforces valid state transitions and
--      role-based rules (only the recipient can accept/decline; each party
--      can only set their own completion flag; terminal states are locked).

-- ── 1. Lock immutable columns ──────────────────────────────────────────────

REVOKE UPDATE (
  proposer_id,
  recipient_id,
  offered_skill_id,
  requested_skill_id,
  message,
  proposed_at,
  conversation_id
) ON public.swap_proposals FROM authenticated;

-- ── 2. State-transition trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_swap_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ── Status transitions ──────────────────────────────────────────────────

  IF NEW.status IS DISTINCT FROM OLD.status THEN

    -- Terminal states cannot be modified further
    IF OLD.status IN ('completed', 'declined', 'cancelled') THEN
      RAISE EXCEPTION 'Cannot modify a swap in % status', OLD.status;
    END IF;

    IF OLD.status = 'pending' THEN
      IF NEW.status NOT IN ('in_progress', 'declined', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition: pending → %', NEW.status;
      END IF;
      -- Only the recipient may accept (in_progress) or decline
      IF NEW.status IN ('in_progress', 'declined') AND auth.uid() != OLD.recipient_id THEN
        RAISE EXCEPTION 'Only the recipient can accept or decline a proposal';
      END IF;
      -- Only the proposer may cancel a pending swap
      IF NEW.status = 'cancelled' AND auth.uid() != OLD.proposer_id THEN
        RAISE EXCEPTION 'Only the proposer can cancel a pending proposal';
      END IF;
    END IF;

    IF OLD.status = 'in_progress' THEN
      IF NEW.status NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition: in_progress → %', NEW.status;
      END IF;
      -- completed requires both parties to have confirmed
      IF NEW.status = 'completed'
         AND NOT (NEW.proposer_completed AND NEW.recipient_completed) THEN
        RAISE EXCEPTION 'Cannot mark completed: both parties must confirm first';
      END IF;
    END IF;

  END IF;

  -- ── Completion flags ────────────────────────────────────────────────────

  IF NEW.proposer_completed IS DISTINCT FROM OLD.proposer_completed THEN
    IF auth.uid() != OLD.proposer_id THEN
      RAISE EXCEPTION 'Only the proposer can set proposer_completed';
    END IF;
    IF OLD.status != 'in_progress' THEN
      RAISE EXCEPTION 'proposer_completed can only be set on an in_progress swap';
    END IF;
  END IF;

  IF NEW.recipient_completed IS DISTINCT FROM OLD.recipient_completed THEN
    IF auth.uid() != OLD.recipient_id THEN
      RAISE EXCEPTION 'Only the recipient can set recipient_completed';
    END IF;
    IF OLD.status != 'in_progress' THEN
      RAISE EXCEPTION 'recipient_completed can only be set on an in_progress swap';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_swap_update_rules
  BEFORE UPDATE ON public.swap_proposals
  FOR EACH ROW
  EXECUTE FUNCTION validate_swap_update();
