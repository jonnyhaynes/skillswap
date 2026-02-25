-- Security: restrict direct SELECT access to email and postcode on profiles.
--
-- These fields are PII. The existing "Profiles are viewable by everyone" policy
-- uses USING (true), which (combined with the default select('*') in service
-- code) exposes every user's email address and postcode to all callers,
-- including unauthenticated requests to the PostgREST REST API.
--
-- Fix:
--   1. REVOKE column-level SELECT on email/postcode from both anon and
--      authenticated roles.
--   2. Add a SECURITY DEFINER function that profile owners can call to
--      retrieve their own PII. The function runs as the DB owner, bypassing
--      the column-level restriction, but only returns data for auth.uid().

REVOKE SELECT (email, postcode) ON public.profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_own_profile_pii()
RETURNS TABLE(email TEXT, postcode TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.email, p.postcode
  FROM profiles p
  WHERE p.id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_own_profile_pii() TO authenticated;
