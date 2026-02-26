-- Tighten the neighbourhood INSERT policy.
--
-- The previous policy used WITH CHECK (true), accepting any content.
-- Replace it with a check that enforces:
--   - Non-empty name, max 100 characters.
--   - Only characters found in real UK place names (letters, spaces,
--     hyphens, apostrophes).  This blocks HTML/script injection and
--     other unexpected content while remaining compatible with OS Names API
--     results and the existing seed data.

DROP POLICY IF EXISTS "Authenticated users can insert neighbourhoods"
  ON public.neighbourhoods;

CREATE POLICY "Authenticated users can insert neighbourhoods"
  ON public.neighbourhoods FOR INSERT
  TO authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 100
    AND name ~ $$^[A-Za-z][A-Za-z' \-]*$$$
  );
