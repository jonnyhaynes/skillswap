import type { Message } from '@/types'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  senderName: string
}

export function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
  return (
    <div className={cn('flex flex-col max-w-[75%]', isOwn ? 'self-end items-end' : 'self-start items-start')}>
      {!isOwn && (
        <span className="text-xs font-medium text-slate-500 mb-1 ml-3">{senderName}</span>
      )}
      <div
        className={cn(
          'px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
          isOwn
            ? 'bg-gradient-to-br from-[#43c1a6] to-[#6366f1] text-white rounded-2xl rounded-br-md shadow-md shadow-primary-500/15'
            : 'bg-white text-slate-900 rounded-2xl rounded-bl-md ring-1 ring-slate-100 shadow-sm'
        )}
      >
        {message.content}
      </div>
      <time
        dateTime={message.sentAt}
        className="text-[11px] mt-1 mx-3 text-slate-500"
      >
        {formatRelativeTime(message.sentAt)}
      </time>
    </div>
  )
}
