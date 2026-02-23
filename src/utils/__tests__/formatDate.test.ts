import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from '../formatDate'

describe('formatDate', () => {
  it('formats a date string to en-GB short format', () => {
    expect(formatDate('2025-06-15T00:00:00Z')).toBe('15 Jun 2025')
  })

  it('formats January correctly', () => {
    expect(formatDate('2025-01-01T00:00:00Z')).toBe('1 Jan 2025')
  })
})

describe('formatDateTime', () => {
  it('includes time component', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z')
    expect(result).toContain('Jun 2025')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})
