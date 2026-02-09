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
        'flex items-center gap-3.5 px-5 py-4 transition-all duration-200',
        isActive
          ? 'bg-primary-50/80 border-l-2 border-primary-500'
          : 'border-l-2 border-transparent hover:bg-slate-50/80'
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Conversation with ${otherUser.firstName} ${otherUser.lastName}${hasUnread ? ', unread messages' : ''}`}
    >
      <div className="shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#43c1a6] to-[#6366f1]">
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
          <span className={cn(
            'text-sm truncate',
            hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'
          )}>
            {otherUser.firstName} {otherUser.lastName}
          </span>
          <span className="text-xs text-slate-500 shrink-0">
            <time dateTime={conversation.lastMessageAt}>
              {formatRelativeTime(conversation.lastMessageAt)}
            </time>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className={cn('text-sm truncate', hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500')}>
            {conversation.lastMessagePreview}
          </p>
          {hasUnread && (
            <>
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#43c1a6] to-[#6366f1] shrink-0" aria-hidden="true" />
              <span className="sr-only">Unread</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
