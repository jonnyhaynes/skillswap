import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { Card } from '@/components/ui/Card'
import { ConversationList } from '@/components/messages/ConversationList'
import { EmptyInbox } from '@/components/messages/EmptyInbox'

export function MessagesPage() {
  const { currentUser } = useAuth()
  const { getConversationsForUser } = useMessages()

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-slate-500 text-center">Please log in to view your messages.</p>
      </div>
    )
  }

  const conversations = getConversationsForUser(currentUser.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
      <Card>
        {conversations.length === 0 ? (
          <EmptyInbox />
        ) : (
          <ConversationList
            conversations={conversations}
            currentUserId={currentUser.id}
          />
        )}
      </Card>
    </div>
  )
}
