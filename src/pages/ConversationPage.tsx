import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { MessageThread } from '@/components/messages/MessageThread'
import { MessageInput } from '@/components/messages/MessageInput'

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { currentUser, getUserById } = useAuth()
  const { getConversation, getMessagesForConversation, fetchMessages, sendMessage, markAsRead } =
    useMessages()

  const conversation = conversationId ? getConversation(conversationId) : undefined
  const messages = conversationId ? getMessagesForConversation(conversationId) : []

  const otherUserId = conversation?.participantIds.find((id) => id !== currentUser?.id)
  const otherUser = otherUserId ? getUserById(otherUserId) : undefined

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId, fetchMessages])

  useEffect(() => {
    if (conversationId && currentUser) {
      markAsRead(conversationId, currentUser.id)
    }
  }, [conversationId, currentUser, markAsRead, messages.length])

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-slate-500 text-center">Please log in to view this conversation.</p>
      </div>
    )
  }

  if (!conversation || !otherUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <EmptyState
          title="Conversation not found"
          description="This conversation does not exist or you do not have access to it."
          action={{
            label: 'Back to Messages',
            onClick: () => window.history.back(),
          }}
        />
      </div>
    )
  }

  const handleSend = (content: string) => {
    sendMessage(conversation.id, currentUser.id, content)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <Link
          to="/messages"
          className="text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Back to messages"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </Link>
        <Avatar
          src={otherUser.avatarUrl}
          name={`${otherUser.firstName} ${otherUser.lastName}`}
          size="md"
        />
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            {otherUser.firstName} {otherUser.lastName}
          </h1>
          <p className="text-xs text-slate-500">{otherUser.neighbourhood}</p>
        </div>
      </div>

      <MessageThread messages={messages} currentUserId={currentUser.id} />

      <MessageInput onSend={handleSend} />
    </div>
  )
}
