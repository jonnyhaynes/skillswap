import { describe, it, expect } from 'vitest'
import { filterSkills } from '../filterSkills'
import type { SkillListing } from '@/types'

const base: SkillListing = {
  id: '1',
  userId: 'user-1',
  title: 'Piano Lessons',
  description: 'Learn piano from scratch',
  category: 'music',
  level: 'beginner',
  listingType: 'offered',
  availability: 'Weekends',
  isRemote: true,
  isInPerson: false,
  tags: ['piano', 'classical'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const listings: SkillListing[] = [
  base,
  { ...base, id: '2', userId: 'user-2', title: 'Guitar Hero', category: 'music', listingType: 'wanted', tags: ['guitar'] },
  { ...base, id: '3', userId: 'user-1', title: 'Python Coding', category: 'technology', listingType: 'offered', tags: ['python'] },
]

describe('filterSkills', () => {
  it('returns all listings when no options given', () => {
    expect(filterSkills(listings, {})).toHaveLength(3)
  })

  it('excludes listings by userId', () => {
    const result = filterSkills(listings, { excludeUserId: 'user-1' })
    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe('user-2')
  })

  it('filters by listingType', () => {
    const result = filterSkills(listings, { listingType: 'wanted' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by category', () => {
    const result = filterSkills(listings, { categories: ['technology'] })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Python Coding')
  })

  it('filters by search query matching title', () => {
    const result = filterSkills(listings, { query: 'guitar' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by search query matching tags', () => {
    const result = filterSkills(listings, { query: 'classical' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('search is case-insensitive', () => {
    const result = filterSkills(listings, { query: 'GUITAR' })
    expect(result).toHaveLength(1)
  })

  it('combines multiple filters', () => {
    const result = filterSkills(listings, {
      categories: ['music'],
      listingType: 'offered',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns empty array when nothing matches', () => {
    const result = filterSkills(listings, { query: 'xyznotfound' })
    expect(result).toHaveLength(0)
  })
})
