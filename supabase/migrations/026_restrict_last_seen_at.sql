-- Privacy fix: revoke last_seen_at from anonymous callers.
--
-- last_seen_at is precise presence data. Any unauthenticated visitor can
-- currently poll when specific users were last active via the public
-- profile SELECT policy. Restrict to authenticated users only.

REVOKE SELECT (last_seen_at) ON public.profiles FROM anon;
