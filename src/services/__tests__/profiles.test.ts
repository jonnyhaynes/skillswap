import { describe, it, expect, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { supabase } from '@/lib/supabase'
import { getProfile, getProfilesByIds, ProfileServiceError } from '../profiles'

const BASE = 'https://test.supabase.co/rest/v1'

// A profiles row as returned for the public (anon-safe) column set. Note the
// absence of email/postcode (PII) and — for anon — last_seen_at.
const mockPublicProfileRow = {
  id: 'user-2',
  first_name: 'Jane',
  last_name: 'Doe',
  avatar_url: null,
  bio: 'Keen gardener',
  neighbourhood: 'Bristol',
  is_verified_neighbour: false,
  joined_at: '2025-01-01T10:00:00Z',
}

/**
 * Force the authenticated branch by stubbing supabase.auth.getSession to return
 * a session. Returns a restore-free spy (afterEach restores all mocks).
 */
function mockSession(hasSession: boolean) {
  vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: {
      session: hasSession
        ? // Minimal shape — the code only checks `session !== null`.
          ({ access_token: 't', user: { id: 'user-1' } } as never)
        : null,
    },
    error: null,
  } as never)
}

/**
 * Register a profiles GET handler that captures the request URL so tests can
 * assert on the PostgREST `select=` column list.
 */
function captureProfilesGet(responseBody: unknown) {
  let capturedUrl = ''
  server.use(
    http.get(`${BASE}/profiles`, ({ request }) => {
      capturedUrl = request.url
      return HttpResponse.json(responseBody)
    })
  )
  return () => capturedUrl
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('anon profile read path', () => {
  it('does NOT request last_seen_at when there is no session', async () => {
    // Regression guard: migration 034 grants last_seen_at to `authenticated`
    // only, so requesting it as anon fails the WHOLE query (42501) and silently
    // empties any UI that renders another user (swaps list, UserPresence).
    mockSession(false)
    const getUrl = captureProfilesGet(mockPublicProfileRow)

    const result = await getProfile('user-2')

    const select = new URL(getUrl()).searchParams.get('select') ?? ''
    expect(select).not.toContain('last_seen_at')
    expect(select).toContain('id')
    expect(select).toContain('first_name')

    // Row without last_seen_at maps cleanly with lastSeenAt defaulted to null.
    expect(result?.id).toBe('user-2')
    expect(result?.lastSeenAt).toBeNull()
  })

  it('requests last_seen_at when a session exists', async () => {
    mockSession(true)
    const getUrl = captureProfilesGet({
      ...mockPublicProfileRow,
      last_seen_at: '2025-06-01T09:00:00Z',
    })

    const result = await getProfile('user-2')

    const select = new URL(getUrl()).searchParams.get('select') ?? ''
    expect(select).toContain('last_seen_at')
    expect(result?.lastSeenAt).toBe('2025-06-01T09:00:00Z')
  })

  it('getProfilesByIds also omits last_seen_at for anon', async () => {
    mockSession(false)
    const getUrl = captureProfilesGet([mockPublicProfileRow])

    const result = await getProfilesByIds(['user-2'])

    const select = new URL(getUrl()).searchParams.get('select') ?? ''
    expect(select).not.toContain('last_seen_at')
    expect(result).toHaveLength(1)
    expect(result[0].lastSeenAt).toBeNull()
  })

  it('returns null when the profile does not exist (PGRST116)', async () => {
    mockSession(false)
    server.use(
      http.get(`${BASE}/profiles`, () => {
        return HttpResponse.json(
          { message: 'no rows', code: 'PGRST116' },
          { status: 406 }
        )
      })
    )
    await expect(getProfile('missing')).resolves.toBeNull()
  })

  it('throws ProfileServiceError on a permission error', async () => {
    mockSession(false)
    server.use(
      http.get(`${BASE}/profiles`, () => {
        return HttpResponse.json(
          { message: 'permission denied for table profiles', code: '42501' },
          { status: 400 }
        )
      })
    )
    await expect(getProfile('user-2')).rejects.toThrow(ProfileServiceError)
  })
})
