import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPresenceState } from '../usePresence'

describe('getPresenceState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns isOnline: false for an unknown user', () => {
    const { isOnline } = getPresenceState('unknown-user-xyz-abc-123')
    expect(isOnline).toBe(false)
  })
})
