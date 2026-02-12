import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { Avatar } from '@/components/ui/Avatar'
import { VerifiedBadge } from '@/components/profile/VerifiedBadge'
import { ReportUserButton } from '@/components/reports/ReportUserButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { MessageThread } from '@/components/messages/MessageThread'
import { MessageInput } from '@/components/messages/MessageInput'
import { Skeleton } from '@/components/ui/Skeleton'

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { currentUser, getUserById, fetchUserById } = useAuth()
  const {
    getConversation,
    getMessagesForConversation,
    fetchMessages,
    sendMessage,
    markAsRead,
    initialized,
    loading,
  } = useMessages()

  const conversation = conversationId ? getConversation(conversationId) : undefined
  const messages = conversationId ? getMessagesForConversation(conversationId) : []

  const otherUserId = conversation?.participantIds.find((id) => id !== currentUser?.id)
  const otherUser = otherUserId ? getUserById(otherUserId) : undefined
  const [loadingOtherUser, setLoadingOtherUser] = useState(false)

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId, fetchMessages])

  // Fetch the other participant's profile if not already cached
  useEffect(() => {
    if (otherUserId && !otherUser && !loadingOtherUser) {
      setLoadingOtherUser(true)
      fetchUserById(otherUserId).finally(() => {
        setLoadingOtherUser(false)
      })
    }
  }, [otherUserId, otherUser, loadingOtherUser, fetchUserById])

  useEffect(() => {
    if (conversationId && currentUser && messages.length > 0) {
      markAsRead(conversationId, currentUser.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUser, markAsRead])

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-slate-500 text-center">Please log in to view this conversation.</p>
      </div>
    )
  }

  if (!initialized || loading || loadingOtherUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-3 py-4">
          <div className="flex justify-end"><Skeleton className="h-10 w-48 rounded-2xl" /></div>
          <div className="flex justify-start"><Skeleton className="h-10 w-56 rounded-2xl" /></div>
          <div className="flex justify-end"><Skeleton className="h-10 w-40 rounded-2xl" /></div>
          <div className="flex justify-start"><Skeleton className="h-10 w-52 rounded-2xl" /></div>
        </div>
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
    <div className="max-w-3xl mx-auto flex flex-col pb-16 md:pb-0">
      {/* Conversation header */}
      <div className="flex items-center gap-3 px-1 pb-4 border-b border-slate-200/80">
        <Link
          to="/messages"
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
          aria-label="Back to messages"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="shrink-0 relative">
          <div className="rounded-full p-0.5 bg-primary-500">
            <div className="rounded-full p-0.5 bg-white">
              <Avatar
                src={otherUser.avatarUrl}
                name={`${otherUser.firstName} ${otherUser.lastName}`}
                size="md"
              />
            </div>
          </div>
          {otherUser.isVerifiedNeighbour && (
            <span className="absolute -bottom-0.5 -right-0.5">
              <VerifiedBadge />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900 font-display truncate">
            {otherUser.firstName} {otherUser.lastName}
          </h1>
          <p className="text-xs text-slate-500">{otherUser.neighbourhood}</p>
        </div>
        <div className="ml-auto shrink-0">
          <ReportUserButton
            reportedUserId={otherUser.id}
            reportedUserName={`${otherUser.firstName} ${otherUser.lastName}`}
          />
        </div>
      </div>

      <MessageThread messages={messages} currentUserId={currentUser.id} />

      <MessageInput onSend={handleSend} />
    </div>
  )
}
