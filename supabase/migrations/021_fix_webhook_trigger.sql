-- Security fix: add SET search_path and pass the webhook secret as an
-- Authorization header so the edge function can verify the caller is the
-- internal DB trigger (not an arbitrary internet client).
--
-- Previously the trigger called http_post with no Authorization header, which
-- meant (a) all notifications silently failed with 401, and (b) the secret
-- check in the edge function provided no actual protection.
--
-- Configure app.settings.webhook_secret in supabase/config.toml [db.settings]
-- to match the WEBHOOK_SECRET env var on the edge function.

CREATE OR REPLACE FUNCTION notify_new_swap_proposal()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  payload JSONB;
BEGIN
  edge_function_url := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/notify-swap-proposal';

  IF edge_function_url IS NULL OR edge_function_url = '/functions/v1/notify-swap-proposal' THEN
    edge_function_url := 'http://kong:8000/functions/v1/notify-swap-proposal';
  END IF;

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

  PERFORM extensions.http_post(
    edge_function_url,
    payload::text,
    'application/json',
    ARRAY[
      ('Authorization'::text,
       ('Bearer ' || COALESCE(current_setting('app.settings.webhook_secret', true), ''))::text
      )::extensions.http_header
    ]
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send swap notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;
