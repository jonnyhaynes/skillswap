-- When a swap_proposal is deleted (which happens via CASCADE from profiles),
-- we want reviews linked to that swap to be PRESERVED (anonymised), not deleted.
-- Change swap_id from ON DELETE CASCADE to ON DELETE SET NULL so the review
-- record survives with swap_id = NULL rather than being wiped.

ALTER TABLE reviews
  ALTER COLUMN swap_id DROP NOT NULL;

ALTER TABLE reviews
  DROP CONSTRAINT reviews_swap_id_fkey;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_swap_id_fkey
  FOREIGN KEY (swap_id)
  REFERENCES swap_proposals(id)
  ON DELETE SET NULL;
