-- SECURITY FIX: close PII leak on profiles in environments that have a
-- table-wide SELECT grant (e.g. Supabase's hosted default privileges).
--
-- Background: migrations 018/026 REVOKE column-level SELECT on email, postcode
-- and last_seen_at, and 033 GRANTs SELECT only on the non-PII columns. But in
-- PostgreSQL a table-wide `GRANT SELECT ON profiles` authorizes EVERY column and
-- a column-level REVOKE cannot subtract from it — the revoke is a silent no-op.
-- Hosted Supabase projects start with such a table-wide grant, so on production
-- anon could read email/postcode/last_seen_at despite 018/026/033.
--
-- Fix: drop the table-wide SELECT grant so the column-scoped grants from 033 are
-- the only thing authorizing reads. After this, email and postcode are readable
-- by no client role, and last_seen_at by authenticated only.
REVOKE SELECT ON public.profiles FROM anon, authenticated;

-- Re-assert the intended column-scoped SELECT grants (idempotent; also covers
-- fresh DBs that never had the table-wide grant). Keep in sync with 033.
GRANT SELECT (
  id, first_name, last_name, avatar_url, bio, neighbourhood,
  joined_at, is_verified_neighbour, updated_at
) ON public.profiles TO anon, authenticated;
GRANT SELECT (last_seen_at) ON public.profiles TO authenticated;
