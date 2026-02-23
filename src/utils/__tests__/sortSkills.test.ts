import { describe, it, expect } from 'vitest'
import { sortSkills } from '../sortSkills'
import type { SkillListing } from '@/types'

const base: SkillListing = {
  id: '1',
  userId: 'user-1',
  title: 'Baking',
  description: '',
  category: 'cooking',
  level: 'beginner',
  listingType: 'offered',
  availability: '',
  isRemote: true,
  isInPerson: true,
  tags: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const listings: SkillListing[] = [
  { ...base, id: '1', title: 'Baking', createdAt: '2025-01-01T00:00:00Z' },
  { ...base, id: '2', title: 'Archery', createdAt: '2025-03-01T00:00:00Z' },
  { ...base, id: '3', title: 'Coding', createdAt: '2025-02-01T00:00:00Z' },
]

describe('sortSkills', () => {
  it('sorts newest first', () => {
    const result = sortSkills(listings, 'newest')
    expect(result[0].id).toBe('2')
    expect(result[2].id).toBe('1')
  })

  it('sorts oldest first', () => {
    const result = sortSkills(listings, 'oldest')
    expect(result[0].id).toBe('1')
    expect(result[2].id).toBe('2')
  })

  it('sorts title A→Z', () => {
    const result = sortSkills(listings, 'title-asc')
    expect(result[0].title).toBe('Archery')
    expect(result[2].title).toBe('Coding')
  })

  it('sorts title Z→A', () => {
    const result = sortSkills(listings, 'title-desc')
    expect(result[0].title).toBe('Coding')
    expect(result[2].title).toBe('Archery')
  })

  it('does not mutate the original array', () => {
    const original = [...listings]
    sortSkills(listings, 'title-asc')
    expect(listings[0].id).toBe(original[0].id)
  })

  it('returns unsorted list when nearest context missing', () => {
    const result = sortSkills(listings, 'nearest')
    expect(result).toHaveLength(3)
  })
})
