-- supabase/migrations/014_account_deletion.sql

-- Make review FKs nullable so anonymisation can set them to NULL
-- without deleting the review record
ALTER TABLE reviews
  ALTER COLUMN reviewer_id DROP NOT NULL,
  ALTER COLUMN reviewee_id DROP NOT NULL;

-- Atomic cleanup function called by the delete-account Edge Function.
-- Uses SECURITY DEFINER so it runs with the function owner's privileges,
-- allowing updates across rows regardless of RLS.
CREATE OR REPLACE FUNCTION delete_account_data(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cancelled_swap_ids UUID[];
BEGIN
  -- 1. Anonymise reviews this user wrote (keep reviewee_id so the
  --    other party retains their rating; remove reviewer identity + comment)
  UPDATE reviews
  SET reviewer_id = NULL,
      comment     = '[Review removed]'
  WHERE reviewer_id = p_user_id;

  -- 2. Anonymise reviews written about this user (keep reviewer_id so the
  --    reviewer retains their activity record; remove personal association)
  UPDATE reviews
  SET reviewee_id = NULL,
      comment     = '[Review removed]'
  WHERE reviewee_id = p_user_id;

  -- 3. Remove user from conversation participant arrays.
  --    Conversations are preserved so the other party keeps their history.
  UPDATE conversations
  SET participant_ids = array_remove(participant_ids, p_user_id)
  WHERE p_user_id = ANY(participant_ids);

  -- 4. Cancel active swaps and capture their IDs for notification
  WITH cancelled AS (
    UPDATE swap_proposals
    SET status = 'cancelled'
    WHERE (proposer_id = p_user_id OR recipient_id = p_user_id)
      AND status IN ('pending', 'in_progress')
    RETURNING id
  )
  SELECT array_agg(id) INTO v_cancelled_swap_ids FROM cancelled;

  RETURN jsonb_build_object(
    'cancelled_swap_ids', COALESCE(v_cancelled_swap_ids, ARRAY[]::UUID[])
  );
END;
$$;

-- Only the service role (used by the Edge Function) can call this.
-- Revoke from public and authenticated to prevent direct misuse.
REVOKE ALL ON FUNCTION delete_account_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION delete_account_data(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION delete_account_data(UUID) TO service_role;
