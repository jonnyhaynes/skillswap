import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'
import { mockReviewRow } from '@/test/mocks/handlers'
import {
  getReviewsForUser,
  createReview,
  ReviewsServiceError,
} from '../reviews'

describe('getReviewsForUser', () => {
  it('returns mapped reviews', async () => {
    const result = await getReviewsForUser('user-2')
    expect(result).toHaveLength(1)
    expect(result[0].revieweeId).toBe('user-2')
    expect(result[0].rating).toBe(5)
  })

  it('throws ReviewsServiceError on failure', async () => {
    server.use(
      http.get('https://test.supabase.co/rest/v1/reviews', () => {
        return HttpResponse.json({ message: 'error', code: '42501' }, { status: 400 })
      })
    )
    await expect(getReviewsForUser('user-2')).rejects.toThrow(ReviewsServiceError)
  })
})

describe('createReview', () => {
  it('returns the created review', async () => {
    server.use(
      http.post('https://test.supabase.co/rest/v1/reviews', () => {
        return HttpResponse.json(mockReviewRow, { status: 201 })
      })
    )

    const result = await createReview({
      swapId: 'swap-1',
      reviewerId: 'user-1',
      revieweeId: 'user-2',
      rating: 5,
      comment: 'Great swap!',
      skillCategory: 'music',
    })
    expect(result.id).toBe('review-1')
    expect(result.rating).toBe(5)
  })
})
