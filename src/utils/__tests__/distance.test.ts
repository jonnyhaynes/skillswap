import { describe, it, expect } from 'vitest'
import { haversineDistance } from '../distance'

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(51.5, -0.1, 51.5, -0.1)).toBe(0)
  })

  it('calculates approximate distance between London and Manchester', () => {
    // London: 51.5074, -0.1278 | Manchester: 53.4808, -2.2426
    const dist = haversineDistance(51.5074, -0.1278, 53.4808, -2.2426)
    // ~163 miles
    expect(dist).toBeGreaterThan(155)
    expect(dist).toBeLessThan(175)
  })

  it('is symmetric (A→B equals B→A)', () => {
    const ab = haversineDistance(51.5, -0.1, 53.48, -2.24)
    const ba = haversineDistance(53.48, -2.24, 51.5, -0.1)
    expect(ab).toBeCloseTo(ba, 5)
  })
})
