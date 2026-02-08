-- Enable realtime for swap_proposals table
-- This allows clients to subscribe to INSERT/UPDATE events on swap proposals
-- for real-time notification badges and UI updates

ALTER PUBLICATION supabase_realtime ADD TABLE public.swap_proposals;
