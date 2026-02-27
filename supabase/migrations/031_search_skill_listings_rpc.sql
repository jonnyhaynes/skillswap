-- Parameterised full-text search helper for skill listings.
--
-- Replaces the client-side PostgREST filter-string interpolation
-- (blacklist-based) with a proper SQL function that receives the search
-- term as a bound parameter ($1). Because the value never touches the
-- PostgREST filter-string parser it cannot be used to inject additional
-- filter conditions, regardless of what characters the caller includes.
--
-- SECURITY INVOKER ensures the function runs as the calling role so that
-- Row-Level Security policies on skill_listings are still enforced.

CREATE OR REPLACE FUNCTION search_skill_listings(search_query TEXT)
RETURNS SETOF skill_listings
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT *
  FROM skill_listings
  WHERE
    title       ILIKE '%' || search_query || '%'
    OR description ILIKE '%' || search_query || '%'
  ORDER BY created_at DESC;
$$;

-- Grant to the same roles that can query skill_listings directly.
GRANT EXECUTE ON FUNCTION search_skill_listings(TEXT) TO authenticated, anon;
