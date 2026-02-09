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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Messages</h1>
        <p className="text-slate-500 mt-1">Your conversations with other skill swappers</p>
      </div>
      <Card className="overflow-hidden">
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
