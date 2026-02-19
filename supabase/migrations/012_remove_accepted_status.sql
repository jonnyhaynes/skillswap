BEGIN;

-- Migrate any existing 'accepted' rows to 'in_progress'
UPDATE public.swap_proposals
SET
  status = 'in_progress',
  responded_at = COALESCE(responded_at, NOW())
WHERE status = 'accepted';

-- Postgres can't drop an enum value directly, so we recreate the type
-- 1. Create the new enum without 'accepted'
CREATE TYPE swap_status_new AS ENUM (
  'pending',
  'declined',
  'in_progress',
  'completed',
  'cancelled'
);

-- 2. Drop the reviews policy that references the status column so we can alter the type
DROP POLICY IF EXISTS "Users can create reviews for own completed or cancelled swaps" ON public.reviews;

-- 3. Drop the column default before changing the type (default references old enum)
ALTER TABLE public.swap_proposals
  ALTER COLUMN status DROP DEFAULT;

-- 4. Swap the column to use the new type
ALTER TABLE public.swap_proposals
  ALTER COLUMN status TYPE swap_status_new
  USING status::text::swap_status_new;

-- 5. Restore the default using the new type
ALTER TABLE public.swap_proposals
  ALTER COLUMN status SET DEFAULT 'pending'::swap_status_new;

-- 6. Drop the old type and rename the new one
DROP TYPE swap_status;
ALTER TYPE swap_status_new RENAME TO swap_status;

-- 7. Recreate the reviews policy now that the type is updated
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

COMMIT;
