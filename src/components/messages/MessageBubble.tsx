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
        <span className="text-xs text-slate-500 mb-1 ml-1">{senderName}</span>
      )}
      <div
        className={cn(
          'px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
          isOwn
            ? 'bg-primary-500 text-white rounded-2xl rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-md'
        )}
      >
        {message.content}
      </div>
      <span
        className={cn(
          'text-xs mt-1 mx-1',
          isOwn ? 'text-primary-200' : 'text-slate-400'
        )}
      >
        {formatRelativeTime(message.sentAt)}
      </span>
    </div>
  )
}
