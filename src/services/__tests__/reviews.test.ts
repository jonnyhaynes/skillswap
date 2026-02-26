import { describe, it, expect, vi, afterEach } from 'vitest'
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

describe('createReview — console.error safety (security)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs only the error code, not the full error message or details', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    server.use(
      http.post('https://test.supabase.co/rest/v1/reviews', () => {
        return HttpResponse.json(
          {
            message: 'new row violates row-level security policy for table "reviews"',
            code: '42501',
            details: 'Failing row contains sensitive info',
            hint: 'Check your RLS policies',
          },
          { status: 400 }
        )
      })
    )

    await expect(
      createReview({
        swapId: 'swap-1',
        reviewerId: 'user-1',
        revieweeId: 'user-2',
        rating: 5,
        comment: 'Test',
        skillCategory: 'music',
      })
    ).rejects.toThrow(ReviewsServiceError)

    expect(consoleSpy).toHaveBeenCalledOnce()

    // The logged argument must be the error code only
    const loggedArgs = consoleSpy.mock.calls[0]
    expect(loggedArgs[1]).toBe('42501')

    // Must NOT log the full error message, details, or hint
    const loggedString = JSON.stringify(loggedArgs)
    expect(loggedString).not.toContain('row-level security')
    expect(loggedString).not.toContain('sensitive info')
    expect(loggedString).not.toContain('RLS policies')
  })
})
