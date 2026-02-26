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

describe('getSkillListings — searchQuery sanitisation (security)', () => {
  it('strips PostgREST special characters from the search query', async () => {
    let capturedUrl = ''
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', ({ request }) => {
        capturedUrl = decodeURIComponent(request.url)
        return HttpResponse.json([mockSkillRow])
      })
    )

    // Commas, parentheses, and backticks are PostgREST injection vectors
    await getSkillListings({ searchQuery: 'guitar,extra(injected)`bad' })

    expect(capturedUrl).toBeDefined()
    // Safe characters must remain in the filter
    expect(capturedUrl).toContain('guitar')
    expect(capturedUrl).toContain('extra')
    expect(capturedUrl).toContain('injected')
    // Dangerous characters must be stripped
    expect(capturedUrl).not.toContain(',extra')   // comma stripped
    expect(capturedUrl).not.toContain('(injected') // paren stripped
    expect(capturedUrl).not.toContain('`bad')       // backtick stripped
  })

  it('omits the or filter entirely when query contains only special characters', async () => {
    let capturedUrl = ''
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )

    await getSkillListings({ searchQuery: '()()(,,,)' })

    // All chars stripped → empty safeQuery → no or filter added to the request
    expect(capturedUrl).not.toContain('or=')
  })

  it('uses a safe query normally when no special characters are present', async () => {
    let capturedUrl = ''
    server.use(
      http.get('https://test.supabase.co/rest/v1/skill_listings', ({ request }) => {
        // Replace '+' (form-encoded space) with ' ' before asserting
        capturedUrl = decodeURIComponent(request.url.replace(/\+/g, ' '))
        return HttpResponse.json([mockSkillRow])
      })
    )

    await getSkillListings({ searchQuery: 'piano lessons' })

    expect(capturedUrl).toContain('or=')
    expect(capturedUrl).toContain('piano lessons')
  })
})
