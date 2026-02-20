// src/components/ui/UserPresence.tsx
import { getPresenceState } from '@/hooks/usePresence'
import { formatRelativeTime } from '@/utils/formatDate'

interface UserPresenceProps {
  userId: string
  lastSeenAt: string | null
  className?: string
}

export function UserPresence({ userId, lastSeenAt, className = '' }: UserPresenceProps) {
  const { isOnline } = getPresenceState(userId, lastSeenAt)

  if (!isOnline && !lastSeenAt) {
    // User predates the feature — render nothing
    return null
  }

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${
          isOnline ? 'bg-green-500' : 'bg-slate-300'
        }`}
        aria-hidden="true"
      />
      <span className="text-sm text-slate-500">
        {isOnline ? 'Online now' : `Last seen ${formatRelativeTime(lastSeenAt!)}`}
      </span>
    </span>
  )
}
