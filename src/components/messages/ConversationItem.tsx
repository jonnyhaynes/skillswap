import { Link } from 'react-router'
import type { Conversation, User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

interface ConversationItemProps {
  conversation: Conversation
  otherUser: User
  isActive?: boolean
  hasUnread?: boolean
}

export function ConversationItem({
  conversation,
  otherUser,
  isActive = false,
  hasUnread = false,
}: ConversationItemProps) {
  return (
    <Link
      to={`/messages/${conversation.id}`}
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors',
        isActive && 'bg-primary-50 border-l-2 border-primary-500',
        !isActive && 'border-l-2 border-transparent'
      )}
    >
      <div className="shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#2DD4BF] to-[#3B82F6]">
        <div className="rounded-full p-0.5 bg-white">
          <Avatar
            src={otherUser.avatarUrl}
            name={`${otherUser.firstName} ${otherUser.lastName}`}
            size="md"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm font-semibold text-slate-900 truncate', hasUnread && 'text-slate-900')}>
            {otherUser.firstName} {otherUser.lastName}
          </span>
          <span className="text-xs text-slate-400 shrink-0">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className={cn('text-sm truncate', hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500')}>
            {conversation.lastMessagePreview}
          </p>
          {hasUnread && (
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
          )}
        </div>
      </div>
    </Link>
  )
}
