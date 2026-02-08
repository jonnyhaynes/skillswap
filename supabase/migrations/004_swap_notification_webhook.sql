-- Database webhook trigger for swap proposal notifications
-- Calls the notify-swap-proposal edge function when a new swap is created

-- Enable the pg_net extension for making HTTP requests from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to notify on new swap proposal via edge function
CREATE OR REPLACE FUNCTION notify_new_swap_proposal()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  payload JSONB;
BEGIN
  -- Build the edge function URL using the Supabase project URL
  edge_function_url := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/notify-swap-proposal';

  -- If the setting isn't available, try the local dev URL
  IF edge_function_url IS NULL OR edge_function_url = '' THEN
    edge_function_url := 'http://kong:8000/functions/v1/notify-swap-proposal';
  END IF;

  -- Build the webhook payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'swap_proposals',
    'record', jsonb_build_object(
      'id', NEW.id,
      'proposer_id', NEW.proposer_id,
      'recipient_id', NEW.recipient_id,
      'offered_skill_id', NEW.offered_skill_id,
      'requested_skill_id', NEW.requested_skill_id,
      'message', NEW.message,
      'status', NEW.status,
      'proposed_at', NEW.proposed_at,
      'conversation_id', NEW.conversation_id
    )
  );

  -- Make async HTTP POST to the edge function
  PERFORM extensions.http_post(
    edge_function_url,
    payload::text,
    'application/json'
  );

  RETURN NEW;
EXCEPTION
  -- Don't let notification failures block the swap creation
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send swap notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new swap proposals
CREATE TRIGGER on_swap_proposal_created
  AFTER INSERT ON public.swap_proposals
  FOR EACH ROW EXECUTE FUNCTION notify_new_swap_proposal();
