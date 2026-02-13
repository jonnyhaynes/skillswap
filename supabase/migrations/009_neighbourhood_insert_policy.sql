-- Allow authenticated users to insert new neighbourhoods.
-- This supports the typeahead flow where selecting a place
-- from the OS Names API upserts it into the neighbourhoods table.

CREATE POLICY "Authenticated users can insert neighbourhoods"
  ON public.neighbourhoods FOR INSERT
  TO authenticated
  WITH CHECK (true);
