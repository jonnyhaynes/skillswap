import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type { Conversation, Message } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import {
  getConversations as getConversationsService,
  getConversation as getConversationService,
  getMessages as getMessagesService,
  sendMessage as sendMessageService,
  markAsRead as markAsReadService,
  getOrCreateConversation,
  subscribeToUserConversations,
  unsubscribe,
} from '@/services/messages'

interface MessagesState {
  conversations: Conversation[]
  messages: Map<string, Message[]> // Map of conversationId -> messages
  loading: boolean
  error: string | null
  initialized: boolean
}

type MessagesAction =
  | { type: 'SET_CONVERSATIONS'; conversations: Conversation[] }
  | { type: 'ADD_CONVERSATION'; conversation: Conversation }
  | { type: 'UPDATE_CONVERSATION'; conversation: Conversation }
  | { type: 'SET_MESSAGES'; conversationId: string; messages: Message[] }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'MARK_AS_READ'; conversationId: string; userId: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_INITIALIZED' }

export interface MessagesContextType {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  initialized: boolean
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<Message[]>
  sendMessage: (conversationId: string, senderId: string, content: string) => Promise<Message | null>
  createConversation: (participantIds: [string, string], swapId?: string | null) => Promise<string | null>
  markAsRead: (conversationId: string, userId: string) => Promise<void>
  getConversation: (id: string) => Conversation | undefined
  getMessagesForConversation: (id: string) => Message[]
  getConversationsForUser: (userId: string) => Conversation[]
  getUnreadCount: (userId: string) => number
  clearError: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const MessagesContext = createContext<MessagesContextType | null>(null)

function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.conversations,
        loading: false,
        error: null,
      }
    case 'ADD_CONVERSATION':
      // Check if conversation already exists
      if (state.conversations.find((c) => c.id === action.conversation.id)) {
        return state
      }
      return {
        ...state,
        conversations: [action.conversation, ...state.conversations],
      }
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversation.id ? action.conversation : c
        ),
      }
    case 'SET_MESSAGES': {
      const newMessages = new Map(state.messages)
      newMessages.set(action.conversationId, action.messages)
      return { ...state, messages: newMessages }
    }
    case 'ADD_MESSAGE': {
      const newMessages = new Map(state.messages)
      const existing = newMessages.get(action.message.conversationId) || []
      // Check if message already exists
      if (!existing.find((m) => m.id === action.message.id)) {
        newMessages.set(action.message.conversationId, [...existing, action.message])
      }
      return { ...state, messages: newMessages }
    }
    case 'MARK_AS_READ': {
      const newMessages = new Map(state.messages)
      const existing = newMessages.get(action.conversationId) || []
      const updated = existing.map((msg) =>
        msg.senderId !== action.userId ? { ...msg, isRead: true } : msg
      )
      newMessages.set(action.conversationId, updated)
      return { ...state, messages: newMessages }
    }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'SET_INITIALIZED':
      return { ...state, initialized: true }
    default:
      return state
  }
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [state, dispatch] = useReducer(messagesReducer, {
    conversations: [],
    messages: new Map(),
    loading: false,
    error: null,
    initialized: false,
  })

  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const conversationIdsRef = useRef<Set<string>>(new Set())

  // Keep the ref in sync with state
  useEffect(() => {
    conversationIdsRef.current = new Set(state.conversations.map((c) => c.id))
  }, [state.conversations])

  // Fetch conversations and set up real-time subscriptions when user changes
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: 'SET_CONVERSATIONS', conversations: [] })
      dispatch({ type: 'SET_INITIALIZED' })
      return
    }

    const loadConversations = async () => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const conversations = await getConversationsService(currentUser.id)
        dispatch({ type: 'SET_CONVERSATIONS', conversations })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load conversations'
        dispatch({ type: 'SET_ERROR', error: message })
      } finally {
        dispatch({ type: 'SET_INITIALIZED' })
      }
    }

    loadConversations()

    // Set up real-time subscription
    subscriptionRef.current = subscribeToUserConversations(
      currentUser.id,
      async (message) => {
        dispatch({ type: 'ADD_MESSAGE', message })
        // If this message belongs to a conversation we don't have yet, fetch it
        if (!conversationIdsRef.current.has(message.conversationId)) {
          const conversation = await getConversationService(message.conversationId)
          if (conversation) {
            dispatch({ type: 'ADD_CONVERSATION', conversation })
          }
        }
      },
      (conversation) => {
        dispatch({ type: 'UPDATE_CONVERSATION', conversation })
      }
    )

    return () => {
      if (subscriptionRef.current) {
        unsubscribe(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [currentUser])

  const fetchConversations = useCallback(async () => {
    if (!currentUser) return

    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const conversations = await getConversationsService(currentUser.id)
      dispatch({ type: 'SET_CONVERSATIONS', conversations })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations'
      dispatch({ type: 'SET_ERROR', error: message })
    }
  }, [currentUser])

  const fetchMessages = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      try {
        const messages = await getMessagesService(conversationId)
        dispatch({ type: 'SET_MESSAGES', conversationId, messages })
        return messages
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load messages'
        dispatch({ type: 'SET_ERROR', error: message })
        return []
      }
    },
    []
  )

  const sendMessage = useCallback(
    async (
      conversationId: string,
      senderId: string,
      content: string
    ): Promise<Message | null> => {
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const message = await sendMessageService(conversationId, senderId, content)
        // Optimistic update - add message immediately
        dispatch({ type: 'ADD_MESSAGE', message })
        return message
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message'
        dispatch({ type: 'SET_ERROR', error: errorMsg })
        return null
      }
    },
    []
  )

  const createConversation = useCallback(
    async (
      participantIds: [string, string],
      swapId?: string | null
    ): Promise<string | null> => {
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const conversation = await getOrCreateConversation(
          participantIds[0],
          participantIds[1],
          swapId ?? undefined
        )
        dispatch({ type: 'ADD_CONVERSATION', conversation })
        return conversation.id
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create conversation'
        dispatch({ type: 'SET_ERROR', error: message })
        return null
      }
    },
    []
  )

  const markAsRead = useCallback(
    async (conversationId: string, userId: string): Promise<void> => {
      try {
        await markAsReadService(conversationId, userId)
        dispatch({ type: 'MARK_AS_READ', conversationId, userId })
      } catch {
        // Silently fail for mark as read
      }
    },
    []
  )

  const getConversation = useCallback(
    (id: string): Conversation | undefined => {
      return state.conversations.find((conv) => conv.id === id)
    },
    [state.conversations]
  )

  const sortedMessagesCache = useRef<Map<string, Message[]>>(new Map())

  const getMessagesForConversation = useCallback(
    (id: string): Message[] => {
      const raw = state.messages.get(id)
      if (!raw || raw.length === 0) return []

      const cached = sortedMessagesCache.current.get(id)
      if (cached && cached.length === raw.length) return cached

      const sorted = [...raw].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      )
      sortedMessagesCache.current.set(id, sorted)
      return sorted
    },
    [state.messages]
  )

  const getConversationsForUser = useCallback(
    (userId: string): Conversation[] => {
      return state.conversations
        .filter((conv) => conv.participantIds.includes(userId))
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
    },
    [state.conversations]
  )

  const getUnreadCount = useCallback(
    (userId: string): number => {
      const userConversations = state.conversations.filter((conv) =>
        conv.participantIds.includes(userId)
      )
      let count = 0
      for (const conv of userConversations) {
        const messages = state.messages.get(conv.id) || []
        const hasUnread = messages.some(
          (msg) => msg.senderId !== userId && !msg.isRead
        )
        if (hasUnread) count++
      }
      return count
    },
    [state.conversations, state.messages]
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null })
  }, [])

  return (
    <MessagesContext.Provider
      value={{
        conversations: state.conversations,
        loading: state.loading,
        error: state.error,
        initialized: state.initialized,
        fetchConversations,
        fetchMessages,
        sendMessage,
        createConversation,
        markAsRead,
        getConversation,
        getMessagesForConversation,
        getConversationsForUser,
        getUnreadCount,
        clearError,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
