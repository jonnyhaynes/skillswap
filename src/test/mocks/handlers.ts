import { http, HttpResponse } from 'msw'

const BASE = 'https://test.supabase.co/rest/v1'
const FUNCTIONS_BASE = 'https://test.supabase.co/functions/v1'

export const mockAccountExport = {
  exported_at: '2024-01-01T00:00:00.000Z',
  profile: { id: 'user-1', first_name: 'Test', email: 'test@example.com' },
  skill_listings: [],
  conversations: [],
  messages: [],
  swap_proposals: [],
  reviews_written: [],
  reviews_received: [],
}

// Reusable skill listing shape (matches SkillListingRow from database.ts)
export const mockSkillRow = {
  id: 'skill-1',
  user_id: 'user-1',
  title: 'Piano Lessons',
  description: 'Beginner to intermediate piano tuition',
  category: 'music',
  level: 'intermediate',
  listing_type: 'offered',
  availability: 'Weekends',
  is_remote: true,
  is_in_person: true,
  tags: ['music', 'piano'],
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
}

export const mockSwapRow = {
  id: 'swap-1',
  proposer_id: 'user-1',
  recipient_id: 'user-2',
  offered_skill_id: 'skill-1',
  requested_skill_id: 'skill-2',
  message: 'I would love to swap skills!',
  status: 'pending',
  proposed_at: '2025-01-01T10:00:00Z',
  responded_at: null,
  completed_at: null,
  conversation_id: null,
  proposer_completed: false,
  recipient_completed: false,
}

export const mockReviewRow = {
  id: 'review-1',
  swap_id: 'swap-1',
  reviewer_id: 'user-1',
  reviewee_id: 'user-2',
  rating: 5,
  comment: 'Great swap!',
  skill_category: 'music',
  created_at: '2025-01-15T10:00:00Z',
}

export const handlers = [
  // Skills
  http.get(`${BASE}/skill_listings`, () => {
    return HttpResponse.json([mockSkillRow])
  }),
  http.post(`${BASE}/skill_listings`, () => {
    return HttpResponse.json([mockSkillRow], { status: 201 })
  }),
  http.patch(`${BASE}/skill_listings`, () => {
    return HttpResponse.json([mockSkillRow])
  }),
  http.delete(`${BASE}/skill_listings`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Swaps
  http.get(`${BASE}/swap_proposals`, () => {
    return HttpResponse.json([mockSwapRow])
  }),
  http.post(`${BASE}/swap_proposals`, () => {
    return HttpResponse.json([mockSwapRow], { status: 201 })
  }),
  http.patch(`${BASE}/swap_proposals`, () => {
    return HttpResponse.json([mockSwapRow])
  }),

  // Reviews
  http.get(`${BASE}/reviews`, () => {
    return HttpResponse.json([mockReviewRow])
  }),
  http.post(`${BASE}/reviews`, () => {
    return HttpResponse.json([mockReviewRow], { status: 201 })
  }),

  // Account (Edge Function)
  http.post(`${FUNCTIONS_BASE}/delete-account`, async ({ request }) => {
    const body = await request.json() as { action?: string; confirmation?: string }
    if (body.action === 'export') {
      return HttpResponse.json(mockAccountExport)
    }
    if (body.action === 'delete' && body.confirmation === 'DELETE') {
      return HttpResponse.json({ success: true })
    }
    return HttpResponse.json({ error: 'Invalid request' }, { status: 400 })
  }),
  // Auth token (signInWithPassword re-auth)
  http.post('https://test.supabase.co/auth/v1/token', async ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('grant_type') === 'password') {
      const body = await request.json() as { email?: string; password?: string }
      if (body.password === 'wrongpassword') {
        return HttpResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid login credentials' },
          { status: 400 }
        )
      }
      return HttpResponse.json({
        access_token: 'test-access-token',
        token_type: 'bearer',
        user: { id: 'user-1', email: body.email },
      })
    }
    return HttpResponse.json({}, { status: 400 })
  }),

  // Auth user update (updateUser)
  http.put('https://test.supabase.co/auth/v1/user', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }
    return HttpResponse.json({
      id: 'user-1',
      email: body.email ?? 'test@example.com',
    })
  }),
]
