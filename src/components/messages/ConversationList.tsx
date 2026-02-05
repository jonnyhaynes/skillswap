import type { Conversation } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { ConversationItem } from './ConversationItem'
import { EmptyInbox } from './EmptyInbox'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  activeConversationId?: string
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
}: ConversationListProps) {
  const { getUserById } = useAuth()
  const { messages } = useMessages()

  if (conversations.length === 0) {
    return <EmptyInbox />
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conversation) => {
        const otherUserId = conversation.participantIds.find((id) => id !== currentUserId)
        const otherUser = otherUserId ? getUserById(otherUserId) : undefined

        if (!otherUser) return null

        const hasUnread = messages.some(
          (msg) =>
            msg.conversationId === conversation.id &&
            msg.senderId !== currentUserId &&
            !msg.isRead
        )

        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            otherUser={otherUser}
            isActive={conversation.id === activeConversationId}
            hasUnread={hasUnread}
          />
        )
      })}
    </div>
  )
}
