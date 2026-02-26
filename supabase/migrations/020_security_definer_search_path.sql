-- Security fix: add SET search_path to all SECURITY DEFINER functions.
--
-- Without a fixed search_path, a privileged DB user could create objects in a
-- schema that appears earlier in search_path (e.g. pg_temp) and hijack these
-- functions while they run with owner-level privileges, bypassing RLS.

-- Fix handle_new_user() — needs public + auth schemas
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, neighbourhood, postcode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'neighbourhood', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'postcode', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Fix recalculate_verified_neighbour(UUID)
CREATE OR REPLACE FUNCTION recalculate_verified_neighbour(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  swap_count INTEGER;
  avg_rating NUMERIC;
BEGIN
  SELECT COUNT(*) INTO swap_count
  FROM public.swap_proposals
  WHERE status = 'completed'
    AND (proposer_id = user_uuid OR recipient_id = user_uuid);

  SELECT AVG(rating)::NUMERIC INTO avg_rating
  FROM public.reviews
  WHERE reviewee_id = user_uuid;

  UPDATE public.profiles
  SET is_verified_neighbour = (swap_count >= 5 AND avg_rating = 5.0)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Fix on_review_inserted()
CREATE OR REPLACE FUNCTION on_review_inserted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_verified_neighbour(NEW.reviewee_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;
