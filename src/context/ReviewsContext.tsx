import { createContext, useReducer, useCallback, type ReactNode } from 'react'
import type { Review } from '@/types'
import { reviews as mockReviews } from '@/data/reviews'
import { generateId } from '@/utils/generateId'

interface ReviewsState {
  reviews: Review[]
}

type ReviewsAction = { type: 'ADD_REVIEW'; review: Review }

export interface ReviewsContextType {
  reviews: Review[]
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => void
  getReviewsForUser: (userId: string) => Review[]
  getReviewsByUser: (userId: string) => Review[]
  getAverageRating: (userId: string) => number
  getTotalReviews: (userId: string) => number
  getReviewForSwap: (swapId: string, reviewerId: string) => Review | undefined
}

export const ReviewsContext = createContext<ReviewsContextType | null>(null)

function reviewsReducer(state: ReviewsState, action: ReviewsAction): ReviewsState {
  switch (action.type) {
    case 'ADD_REVIEW':
      return { ...state, reviews: [action.review, ...state.reviews] }
    default:
      return state
  }
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reviewsReducer, {
    reviews: [...mockReviews],
  })

  const addReview = useCallback(
    (data: Omit<Review, 'id' | 'createdAt'>) => {
      const review: Review = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_REVIEW', review })
    },
    []
  )

  const getReviewsForUser = useCallback(
    (userId: string) => state.reviews.filter((r) => r.revieweeId === userId),
    [state.reviews]
  )

  const getReviewsByUser = useCallback(
    (userId: string) => state.reviews.filter((r) => r.reviewerId === userId),
    [state.reviews]
  )

  const getAverageRating = useCallback(
    (userId: string) => {
      const userReviews = state.reviews.filter((r) => r.revieweeId === userId)
      if (userReviews.length === 0) return 0
      const total = userReviews.reduce((sum, r) => sum + r.rating, 0)
      return total / userReviews.length
    },
    [state.reviews]
  )

  const getTotalReviews = useCallback(
    (userId: string) => state.reviews.filter((r) => r.revieweeId === userId).length,
    [state.reviews]
  )

  const getReviewForSwap = useCallback(
    (swapId: string, reviewerId: string) =>
      state.reviews.find((r) => r.swapId === swapId && r.reviewerId === reviewerId),
    [state.reviews]
  )

  return (
    <ReviewsContext.Provider
      value={{
        reviews: state.reviews,
        addReview,
        getReviewsForUser,
        getReviewsByUser,
        getAverageRating,
        getTotalReviews,
        getReviewForSwap,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}
