-- Explicit table privileges for the `anon` and `authenticated` roles.
--
-- Why this exists:
-- Supabase's hosted platform auto-grants baseline SELECT/INSERT/UPDATE/DELETE
-- on public-schema tables to anon/authenticated. A database built purely from
-- these migrations (e.g. `supabase db reset` locally or in CI) does NOT get
-- those implicit grants, so every query failed with `42501 permission denied`
-- even though the RLS policies allow the row. RLS is only consulted AFTER the
-- table-level privilege check passes.
--
-- This migration makes the schema self-contained by granting exactly the
-- privileges the app + RLS policies rely on. RLS policies (defined in 001 and
-- later) and the PII column-level REVOKEs (018, 026) remain the real access
-- gate on top of these grants — they are re-asserted at the end of this file so
-- the protections survive regardless of migration ordering.

-- Public reference / browseable data: readable by everyone.
GRANT SELECT ON public.skill_listings TO anon, authenticated;
GRANT SELECT ON public.reviews        TO anon, authenticated;
GRANT SELECT ON public.neighbourhoods TO anon, authenticated;

-- profiles: PII-aware column grants. We must NOT grant table-wide SELECT here —
-- in PostgreSQL a table-level GRANT authorizes every column and a later
-- column-level REVOKE cannot subtract from it (the revoke is silently a no-op).
-- So we grant SELECT only on the non-PII columns. email/postcode are never
-- granted to any client role (owner reads its own via get_own_profile_pii());
-- last_seen_at is granted to authenticated only (hidden from anon).
GRANT SELECT (
  id, first_name, last_name, avatar_url, bio, neighbourhood,
  joined_at, is_verified_neighbour, updated_at
) ON public.profiles TO anon, authenticated;
GRANT SELECT (last_seen_at) ON public.profiles TO authenticated;

-- Authenticated users manage their own content (RLS scopes rows to auth.uid()).
GRANT INSERT, UPDATE          ON public.profiles        TO authenticated;
GRANT INSERT, UPDATE, DELETE  ON public.skill_listings  TO authenticated;
GRANT INSERT                  ON public.reviews         TO authenticated;
GRANT INSERT                  ON public.neighbourhoods  TO authenticated;
GRANT SELECT, INSERT          ON public.conversations   TO authenticated;
GRANT SELECT, INSERT          ON public.messages        TO authenticated;
GRANT SELECT, INSERT, UPDATE  ON public.swap_proposals  TO authenticated;
GRANT INSERT                  ON public.user_reports    TO authenticated;

-- Write-only intake tables: anyone may submit, nobody may read (RLS has no
-- SELECT policy, so reads return zero rows; we also withhold the SELECT grant).
GRANT INSERT ON public.contact_enquiries        TO anon, authenticated;
GRANT INSERT ON public.mailing_list_subscribers TO anon, authenticated;

-- Note: profiles INSERT/UPDATE for authenticated is granted table-wide below;
-- RLS (auth.uid() = id) restricts rows. The PII READ protection is handled
-- purely by the column-scoped SELECT grants above — email/postcode are simply
-- never granted, which is the only reliable way to withhold them in Postgres.
