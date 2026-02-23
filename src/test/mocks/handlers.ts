import { http, HttpResponse } from 'msw'

const BASE = 'https://test.supabase.co/rest/v1'

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
]
