import { useEffect, useRef } from 'react'
import type { Message } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { MessageBubble } from './MessageBubble'

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const { getUserById } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-3 overflow-y-auto flex-1 py-4 px-1">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId
        const sender = getUserById(message.senderId)
        const senderName = sender
          ? `${sender.firstName} ${sender.lastName}`
          : 'Unknown User'

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            senderName={senderName}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
