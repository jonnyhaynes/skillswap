import { useEffect, useState } from 'react'
import type { Conversation, User } from '@/types'
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
  const { fetchUsersByIds } = useAuth()
  const { getMessagesForConversation } = useMessages()
  const [otherUsers, setOtherUsers] = useState<Map<string, User>>(new Map())

  const otherUserIds = conversations
    .map((c) => c.participantIds.find((id) => id !== currentUserId))
    .filter((id): id is string => !!id)
  const hasOtherUsers = otherUserIds.length > 0

  const [loading, setLoading] = useState(hasOtherUsers)

  // Fetch all other users for conversations
  useEffect(() => {
    if (!hasOtherUsers) {
      return
    }

    let cancelled = false
    const uniqueIds = [...new Set(otherUserIds)]

    fetchUsersByIds(uniqueIds).then((users) => {
      if (cancelled) return
      const userMap = new Map<string, User>()
      users.forEach((user) => userMap.set(user.id, user))
      setOtherUsers(userMap)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [conversations, currentUserId, fetchUsersByIds, hasOtherUsers, otherUserIds])

  if (loading) {
    return (
      <div className="p-5 space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-100 rounded-full" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
              <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return <EmptyInbox />
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conversation) => {
        const otherUserId = conversation.participantIds.find((id) => id !== currentUserId)
        const otherUser = otherUserId ? otherUsers.get(otherUserId) : undefined

        if (!otherUser) return null

        const messages = getMessagesForConversation(conversation.id)
        const hasUnread = messages.some(
          (msg) =>
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
