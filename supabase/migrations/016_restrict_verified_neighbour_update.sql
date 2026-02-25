-- Security: prevent authenticated users from directly writing is_verified_neighbour.
-- This field is managed exclusively by the recalculate_verified_neighbour() trigger
-- (see migration 011_verified_neighbour_trigger.sql). The application-layer mapper
-- no longer sends this column, but we enforce it at the DB level as defence-in-depth.

REVOKE UPDATE (is_verified_neighbour) ON public.profiles FROM authenticated;
