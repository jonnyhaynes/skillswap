import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockSkillRow } from '@/test/mocks/handlers'
import {
  getSkillListings,
  getSkillById,
  createSkillListing,
  deleteSkillListing,
  SkillsServiceError,
} from '../skills'

describe('getSkillListings', () => {
  it('returns mapped listings', async () => {
    const result = await getSkillListings()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('skill-1')
    expect(result[0].userId).toBe('user-1')
    expect(result[0].listingType).toBe('offered') // snake_case mapped to camelCase
  })

  it('throws SkillsServiceError on Supabase error', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(
          { message: 'permission denied', code: '42501' },
          { status: 400 }
        )
      })
    )
    await expect(getSkillListings()).rejects.toThrow(SkillsServiceError)
  })
})

describe('getSkillById', () => {
  it('returns a single skill', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(mockSkillRow) // single object for .single()
      })
    )
    const result = await getSkillById('skill-1')
    expect(result?.id).toBe('skill-1')
  })

  it('returns null when not found (PGRST116)', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(
          { message: 'not found', code: 'PGRST116' },
          { status: 406 }
        )
      })
    )
    const result = await getSkillById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createSkillListing', () => {
  it('returns the created listing', async () => {
    server.use(
      http.post('https://test.supabase.co/rest/v1/skill_listings', () => {
        return HttpResponse.json(mockSkillRow, { status: 201 })
      })
    )

    const result = await createSkillListing({
      userId: 'user-1',
      title: 'Piano Lessons',
      description: 'Beginner to intermediate',
      category: 'music',
      level: 'intermediate',
      listingType: 'offered',
      availability: 'Weekends',
      isRemote: true,
      isInPerson: true,
      tags: ['piano'],
    })
    expect(result.id).toBe('skill-1')
  })
})

describe('deleteSkillListing', () => {
  it('resolves without error on success', async () => {
    server.use(
      http.delete('https://test.supabase.co/rest/v1/skill_listings', () => {
        return new HttpResponse(null, { status: 204 })
      })
    )
    await expect(deleteSkillListing('skill-1')).resolves.toBeUndefined()
  })
})
