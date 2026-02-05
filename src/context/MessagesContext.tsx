import { createContext, useReducer, type ReactNode } from 'react'
import type { Conversation, Message } from '@/types'
import { conversations as mockConversations, messages as mockMessages } from '@/data/messages'
import { generateId } from '@/utils/generateId'

interface MessagesState {
  conversations: Conversation[]
  messages: Message[]
}

type MessagesAction =
  | { type: 'SEND_MESSAGE'; conversationId: string; senderId: string; content: string }
  | { type: 'CREATE_CONVERSATION'; conversation: Conversation }
  | { type: 'MARK_AS_READ'; conversationId: string; userId: string }

export interface MessagesContextType {
  conversations: Conversation[]
  messages: Message[]
  sendMessage: (conversationId: string, senderId: string, content: string) => void
  createConversation: (participantIds: [string, string], swapId?: string | null) => string
  markAsRead: (conversationId: string, userId: string) => void
  getConversation: (id: string) => Conversation | undefined
  getMessagesForConversation: (id: string) => Message[]
  getConversationsForUser: (userId: string) => Conversation[]
  getUnreadCount: (userId: string) => number
}

export const MessagesContext = createContext<MessagesContextType | null>(null)

function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const now = new Date().toISOString()
      const newMessage: Message = {
        id: `msg-${generateId()}`,
        conversationId: action.conversationId,
        senderId: action.senderId,
        content: action.content,
        sentAt: now,
        isRead: false,
      }
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === action.conversationId
          ? {
              ...conv,
              lastMessageAt: now,
              lastMessagePreview: action.content,
            }
          : conv
      )
      return {
        ...state,
        messages: [...state.messages, newMessage],
        conversations: updatedConversations,
      }
    }
    case 'CREATE_CONVERSATION': {
      return {
        ...state,
        conversations: [...state.conversations, action.conversation],
      }
    }
    case 'MARK_AS_READ': {
      const updatedMessages = state.messages.map((msg) =>
        msg.conversationId === action.conversationId && msg.senderId !== action.userId
          ? { ...msg, isRead: true }
          : msg
      )
      return {
        ...state,
        messages: updatedMessages,
      }
    }
    default:
      return state
  }
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messagesReducer, {
    conversations: [...mockConversations],
    messages: [...mockMessages],
  })

  const sendMessage = (conversationId: string, senderId: string, content: string) => {
    dispatch({ type: 'SEND_MESSAGE', conversationId, senderId, content })
  }

  const createConversation = (participantIds: [string, string], swapId?: string | null): string => {
    const now = new Date().toISOString()
    const id = `conv-${generateId()}`
    const conversation: Conversation = {
      id,
      participantIds,
      swapId: swapId ?? null,
      createdAt: now,
      lastMessageAt: now,
      lastMessagePreview: '',
    }
    dispatch({ type: 'CREATE_CONVERSATION', conversation })
    return id
  }

  const markAsRead = (conversationId: string, userId: string) => {
    dispatch({ type: 'MARK_AS_READ', conversationId, userId })
  }

  const getConversation = (id: string): Conversation | undefined => {
    return state.conversations.find((conv) => conv.id === id)
  }

  const getMessagesForConversation = (id: string): Message[] => {
    return state.messages
      .filter((msg) => msg.conversationId === id)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
  }

  const getConversationsForUser = (userId: string): Conversation[] => {
    return state.conversations
      .filter((conv) => conv.participantIds.includes(userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  }

  const getUnreadCount = (userId: string): number => {
    const userConversations = state.conversations.filter((conv) =>
      conv.participantIds.includes(userId)
    )
    let count = 0
    for (const conv of userConversations) {
      const hasUnread = state.messages.some(
        (msg) =>
          msg.conversationId === conv.id &&
          msg.senderId !== userId &&
          !msg.isRead
      )
      if (hasUnread) count++
    }
    return count
  }

  return (
    <MessagesContext.Provider
      value={{
        conversations: state.conversations,
        messages: state.messages,
        sendMessage,
        createConversation,
        markAsRead,
        getConversation,
        getMessagesForConversation,
        getConversationsForUser,
        getUnreadCount,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
