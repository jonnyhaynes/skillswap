import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime } from '../formatRelativeTime'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for < 60 seconds ago', () => {
    const date = new Date('2025-06-15T11:59:30Z').toISOString()
    expect(formatRelativeTime(date)).toBe('just now')
  })

  it('returns minutes for < 1 hour ago', () => {
    const date = new Date('2025-06-15T11:30:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('30m ago')
  })

  it('returns hours for < 24 hours ago', () => {
    const date = new Date('2025-06-15T09:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('3h ago')
  })

  it('returns days for < 7 days ago', () => {
    const date = new Date('2025-06-12T12:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('3d ago')
  })

  it('returns weeks for < 5 weeks ago', () => {
    const date = new Date('2025-05-25T12:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('3w ago')
  })

  it('returns months for older dates', () => {
    const date = new Date('2025-04-01T12:00:00Z').toISOString()
    expect(formatRelativeTime(date)).toBe('2mo ago')
  })
})
