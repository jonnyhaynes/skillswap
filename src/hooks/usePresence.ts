// src/hooks/usePresence.ts
import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const HEARTBEAT_INTERVAL_MS = 60_000
const ONLINE_THRESHOLD_MS = 2 * 60_000 // 2 minutes grace period

interface PresenceState {
  isOnline: boolean
  lastSeenAt: string | null
}

// Module-level map so presence data is accessible outside the hook
// without needing context. Keyed by userId.
const presenceMap = new Map<string, { onlineAt: number }>()

/**
 * Call once at the top level (inside AuthProvider) when a user is authenticated.
 * Manages Realtime Presence channel membership and last_seen_at heartbeat.
 */
export function usePresence(userId: string | null) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateLastSeen = useCallback(async () => {
    if (!userId) return
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId)
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Write last_seen_at immediately on mount
    updateLastSeen()

    // Join presence channel
    const channel = supabase.channel('presence:global', {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ online_at: number }>()
        // Rebuild our local map from Supabase presence state
        presenceMap.clear()
        for (const [key, presences] of Object.entries(state)) {
          // presences is an array; take the most recent
          const latest = presences[presences.length - 1] as { online_at: number }
          if (latest) presenceMap.set(key, { onlineAt: latest.online_at })
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: Date.now() })
        }
      })

    channelRef.current = channel

    // Heartbeat: update last_seen_at every 60s
    heartbeatRef.current = setInterval(() => {
      updateLastSeen()
      channel.track({ online_at: Date.now() })
    }, HEARTBEAT_INTERVAL_MS)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [userId, updateLastSeen])
}

/**
 * Check presence state for any user.
 * isOnline: true if they are in the presence channel right now.
 * lastSeenAt: from the DB (passed in from the User object).
 */
export function getPresenceState(
  userId: string,
  lastSeenAt: string | null
): PresenceState {
  const entry = presenceMap.get(userId)
  const isOnline = entry
    ? Date.now() - entry.onlineAt < ONLINE_THRESHOLD_MS
    : false

  return { isOnline, lastSeenAt }
}
