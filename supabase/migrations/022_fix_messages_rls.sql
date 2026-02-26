-- Security fix: restrict the messages UPDATE policy so that only the
-- is_read column can be updated by conversation participants.
--
-- The previous policy had no WITH CHECK and no column restriction, meaning
-- any participant could mutate content, sender_id, or sent_at of any message
-- in the conversation — including messages written by the other party.

DROP POLICY IF EXISTS "Users can update messages in own conversations" ON public.messages;

-- Revoke broad UPDATE and re-grant only the is_read column.
-- The only legitimate client-side write is marking messages as read.
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (is_read) ON public.messages TO authenticated;

CREATE POLICY "Users can update messages in own conversations"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND auth.uid() = ANY(participant_ids)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND auth.uid() = ANY(participant_ids)
    )
  );
