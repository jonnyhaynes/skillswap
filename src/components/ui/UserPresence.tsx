import { useState, useEffect } from 'react'
import { getPresenceState } from '@/hooks/usePresence'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

interface UserPresenceProps {
  userId: string
  lastSeenAt: string | null
  className?: string
}

export function UserPresence({ userId, lastSeenAt, className = '' }: UserPresenceProps) {
  const [isOnline, setIsOnline] = useState(() => getPresenceState(userId).isOnline)

  useEffect(() => {
    // Check immediately
    setIsOnline(getPresenceState(userId).isOnline)

    // Re-check every 30 seconds to pick up presence changes
    const interval = setInterval(() => {
      setIsOnline(getPresenceState(userId).isOnline)
    }, 30_000)

    return () => clearInterval(interval)
  }, [userId])

  if (!isOnline && !lastSeenAt) {
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
