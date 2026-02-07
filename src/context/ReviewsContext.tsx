import {
  createContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type { Review } from '@/types'
import {
  getReviewsForUser as getReviewsForUserService,
  getReviewsByUser as getReviewsByUserService,
  getReviewForSwap as getReviewForSwapService,
  createReview as createReviewService,
  getUserAverageRating,
} from '@/services/reviews'

interface ReviewsState {
  reviews: Review[]
  loading: boolean
  error: string | null
  // Cache for user reviews to avoid refetching
  userReviewsCache: Map<string, Review[]>
}

type ReviewsAction =
  | { type: 'SET_REVIEWS'; reviews: Review[] }
  | { type: 'ADD_REVIEW'; review: Review }
  | { type: 'CACHE_USER_REVIEWS'; userId: string; reviews: Review[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }

export interface ReviewsContextType {
  reviews: Review[]
  loading: boolean
  error: string | null
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => Promise<Review | null>
  fetchReviewsForUser: (userId: string) => Promise<Review[]>
  fetchReviewsByUser: (userId: string) => Promise<Review[]>
  fetchReviewForSwap: (swapId: string, reviewerId: string) => Promise<Review | null>
  getReviewsForUser: (userId: string) => Review[]
  getReviewsByUser: (userId: string) => Review[]
  getAverageRating: (userId: string) => number
  getTotalReviews: (userId: string) => number
  getReviewForSwap: (swapId: string, reviewerId: string) => Review | undefined
  fetchAverageRating: (userId: string) => Promise<{ average: number; count: number }>
  clearError: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ReviewsContext = createContext<ReviewsContextType | null>(null)

function reviewsReducer(state: ReviewsState, action: ReviewsAction): ReviewsState {
  switch (action.type) {
    case 'SET_REVIEWS':
      return {
        ...state,
        reviews: action.reviews,
        loading: false,
        error: null,
      }
    case 'ADD_REVIEW':
      return {
        ...state,
        reviews: [action.review, ...state.reviews],
        loading: false,
      }
    case 'CACHE_USER_REVIEWS': {
      const newCache = new Map(state.userReviewsCache)
      newCache.set(action.userId, action.reviews)
      // Also add to main reviews list (deduped)
      const existingIds = new Set(state.reviews.map((r) => r.id))
      const newReviews = action.reviews.filter((r) => !existingIds.has(r.id))
      return {
        ...state,
        reviews: [...state.reviews, ...newReviews],
        userReviewsCache: newCache,
      }
    }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    default:
      return state
  }
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reviewsReducer, {
    reviews: [],
    loading: false,
    error: null,
    userReviewsCache: new Map(),
  })

  const addReview = useCallback(
    async (data: Omit<Review, 'id' | 'createdAt'>): Promise<Review | null> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const review = await createReviewService(data)
        dispatch({ type: 'ADD_REVIEW', review })
        return review
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create review'
        dispatch({ type: 'SET_ERROR', error: message })
        return null
      }
    },
    []
  )

  const fetchReviewsForUser = useCallback(
    async (userId: string): Promise<Review[]> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const reviews = await getReviewsForUserService(userId)
        dispatch({ type: 'CACHE_USER_REVIEWS', userId, reviews })
        dispatch({ type: 'SET_LOADING', loading: false })
        return reviews
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load reviews'
        dispatch({ type: 'SET_ERROR', error: message })
        return []
      }
    },
    []
  )

  const fetchReviewsByUser = useCallback(
    async (userId: string): Promise<Review[]> => {
      try {
        return await getReviewsByUserService(userId)
      } catch {
        return []
      }
    },
    []
  )

  const fetchReviewForSwap = useCallback(
    async (swapId: string, reviewerId: string): Promise<Review | null> => {
      try {
        return await getReviewForSwapService(swapId, reviewerId)
      } catch {
        return null
      }
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

  const fetchAverageRating = useCallback(
    async (userId: string): Promise<{ average: number; count: number }> => {
      try {
        return await getUserAverageRating(userId)
      } catch {
        return { average: 0, count: 0 }
      }
    },
    []
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null })
  }, [])

  return (
    <ReviewsContext.Provider
      value={{
        reviews: state.reviews,
        loading: state.loading,
        error: state.error,
        addReview,
        fetchReviewsForUser,
        fetchReviewsByUser,
        fetchReviewForSwap,
        getReviewsForUser,
        getReviewsByUser,
        getAverageRating,
        getTotalReviews,
        getReviewForSwap,
        fetchAverageRating,
        clearError,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}
