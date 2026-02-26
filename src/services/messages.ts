// Messages service - Supabase operations for conversations and messages

import { supabase } from '@/lib/supabase'
import {
  mapDbConversation,
  mapDbMessage,
  mapConversationToDbInsert,
  mapMessageToDbInsert,
} from '@/lib/typeMappers'
import type { Conversation, Message } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { MessageUpdate } from '@/types/database'

export class MessagesServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'MessagesServiceError'
    this.code = code
  }
}

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false })

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }

  return data.map(mapDbConversation)
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new MessagesServiceError(error.message, error.code)
  }

  return mapDbConversation(data)
}

/**
 * Find existing conversation between two users
 */
export async function findConversationBetweenUsers(
  userId1: string,
  userId2: string
): Promise<Conversation | null> {
  // Since participant_ids is an array, we need to check for both users
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId1, userId2])

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }

  // Filter to make sure we have exactly these two participants
  const conversation = data.find(
    (c) =>
      c.participant_ids.length === 2 &&
      c.participant_ids.includes(userId1) &&
      c.participant_ids.includes(userId2)
  )

  return conversation ? mapDbConversation(conversation) : null
}

/**
 * Create a new conversation
 */
export async function createConversation(
  participantIds: [string, string],
  swapId?: string
): Promise<Conversation> {
  const dbInsert = mapConversationToDbInsert({
    participantIds,
    swapId: swapId ?? null,
  })

  const { data, error } = await supabase
    .from('conversations')
    .insert(dbInsert)
    .select()
    .single()

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }

  return mapDbConversation(data)
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  swapId?: string
): Promise<Conversation> {
  const existing = await findConversationBetweenUsers(userId1, userId2)
  if (existing) {
    return existing
  }
  return createConversation([userId1, userId2], swapId)
}

/**
 * Get all messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }

  return data.map(mapDbMessage)
}

/**
 * Send a new message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const dbInsert = mapMessageToDbInsert({
    conversationId,
    senderId,
    content,
  })

  const { data, error } = await supabase
    .from('messages')
    .insert(dbInsert)
    .select()
    .single()

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }

  return mapDbMessage(data)
}

/**
 * Mark all messages in a conversation as read for a user
 */
export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const update: MessageUpdate = { is_read: true }
  const { error } = await supabase
    .from('messages')
    .update(update)
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  // Get all conversations for the user
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .contains('participant_ids', [userId])

  if (convError) {
    throw new MessagesServiceError(convError.message, convError.code)
  }

  if (conversations.length === 0) return 0

  const conversationIds = conversations.map((c) => c.id)

  // Count unread messages not sent by this user
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new MessagesServiceError(error.message, error.code)
  }

  return count ?? 0
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(mapDbMessage(payload.new as Parameters<typeof mapDbMessage>[0]))
      }
    )
    .subscribe()
}

/**
 * Subscribe to all conversations for a user (for notifications).
 *
 * Server-side filter limitation: Supabase Realtime does not support array-
 * contains filters, so we cannot filter messages by `participant_ids` or
 * conversations by whether the user appears in `participant_ids`.  Supabase
 * Realtime RLS (row-level security) already enforces that users only receive
 * events for rows they are permitted to read, so these subscriptions are safe —
 * no cross-user data leaks occur even though no explicit filter is set here.
 */
export function subscribeToUserConversations(
  userId: string,
  onNewMessage: (message: Message) => void,
  onConversationUpdate: (conversation: Conversation) => void
): RealtimeChannel {
  return supabase
    .channel(`user:${userId}:conversations`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        // No server-side filter: messages table uses conversation_id, not user_id.
        // Realtime RLS restricts events to conversations the user participates in.
      },
      (payload) => {
        onNewMessage(mapDbMessage(payload.new as Parameters<typeof mapDbMessage>[0]))
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        // No server-side filter: participant_ids array column is not supported
        // by Realtime filters.  Realtime RLS enforces row-level access control.
      },
      (payload) => {
        onConversationUpdate(
          mapDbConversation(payload.new as Parameters<typeof mapDbConversation>[0])
        )
      }
    )
    .subscribe()
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}
